from services.subscription_service import get_user_subscription, limite_equipamentos
from database import SessionLocal

db = SessionLocal()

print("---- TESTE SUBSCRIPTION ----")

sub = get_user_subscription(db, 4)

if sub:
    plano_nome = sub.plan.nome

else:
    plano_nome = "FREE"

print("Plano objeto:", plano_nome)
print("Tipo:", type(sub.plan))

print("Limite:", limite_equipamentos(plano_nome))

db.close()

