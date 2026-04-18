from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, SessionLocal,  criar_tabelas, engine
from models import FonteEnergiaDB, EquipamentoDB, UserDB, SubscriptionDB, PlanDB
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from contextlib import asynccontextmanager
from calculo_solar import simular_dia_sequencial
from auth import get_current_user
from auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # O que colocar aqui roda quando o app LIGA
    print("🚀 Iniciando o sistema: Criando tabelas...")
    criar_tabelas()
    
    yield  # Aqui o app fica rodando
    print("🛑 Encerrando sistema...")
    
app = FastAPI(
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

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

class EquipamentosUpdate(BaseModel):
    nome: str | None = None
    watts: float | None = None
    hora_inicio: int | None = None
    hora_fim: int | None = None
    publico: bool = True

class InventarioSchema(BaseModel):
    user_id: int
    lista_equipamentos: List[EquipamentosUpdate]

class SimulacaoSchema(BaseModel):
    potencia_painel: float
    bateria_ah: float
    clima: str # "sol", "nublado" ou "chuva"
    equipamentos: List[EquipamentosUpdate]
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
    equipamentos: List[EquipamentosUpdate]
    fontes_geracao: Optional[List[FonteGeracao]] = []
    carga_inicial_wh: Optional[float] = None

class FonteEnergiaSchema(BaseModel):
    user_id: int  # Opcional por enquanto para teste
    painel_watts: float
    tipo_controlador: str
    bateria_ah: int
    bateria_tipo: str
    conversor_acdc_amperes: float
    dcdc_amperes: float
    publico: bool = True

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    cpf: str | None = None
    fone: str | None = None
    senha: str


@app.post("/users/")
def criar_user(dados: UserCreate, db: Session = Depends(get_db)):
    existente = db.query(UserDB).filter(UserDB.email == dados.email).first()
    
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_user = UserDB(
        nome=dados.nome,
        email=dados.email,
        cpf=dados.cpf,
        fone=dados.fone,
        senha_hash=dados.senha
    )
    
    try:
        db.add(novo_user)
        db.commit()
        db.refresh(novo_user)
    except Exception as e:
        db.rollback()
        print("Erro USER: ",e)
        raise HTTPException(status_code=500, detail=str(e))

    # 🔥 pegar plano FREE
    plano_free = db.query(PlanDB).filter(PlanDB.nome == "FREE").first()

    if not plano_free:
        raise HTTPException(status_code=500, detail="Plano FREE não encontrado")

    # 🔥 criar assinatura
    sub = SubscriptionDB(
        user_id=novo_user.id,
        plan_id=plano_free.id,
        status="active"
    )
    try:
        db.add(sub)
        db.commit()
    except Exception as e:
        db.rollback()
        print("ERRO SUB: ",e)
        raise HTTPException(status_code=500, detail= str(e))

    return novo_user

@app.post("/fontes/")
def criar_fonte(dados: FonteEnergiaSchema, db: Session = Depends(get_db)):
    # ✅ FIX: Validar cliente_id antes de tudo
    if not dados.user_id or dados.user_id <= 0:
        raise HTTPException(
            status_code=400, 
            detail="user_id é obrigatório e deve ser válido"
        )
    
    # ✅ FIX: Verificar se usuario existe
    usuario = db.query(UserDB).filter(UserDB.id == dados.user_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404, 
            detail=f"Usuario com ID {dados.user_id} não encontrado"
        )
    
    try:
        nova_fonte = FonteEnergiaDB(
            user_id=dados.user_id,
            painel_watts=dados.painel_watts,
            tipo_controlador=dados.tipo_controlador,
            bateria_ah=dados.bateria_ah,
            bateria_tipo=dados.bateria_tipo,
            conversor_acdc_amperes=dados.conversor_acdc_amperes,
            dcdc_amperes=dados.dcdc_amperes,
            publico=dados.publico
        )
        db.add(nova_fonte)
        db.commit()
        db.refresh(nova_fonte)
        return nova_fonte
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao salvar fonte: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao salvar configuração: {str(e)}"
        )

