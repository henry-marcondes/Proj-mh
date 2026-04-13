from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth import verificar_admin
from database import SessionLocal, FonteEnergiaDB, EquipamentoDB
from models import User

router = APIRouter( )

# 🔌 Dependência DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 👤 CLIENTES
@router.get("/clientes", dependencies=[Depends(verificar_admin)])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(User).all()

# ⚡ FONTES
@router.get("/fontes", dependencies=[Depends(verificar_admin)])
def listar_fontes(db: Session = Depends(get_db)):
    return db.query(FonteEnergiaDB).all()

# 🔧 EQUIPAMENTOS
@router.get("/equipamentos", dependencies=[Depends(verificar_admin)])
def listar_equipamentos(db: Session = Depends(get_db)):
    return db.query(EquipamentoDB).all()
