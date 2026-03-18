from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, ClienteDB, criar_tabelas, Base
from database import FonteEnergiaDB, EquipamentoDB, engine
from pydantic import BaseModel
from typing import List, Optional

# Importando do seu arquivo de lógica

from database import SessionLocal, ClienteDB, criar_tabelas
from calculo_solar import simular_dia_sequencial

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar tabelas ao iniciar
criar_tabelas()

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
def post_simulacao(params: SimulacaoSchema):
    # Usando model_dump() conforme sua observação correta!
    lista_dicts = [eq.model_dump() for eq in params.equipamentos]
    
    resultado = simular_dia_sequencial(
        potencia_painel_w=params.potencia_painel,
        capacidade_bateria_ah=params.bateria_ah,
        lista_equipamentos=lista_dicts,
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
