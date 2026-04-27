from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import except_
from sqlalchemy.orm import Session
from database import Base, SessionLocal,  criar_tabelas, engine
from models import FonteEnergiaDB, EquipamentoDB, SimulationDB, UserDB, SubscriptionDB, PlanDB
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, cast
from contextlib import asynccontextmanager
from calculo_solar import simular_dia_sequencial
from services.plan_dependencies import get_current_plan
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
    dia: int = Field(default=1, ge=1)

class FonteEnergiaSchema(BaseModel):
    user_id: Optional[int] = None  
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

#------------------------User/login--------------------------
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

#-------------------------Fontes--------------------------------
@app.post("/fontes/")
def criar_fonte(
    dados: FonteEnergiaSchema,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
    plan: PlanDB = Depends(get_current_plan)
):
    # 🔢 valida limite
    count = db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.user_id == current_user.id
    ).count()
    
    limite = cast(Optional[int], plan.max_fontes)
    if limite is not None and count >= limite:
        raise HTTPException(
            403,
            f"Plano {plan.nome} permite até {plan.max_fontes} fontes"
        )

    nova_fonte = FonteEnergiaDB(
        user_id=current_user.id,  # 🔐 sempre do token
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


# 1. Depois a rota por ID de Fonte (Específica)
@app.get("/fontes/")
def listar_fontes(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    return db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.user_id == current_user.id
    ).all()

@app.get("/fontes/{fonte_id}")
def buscar_fonte(
    fonte_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    fonte = db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.id == fonte_id,
        FonteEnergiaDB.user_id == current_user.id
    ).first()

    if not fonte:
        raise HTTPException(404, "Fonte não encontrada")

    return fonte

@app.delete("/fontes/{fonte_id}")
def deletar_fonte(
    fonte_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    fonte = db.query(FonteEnergiaDB).filter(
        FonteEnergiaDB.id == fonte_id,
        FonteEnergiaDB.user_id == current_user.id
    ).first()

    if not fonte:
        raise HTTPException(404, "Fonte não encontrada")

    db.delete(fonte)
    db.commit()

    return {"status": "sucesso"}

#--------------------------------Simulador------------------------------
@app.post("/simulador/ciclo-24h")
def post_simulacao(
    params: SimuladorInput,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
    plan: PlanDB = Depends(get_current_plan)
):
    # 🔥 DEBUG (opcional)
    print("🔥 USER:", current_user.id)
    #print("🔥 FONTES RECEBIDAS:", params.fontes_geracao)

    # 🔢 1. LIMITE DE EXECUÇÕES (se existir)
    count = db.query(SimulationDB).filter(SimulationDB.user_id == current_user.id).count()

    limite = cast(Optional[int], plan.limite_simulacoes)
    max_dias = cast(Optional[int], plan.max_dias_simulacao)
    print("PLANO:", plan.nome)
    print("MAX_DIAS:", plan.max_dias_simulacao)
    print("DIAS RECEBIDO:", params.dia)

    if limite is not None and count >= limite:
        raise HTTPException(403, "Limite de simulações atingido")

    if max_dias is not None and params.dia > max_dias:
        raise HTTPException(403, "Limite de dias excedido")
    # 🔄 transforma dados
    lista_dicts = [eq.model_dump() for eq in params.equipamentos]

    lista_fontes = [
        f.model_dump() for f in (params.fontes_geracao or [])
    ]

    # ⚙️ execução da simulação 
    resultado = simular_dia_sequencial(
        potencia_painel_w=params.potencia_painel,
        capacidade_bateria_ah=params.bateria_ah,
        lista_equipamentos=lista_dicts,
        lista_fontes_geracao=lista_fontes,
        clima=params.clima,
        carga_inicial_wh=params.carga_inicial_wh
    )

    return resultado

#-------------------------Equipamentos-----------------------------------
#  Buscar equipamentos de um cliente
@app.get("/equipamentos/")
def listar_equipamentos(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
    ):
    print("USER LOGADO:", current_user.id)
    return db.query(EquipamentoDB).filter(
        EquipamentoDB.user_id == current_user.id
        ).all()

# Deletar um equipamento específico
@app.delete("/equipamentos/{equipamento_id}")
def deletar_equipamento(
    equipamento_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    equipamento = db.query(EquipamentoDB).filter(
        EquipamentoDB.id == equipamento_id,
        EquipamentoDB.user_id == current_user.id
    ).first()
    
    if not equipamento:
        raise HTTPException(404, "Equipamento não encontrado")
    
    db.delete(equipamento)
    db.commit()

    return {"status": "sucesso"}

# 
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
    
    for key, value in dados.model_dump(exclude_unset=True).items():
        if hasattr(equipamento, key):
            setattr(equipamento, key, value)
    
    db.commit()
    db.refresh(equipamento)

    return equipamento

@app.post("/equipamentos/")
def criar_equipamento(
    dados: EquipamentosUpdate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
    plan: PlanDB = Depends(get_current_plan)
):
    # 🔢 contar quantos já existem
    count = db.query(EquipamentoDB).filter(
        EquipamentoDB.user_id == current_user.id
    ).count()
    print("DADOS RECEBIDOS",dados)
    print("plan Recebido",plan)

    max_ep = cast(Optional[int], plan.max_equipamentos)

    # 🚫 validar limite
    if max_ep is not None and count >= int(max_ep):
        raise HTTPException(
            403,
            f"Plano {plan.nome} permite até {max_ep} equipamentos"
        )

    # 💾 criar
    novo = EquipamentoDB(
        user_id=current_user.id,
        nome=dados.nome,
        watts=dados.watts,
        hora_inicio=dados.hora_inicio,
        hora_fim=dados.hora_fim,
        publico=dados.publico
    )
    try:
        db.add(novo)
        db.commit()
        db.refresh(novo)
    except Exception as e:
        print("X ERRO AO SALVAR", str(e))
        raise HTTPException(500,str(e))

    return novo


@app.post("/equipamentos/lote")
def salvar_equipamentos(
    dados: InventarioSchema,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
    plan: PlanDB = Depends(get_current_plan)
):
    # quantos já existem
    existentes = db.query(EquipamentoDB).filter(EquipamentoDB.user_id == current_user.id).count()

    novos = len(dados.lista_equipamentos)

    max_ep = cast(Optional[int], plan.max_equipamentos)

    if max_ep is not None and (existentes + novos) > max_ep:
        raise HTTPException( 403, f"Plano {plan.nome} permite até {plan.max_equipamentos} eqipamentos")

    # 💾 salva novos
    for item in dados.lista_equipamentos:
        novo_item = EquipamentoDB(
            user_id=current_user.id,
            nome=item.nome,
            watts=item.watts,
            hora_inicio=item.hora_inicio,
            hora_fim=item.hora_fim,
            publico=item.publico
        )
        db.add(novo_item)

    db.commit()

    return {
        "status": "sucesso",
        "salvos": len(dados.lista_equipamentos)
    }

#------------------------------UI /docs Tema Escuro-------------------------------------------
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
