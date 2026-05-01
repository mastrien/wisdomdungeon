# Wisdom Dungeon

Uma plataforma gamificada de estudos voltada para a resolução de questões de vestibular, transformando a preparação acadêmica em uma experiência de RPG.

## 1. Visão Geral
O objetivo do **Wisdom Dungeon** é tornar o estudo para vestibulares mais engajador e recompensador. Através de mecânicas de gamificação, os estudantes transformam seu progresso acadêmico em evolução dentro de um sistema de jogo.

## 2. Mecânicas Principais

### 2.1 Sistema de Recompensas
*   **XP (Experiência):** Obtida ao resolver questões e completar desafios, utilizada para subir o nível do perfil.
*   **Ouro:** Moeda virtual acumulada ao acertar questões, utilizada na loja do jogo.
*   **Maestria:** Pontuação específica por assunto (ex: Estequiometria, Mecânica, Literatura Brasileira). Reflete o domínio real do usuário em cada tópico.

### 2.2 Itens e Customização
*   **Cosméticos:** Itens visuais para personalizar o avatar e o perfil do usuário.
*   **Consumíveis:** Itens que oferecem vantagens temporárias ou auxílios durante a resolução de "dungeons" (ex: poções de "pular questão" ou "dica extra").

## 3. Modos de Jogo

*   **Treino Livre:** Resolução de questões avulsas para prática rápida.
*   **Dungeons (Masmorras):** Sequências de questões com uma temática específica (ex: "Dungeon de Termodinâmica") ou desafios aleatórios de diversas áreas.
*   **Raids (Futuro):** Dungeons gigantes projetadas para serem resolvidas em grupo, incentivando o estudo colaborativo e a formação de comunidades através de listas de amigos.

## 4. Análise de Dados e Progresso
A plataforma prioriza o acompanhamento detalhado do desempenho:
*   Rastreamento completo de erros e acertos por área de conhecimento.
*   Identificação de pontos fortes e lacunas no aprendizado.
*   Histórico de evolução de maestria ao longo do tempo.

## 5. Stack Tecnológica

*   **Frontend:** [Next.js](https://nextjs.org/) (React)
*   **Backend:** [Django](https://www.djangoproject.com/) (Python) + Django REST Framework / Ninja
*   **Banco de Dados Principal:** PostgreSQL (Hospedado no [Supabase](https://supabase.com/))
*   **Serviços Auxiliares:** [Google Firebase](https://firebase.google.com/)

## 6. Arquitetura e Infraestrutura
O sistema adota uma arquitetura orientada a serviços (API-driven), separando o Frontend do Backend e utilizando serviços em nuvem específicos para seus pontos fortes.

### 6.1 Papel das Tecnologias
*   **PostgreSQL (Supabase):** Armazenamento relacional robusto para dados estruturados (questões, inventário, transações). Gerenciado via Supabase CLI.
*   **Django:** Atua como o "Mestre de Jogo", detentor da lógica de negócios, validação de respostas e cálculo de XP. O Django é o responsável pelas migrações e integridade do banco de dados.
*   **Firebase:** Utilizado para microserviços essenciais:
    *   **Authentication:** Gestão de login (Google, E-mail/Senha) e geração de Tokens JWT.
    *   **Realtime Database:** Estados efêmeros de alta frequência (Lobby de Raids, status online, leaderboards).
    *   **Cloud Messaging (FCM):** Notificações push multiplataforma.

### 6.2 Fluxo de Autenticação
A segurança da comunicação entre serviços segue o fluxo:
1.  **Frontend (Next.js):** Realiza o login via Firebase Auth.
2.  **Token JWT:** O Firebase retorna um token que é enviado no cabeçalho das requisições para a API.
3.  **Backend (Django):** Valida o token usando o SDK `firebase-admin`.
4.  **Dados:** Após validação, o Django consulta o **PostgreSQL** e retorna as informações ao usuário.
