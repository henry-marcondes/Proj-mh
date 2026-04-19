from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import SubscriptionDB, PlanDB

def get_user_plan(db: Session, user_id: int) -> PlanDB:
    sub = db.query(SubscriptionDB).filter(
        SubscriptionDB.user_id == user_id,
        SubscriptionDB.status == "active"
    ).first()

    if not sub:
        raise HTTPException(403, "Usuário sem assinatura ativa")

    plan = db.query(PlanDB).filter(PlanDB.id == sub.plan_id).first()

    if not plan:
        raise HTTPException(500, "Plano não encontrado")

    return plan


def check_limit(current, limit, message):
    if limit is not None and current >= limit:
        raise HTTPException(403, message)


def check_permission(permission: bool, message: str):
    if not permission:
        raise HTTPException(403, message)
