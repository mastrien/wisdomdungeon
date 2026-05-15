# Log de Desenvolvimento - Wisdom Dungeon

## [30/04/2026] - Início do Ciclo de Desenvolvimento MVP

### Status Atual
- Arquitetura técnica definida em `ideia.md` e `novas_considerações.md`.
- Escopo do MVP definido em `mvp.md` (Mundo da Matemática, questões geradas automaticamente).
- Procedimento de desenvolvimento (Test-First) estabelecido em `procedimento.md`.

### Próximos Passos (Imediatos)
1. **Página Inicial Dinâmica:** Atualizar a `HomePage` para listar masmorras da `WeeklyDungeon` via API.
2. **Interface de Inventário:** Criar página para o usuário equipar itens e ver consumíveis.
3. **Masmorra Elite:** Implementar trava visual e lógica na lista de masmorras.
4. **Deploy:** Validar migrações em ambiente de staging.

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

**Ciclo [01/05/2026 10:00]:**
- **Ação:** Corrigir mostrador de XP e adicionar mostrador de Ouro no Header.
- **Teste:** Criado `Header.test.tsx` e atualizado `DungeonPage.test.tsx`. Todos os testes passando.
- **Implementação:** `AuthContext` atualizado para carregar perfil via API. Criado componente `Header.tsx`.
- **Refatoração:** Header extraído e aplicado em todas as rotas principais (`page.tsx`, `history/page.tsx`, `dungeon/[id]/page.tsx`).

**Ciclo [01/05/2026 11:00]:**
- **Ação:** Criar página de perfil público acessível por `/profile/[username]`.
- **Backend:** Adicionado `PublicProfileView` e rota `/api/profile/<username>/`.
- **Frontend:** Criado `src/app/profile/[username]/page.tsx` com lógica de dono vs visitante.
- **Interface:** Header atualizado com username e avatar (placeholder) vinculados ao perfil.
- **Teste:** Adicionados testes de integração no backend (`test_views.py`) e unitários no frontend (`ProfilePage.test.tsx`).

**Ciclo [03/05/2026 10:00]:**
- **Ação:** Implementar mecânica de seguir usuários.
- **Backend:** 
    - [x] Adicionar campo `following` ao modelo `Profile`.
    - [x] Criar `FollowView` para ações de seguir/deseguir.
    - [x] Atualizar `ProfileSerializer` e `PublicProfileView`.
- **Frontend:**
    - [x] Adicionar botão de Seguir/Deseguir no perfil público.
    - [x] Exibir contadores de seguidores/seguindo.
    - [x] Implementar interface básica de edição de perfil.
- **Testes:**
    - [x] Criar `test_following.py` no backend.
    - [x] Atualizar `ProfilePage.test.tsx` no frontend.

**Ciclo [03/05/2026 12:00]:**
- **Ação:** Alinhamento de geradores matemáticos e renderização KaTeX.
- **Backend:**
    - [x] Portar lógica de geradores do protótipo `math.html` para `MathGenerator.py`.
    - [x] Adicionar novos temas: Integrais, Regras de Derivada (Produto/Cadeia), Produto Escalar, Combinação Linear, Multiplicação de Matrizes.
    - [x] Formatar todas as saídas (enunciado e opções) em LaTeX.
- **Frontend:**
    - [x] Instalar dependências de KaTeX.
    - [x] Criar componente `MathRenderer`.
    - [x] Integrar `MathRenderer` na `DungeonPage` para exibição de alta qualidade.
- **Testes:**
    - [x] Atualizar testes do backend para validar formato LaTeX.
    - [x] Mockar `MathRenderer` nos testes frontend para garantir estabilidade.

**Ciclo [03/05/2026 14:00]:**
- **Ação:** Melhoria na responsividade e clareza dos enunciados.
- **Backend:**
    - [x] Refinar enunciados para serem mais descritivos (ex: "Encontre o valor de x", "Calcule a derivada").
- **Frontend:**
    - [x] Adicionar regras CSS para scroll horizontal em equações longas.
    - [x] Ajustar container de questões para permitir scroll em telas pequenas.

**Ciclo [03/05/2026 15:00]:**
- **Ação:** Refinamento da interface do Header.
- **Frontend:**
    - [x] Implementar renderização condicional no Header baseada no estado de autenticação.
    - [x] Esconder indicadores de XP/Ouro/Nível quando o usuário estiver deslogado.
    - [x] Substituir botão de Logout por botão "Entrar" (Login) para usuários visitantes.

