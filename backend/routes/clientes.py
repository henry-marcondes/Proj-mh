from fastapi import APIRouter, Depends
from fastapi import HTTPException 
#from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session
#from database import SessionLocal
from database import get_db
from auth import get_current_user
from models import User

router = APIRouter()

@router.delete("/admin/clientes/{user_id}")
def deletar_cliente(
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)

):
    cliente = db.query(User).filter(
    User.id == user_id,
    User.user_id == user.id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    db.delete(cliente)
    db.commit()
    
    return {"status": "deletado"}
