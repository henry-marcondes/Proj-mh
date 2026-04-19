from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import UserDB, PlanDB
from services.plan_service import get_user_plan
from fastapi import HTTPException
from models import EquipamentoDB

def limit_equipamentos():
    def dependency(
        current_user: UserDB = Depends(get_current_user),
        db: Session = Depends(get_db),
        plan: PlanDB = Depends(get_current_plan)
    ):
        count = db.query(EquipamentoDB).filter(
            EquipamentoDB.user_id == current_user.id
        ).count()

        if plan.max_equipamentos is not None and count >= plan.max_equipamentos:
            raise HTTPException(
                status_code=403,
                detail=f"Plano {plan.nome} permite até {plan.max_equipamentos} equipamentos"
            )

    return dependency

def get_current_plan(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PlanDB:
    return get_user_plan(db, current_user.id)

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
        if plan.max_dias_simulacao is not None and dias > plan.max_dias_simulacao:
            raise HTTPException(
                status_code=403,
                detail=f"Plano {plan.nome} permite até {plan.max_dias_simulacao} dias"
            )
    return dependency
