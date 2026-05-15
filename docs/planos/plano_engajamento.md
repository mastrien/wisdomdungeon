# Plano de engajamento

Estratégias a serem adotadas pelo Wisdom Dungeon para engajar os usuários.

## Sessões de estudo

Precisamos entender exatamente como estão acontecendo as sessões de estudo atualmente. O que acontece atualmente quando um usuário entra em uma masmorra para resolver exercícios?

Para implementar as novas mudanças, temos primeiro que entender como isso está sendo feito.

As mudanças serão:

- Sequência de acertos visível ao usuário.
- Tempo naquela questão visível ao usuário.
- Itens consumíveis acessíveis através do inventário que por sua vez também deve estar acessível ao usuário durante uma masmorra.
- Avisar o usuário que ao sair de uma masmorra, sua sequência de acertos será perdida.

## Organização de masmorras e questões

Atualmente as questões são geradas automaticamente, isso precisa mudar. Até podemos gerar as questões, mas não durante a aventura na masmorra, elas devem pré-existir em algum lugar. Existem dois motivos para isso.

1. **Questões iguais**. Queremos que as masmorras sejam iguais para todos os usuários.
2. **Coleta de dados de cada questão**. Queremos saber, para cada questão, quantas pessoas resolveram aquela questão, quantas acertaram e quanto tempo levaram. Saber a taxa de acerto da comunidade naquela questão vai nos ajudar futuramente a mapear a dificuldade das questões. O tempo médio levado para responder aquela questão tem a mesma utilidade.

Além dessa mudança nas questões, vamos mudar como as masmorras funcionam.

1. **Feedback rápido visual**. As masmorras agora serão semanais e divididas em salas de 10 questões cada. Semanalmente, para cada tema de masmorra, serão disponibilizadas 2 masmorras, a **Masmorra Normal** e a **Masmorra Elite**. A Masmorra Elite ficará disponível apenas para os usuários que concluírem a Masmorra Normal daquela semana. Cada masmorra, tanto a normal quanto a elite tem 10 salas com 10 questões cada. O progresso da masmorra (em que sala o usuário está), e o progresso da sala (quantas questões faltam) serão exibidos de formas diferentes, a sala em que o usuário está será exibida por texto (Sala 2/10) enquanto o progresso da sala será exibido como uma barra de progresso que aumenta visualmente conforme o usuário acerta questões daquela masmorra. Masmorras já finalizadas são marcadas como concluídas na página inicial e não dão mais XP, servem apenas como revisão.

2. **Recompensa por masmorra**. Concluir masmorras ou sala de masmorras vão dar aos jogadores recompensas de XP e ouro adicionais, além de itens e consumíveis (itens e consumíveis serão descritos mais a frente).

3. **Progresso em masmorra**. Isso é relativamente óbvio, mas é bom reforçar, como as masmorras serão semanais, é importante que o sistema salve o progresso do usuário em cada masmorra. Ele não precisa resolver uma masmorra ou uma sala inteira de uma só vez. O usuário pode entrar em uma masmorra, resolver 1 sala e 3 questões, e sair, e só então mais tarde voltar para resolver mais questões, voltando de onde havia parado anteriormente.

## Itemização

Os jogadores podem coletar em masmorras ou comprar itens e consumíveis para ajudar na jornada. 

Itens darão benefícios mecânicos estratégicos que vão otimizar o estilo de aprendizagem do jogador. Se ele quiser por exemplo treinar consistência, ele pode usar um item que recompensa sequências de acertos. Já se ele quiser treinar tempo de resolução de questão, ele pode usar um item que recompensa ele por resolver uma questão dentro de um tempo estipulado. Esses "itens principais" podem ser "equipados" fora das masmorras, mas ficam visíveis durante uma aventura na masmorra para que o jogador saiba qual item está usando, e para que ele possa ler o que o item faz. É importante que as recompensas de itens que valorizam sequência de acertos (precisão) sejam maiores do que recompensam agilidade.

Consumíveis ficam visíveis durante a resolução de masmorras e podem ser usados nelas. Eles podem servir por exemplo para aumentar temporariamente o XP ganho, ou aumentar o XP e ouro ganho nas próximas X questões, ou então permitir que o usuário pule uma questão (estes devem ser mais raros).

## Ofensiva

O sistema deverá contabilizar a sequência de dias em que o usuário foi ativo na plataforma. Para manter uma ofensiva, o usuário deve resolver ao menos uma sala de masmorra por dia (note que ele deve resolver uma SALA, considerando que o progresso é salvo, é possível que ele faça nove questões em um dia, e no dia seguinte consiga manter a ofensiva fazendo apenas uma questão. em outras palavras, a manutenção da ofensiva é uma **recompensa de cada sala**.). Para evitar estresse e desmotivação, deverão haver meios de proteger a ofensiva do usuário, como amuletos que permitem ficar um dia sem resolver questões, ou então um amuleto que faz com que o usuário não precise praticar aos finais de semana para manter a ofensiva (mas será altamente recompensado se praticar durante finais de semana, visto que normalmente há menos motivação para isso).