**Ciclo [03/05/2026 16:00]:**
- **Ação:** Tratamento de erro para username duplicado.
- **Backend:**
    - [x] Adicionar verificação explícita de unicidade de username na `ProfileView.patch`.
    - [x] Retornar erro 400 amigável quando o username já estiver em uso.
- **Frontend:**
    - [x] Capturar erros de validação no formulário de edição de perfil.
    - [x] Exibir alerta amigável quando o nome de aventureiro já estiver ocupado.

**Ciclo [03/05/2026 17:00]:**
- **Ação:** Correção da falha no Login com Google (Erro 403).
- **Backend:**
    - [x] Implementar mecanismo de retry com delay de 1s na `FirebaseAuthentication` para mitigar o erro "Token used too early" (Clock Skew).
    - [x] Criar `core/tests/test_auth.py` para validar fluxos de autenticação Firebase (sucesso, retry e conflito de username).
- **Teste:** Novos testes de autenticação passando com sucesso.

**Ciclo [03/05/2026 18:00]:**
- **Ação:** Refatoração do Histórico e implementação de Maestria.
- **Backend:**
    - [x] Implementar paginação (20 por página) na `HistoryView` usando `offset`.
    - [x] Criar `MasteryView` para calcular estatísticas por masmorra (resolvidos, taxa de acerto, maestria/XP).
    - [x] Registrar rota `/api/mastery/`.
- **Frontend:**
    - [x] Atualizar `HistoryPage` para suportar carregamento incremental ("Ver Mais").
    - [x] Adicionar seção de estatísticas de masmorra acima do histórico geral.
    - [x] Garantir renderização LaTeX no histórico usando `MathRenderer`.
- **Testes:**
    - [x] Atualizar `test_get_history` e adicionar `test_get_mastery` no backend.

**Ciclo [03/05/2026 19:00]:**
- **Ação:** Refatoração da renderização matemática (Mixed Text/Math).
- **Backend:**
    - [x] Atualizar `MathGenerator.py` para usar delimitadores `$` para partes matemáticas e texto puro para o restante.
    - [x] Garantir que opções (respostas) também utilizem delimitadores `$`.
- **Frontend:**
    - [x] Refatorar `MathRenderer.tsx` para atuar como um parser de conteúdo misto.
    - [x] Remover barras de scroll horizontal e permitir que o navegador faça quebra de linha natural do texto.
    - [x] Ajustar CSS para esconder scrollbars em blocos `katex-display` e favorecer fluidez.
- **Testes:**
    - [x] Atualizar `test_math_generator.py` para validar o novo formato de string com `$`.

**Ciclo [03/05/2026 20:00]:**
- **Ação:** Implementação de estatísticas diárias na Página Inicial.
- **Backend:**
    - [x] Atualizar `MasteryView` para aceitar parâmetro `today=true`, filtrando histórico pelo dia atual.
- **Frontend:**
    - [x] Refatorar os cards de masmorra na `HomePage` para exibir quantidade de desafios resolvidos e taxa de acerto do dia.
    - [x] Remover informações estáticas irrelevantes (como dificuldade fixa).
    - [x] Adicionar feedback visual de progresso diário total no rodapé da lista.

**Ciclo [03/05/2026 21:00]:**
- **Ação:** Fase 1 - Fundação de Dados e Modelagem.
- **Teste:** Criar `core/tests/test_engagement_models.py` para validar novos modelos. [CONCLUÍDO]
- **Implementação:** Atualizar `core/models.py` com `WeeklyDungeon`, `FixedQuestion`, etc. [CONCLUÍDO]
- **Refatoração:** Aplicar migrações. [CONCLUÍDO]

**Ciclo [03/05/2026 21:30]:**
- **Ação:** Fase 2 - Seed Semanal.
- **Teste:** Criar `core/tests/test_seeding.py`. [CONCLUÍDO]
- **Implementação:** Criar comando `seed_weekly_dungeons`. [CONCLUÍDO]

**Ciclo [03/05/2026 22:00]:**
- **Ação:** Fase 2 - API de Progressão.
- **Teste:** Criar `core/tests/test_progression_api.py`. [CONCLUÍDO]
- **Implementação:** Criar `DungeonCurrentView` e `AnswerView`. [CONCLUÍDO]

**Ciclo [03/05/2026 22:30]:**
- **Ação:** Fase 3 - Itemização.
- **Teste:** Criar `core/tests/test_item_system.py`. [CONCLUÍDO]
- **Implementação:** Adicionar suporte a bônus de itens no `AnswerService` e `InventoryView`. [CONCLUÍDO]