# 1. Primeiro a rota de lista (Mais genérica)
@app.get("/fontes/")
def listar_todas_fontes(db: Session = Depends(get_db)):
    return db.query(FonteEnergiaDB).all()

# 2. Depois a rota por ID de Fonte (Específica)
@app.get("/fontes/{fonte_id}") # Adicionada a / aqui!
def buscar_fonte(fonte_id: int, db: Session = Depends(get_db)):
    fonte = db.query(FonteEnergiaDB).filter(FonteEnergiaDB.id == fonte_id).first()
    if not fonte:
        raise HTTPException(status_code=404, detail="Fonte não Encontrada")
    return fonte 

# 3. E a rota do Cliente (Relacional)
@app.get("/clientes/{user_id}/fontes/")
def listar_fontes_do_cliente(user_id: int, db: Session = Depends(get_db)):
    return db.query(FonteEnergiaDB).filter(FonteEnergiaDB.user_id == user_id).all()

@app.get("/clientes/{user_id}")
def buscar_cliente_por_id(user_id: int, db: Session = Depends(get_db)):
    cliente = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@app.post("/simulador/ciclo-24h")
def post_simulacao(params: SimuladorInput):

    print("🔥 FONTES RECEBIDAS:", params.fontes_geracao)

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

@app.post("/login")
def login(dados: dict, db: Session = Depends(get_db)):
    # Busca por e-mail ou CPF
    cliente = db.query(UserDB).filter(
        (UserDB.email == dados.get("identificador")) | 
        (UserDB.cpf == dados.get("identificador"))
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"id": cliente.id, "nome": cliente.nome}

# ✅ NOVO: Buscar equipamentos de um cliente
@app.get("/clientes/{cliente_id}/equipamentos/")
def listar_equipamentos_do_cliente(user_id: int, db: Session = Depends(get_db)):
    equipamentos = db.query(EquipamentoDB).filter(
        EquipamentoDB.user_id == user_id
    ).all()
    return equipamentos

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
def atualizar_equipamento(
    equipamento_id: int,
    dados: EquipamentosUpdate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    
    equipamento = db.query(EquipamentoDB).filter(
        EquipamentoDB.id == equipamento_id,
        EquipamentoDB.user_id == current_user.id  # ✅ CORRETO
    ).first()

    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    for key, value in dados.model_dump().items():
        if hasattr(equipamento, key):
            setattr(equipamento, key, value)
    
    db.commit()
    db.refresh(equipamento)

    return equipamento

@app.post("/equipamentos/")
def salvar_equipamentos(dados: InventarioSchema, db: Session = Depends(get_db)):
    # 1. Remove equipamentos antigos desse cliente para não duplicar
    db.query(EquipamentoDB).filter(
        EquipamentoDB.user_id == dados.user_id
        ).delete(synchronize_session=False)

    # 2. Salva a nova lista enviada pelo frontend
    for item in dados.lista_equipamentos:
        novo_item = EquipamentoDB(
            user_id=dados.user_id,
            nome=item.nome,
            watts=item.watts,
            hora_inicio=item.hora_inicio,
            hora_fim=item.hora_fim,
            publico=item.publico
        )
        db.add(novo_item)
    
    db.commit()
    return {"status": "sucesso", "salvos": len(dados.lista_equipamentos)}


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Docs - Dark</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui.css">
        <style>
            body {
                background-color: #0f172a;
            }

            .swagger-ui {
                filter: invert(1) hue-rotate(180deg);
            }

            .swagger-ui img {
                filter: invert(1) hue-rotate(180deg);
            }

            /* Ajustes extras */
            .swagger-ui .topbar {
                display: none;
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
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        </script>
    </body>
    </html>
    """)