## Plano de implementação (Gemini CLI)

Este plano detalha a transição do sistema de geração procedural simples para um ecossistema de engajamento baseado em RPG, focado em retenção, progressão estruturada e itemização tática.

### Fase 1: Fundação de Dados e Modelagem (Backend)
- **Migração de Modelos:**
    - `FixedQuestion`: Armazenará enunciados, opções, resposta correta e hash. Incluirá campos para telemetria (`total_attempts`, `total_correct`, `avg_time`).
    - `WeeklyDungeon`: Define o desafio da semana (Tipo: Normal ou Elite), data de início/fim e tópico.
    - `DungeonRoom`: Estrutura de 10 salas por masmorra, vinculando 10 `FixedQuestion` a cada uma.
    - `UserDungeonProgress`: Rastreador de estado do usuário (Masmorra, Sala Atual, Índice da Questão).
    - `Profile` (Expansão): `streak_count`, `last_activity_date`, `streak_protected_until` (Boolean/Date), `equipped_item_id`, **total_dungeons_completed**.
    - `Item` e `Inventory`: Catálogo de itens (benefícios passivos) e consumíveis (uso ativo).
- **Histórico Persistente:** Garantir que o sistema registre cada masmorra finalizada no histórico do jogador para consulta de progresso a longo prazo e conquistas.

### Fase 2: Refatoração do Fluxo de Masmorras
- **Serviço de Seed Semanal:** Implementar um comando administrativo para gerar as masmorras da semana antecipadamente, garantindo que todos os usuários enfrentem os mesmos desafios.
- **API de Progressão:**
    - `GET /api/dungeon/current/`: Retorna o estado atual do usuário na masmorra ativa (questão atual, progresso da sala, progresso da masmorra).
    - `POST /api/answer/`: Atualizado para aceitar `time_spent_ms`. A lógica de recompensa agora consultará o item equipado no `Profile` para aplicar bônus de Precisão (XP) ou Velocidade (Ouro).
- **Lógica de Ofensiva (Streak):** A manutenção da ofensiva será vinculada à conclusão de uma `DungeonRoom` completa (10 questões).

### Fase 3: Sistema de Itemização, Inventário e Atributos Visíveis
- **Mecânica de Atributos e Itens:**
    - Os itens equipados devem modificar **atributos visíveis** do jogador durante a masmorra. 
    - **Atributos Base:**
        - **XP por questão**, **XP por sala**, **XP por masmorra**.
        - **Ouro por questão**, **Ouro por sala**, **Ouro por masmorra**.
        - **Multiplicador de XP**.
    - **Efeitos Passivos e Atributos Avançados (Sugestões):**
        - **Escudo de Combo:** Protege a sequência de acertos contra um erro acidental.
        - **Chance de Crítico Acadêmico:** Probabilidade de ganhar 2x XP/Ouro em uma questão difícil.
        - **Visão de Oráculo:** Chance de eliminar uma opção incorreta automaticamente ao iniciar a questão.
        - **Vigor de Estudo:** Reduz o "cansaço" do avatar (se implementado HP/Energia) ou aumenta bônus de XP após 15 min de sessão.
        - **Sorte do Aventureiro:** Aumenta a chance de encontrar consumíveis raros ao final de cada sala.
    - `Itens de Precisão`: Atuam majoritariamente sobre o **Multiplicador de XP** e **XP por questão**.
    - `Itens de Velocidade`: Atuam sobre **Ouro por questão** e reduzem o tempo necessário para bônus.
    - `Consumíveis`: Ativam bônus temporários ou efeitos imediatos (ex: **Pular Questão**).
- **Visualização em Tempo Real:** Durante a resolução da questão, o HUD deve exibir os modificadores ativos para que o usuário veja o efeito sendo aplicado a cada acerto.
- **API de Inventário:** Endpoints para listar itens, equipar/desequipar e usar consumíveis durante a sessão.

### Fase 4: Experiência do Usuário (Frontend)
- **HUD da Masmorra (v2):**
    - Barra de progresso visual no topo (0-100% da sala atual).
    - Contador de Sequência (Combo) e Timer em tempo real.
    - Botão de acesso rápido ao Inventário (Consumíveis).
    - Modal de confirmação ao tentar sair: "Sua sequência de acertos nesta sala será perdida!".
- **Painel de Controle (Home):**
    - Visualização de Masmorras Semanais com status de "Concluída" ou "Pendente".
    - Indicação visual de bloqueio para a Masmorra Elite.
- **Loja e Inventário:** Interface para gerenciar equipamentos e comprar proteções de ofensiva (amuletos).

### Fase 5: Validação e Telemetria
- **Telemetria de Questões:** Implementar o registro automático de tempo e acerto por questão para mapeamento futuro de dificuldade (Curva Polinomial).
- **Testes de Stress de Progressão:** Garantir que o estado de salvamento (Persistence) funcione perfeitamente entre logins.
- **Balanceamento de Recompensas:** Ajustar multiplicadores para garantir que a Precisão seja sempre mais recompensadora que a Velocidade pura, conforme o SAT (Speed-Accuracy Trade-off).