**Ciclo [03/05/2026 23:00]:**
- **Ação:** Fase 4 - HUD v2.
- **Teste:** Atualizar `DungeonPage.test.tsx`. [CONCLUÍDO]
- **Implementação:** Refatorar `DungeonPage` com Timer, Combo e Progresso. [CONCLUÍDO]

**Ciclo [04/05/2026 10:00]:**
- **Ação:** Planejamento das novas mecânicas de engajamento e customização.
- **Documentação:** Criado plano de implementação detalhado em `plano_engajamento2.md`.
- **Escopo:** 
    - Mecânica de Vidas (HP) e Pulo de Questão.
    - Tematização modular (CSS Variables).
    - Refatoração do Header (Menu de Opções).
    - Placeholder da Loja e Página de Configurações.

**Ciclo [04/05/2026 10:30]:**
- **Fase 1 (Backend):** Implementação da Mecânica de Risco e Vidas.
- **Teste:** Criado `core/tests/test_dungeon_risk.py` validando perda de HP, avanço forçado de questão e penalidade de recompensa. [CONCLUÍDO]
- **Implementação:**
    - [x] Atualizado modelo `Profile` com `hp`, `max_hp`, `theme_color` e `font_size`.
    - [x] Refatorado `AnswerService.submit_answer` para aplicar as novas regras.
- **Resultado:** Testes passando e migrações aplicadas.

**Ciclo [04/05/2026 12:00]:**
- **Fase 2, 3, 4 e 5 (Frontend):** Implementação completa da UI de Engajamento.
- **Tematização:** 
    - [x] Refatorado `globals.css` com variáveis CSS.
    - [x] Substituídas cores fixas `amber-` por `brand-primary` em todo o projeto.
    - [x] Injeção de tema dinâmica implementada no `AuthContext`.
- **Interface:**
    - [x] Header atualizado com menu de "Mais Opções" e dropdown.
    - [x] Criada `SettingsPage` para ajuste de cores e fonte (com trava por nível).
    - [x] Adicionado visualizador de HP (Vidas) e resposta correta no HUD da `DungeonPage`.
    - [x] Exibição de taxa de acerto diária nos cards da `HomePage`.
- **Infraestrutura:**
    - [x] Adicionada regra de commits granulares ao `procedimento.md`.
    - [x] Realizados commits sequenciais para cada melhoria validada.
- **Resultado:** Sistema de engajamento visualmente completo e funcional.

**Ciclo [04/05/2026 16:30]:**
- **Restauração:** Recuperadas chaves do Firebase e restaurado o arquivo `wisdom_frontend/src/lib/firebase.ts`.
- **Teste:** Atualizado `jest.setup.js` para mockar o Firebase Auth, garantindo estabilidade no ambiente de testes. [CONCLUÍDO]
- **Tematização (Contraste):**
    - [x] Adicionadas variáveis `--text-muted` e `--text-dim` com contraste otimizado para o modo claro.
    - [x] Ajustado `AuthContext` para utilizar cores de tema mais escuras no modo claro, garantindo acessibilidade (WCAG).
    - [x] Substituídas classes fixas `text-slate-400/500` por variáveis adaptativas em todo o projeto.
- **Resultado:** Interface em modo claro agora é totalmente legível e acessível, com 100% dos testes frontend passando.

## [04/05/2026 20:00] - Perfil de Usuário com Maestria e Estatísticas
### Ação
Implementar exibição das 3 masmorras com mais maestria e estatísticas de engajamento no perfil.
### Tarefas
- [x] Backend: Atualizar `MasteryView` para suportar consulta por `username`.
- [x] Backend: Testar consulta de maestria por outro usuário.
- [x] Frontend: Atualizar interface `ProfileData` e `ProfilePage` para exibir maestria e estatísticas.
- [x] Frontend: Testar exibição dos novos componentes no perfil.

**Ciclo [04/05/2026 21:30]:**
- **Problema:** Erro 403 (Forbidden) ao acessar perfis públicos deslogado.
- **Causa:** `MasteryView` exigia autenticação por padrão, impedindo visitantes de verem as estatísticas de maestria de outros usuários.
- **Solução:** Atualizada `MasteryView` para `AllowAny` e implementada lógica para exigir login apenas em consultas sem o parâmetro `username`.
- **Teste:** Adicionado `test_get_mastery_anonymous` ao backend. Todos os testes passando.

