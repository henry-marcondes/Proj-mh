# 1. Usa uma imagem leve do Python
FROM python:3.11-slim

# 2. Define a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia o arquivo de dependências
COPY requirements.txt .

# 4. Instala as bibliotecas (FastAPI, SQLAlchemy, psycopg2, etc.)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia todo o resto do seu código para dentro do container
COPY . .

# 6. Comando para iniciar o servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]