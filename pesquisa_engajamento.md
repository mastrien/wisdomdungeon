# Pesquisa de engajamento

Essa pesquisa tem como objetivo desvendar meios de engajar os usuários a conseguirem os recursos da plataforma.

## Objetivos da pesquisa

- Como normalmente funciona progressão de nível em jogos? É logarítmica, linear, exponencial...? Como ela se relaciona com a quantidade de XP e como a dificuldade de evoluir de nível aumenta?
- Imaginando uma trilha de coisas para desbloquear conforme o usuário sobe de nível, que recompensas poderiam motivar os usuários a subirem de nível? (uma das coisas que eu estava pensando era desbloquear a capacidade de usar um ícone customizado, ou seja, poder usar uma imagem de icon de perfil.)
- No contexto da aplicação, que tipo de benefício itens adquiridos com ouro poderiam dar? Seria legal criar uma mecânica de build? Por exemplo, um jogador criar uma build que beneficia sequência de acertos enquanto outro cria uma build que beneficia acertos feitos em pouco tempo, e outros aprimoramentos desse tipo como itens equipáveis no inventário como equipamento da aventura na masmorra.
- Se encontrar outros mecanismos de engajamento usados por plataformas similares, anote-os também.

## Resultados da pesquisa

### 1. Curvas de Progressão de Nível
A escolha da curva de progressão define o "ritmo" do jogo e como o esforço do usuário é percebido ao longo do tempo.

*   **Linear:** O XP necessário para o próximo nível aumenta em um valor fixo (ex: 500 XP por nível). 
    *   *Uso:* Jogos simples ou curtos. 
    *   *Problema:* Torna-se monótono e não escala bem para jogadores veteranos.
*   **Exponencial (O Padrão da Indústria):** O XP necessário cresce aceleradamente (ex: `XP = Constante * Nivel^1.5`). 
    *   *Uso:* RPGs e MMOs (Pokémon, WoW). 
    *   *Vantagem:* Níveis iniciais rápidos geram dopamina imediata e "prendem" o jogador. Níveis finais lentos estendem a vida útil do conteúdo.
*   **Logarítmica:** O ganho de poder diminui conforme o nível aumenta. 
    *   *Uso:* Jogos competitivos (CS, LoL para balanceamento). 
    *   *Foco:* Estimula o jogador a buscar variedade (novas habilidades) em vez de apenas "números maiores".
*   **Sugestão para Wisdom Dungeon:** Uma curva **Polinomial** (ex: `100 * Nivel^2`). Ela é mais íngreme que a linear, mas menos punitiva que a exponencial pura nos níveis intermediários.

### 2. Recompensas e Desbloqueáveis
Baseado na **Teoria da Autodeterminação**, os usuários são motivados por Autonomia, Competência e Relacionamento.

*   **Customização (Autonomia):**
    *   **Nível 5:** Desbloqueia ícone de perfil customizado (upload de imagem).
    *   **Nível 10:** Molduras raras para o avatar (Bronze, Prata, Ouro, Diamante).
    *   **Nível 20:** Temas visuais exclusivos para a interface (ex: Modo Escuro "Abismo", Modo "Pergaminho Antigo").
*   **Acesso e Poder (Competência):**
    *   **Masmorras Secretas:** Desbloqueie tópicos avançados (ex: Cálculo II) apenas após atingir nível X em Cálculo Básico.
    *   **Títulos:** Exibir "Mestre das Matrizes" ou "Lenda da Geometria" abaixo do nome.
*   **Utilidade:** Slots de inventário adicionais para carregar mais itens/equipamentos.

### 3. Mecânica de "Builds" e Itens (Equipamentos de Masmorra)
Itens comprados com ouro podem transformar o desempenho matemático em estratégia de RPG.

*   **Build de Sequência (Precisão):**
    *   *Item:* "Pergaminho da Concentração".
    *   *Efeito:* Dobra o bônus de XP após 5 acertos seguidos, mas o bônus é perdido no primeiro erro.
*   **Build de Velocidade (Agilidade):**
    *   *Item:* "Ampulheta de Mercúrio".
    *   *Efeito:* Ganha +5 de Ouro extra se responder em menos de 15 segundos.
*   **Build de Sobrevivência (Resiliência):**
    *   *Item:* "Escudo da Lógica".
    *   *Efeito:* Uma vez por dungeon, permite errar uma questão sem perder a sequência de acertos (Combo Protection).
*   **Build de Sorte:**
    *   *Item:* "Amuleto do Acaso".
    *   *Efeito:* 10% de chance de uma questão de Geometria dar o dobro de recompensa.

### 4. Outros Mecanismos de Engajamento (Benchmark)
*   **Ofensivas (Streaks):** Usado pelo Duolingo. É o mecanismo mais forte de retenção. Perder uma sequência de 50 dias gera uma forte "Aversão à Perda".
*   **Batalhas de Chefão Sociais:** Como no Habitica. Usuários formam grupos e causam dano a um monstro coletivo ao resolver questões. Se um membro do grupo não praticar no dia, o monstro causa dano ao HP de todos (Responsabilidade Social).
*   **Ligas Semanais:** Agrupar usuários em divisões (Bronze -> Diamante). Os top 5 de cada semana sobem de liga. Isso cria uma competição saudável entre pessoas de nível similar.
*   **Eventos de Tempo Limitado:** "Masmorra do Caos: Apenas hoje, questões de Álgebra Linear dão 2x Ouro".

## Conclusão
Para o **Wisdom Dungeon**, o ideal é focar primeiro nas **Ofensivas** (Streaks) para retenção diária e em um sistema de **Equipamentos** básico que permita aos usuários gastar o ouro acumulado em itens que favoreçam seu estilo de resolução (rápido vs. preciso).
