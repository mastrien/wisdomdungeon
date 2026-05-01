# Log de Desenvolvimento - Wisdom Dungeon

## [30/04/2026] - Início do Ciclo de Desenvolvimento MVP

### Status Atual
- Arquitetura técnica definida em `ideia.md` e `novas_considerações.md`.
- Escopo do MVP definido em `mvp.md`.
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
- **Auth Domínios:** Explicado a necessidade de autorizar domínios no Console do Firebase (localhost já autorizado).
- **Interface:** Utilizado Tailwind CSS com tema Dark (slate-950) e acentos em Amber para uma estética de RPG.
- **Icons:** Utilizado Lucide React para iconografia.

**Ciclo [30/04/2026 04:10]:**
- **Ação:** Implementação da interface de Login e Dashboard.
- **Implementação:** `layout.tsx` atualizado com `AuthProvider`. `login/page.tsx` criado com suporte a E-mail/Senha e Google. `page.tsx` (Home) transformado em Dashboard protegido.
- **Documentação:** Preservado histórico de ciclos no `log.md`.
