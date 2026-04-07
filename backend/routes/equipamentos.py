from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, EquipamentoDB, get_db

router = APIRouter()

@router.get("/admin/equipamentos")
def listar_equipamentos(db: Session = Depends(get_db)):
    return db.query(EquipamentoDB).all()
