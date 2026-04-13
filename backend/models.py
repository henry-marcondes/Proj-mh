from sqlalchemy import JSON, Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship  
from database import Base

# 👤 USER
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    cpf: Mapped[str] = mapped_column(String)
    fone: Mapped[str] = mapped_column(String)
    senha_hash: Mapped[str] = mapped_column(String)
    subscriptions = relationship("Subscription", back_populates="user")
    fontes_energia = relationship("FonteEnergiaDB", back_populates="user")


# 📦 PLANOS
class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True)
    nome = Column(String)
    preco = Column(Integer)

    limite_simulacoes = Column(Integer)
    permite_salvar = Column(Boolean)
    permite_comparar = Column(Boolean)

    subscriptions = relationship("Subscription", back_populates="plan")


# 💳 ASSINATURA
class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))

    status = Column(String)

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")
    

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    nome = Column(String)
    dados = Column(JSON)  # salva tudo da simulação

    user = relationship("User")
