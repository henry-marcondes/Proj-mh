from re import sub
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import UserDB, SubscriptionDB, PlanDB
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

SECRET_KEY = "S123456"
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60 *24 # 1 dia

security = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    cpf: str | None = None
    fone: str | None = None

class LoginData(BaseModel):
    email: EmailStr
    senha: str

def hash_senha(senha: str):
    return pwd_context.hash(senha)

def verificar_senha(senha, hash):
    return pwd_context.verify(senha, hash)

def criar_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# 🔐 Criar token
def criar_token_admin():
    payload = {
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# 🔍 Validar token
def verificar_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Acesso negado")
    except JWTError:
        raise HTTPException(status_code=403, detail="Token inválido")

@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):

    user_exist = db.query(UserDB).filter(UserDB.email == data.email).first() #verificar se não é UserDB
    if user_exist:
        raise HTTPException(status_code=400, detail="Email já existe")

    novo_user = UserDB(
        nome=data.nome,
        email=data.email,
        cpf=data.cpf,
        fone=data.fone,
        senha_hash=hash_senha(data.senha)
    )

    db.add(novo_user)
    db.commit()
    db.refresh(novo_user)

    # Buscar plano free
    plano_free = db.query(PlanDB).filter(PlanDB.nome == "FREE").first()

    if not plano_free:
        raise HTTPException(status_code=500, detail="Plano FREE não encontrado")

    # 🔗 Cria subscription
    sub = SubscriptionDB(
        user_id=novo_user.id,
        plan_id=plano_free.id,
        status="active"
    )

    db.add(sub)
    db.commit() 

    token = criar_token(novo_user.id)

    return {
    "token": token,
    "user": {
        "id": novo_user.id,
        "nome": novo_user.nome,
        "email": novo_user.email
    }
}

@router.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):

    user = db.query(UserDB).filter(UserDB.email == data.email).first()

    if not user or not verificar_senha(data.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    #token = criar_token(int(user.id))# antigo
    token = criar_token(user.id)# novo 
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nome": user.nome,
            "email": user.email
        }
    }
    # antigo se não funcionar o novo verificar aqui
    #return {
    #   "token": token,
    #    "user": {
    #        "id": user.id,
    #        "nome": user.nome,
    #       "email": user.email
    #   }
    #}

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id = int(sub)

        user = db.query(UserDB).get(user_id)

        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/me")
def me(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(SubscriptionDB).filter(
        SubscriptionDB.user_id == current_user.id,
        SubscriptionDB.status == "active"
    ).first()

    plan_nome = None

    if sub:
        plan = db.query(PlanDB).filter(PlanDB.id == sub.plan_id).first()
        if plan:
            plan_nome = plan.nome

    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "plano": plan_nome
    }



