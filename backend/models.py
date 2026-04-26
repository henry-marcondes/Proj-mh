from sqlalchemy import JSON, Float, Column, Integer, String, Boolean, ForeignKey, JSON, DateTime, func 
from sqlalchemy.orm import Mapped, mapped_column, relationship  
from database import Base
from enum import unique

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
    #simulations = relationships("Simulation", back_populates="user")

# 📦 PLANOS

class PlanDB(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True)
    nome = Column(String)
    preco = Column(Integer)

    limite_simulacoes = Column(Integer)
    permite_salvar = Column(Boolean)
    permite_comparar = Column(Boolean)

    max_equipamentos = Column(Integer)
    max_fontes = Column(Integer)
    max_dias_simulacao = Column(Integer)
    max_projetos = Column(Integer)

    stripe_price_id = Column(String)

    subscriptions = relationship("SubscriptionDB", back_populates="plan")
# 💳 ASSINATURA 
class SubscriptionDB(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))

    status = Column(String),
    
    # 🕒 PERÍODO DA ASSINATURA
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)

    cancel_at_period_end = Column(Boolean, default=False)

    # 🕒 CONTROLE AUTOMÁTICO
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("UserDB", back_populates="subscriptions")
    plan = relationship("PlanDB", back_populates="subscriptions")
    

class SimulationDB(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    nome = Column(String)
    dados = Column(JSON)  # salva tudo da simulação

    #user = relationship("UserDB", back_populates="simulations")

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
