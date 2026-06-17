from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session, session
from database import get_db
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import stripe
from models import SubscriptionDB, PlanDB
from datetime import datetime, timezone

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter(prefix="/payment", tags=["payment"])

print("STRIPE", stripe.api_key)  # DEBUG



class CheckoutRequest(BaseModel):
    plan: str
    user_id: int 

PRICE_IDS = {
        "BASIC": "price_1TMFifGqtDweu1Ea1FIaCTKv",
        "PRO": "price_1TMZrEGqtDweu1EaE9TbVmll" 
        }

@router.post("/checkout")
def create_checkout(data: CheckoutRequest):
    
    # 1. Validar plano
    #planos_validos = ["BASIC", "PRO"]

    if data.plan not in PRICE_IDS:
        raise HTTPException(status_code=400, detail="Plano inválido")
  
    try:
        print("PLANO RECEBIDO:", data.plan)
        print("PRICE_IDS:", PRICE_IDS)
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],

            line_items=[
                {
                    "price": PRICE_IDS[data.plan],
                    "quantity": 1,
                }
            ],

            mode="subscription",

            metadata={
                "user_id": str(data.user_id),
                "plan": data.plan },


            success_url="http://localhost:5173/success",
            cancel_url="http://localhost:5173/cancel",
        )

        return {
            "checkout_url": session.url
        }

    except Exception as e:
        print("ERRO STRIPE:")
        print(e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):

    payload = await request.body()

    event = stripe.Event.construct_from(
        await request.json(),
        stripe.api_key
    )

    print("EVENTO RECEBIDO:", event["type"])

    if event["type"] == "checkout.session.completed":
        print("CHECKOUT FINALIZADO!")

        session = event["data"]["object"]
        metadata = session["metadata"]

        print("METADATA:", metadata)

        print("CUSTOMER:", session["customer"])

        print("SUBSCRIPTION:", session["subscription"])

        stripe_subscription = stripe.Subscription.retrieve(session["subscription"])
        period_start = stripe_subscription["items"]["data"][0]["current_period_start"]

        period_end = stripe_subscription["items"]["data"][0]["current_period_end"]

        print("PERIOD START:", period_start)
        print("PERIOD END:", period_end)

        period_start_dt = datetime.fromtimestamp(
            period_start,
            tz=timezone.utc
        )

        period_end_dt = datetime.fromtimestamp(
            period_end,
            tz=timezone.utc
        )

        print("START DT:", period_start_dt)
        print("END DT:", period_end_dt)
       
        user_id = int(metadata["user_id"])
        plan_name = metadata["plan"]

        print("USER_ID:", user_id)
        print("PLAN:", plan_name)
        plan = db.query(PlanDB).filter(PlanDB.nome == plan_name).first()

        if not plan:
            raise HTTPException(404, "Plano não encontrado")

        subscription = db.query(SubscriptionDB).filter(SubscriptionDB.user_id == user_id).order_by(SubscriptionDB.created_at.desc()).first() 

        if not subscription:
            raise HTTPException(404, "Assinatura não Encontrada")

        subscription.plan_id = plan.id

        subscription.status = "active"

        subscription.stripe_customer_id = session["customer"]

        subscription.stripe_subscription_id = session["subscription"]

        subscription.stripe_price_id = PRICE_IDS[plan_name]

        subscription.current_period_start = period_start_dt

        subscription.current_period_end = period_end_dt
        
        db.commit()

        print("ASSINATURA ATUALIZADA!")

    elif event["type"] == "customer.subscription.updated":

        print("######## ENTREI NO UPDATED ########")

        stripe_subscription = event["data"]["object"]

        stripe_sub_id = stripe_subscription["id"]

        print("STRIPE SUB ID:", stripe_sub_id)

        print("STATUS:", stripe_subscription["status"])


        period_start = stripe_subscription["items"]["data"][0]["current_period_start"]

        period_end = stripe_subscription["items"]["data"][0]["current_period_end"]


        period_start_dt = datetime.fromtimestamp(
            period_start,
            tz=timezone.utc
        )

        period_end_dt = datetime.fromtimestamp(
            period_end,
            tz=timezone.utc
        )


        subscription = db.query(SubscriptionDB).filter(
            SubscriptionDB.stripe_subscription_id == stripe_sub_id
        ).first()


        if not subscription:
            print("ASSINATURA NÃO ENCONTRADA NO BANCO")
            return {"status": "success"}


        subscription.status = stripe_subscription["status"]
        subscription.current_period_start = period_start_dt
        subscription.current_period_end = period_end_dt
        subscription.cancel_at_period_end = stripe_subscription["cancel_at_period_end"]

        db.commit()

        print("ASSINATURA SINCRONIZADA COM A STRIPE!")
    return {"status": "success"}