## [06/05/2026 14:00] - Sistema de Itens Reativos e Consumíveis (Fase 1)
### Ação
Implementar a mecânica de itens que reagem a eventos e aplicam bônus/penalidades conforme `itens.md`.
### Tarefas
- [x] Backend: Expandir modelos `Item` e `InventoryItem` para suportar cargas, ativação e metadados.
- [x] Backend: Criar `ItemService` para processar eventos e efeitos de itens.
- [x] Backend: Implementar lógica da "Lâmina de Vidro de Kataha" (quebra e penalidade).
- [x] Backend: Implementar lógica do "Orbe Restaurador" (restaurar combo).
- [x] Backend: Implementar lógica do "Amuleto do Conhecimento" (revelar errada).
- [x] Backend: Criar APIs de Loja e uso de itens.
- [x] Frontend: Criar interface de Loja e Inventário.
- [x] Frontend: Integrar uso de itens na tela de Dungeon.
### Testes
- [x] Criar `core/tests/test_item_advanced.py` validando os novos comportamentos.

## [14/05/2026 15:00] - Refatoração da Lâmina de Vidro de Kataha (Acúmulos Internos)
### Ação
Alterar a lógica da Kataha para usar acúmulos próprios em vez do combo global do perfil, garantindo que o bônus resete ao desequipar.
### Tarefas
- [x] Backend: Atualizar `test_item_advanced.py` com novos casos de teste (acúmulos graduais e reset no desequipar).
- [x] Backend: Refatorar `ItemService._handle_kataha_event` para incrementar `xp_bonus` em +0.5 por acerto.
- [x] Backend: Implementar lógica de reset de metadados ao desequipar itens na `InventoryView` ou `ItemService`.
- [x] Backend: Validar que bônus alto pré-existente não afeta o item ao ser equipado.
### Testes
- [x] Rodar `pytest core/tests/test_item_advanced.py`.

## [14/05/2026 16:30] - Refatoração Arquitetural do Sistema de Itens (Observer/Strategy)
### Ação
Migrar a lógica procedural dos itens para um padrão polimórfico (Strategy), permitindo que cada item seja uma classe isolada que escuta eventos do usuário.
### Tarefas
- [x] Backend: Criar interface base `BaseItemStrategy`.
- [x] Backend: Criar `ITEM_REGISTRY` para mapeamento de efeitos.
- [x] Backend: Implementar estratégias específicas (`KatahaBladeStrategy`, `RevealWrongAmuletStrategy`, etc.).
- [x] Backend: Refatorar `ItemService` para atuar como um despachante de eventos (Dispatcher).
- [x] Backend: Validar isolamento de sessão e integridade transacional.
### Testes
- [x] Rodar `python manage.py test core.tests.test_item_advanced core.tests.test_item_system`. [PASSOU]

## [14/05/2026 17:30] - Refatoração de Inventário e Ativação Manual de Itens
### Ação
Melhorar a experiência de uso de itens, permitindo ativação manual estratégica durante a masmorra e limpando a UI de inventário.
### Tarefas
- [x] Frontend: Ocultar botão "Equipar" para consumíveis no Inventário.
- [x] Backend: Migrar Amuleto do Conhecimento para ativação manual via método `use()`.
- [x] Backend: Incluir metadados do item equipado no `Profile` para consumo da UI.
- [x] Frontend: Criar slot de "Item Ativo" na `DungeonPage` com botão de ativação e status.
- [x] Backend: Ajustar `DungeonCurrentView` para persistir efeitos ativos entre recarregamentos de página.
### Testes
- [x] Validar funcionamento do Amuleto do Conhecimento via botão manual.
- [x] Verificar reset de `revealed_wrong` ao avançar de questão.
- [x] Rodar suíte de testes de itens. [PASSOU]

## [14/05/2026 18:30] - Implementação de Masmorras de Elite e Travas de Acesso
### Ação
Implementar restrições de nível e pré-requisitos para masmorras de elite, com feedback visual na interface.
### Tarefas
- [x] Backend: Adicionar campo `level_required` ao modelo `WeeklyDungeon`.
- [x] Backend: Atualizar `WeeklyDungeonSerializer` com lógica de bloqueio (Nível + Conclusão da Normal).
- [x] Backend: Incluir `unlock_reason` na API de masmorras.
- [x] Backend: Atualizar seeder para definir Nível 10 como requisito para Masmorras de Elite.
- [x] Frontend: Exibir motivo do bloqueio e requisitos no card da masmorra na `HomePage`.
- [x] Backend: Implementar recompensas em dobro (XP e Ouro) para Masmorras de Elite no `AnswerService`.
### Testes
- [x] Validar que masmorras normais estão abertas por padrão.
- [x] Validar que masmorras de elite mostram "Bloqueado" e o motivo correto.

