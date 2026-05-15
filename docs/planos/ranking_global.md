# Planejamento: Ranking Global (Leaderboard)

Este documento detalha a implementação do sistema de Ranking Global para a plataforma Wisdom Dungeon.

## 1. Objetivo
Criar uma página de "Leaderboard" onde os jogadores possam visualizar suas posições em relação a outros aventureiros, incentivando o engajamento através de competição saudável.

## 2. Métricas de Ranking
O ranking principal será baseado em **Experiência Total (XP)**, pois ela reflete tanto a consistência (quantidade de questões) quanto a habilidade (bônus de combo e masmorras de elite).

Métricas secundárias exibidas (para desempate ou curiosidade):
*   Nível Atual
*   Maior Combo (`max_combo` no `Profile`)
*   Masmorras Completadas (`total_normal_dungeons_completed` + `total_elite_dungeons_completed`)

## 3. Implementação - Backend

### 3.1. Nova View (`LeaderboardView`)
Arquivo: `wisdom_backend/core/views.py`

*   **Endpoint:** `/api/leaderboard/`
*   **Permissão:** `AllowAny` (para permitir que visitantes vejam o ranking, embora a posição do próprio usuário dependa de login).
*   **Lógica:**
    *   Buscar o top 50/100 perfis ordenados por `-xp`.
    *   Utilizar `select_related('user')` para otimizar a query.
    *   Retornar os dados paginados ou limitados (ex: top 100).
    *   Opcional: Se o usuário estiver logado, retornar também a posição (rank) exata do usuário atual, mesmo que ele não esteja no top 100.

### 3.2. Serializador (`LeaderboardProfileSerializer`)
Criar um serializador otimizado no `serializers.py` apenas com os dados necessários para o ranking (username, xp, level, max_combo, avatar/initial).

## 4. Implementação - Frontend

### 4.1. Nova Página (`/leaderboard/page.tsx`)
*   **Visual:** Uma tabela ou lista estilizada ("Hall da Fama").
*   **Elementos:**
    *   Pódio destacado para os 3 primeiros lugares (Ouro, Prata, Bronze).
    *   Lista dos demais usuários.
    *   Uma barra fixa no final da tela destacando a posição do usuário logado atual.
*   **Navegação:** Adicionar um link no `Header.tsx` (ou no menu de navegação lateral/inferior) apontando para `/leaderboard`. Pode ser um ícone de Troféu no Header, ou no menu "Mais opções".

## 5. Passos para Execução
1.  **Backend:** Adicionar `LeaderboardView` e `LeaderboardProfileSerializer`. Configurar rota em `urls.py`.
2.  **Frontend:** Criar a estrutura base da página `app/leaderboard/page.tsx`.
3.  **Integração:** Buscar os dados via `api.get('/leaderboard/')` e renderizar.
4.  **Polimento Visual:** Aplicar as cores de pódio, destaque do jogador atual e design responsivo.
