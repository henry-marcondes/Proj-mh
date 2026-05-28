from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import stripe

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