## [14/05/2026 19:30] - Adição de Novos Itens e Correções de Seeder
### Ação
Implementar o item "Amuleto de Vampirismo" e corrigir metadados de itens existentes no seeder.
### Tarefas
- [x] Backend: Criar `VampirismStrategy` (recupera vida a cada 5 acertos seguidos).
- [x] Backend: Atualizar `ITEM_REGISTRY` com o novo item.
- [x] Backend: Corrigir "Amuleto do Conhecimento" no seeder para `activatable=True`.
- [x] Backend: Adicionar "Amuleto de Vampirismo" ao seeder.
- [x] Backend: Criar `RestfulAmuletStrategy` (cura ao completar sala) e `PhoenixAmuletStrategy` (vida extra).
- [x] Backend: Disparar eventos `on_room_complete` e `on_death` no `AnswerService`.
### Testes
- [x] Validar cura ao atingir combo de 5 com o amuleto equipado. [PASSOU]
- [x] Validar cura ao completar sala com Amuleto do Descanso. [PASSOU]
- [x] Validar ressurreição com Amuleto da Fênix. [PASSOU]

## [14/05/2026 21:00] - Correção de Condição de Corrida na Autenticação (Race Condition)
### Ação
Resolver falhas intermitentes de carregamento (Erro 403) causadas por dessincronização entre Firebase e Backend no início da sessão.
### Tarefas
- [x] Frontend: Implementar mecanismo de retry em `AuthContext.fetchProfile` (3 tentativas com delay de 1s).
- [x] Frontend: Adicionar interceptor de resposta global no Axios para retry automático em erros 403/401 com refresh de token.
- [x] Frontend: Atualizar `HomePage` para aguardar a presença do objeto `profile` antes de renderizar a UI principal ou buscar dados.
### Resultados
A aplicação agora é muito mais resiliente a "Clock Skew" e latência de provisionamento de conta, garantindo que o usuário só veja o mapa quando a sessão estiver 100% estabelecida no backend.

## [14/05/2026 22:00] - Tela Épica de Resumo de Masmorra e Rastreamento de Sessão
### Ação
Implementar rastreamento detalhado de estatísticas durante a masmorra e exibir um resumo épico com Rank ao concluir.
### Tarefas
- [x] Backend: Adicionar campos de estatísticas de sessão ao modelo `UserDungeonProgress`.
- [x] Backend: Implementar incremento em tempo real de XP, Ouro, Precisão, Combo e Tempo no `AnswerService`.
- [x] Backend: Atualizar `DungeonCurrentView` para retornar `summary_stats` na conclusão.
- [x] Frontend: Implementar interface de resumo com cálculo de Rank (S, A, B, C, D) na `DungeonPage`.
- [x] Organização: Mover todos os arquivos de planejamento para `docs/planos/`.
### Resultados
O fim de uma masmorra agora proporciona um fechamento épico, dando feedback claro sobre a performance do jogador e recompensas acumuladas.

## [14/05/2026 23:00] - Barra de Progresso Visual de Experiência (HUD)
### Ação
Implementar feedback visual constante do progresso de nível através de barras de XP no Header e no HUD da masmorra.
### Tarefas
- [x] Backend: Garantir que `ProfileSerializer` retorne os limiares de XP (`current_level_xp_threshold` e `next_level_xp`).
- [x] Frontend: Adicionar barra de XP persistente (1px) na borda inferior do `Header`.
- [x] Frontend: Adicionar barra de XP detalhada no HUD da `DungeonPage` com contagem numérica.
- [x] Frontend: Implementar animações de transição suave no preenchimento das barras.
### Resultados
O jogador agora tem uma percepção clara e gratificante do seu avanço em direção ao próximo nível após cada questão respondida.

## [14/05/2026 23:30] - Sistema de Ranking Global (Leaderboard)
### Ação
Implementar uma página de ranking para incentivar a competição entre os jogadores baseada em XP e Combo.
### Tarefas
- [x] Backend: Criar `LeaderboardView` para retornar o top 50 jogadores por XP.
- [x] Backend: Implementar lógica para retornar a posição (Rank) individual do usuário logado.
- [x] Backend: Criar `LeaderboardProfileSerializer` otimizado para o ranking.
- [x] Frontend: Criar página `/leaderboard` com pódio destacado e lista geral.
- [x] Frontend: Adicionar barra fixa com a posição do usuário atual.
- [x] Interface: Adicionar link para o Ranking no menu do `Header`.
### Resultados
A introdução do Hall da Fama adiciona uma camada social e competitiva essencial para a retenção a longo prazo dos aventureiros.





