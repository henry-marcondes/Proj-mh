# 🚐 Solar Motorhome Helper - V.0.2.0

O **Solar Motorhome Helper** é uma plataforma para simulação e gestão de sistemas de energia em motorhomes e veículos recreativos.

A aplicação permite que usuários cadastrem seus equipamentos, configurem sistemas de energia e simulem o comportamento da bateria ao longo do tempo, auxiliando na tomada de decisão para autonomia energética.

---

## 🚀 Tecnologias Utilizadas

Arquitetura moderna baseada em API + SPA:

### 🔹 Frontend
- React.js (Vite)
- Axios
- React Router
- Recharts (gráficos)

### 🔹 Backend
- FastAPI (Python 3)
- Pydantic (validação)
- JWT (autenticação)

### 🔹 Banco de Dados
- PostgreSQL

### 🔹 Infraestrutura
- Docker
- Docker Compose

### 🔹 ORM
- SQLAlchemy

---

## 🧠 Funcionalidades (V.0.2.0)

### 🔐 Autenticação
- [x] Cadastro de usuários
- [x] Login com JWT
- [x] Persistência de sessão
- [x] Proteção de rotas

### 🔌 Equipamentos
- [x] Cadastro de equipamentos
- [x] Listagem por usuário
- [x] Cálculo de consumo total

### ⚡ Sistema de Energia
- [x] Seleção de sistema (painel + bateria)
- [x] Armazenamento no localStorage

### 📊 Simulador
- [x] Simulação de ciclo de 24h
- [x] Integração com equipamentos reais
- [x] Controle de fontes (AC-DC / DC-DC)
- [x] Gráfico de consumo, geração e bateria

### 📈 Dashboard
- [x] Visão geral do usuário
- [x] Métricas (equipamentos e consumo)
- [x] Lista dinâmica de equipamentos

---

## 🐳 Como rodar o projeto

### 1️⃣ Pré-requisitos
- Docker
- Docker Compose

---

### 2️⃣ Clonar repositório

```bash
git clone https://github.com/henry-marcondes/Proj-mh.git
cd Proj-mh
