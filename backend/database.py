from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

URL_BANCO = "postgresql://admin:password123@localhost:5432/solar_motorhome"

engine = create_engine(URL_BANCO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ClienteDB(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String, unique=True)
    cpf = Column(String, unique=True)
    fone = Column(String, unique=False, nullable=True)

def criar_tabelas():
    Base.metadata.create_all(bind=engine)


class FonteEnergiaDB(Base):
    __tablename__ = "fontes_energia"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    
    # Placas Solares
    painel_watts = Column(Float, default=0.0)
    tipo_controlador = Column(String) # "MPPT" ou "PWM"
    
    # Bateria
    bateria_ah = Column(Float, default=100.0)
    bateria_tipo = Column(String) # "Lítio" ou "Estacionária"
    
    # Carregador AC-DC (O que você mencionou)
    conversor_acdc_amperes = Column(Float, default=0.0) # Ex: Carregador de 30A
    
    # DC-DC (Alternador)
    dcdc_amperes = Column(Float, default=0.0) # Carga via motor do carro

class EquipamentoDB(Base):
    __tablename__ = "equipamentos"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    nome = Column(String)
    watts = Column(Float)
    hora_inicio = Column(Integer)
    hora_fim = Column(Integer) 
    publico = Column(Boolean, default=True)

 