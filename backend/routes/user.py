from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import User
from typing import Optional

router = APIRouter(prefix="/user", tags=["User"])

# 👤 VER PERFIL
@router.get("")
def get_user(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "cpf": user.cpf,
        "fone": user.fone
    }

# ✏️ ATUALIZAR PERFIL
@router.put("")
def atualizar_user(
    nome: Optional[str] = None,
    cpf: Optional[str] = None,
    fone: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if nome:
        user.nome = nome
    if cpf:
        user.cpf = cpf
    if fone:
        user.fone = fone

    db.commit()
    db.refresh(user)

    return {"msg": "Perfil atualizado"}

# ❌ DELETAR CONTA
@router.delete("")
def deletar_user(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    db.delete(user)
    db.commit()

    return {"msg": "Usuário deletado"}
