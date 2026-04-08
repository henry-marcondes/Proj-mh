from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "SEU_SEGREDO_SUPER_FORTE"
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60

security = HTTPBearer()

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
