from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, ClienteDB, criar_tabelas, Base
from database import FonteEnergiaDB, EquipamentoDB, engine
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
from calculo_solar import simular_dia_sequencial

@asynccontextmanager
async def lifespan(app: FastAPI):
    # O que colocar aqui roda quando o app LIGA
    print("🚀 Iniciando o sistema: Criando tabelas...")
    criar_tabelas()
    
    yield  # Aqui o app fica rodando
    

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar tabelas ao iniciar
#criar_tabelas()

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

class FonteEnergiaSchema(BaseModel):
    cliente_id: int | None = None  # Opcional por enquanto para teste
    painel_watts: float
    tipo_controlador: str
    bateria_ah: int
    bateria_tipo: str
    conversor_acdc_amperes: float
    dcdc_amperes: float
    publico: bool = True

@app.post("/fontes/")
def criar_fonte(dados: FonteEnergiaSchema, db: Session = Depends(get_db)):
    # ✅ FIX: Validar cliente_id antes de tudo
    if not dados.cliente_id or dados.cliente_id <= 0:
        raise HTTPException(
            status_code=400, 
            detail="cliente_id é obrigatório e deve ser válido"
        )
    
    # ✅ FIX: Verificar se cliente existe
    cliente = db.query(ClienteDB).filter(ClienteDB.id == dados.cliente_id).first()
    if not cliente:
        raise HTTPException(
            status_code=404, 
            detail=f"Cliente com ID {dados.cliente_id} não encontrado"
        )
    
    try:
        nova_fonte = FonteEnergiaDB(
            cliente_id=dados.cliente_id,
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
@app.get("/clientes/{cliente_id}/fontes/")
def listar_fontes_do_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return db.query(FonteEnergiaDB).filter(FonteEnergiaDB.cliente_id == cliente_id).all()

@app.get("/clientes/{cliente_id}")
def buscar_cliente_por_id(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@app.post("/clientes/", status_code=status.HTTP_201_CREATED)
def criar_cliente(cliente: ClienteSchema, db: Session = Depends(get_db)):
    
    # 1. Busca se já existe cliente com email ou cpf
    cliente_existente = db.query(ClienteDB).filter((ClienteDB.email == cliente.email) | (ClienteDB.cpf == cliente.cpf)).first()
    if cliente_existente:
        raise HTTPException(status_code=400, detail="Cliente com email ou CPF já existe")
    
    # 2. Se não existir, cria o cliente normalmente
    novo_cliente = ClienteDB(**cliente.model_dump())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

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
    cliente = db.query(ClienteDB).filter(
        (ClienteDB.email == dados.get("identificador")) | 
        (ClienteDB.cpf == dados.get("identificador"))
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"id": cliente.id, "nome": cliente.nome}

# ✅ NOVO: Buscar equipamentos de um cliente
@app.get("/clientes/{cliente_id}/equipamentos/")
def listar_equipamentos_do_cliente(cliente_id: int, db: Session = Depends(get_db)):
    equipamentos = db.query(EquipamentoDB).filter(
        EquipamentoDB.cliente_id == cliente_id
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
def salvar_equipamentos(dados: InventarioSchema, db: Session = Depends(get_db)):
    # 1. Remove equipamentos antigos desse cliente para não duplicar
    db.query(EquipamentoDB).filter(EquipamentoDB.cliente_id == dados.cliente_id).delete()
    
    # 2. Salva a nova lista enviada pelo frontend
    for item in dados.lista_equipamentos:
        novo_item = EquipamentoDB(
            cliente_id=dados.cliente_id,
            nome=item.nome,
            watts=item.watts,
            hora_inicio=item.hora_inicio,
            hora_fim=item.hora_fim,
            publico=item.publico
        )
        db.add(novo_item)
    
    db.commit()
    return {"status": "sucesso", "salvos": len(dados.lista_equipamentos)}
