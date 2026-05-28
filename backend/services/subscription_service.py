from models import PlanDB, SubscriptionDB
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone 
from fastapi import HTTPException

def criar_assinatura_free(db: Session, user_id: int):
    plano_free = db.query(PlanDB).filter(PlanDB.nome == "FREE").first()

    if not plano_free:
        raise Exception("Plano FREE não encontrado")

    sub = SubscriptionDB(
        user_id=user_id,
        plan_id=plano_free.id,
        status="active",
        current_period_start=datetime.now(timezone.utc),
        current_period_end=datetime.now(timezone.utc) + timedelta(days=30)
    )

    db.add(sub)
    db.commit()

def limite_equipamentos(plano: str) -> int:
    if plano == "FREE":
        return 3
    elif plano == "BASIC":
        return 10
    elif plano == "PRO":
        return 9999
    return 0

def get_user_subscription(db, user_id: int):

    print("USER_ID RECEBIDO", user_id)  # DEBUG
    sub = db.query(SubscriptionDB).filter(
        SubscriptionDB.user_id == user_id
    ).order_by(SubscriptionDB.created_at.desc()).first()

    if not sub:
        raise HTTPException(403, "Usuário sem assinatura")

    if sub.status.strip().lower() != "active":
        raise HTTPException(403, "Assinatura inativa")

    print("SUB ENCONTRADA : ", sub)    # DEBUG

    return sub
