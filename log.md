# Log de Desenvolvimento - Wisdom Dungeon

## [30/04/2026] - Início do Ciclo de Desenvolvimento MVP

### Status Atual
- Arquitetura técnica definida em `ideia.md` e `novas_considerações.md`.
- Escopo do MVP definido em `mvp.md` (Mundo da Matemática, questões geradas automaticamente).
- Procedimento de desenvolvimento (Test-First) estabelecido em `procedimento.md`.

### Próximos Passos (Imediatos)
1. **Sincronização de Ambiente:** Sincronizar relógio do sistema local para mitigar o erro 403 (Token used too early).
2. **Expansão de Testes Frontend:** Adicionar testes para `LoginPage` e `HistoryPage`.
3. **Mecânica de Gamificação:** Implementar feedbacks visuais mais ricos para ganho de XP/Ouro.
4. **Deploy:** Preparar scripts para deploy inicial (Supabase Migrations + Vercel).

---
**Decisões Técnicas:**
- **IDs de Questões Dinâmicas:** Implementado um `MathGenerator` que gera questões proceduralmente com `hash` SHA-256.
- **Modelagem:** Criado modelo `Profile` para estender o `User` do Django e armazenar o `firebase_uid`. `QuestionHistory` armazenará o histórico vinculado ao `Profile`.
- **Autenticação:** `FirebaseAuthentication` gerencia a criação automática de usuários no Django a partir do UID do Firebase.
- **Venv:** Criado ambiente virtual para o backend.
- **Frontend Stack:** Next.js 16+, TypeScript, Tailwind CSS, Axios, Lucide React.
- **Estrutura de Pastas:** Projeto dividido em `wisdom_backend` e `wisdom_frontend`.
- **API Client:** Axios configurado com Interceptor JWT.
- **CORS:** Adicionado `django-cors-headers` (Permitido: localhost:3000).
- **Lembrete de Produção:** Ao realizar o deploy, autorizar o domínio de produção no Console do Firebase.
- **Testes Frontend:** Configurado Jest + React Testing Library no Next.js.
- **Erro 403 (Depuração):** Identificado "Clock Skew" como causa da falha na validação do token Firebase.

**Ciclo [30/04/2026 01:10]:**
- **Teste:** `core/tests/test_math_generator.py` criado e validando Álgebra Básica.
- **Implementação:** `core/services/math_generator.py` inicializado com lógica de álgebra.
- **Refatoração:** Lógica de geração isolada em serviço.

**Ciclo [30/04/2026 01:25]:**
- **Teste:** Adicionados testes para `calculo_basico` e `geometria`.
- **Implementação:** Implementadas derivadas de potência e área de retângulo.
- **Refatoração:** Centralizada geração de hash.

**Ciclo [30/04/2026 01:40]:**
- **Teste:** Adicionados testes para todos os 5 tópicos. Total de 5 testes passando.
- **Implementação:** `MathGenerator` completo para o "Mundo da Matemática".

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
- **Ação:** Reorganização estrutural em pastas `wisdom_backend` e `wisdom_frontend`.
- **Documentação:** Atualização do `procedimento.md` (regra do log).

**Ciclo [30/04/2026 03:45]:**
- **Ação:** Configuração do Firebase Client e infraestrutura de autenticação no frontend.
- **Implementação:** Arquivo `.env.local`, `firebase.ts`, `api.ts` (Axios) e `AuthContext.tsx` criados.

**Ciclo [30/04/2026 04:10]:**
- **Ação:** Implementação da interface de Login e Dashboard.
- **Implementação:** `layout.tsx` atualizado com `AuthProvider`. `login/page.tsx` criado.

**Ciclo [30/04/2026 04:30]:**
- **Ação:** Implementação da página da Dungeon e mecânica de resolução.
- **Implementação:** Rota dinâmica `/dungeon/[id]` e integração com API.

**Ciclo [30/04/2026 04:45]:**
- **Ação:** Ajuste de terminologia, criação da página de histórico e configuração de CORS.
- **Documentação:** Criado `STARTUP.md` com instruções de inicialização.

**Ciclo [30/04/2026 05:15]:**
- **Erro:** AxiosError 403 em `/api/question/`.
- **Causa:** Firebase Admin disparando "Token used too early" no backend devido a Clock Skew.
- **Teste Frontend:** Jest + RTL configurados. `DungeonPage.test.tsx` criado e passando.
- **Ação:** Adicionado log de depuração em `core/auth.py`.
