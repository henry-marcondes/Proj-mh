from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base 
import time
from sqlalchemy.exc import OperationalError

DATABASE_URL = "postgresql://admin:password123@db:5432/solar_motorhome"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def criar_tabelas():
    retentativas = 5
    while retentativas > 0:
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Tabelas criadas com sucesso!")
            return
        except OperationalError:
            retentativas -= 1
            print(f"⏳ Banco ainda não pronto... tentando novamente ({retentativas} restantes)")
            time.sleep(5)

    raise Exception("❌ Não foi possível conectar ao banco de dados")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


