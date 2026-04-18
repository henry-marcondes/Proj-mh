from enum import unique
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Mapped, mapped_column
import time
from sqlalchemy.exc import OperationalError

URL_BANCO = "postgresql://admin:password123@db:5432/solar_motorhome"

engine = create_engine(URL_BANCO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class FonteEnergiaDB(Base):
    __tablename__ = "fontes_energia"
    id = Column(Integer, primary_key=True, index=True)
    # FIX: Adicionar nullable=False para garantir integridade
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

    # FIX: Nomenclatura consistente com ClienteDB
    user = relationship("UserDB", back_populates="fontes_energia")

class EquipamentoDB(Base):
    __tablename__ = "equipamentos"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String)
    watts = Column(Float)
    hora_inicio = Column(Integer)
    hora_fim = Column(Integer) 
    publico = Column(Boolean, default=True)
    user = relationship("UserDB",back_populates="equipamentos")
# 👤 USER
class UserDB(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    cpf: Mapped[str] = mapped_column(String)
    fone: Mapped[str] = mapped_column(String)
    senha_hash: Mapped[str] = mapped_column(String)
    subscriptions = relationship("SubscriptionDB", back_populates="user")
    fontes_energia = relationship("FonteEnergiaDB", back_populates="user")
    equipamentos = relationship("EquipamentoDB", back_populates="user")


# 💳 ASSINATURA
class SubscriptionDB(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))

    status = Column(String)

    user = relationship("UserDB", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")


# 📦 PLANOS
class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True)
    nome = Column(String)
    preco = Column(Integer)

    limite_simulacoes = Column(Integer)
    permite_salvar = Column(Boolean)
    permite_comparar = Column(Boolean)

    subscriptions = relationship("SubscriptionDB", back_populates="plan")

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


