# Log de Desenvolvimento - Wisdom Dungeon

## [30/04/2026] - Início do Ciclo de Desenvolvimento MVP

### Status Atual
- Arquitetura técnica definida em `ideia.md` e `novas_considerações.md`.
- Escopo do MVP definido em `mvp.md` (Mundo da Matemática, questões geradas automaticamente).
- Procedimento de desenvolvimento (Test-First) estabelecido em `procedimento.md`.

### Próximos Passos
1. **Infraestrutura Backend:**
   - [x] Inicializar projeto Django.
   - [x] Configurar conexão com Banco de Dados (SQLite local para dev, Supabase via .env).
   - [x] Implementar `FirebaseAuthentication` em `core/auth.py`.
   - [x] Integrar SDK Firebase Admin (Estrutura pronta).
2. **Desenvolvimento do Core (Matemática):**
   - [x] Implementar geradores de questões (Álgebra, Cálculo, Geometria, Álgebra Linear, Probabilidade).
   - [x] Definir modelos de `Profile` e `QuestionHistory`.
   - [x] Implementar serviço para salvar respostas e recompensas (XP/Ouro).
   - [x] Criar API Endpoints (Questões, Histórico, Perfil).
3. **Frontend:**
   - [ ] Inicializar Next.js.
   - [ ] Implementar fluxo de login com Firebase.

---
**Decisões Técnicas:**
- **IDs de Questões Dinâmicas:** Implementado um `MathGenerator` que gera questões proceduralmente com `hash` SHA-256.
- **Modelagem:** Criado modelo `Profile` para estender o `User` do Django e armazenar o `firebase_uid`. `QuestionHistory` armazenará o histórico vinculado ao `Profile`.
- **Autenticação:** `FirebaseAuthentication` gerencia a criação automática de usuários no Django a partir do UID do Firebase.
- **API:** Implementados endpoints REST para integração com o Frontend.

**Ciclo [30/04/2026 02:25]:**
- **Ação:** Criação de Serializers e Views.
- **Implementação:** API completa e testada em `core/tests/test_views.py`.
- **Ambiente:** Testes passando com sucesso.

**Dúvidas Cruciais / Alertas:**
- **Pronto para Frontend:** O Backend está funcional e pronto para ser consumido pelo Next.js.
