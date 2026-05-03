# Wisdom Dungeon

**Wisdom Dungeon** é uma plataforma de aprendizado gamificada onde os usuários exploram masmorras procedurais resolvendo desafios de matemática, cálculo e álgebra. O projeto utiliza uma estética de RPG para transformar o estudo em uma jornada de evolução de personagem, maestria e conquistas.

---

## 🚀 Stack Tecnológica

### Backend
- **Framework:** Django 5.1 + Django REST Framework (DRF)
- **Linguagem:** Python 3.13
- **Autenticação:** Firebase Admin SDK (Integração JWT)
- **Banco de Dados:** SQLite (Desenvolvimento) / PostgreSQL (Produção sugerida)
- **Serviços:** MathGenerator (Geração procedural de questões em LaTeX)

### Frontend
- **Framework:** Next.js 16.2+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Lucide React (Ícones)
- **Renderização Matemática:** KaTeX (Suporte a LaTeX misto com texto)
- **Estado Global:** React Context API (AuthContext)

---

## 📂 Estrutura de Pastas

```text
wisdomdungeon/
├── wisdom_backend/           # API Django
│   ├── core/                 # Lógica principal (Views, Models, Serializers)
│   │   ├── services/         # Motores de geração e correção
│   │   ├── tests/            # Testes unitários e de integração
│   │   └── auth.py           # Middleware de autenticação Firebase
│   └── wisdom_backend/       # Configurações do projeto Django
├── wisdom_frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/              # Rotas e Páginas (Next.js App Router)
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── context/          # Provedores de estado (Auth)
│   │   └── services/         # Cliente API (Axios)
│   └── public/               # Ativos estáticos
└── docs/                     # Pesquisas e especificações (mvp.md, ideia.md)
```

---

## 🛠️ Como Rodar Localmente

### Pré-requisitos
- Python 3.13+ e Node.js 23+
- Um projeto no Firebase com Auth habilitado (Google Login).

### 1. Configuração do Backend
```bash
cd wisdom_backend
# Crie e ative o venv
python -m venv venv
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/Mac

# Instale dependências
pip install -r requirements.txt

# Configure o .env (use .env.example como base)
# Adicione sua firebase-key.json na raiz de wisdom_backend/

# Rode migrações e inicie
python manage.py migrate
python manage.py runserver
```

### 2. Configuração do Frontend
```bash
cd wisdom_frontend
npm install
# Configure o .env.local com as chaves do Firebase Client
npm run dev
```

---

## 🧪 Executando Testes

O projeto segue rigorosamente o padrão **TDD (Test-Driven Development)**.

### Testes do Backend (20+ casos)
```bash
cd wisdom_backend
python manage.py test core.tests
```

### Testes do Frontend (Jest + RTL)
```bash
cd wisdom_frontend
npm test
```

---

## 📊 Modelo de Dados

### Tabelas Principais

1.  **User (Django Built-in):** Gerencia credenciais básicas (username, email).
2.  **Profile:** Extensão do User para gamificação.
    - `firebase_uid`: ID único do Firebase.
    - `xp`, `gold`, `level`: Métricas de progresso.
    - `bio`: Descrição do aventureiro.
    - `following`: Relacionamento Many-to-Many (Self) para sistema de seguidores.
3.  **QuestionHistory:** Registro de cada desafio enfrentado.
    - `topic`: Masmorra de origem (ex: calculo_basico).
    - `enunciado`: Texto da questão (formato Mixed LaTeX).
    - `is_correct`: Resultado da tentativa.
    - `question_hash`: Identificador único da questão gerada.

---

## 🔄 Fluxos Principais e Arquitetura

### 1. Autenticação (Firebase + Django)
1.  O **Frontend** realiza o login via Google SDK do Firebase.
2.  Um `idToken` (JWT) é gerado e enviado no header `Authorization` de cada requisição.
3.  O **Backend** intercepta a rota via `FirebaseAuthentication` (`auth.py`).
4.  O token é validado com o Firebase Admin SDK.
5.  Se o usuário não existir no banco Django, ele é criado automaticamente com base nos dados do token.
6.  **Resiliência:** O backend possui tratamento de *Clock Skew* (retry automático) para evitar erros de sincronização de tempo.

### 2. Ciclo de Questão
1.  **Request:** O frontend solicita uma questão passando o ID da masmorra.
2.  **Geração:** O `MathGenerator` cria uma questão procedural, gera um `hash` único e retorna o enunciado em formato Mixed Math ($...$).
3.  **Resposta:** O usuário submete a resposta.
4.  **Validação:** O `AnswerService` verifica a correção, registra no `QuestionHistory` e atualiza o `Profile` (XP/Ouro/Level).

---

## 🤝 Como Contribuir

1.  **Leia o `procedimento.md`:** É obrigatório implementar o teste antes da funcionalidade.
2.  **Documente no `log.md`:** Adicione seu novo ciclo de desenvolvimento ao final do arquivo.
3.  **Mantenha o Padrão:** Use delimitadores `$` para matemática e evite renderizar blocos inteiros como LaTeX para preservar a responsividade.

---
*Desenvolvido com sabedoria para aventureiros da matemática.*
