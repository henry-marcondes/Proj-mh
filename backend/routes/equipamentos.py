from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import EquipamentoDB
from services.subscription_service import limite_equipamentos

router = APIRouter()

@router.get("/admin/equipamentos")
def listar_equipamentos(db: Session = Depends(get_db)):
    return db.query(EquipamentoDB).all()
