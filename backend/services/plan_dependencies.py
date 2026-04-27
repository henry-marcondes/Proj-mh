from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import UserDB, PlanDB, SubscriptionDB
from services.plan_service import get_user_plan
from fastapi import HTTPException
from models import EquipamentoDB
from typing import Optional, cast

def limit_equipamentos():
    def dependency(
        current_user: UserDB = Depends(get_current_user),
        db: Session = Depends(get_db),
        plan: PlanDB = Depends(get_current_plan)
    ):
        count = db.query(EquipamentoDB).filter(
            EquipamentoDB.user_id == current_user.id
        ).count()

        max_ep = cast(Optional[int], plan.max_equipamentos)

        if max_ep is not None and count >= max_ep:
            raise HTTPException(
                status_code=403,
                detail=f"Plano {plan.nome} permite até {plan.max_equipamentos} equipamentos"
            )

    return dependency

def get_current_plan(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    sub = db.query(SubscriptionDB).filter(
        SubscriptionDB.user_id == current_user.id
    ).order_by(SubscriptionDB.created_at.desc()).first()
    print("CARREGA get_current_plan: sub= ",sub)
    if not sub:
        raise HTTPException(403, "Usuário sem assinatura")

    if sub.status != "active":
        raise HTTPException(403, "Assinatura inativa")

    plan = db.query(PlanDB).filter(
        PlanDB.id == sub.plan_id
    ).first()
    print("CARREGA get_current_plan: plan= ",plan)
    if not plan:
        raise HTTPException(500, "Plano não encontrado")

    return plan  # ✅ INSTÂNCIA

def require_permission(permission_field: str):
    def dependency(plan: PlanDB = Depends(get_current_plan)):
        if not getattr(plan, permission_field):
            raise HTTPException(
                status_code=403,
                detail=f"Seu plano não permite: {permission_field}"
            )
    return dependency

def limit_simulacao(dias: int):
    def dependency(plan: PlanDB = Depends(get_current_plan)):


        max_di = cast(Optional[int], plan.max_dias_simulacao)

        if max_di is not None and dias > max_di:
            raise HTTPException(
                status_code=403,
                detail=f"Plano {plan.nome} permite até {plan.max_dias_simulacao} dias"
            )
    return dependency
