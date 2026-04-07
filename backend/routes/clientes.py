from fastapi import APIRouter, Depends
from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal, ClienteDB
from database import get_db

router = APIRouter()

@router.delete("/admin/clientes/{cliente_id}")
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    db.delete(cliente)
    db.commit()
    
    return {"status": "deletado"}
