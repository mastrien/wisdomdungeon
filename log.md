# Log de Desenvolvimento - Wisdom Dungeon

## [30/04/2026] - Início do Ciclo de Desenvolvimento MVP

### Status Atual
- Arquitetura técnica definida em `ideia.md` e `novas_considerações.md`.
- Escopo do MVP definido em `mvp.md` (Mundo da Matemática, questões geradas automaticamente).
- Procedimento de desenvolvimento (Test-First) estabelecido em `procedimento.md`.

### Próximos Passos
1. **Infraestrutura Backend:**
   - [x] Inicializar projeto Django.
   - [x] Configurar ambiente virtual (`venv`) e `requirements.txt`.
   - [x] Configurar conexão com Banco de Dados.
   - [x] Implementar `FirebaseAuthentication`.
2. **Desenvolvimento do Core (Matemática):**
   - [x] Implementar geradores de questões.
   - [x] Definir modelos de `Profile` e `QuestionHistory`.
   - [x] Implementar serviço para salvar respostas e recompensas.
   - [x] Criar API Endpoints.
3. **Frontend (Next.js):**
   - [x] Inicializar projeto Next.js em `wisdom_frontend`.
   - [x] Configurar Firebase Client SDK com chaves fornecidas.
   - [x] Implementar serviço de API (Axios com Interceptor JWT).
   - [x] Criar Contexto de Autenticação (AuthContext).
   - [x] Criar interface de login (`/login`) e dashboard (`/`).
   - [ ] Criar mecânica de jogo (resolução de questões).

---
**Decisões Técnicas:**
- **IDs de Questões Dinâmicas:** Implementado um `MathGenerator` que gera questões proceduralmente com `hash` SHA-256.
- **Modelagem:** Criado modelo `Profile` para estender o `User` do Django e armazenar o `firebase_uid`. `QuestionHistory` armazenará o histórico vinculado ao `Profile`.
- **Autenticação:** `FirebaseAuthentication` gerencia a criação automática de usuários no Django a partir do UID do Firebase.
- **Venv:** Criado ambiente virtual para o backend.
- **Frontend Stack:** Next.js 16+, TypeScript, Tailwind CSS, Axios, Lucide React.
- **Estrutura de Pastas:** Projeto dividido em `wisdom_backend` e `wisdom_frontend`.
- **API Client:** Axios configurado para injetar automaticamente o Token JWT do Firebase em cada requisição para o Django.
- **Lembrete de Produção:** Ao realizar o deploy, autorizar o domínio de produção no Console do Firebase (Authentication > Settings > Authorized Domains).

**Ciclo [30/04/2026 01:10]:**
- **Teste:** `core/tests/test_math_generator.py` criado e validando Álgebra Básica.
- **Implementação:** `core/services/math_generator.py` inicializado com lógica de álgebra.
- **Refatoração:** Lógica de geração isolada em serviço para facilitar testes sem DB.

**Ciclo [30/04/2026 01:25]:**
- **Teste:** Adicionados testes para `calculo_basico` e `geometria` em `core/tests/test_math_generator.py`.
- **Implementação:** Implementadas derivadas de potência e área de retângulo.
- **Refatoração:** Centralizada geração de hash para garantir consistência entre tópicos.

**Ciclo [30/04/2026 01:40]:**
- **Teste:** Adicionados testes para todos os 5 tópicos em `core/tests/test_math_generator.py`. Total de 5 testes passando.
- **Implementação:** `MathGenerator` completo para o "Mundo da Matemática".
- **Refatoração:** Refatorado o método `generate_question` para usar um dicionário de mapeamento de funções.

**Ciclo [30/04/2026 01:55]:**
- **Ação:** Configuração de `settings.py` e criação de modelos.
- **Implementação:** `core/models.py` com `Profile` e `QuestionHistory`. Migrações aplicadas.

**Ciclo [30/04/2026 02:25]:**
- **Ação:** Criação de Serializers e Views.
- **Implementação:** API completa e testada em `core/tests/test_views.py`.

**Ciclo [30/04/2026 03:10]:**
- **Ação:** Criação de `venv` e inicialização do `wisdom_frontend`.
- **Implementação:** Estrutura base do projeto frontend pronta.

**Ciclo [30/04/2026 03:30]:**
- **Ação:** Reorganização estrutural do projeto em pastas `wisdom_backend` e `wisdom_frontend`.
- **Documentação:** Atualização do `procedimento.md` com regra de preservação do histórico do log.

**Ciclo [30/04/2026 03:45]:**
- **Ação:** Configuração do Firebase Client e infraestrutura de autenticação no frontend.
- **Implementação:** Arquivo `.env.local`, `firebase.ts`, `api.ts` (Axios) e `AuthContext.tsx` criados.

**Ciclo [30/04/2026 04:30]:**
- **Ação:** Implementação da página da Dungeon e mecânica de resolução de questões.
- **Implementação:** Rota dinâmica `/dungeon/[id]` criada. Integração completa com os endpoints `/api/question/` (GET e POST).
- **Interface:** Layout de batalha com feedback de acerto/erro e exibição de recompensas (XP/Ouro).
- **Documentação:** Log completo restaurado e atualizado com lembrete de produção.
