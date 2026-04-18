### backend / database.py --> def get_db():
Para Executar no Brower: $ :MarkdownPreview

---
A palavra-chave mágica aqui é o yield. Ela transforma a função em um Gerador.

db = SessionLocal(): Abre uma nova conexão (sessão) com o banco de dados.

try: yield db:

O código "empresta" a conexão para a sua rota (Endpoint) do FastAPI.


A execução da função pausa aqui e espera a sua rota terminar de processar tudo.

finally: db.close():

Não importa se a sua rota deu certo ou se estourou um erro (Exception), o bloco finally sempre será executado.

Ele garante que a conexão seja fechada, evitando que o seu banco de dados fique sem memória ou com conexões "penduradas".

---

```mermaid
graph TD
    A[Início: Requisição API] --def get_db--> B[Criar Sessão: SessionLocal]
    B --db = entra no banco de dados --> C[Entra no bloco TRY]
    C --> D{yield db}
    D -- Pausa e fornece DB --> E[Sua Rota / Lógica de Negócio]
    E -- Terminou ou Errou --> F[Entra no bloco FINALLY]
    F --> G[db.close: Fecha Conexão]
    G --> H[Fim: Resposta enviada]
