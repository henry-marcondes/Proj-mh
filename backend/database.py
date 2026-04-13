from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import time
from sqlalchemy.exc import OperationalError

URL_BANCO = "postgresql://admin:password123@db:5432/solar_motorhome"

engine = create_engine(URL_BANCO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class FonteEnergiaDB(Base):
    __tablename__ = "fontes_energia"
    id = Column(Integer, primary_key=True, index=True)
    # ✅ FIX: Adicionar nullable=False para garantir integridade
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=False)
 
    # Placas Solares
    painel_watts = Column(Float, default=0.0)
    tipo_controlador = Column(String) # "MPPT" ou "PWM"
    
    # Bateria
    bateria_ah = Column(Integer, default=0)
    bateria_tipo = Column(String) # "Lítio" ou "Estacionária"
    
    # Carregador AC-DC
    conversor_acdc_amperes = Column(Float, default=0.0)
    
    # DC-DC (Alternador)
    dcdc_amperes = Column(Float, default=0.0)

    # Campo para privacidade dos dados
    publico = Column(Boolean, default=True)

    # ✅ FIX: Nomenclatura consistente com User
    user = relationship("User", back_populates="fontes_energia")

class EquipamentoDB(Base):
    __tablename__ = "equipamentos"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String)
    watts = Column(Float)
    hora_inicio = Column(Integer)
    hora_fim = Column(Integer) 
    publico = Column(Boolean, default=True)

def criar_tabelas():
    retentativas = 5
    while retentativas > 0:
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Tabelas criadas com sucesso!")
            break
        except OperationalError:
            retentativas -= 1
            print(f"⏳ Banco ainda não pronto... tentando novamente ({retentativas} restantes)")
            time.sleep(8)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


