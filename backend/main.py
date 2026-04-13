from fastapi import Body, FastAPI, Depends, HTTPException, status,Header
from auth import criar_token_admin, get_current_user
from auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, criar_tabelas, Base
from database import FonteEnergiaDB, EquipamentoDB, engine
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from calculo_solar import simular_dia_sequencial
from routes import clientes, fontes, equipamentos, admin, user
from models import User, Simulation
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

ADMIN_USER = "admin"
ADMIN_PASSWORD = "1234"
ADMIN_TOKEN = "token-super-secreto"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # O que colocar aqui roda quando o app LIGA
    print("🚀 Iniciando o sistema: Criando tabelas...")
    criar_tabelas()
    
    yield  # Aqui o app fica rodando
    

app = FastAPI(
    lifespan=lifespan,
    docs_url=None,       # 🔥 desativa o padrão
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # depois mudar para allow_origins=["http://localhost:5173"]
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
app.include_router(fontes.router, prefix="/fontes", tags=["Fontes"])
app.include_router(equipamentos.router, prefix="/equipamentos", tags=["Equipamentos"])
app.include_router(auth_router)
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(user.router)
Base.metadata.create_all(bind=engine)

@app.post("/admin/login")
def login_admin(dados: dict):
    if dados.get("usuario") == ADMIN_USER and dados.get("senha") == ADMIN_PASSWORD:
        return {"token": ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

def verificar_admin(authorization: str = Header(None)):
    if authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=403, detail="Acesso negado")

# Dependência para abrir/fechar conexão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ClienteSchema(BaseModel):
    nome: str
    email: str
    cpf: str
    fone : str | None = None

class Equipamentos(BaseModel):
    nome: str
    watts: float
    hora_inicio: int
    hora_fim: int
    publico: bool = True

class InventarioSchema(BaseModel):
    cliente_id: int
    lista_equipamentos: List[Equipamentos]

class SimulacaoSchema(BaseModel):
    potencia_painel: float
    bateria_ah: float
    clima: str # "sol", "nublado" ou "chuva"
    equipamentos: List[Equipamentos]
    carga_inicial_wh: Optional[float] = None
    
class FonteGeracao(BaseModel):
    tipo: str
    amperes: float
    hora_inicio: int
    hora_fim: int

class SimuladorInput(BaseModel):
    potencia_painel: float
    bateria_ah: float
    clima: str
    equipamentos: List[Equipamentos]
    fontes_geracao: Optional[List[FonteGeracao]] = []
    carga_inicial_wh: Optional[float] = None

class FonteCreate(BaseModel):
    painel_watts: float
    tipo_controlador: str
    bateria_ah: int
    bateria_tipo: str
    conversor_acdc_amperes: float
    dcdc_amperes: float
    publico: bool = True


class SimulacaoSave(BaseModel):
    nome: str
    dados: Dict[str, Any]

@app.post("/fontes")
def criar_fonte(
    dados: FonteCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nova = FonteEnergiaDB(
        user_id=user.id,
        painel_watts=dados.painel_watts,
        bateria_ah=dados.bateria_ah,
        tipo_controlador=dados.tipo_controlador,
        bateria_tipo=dados.bateria_tipo,
        conversor_acdc_amperes=dados.conversor_acdc_amperes,
        dcdc_amperes=dados.dcdc_amperes,
        publico=dados.publico
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)

    return nova

@app.get("/fontes")
def listar_fontes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.user_id == user.id
    ).all()

@app.get("/fontes/{fonte_id}") # Adicionada a / aqui!
def buscar_fonte(
    fonte_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fonte = db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.id == fonte_id,
        FonteEnergiaDB.user_id == user.id
    ).first()

    if not fonte:
        raise HTTPException(status_code=404, detail="Fonte não encontrada")

    return fonte

@app.get("/clientes/{user_id}")
def buscar_cliente_por_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(user.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return user

@app.post("/clientes/", status_code=status.HTTP_201_CREATED)
def criar_cliente(user: ClienteSchema, db: Session = Depends(get_db)):
    
    # 1. Busca se já existe cliente com email ou cpf
    cliente_existente = db.query(User).filter((User.email == user.email) | (User.cpf == user.cpf)).first()
    if cliente_existente:
        raise HTTPException(status_code=400, detail="Cliente com email ou CPF já existe")
    
    # 2. Se não existir, cria o cliente normalmente
    novo_cliente = User(**user.model_dump())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

@app.post("/simulador/ciclo-24h")
def post_simulacao(
    params: SimuladorInput,
    user: User = Depends(get_current_user)
):
    print("🔥 FONTES RECEBIDAS:", params.fontes_geracao)
    print(user.id)
    print(user.email)

    # Usando model_dump() conforme sua observação correta!
    lista_dicts = [eq.model_dump() for eq in params.equipamentos]

    resultado = simular_dia_sequencial(
        potencia_painel_w=params.potencia_painel,
        capacidade_bateria_ah=params.bateria_ah,
        lista_equipamentos=lista_dicts,
        lista_fontes_geracao=[f.model_dump() for f in (params.fontes_geracao or [])], 
        clima=params.clima,
        carga_inicial_wh=params.carga_inicial_wh
)
    return resultado

@app.get("/equipamentos")
def listar_equipamentos(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(EquipamentoDB).filter(
        EquipamentoDB.user_id == user.id
    ).all()

# ✅ NOVO: Deletar um equipamento específico
@app.delete("/equipamentos/{equipamento_id}")
def deletar_equipamento(equipamento_id: int, db: Session = Depends(get_db)):
    equipamento = db.query(EquipamentoDB).filter(
        EquipamentoDB.id == equipamento_id
    ).first()
    
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    db.delete(equipamento)
    db.commit()
    return {"status": "sucesso", "mensagem": "Equipamento deletado"}


# ✅ NOVO: Atualizar equipamento (CORRIGIDO)
@app.put("/equipamentos/{equipamento_id}")
def atualizar_equipamento(equipamento_id: int, dados: Equipamentos, db: Session = Depends(get_db)):
    equipamento = db.query(EquipamentoDB).filter(
        EquipamentoDB.id == equipamento_id
    ).first()
    
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    # ✅ FIX: Usar update com dictionary
    for key, value in dados.model_dump().items():
        if hasattr(equipamento, key):
            setattr(equipamento, key, value)
    
    db.commit()
    db.refresh(equipamento)
    return equipamento

@app.post("/equipamentos/")
def criar_equipamento(
    dados: Equipamentos,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novo = EquipamentoDB(
        user_id=user.id,
        nome=dados.nome,
        watts=dados.watts,
        hora_inicio=dados.hora_inicio,
        hora_fim=dados.hora_fim,
        publico=dados.publico
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


@app.post("/simulacoes/salvar")
def salvar_simulacao(
    payload: SimulacaoSave,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nova = Simulation(
        user_id=user.id,
        nome=payload.nome,
        dados=payload.dados
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)

    return {"msg": "Simulação salva", "id": nova.id}

@app.get("/simulacoes")
def listar_simulacoes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    simulacoes = db.query(Simulation).filter(
        Simulation.user_id == user.id
    ).all()

    return simulacoes


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>API - Motorhome Solar</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui.css">
        <style>
            body {
                background-color: #121212;
            }
            .swagger-ui {
                filter: invert(1) hue-rotate(180deg);
            }
            .swagger-ui img {
                filter: invert(1) hue-rotate(180deg);
            }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
            SwaggerUIBundle({
                url: '/openapi.json',
                dom_id: '#swagger-ui',
            });
        </script>
    </body>
    </html>
    """)
