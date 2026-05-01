# Guia de Inicialização do Projeto

Este documento explica como iniciar os servidores de backend e frontend do Wisdom Dungeon localmente.

## Pré-requisitos
- Python 3.13+
- Node.js 23+
- Firebase Project configurado (com `firebase-key.json` e `.env.local`)

## 1. Backend (Django)
Navegue até a pasta `wisdom_backend` e execute os seguintes comandos:

```powershell
# Ativar ambiente virtual
.\venv\Scripts\activate

# Aplicar migrações (se houver novas)
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```
O servidor estará disponível em `http://127.0.0.1:8000`.

## 2. Frontend (Next.js)
Navegue até a pasta `wisdom_frontend` e execute:

```bash
# Instalar dependências (se for a primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```
O frontend estará disponível em `http://localhost:3000`.

## 3. Configuração de Variáveis de Ambiente
Certifique-se de que os seguintes arquivos existam:
- `wisdom_backend/.env` (Configurações de banco e segredos)
- `wisdom_backend/firebase-key.json` (Chave Admin do Firebase)
- `wisdom_frontend/.env.local` (Configurações do SDK Firebase Client)
