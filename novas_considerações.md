# Arquitetura e Infraestrutura: Wisdom Dungeon

## 1. Visão Geral do Sistema
O **Wisdom Dungeon** é uma plataforma gamificada de estudos em formato de RPG. Devido à complexidade das relações de dados (Questões, Disciplinas, Inventário, Histórico de Usuários, Lojas) e à necessidade de análises detalhadas de desempenho, o sistema adota uma arquitetura orientada a serviços (API-driven/Headless), separando o Frontend do Backend e utilizando serviços em nuvem específicos para os seus pontos fortes.

---

## 2. Stack Tecnológica Definitiva

*   **Frontend:** Next.js (React)
*   **Backend (API & Lógica):** Django (Python) + Django REST Framework / Ninja
*   **Banco de Dados Principal:** PostgreSQL (Hospedado no Supabase)
*   **Serviços Auxiliares de Nuvem:** Google Firebase

---

## 3. Papel de Cada Tecnologia

### 3.1. O Banco de Dados (PostgreSQL via Supabase)
A modelagem de dados do sistema é estritamente **Relacional (SQL)**. 
*   **Por que não usar Firebase Firestore (NoSQL)?** Bancos NoSQL exigem desnormalização extrema e são ineficientes para agregações e relatórios analíticos complexos (ex: rastrear evolução de maestria por assunto ao longo de meses).
*   **Por que PostgreSQL?** É robusto, perfeito para dados estruturados (banco de questões, inventário, transações) e se integra perfeitamente ao ORM do Django.
*   **O Provedor:** Supabase, gerenciado primariamente através da Supabase CLI, servindo como infraestrutura de banco de dados em nuvem.

### 3.2. O Backend (Django)
Atua como o "Mestre de Jogo" (Game Master) e o detentor da lógica de negócios.
*   **Responsabilidades:** Validação de respostas, cálculo de XP/Maestria, gerenciamento do banco de dados relacional via ORM, entrega de dados estruturados para o Frontend.
*   **Integração de Banco:** O Django é o "chefe" do banco. Migrações e criação de tabelas devem ser feitas exclusivamente via comandos do Django (`makemigrations` e `migrate`), usando a string de conexão do Supabase no `settings.py`.

### 3.3. Os Serviços Auxiliares (Firebase)
O Firebase não armazena os dados permanentes do jogo, mas gerencia microserviços essenciais:
*   **Firebase Authentication:** Gerencia o login (Google, E-mail/Senha). Gera Tokens JWT que o Next.js envia ao Django para autorizar as requisições.
*   **Firebase Realtime Database:** Utilizado estritamente para **estados efêmeros e de alta frequência**. Ideal para o *Lobby* de "Raids" multiplayer, sincronização de status online e leaderboards em tempo real via WebSockets.
*   **Firebase Cloud Messaging (FCM):** Serviço de mensageria para envio de notificações Push multiplataforma (ex: aviso de recarga de stamina, convites para Raids).

---

## 4. Fluxo de Autenticação (Next.js ↔ Firebase ↔ Django)

1.  **Frontend (Next.js):** Usuário faz login via Firebase Auth (ex: Conta Google).
2.  **Firebase:** Valida as credenciais e devolve um **Token JWT** seguro para o Next.js.
3.  **Comunicação:** O Next.js anexa este Token no cabeçalho (*Header*) de todas as requisições feitas para a API do Django.
4.  **Backend (Django):** Recebe a requisição, utiliza o SDK `firebase-admin` para validar o Token JWT. Se válido, consulta o usuário no PostgreSQL e retorna os dados (ex: Inventário, Dungeons disponíveis).

---

## 5. Ferramentas de Gerenciamento: Supabase CLI

O Supabase CLI será utilizado como gerenciador de infraestrutura direto do terminal (semelhante ao `gh` do GitHub).

### Comandos Principais
*   `supabase login`: Autentica o terminal com a nuvem via Management API.
*   `supabase projects list`: Lista os projetos e exibe o **Reference ID** e a Região.
*   `supabase projects create --name "Wisdom Dungeon"`: Cria um novo banco em nuvem.
*   `supabase link --project-ref <REFERENCE_ID>`: Vincula o ambiente local ao projeto na nuvem.
*   `supabase api-keys`: Exibe as chaves do projeto.

### Formato da String de Conexão (Para o Django `settings.py`)
Para conectar o Django ao Supabase em produção, monte a URL seguindo o padrão:
```env
DATABASE_URL=postgresql://postgres.[REFERENCE_ID]:[SUA_SENHA]@[aws-0-sa-east-1.pooler.supabase.com:6543/postgres](https://aws-0-sa-east-1.pooler.supabase.com:6543/postgres)