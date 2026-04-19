from fastapi import APIRouter, Depends
from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from models import FonteEnergiaDB

router = APIRouter()

@router.get("/admin/fontes")
def listar_fontes(db: Session = Depends(get_db)):
    return db.query(FonteEnergiaDB).all()

@router.delete("/admin/fontes/{user_id}")
def deletar_cliente(user_id: int, db: Session = Depends(get_db)):
    cliente = db.query(FonteEnergiaDB).filter(FonteEnergiaDB.id == user_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    db.delete(cliente)
    db.commit()
    
    return {"status": "deletado"}
