from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_criar_cliente_com_sucesso():
    # 1. Dados que o cliente vai enviar no formulário
    payload = {
        "nome": "Marco Antonio",
        "email": "marcoantonio@gmail.com",
        "cpf": "12345678904",
        "fone": "11999999997"
    }
    
    # 2. Fazemos uma "requisição" para a nossa futura API
    response = client.post("/clientes/", json=payload)
    
    # 3. O que esperamos que aconteça? (Status 201 = Criado)
    if response.status_code != 201:
        print("Resposta da API:", response.json())
    assert response.status_code == 201
    assert response.json()["nome"] == "Marco Antonio"

    # 4. Testar que o cliente foi realmente criado (GET)
    # Na Raiz do projeto Proj-mh rodar: pytest - s 