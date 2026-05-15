# Planejamento da Tela Épica de Resumo de Masmorra

Este documento detalha a implementação do rastreamento de estatísticas e da interface de conclusão para as masmorras da plataforma Wisdom Dungeon.

## 1. Objetivo
Transformar o estado de "Masmorra Concluída" (atualmente uma tela simples com um troféu) em uma experiência gamificada que recompensa o jogador com um resumo detalhado do seu desempenho ao longo dos 100 desafios, incluindo o cálculo de um Rank de proficiência (S, A, B, C, D).

## 2. Escopo e Impacto
A mudança afetará o modelo de banco de dados do progresso da masmorra (`UserDungeonProgress`), a lógica de submissão de respostas (`AnswerService`) e o componente visual final (`DungeonPage`).

### 2.1. Backend (Modelagem de Dados)
Para evitar cálculos custosos no momento da conclusão, o progresso da masmorra deve acumular os dados ao longo da jornada.
*   **Arquivo Afetado:** `core/models.py`
*   **Novos Campos em `UserDungeonProgress`:**
    *   `session_xp_gained` (Inteiro): Total de XP ganho (considerando bônus).
    *   `session_gold_gained` (Inteiro): Total de Ouro ganho.
    *   `total_correct` (Inteiro): Quantidade de acertos.
    *   `total_wrong` (Inteiro): Quantidade de erros.
    *   `total_time_ms` (Inteiro): Tempo total gasto.
    *   `max_combo` (Inteiro): Maior sequência atingida nesta tentativa.

### 2.2. Backend (Lógica de Negócio)
A cada resposta, os dados da tentativa atual devem ser adicionados aos totais do progresso.
*   **Arquivo Afetado:** `core/services/answer_service.py`
*   **Ação:** Atualizar o bloco `# 6. Update UserDungeonProgress` para incrementar `session_xp_gained`, `session_gold_gained`, `total_correct`, `total_wrong` e tempo, além de registrar o maior combo localmente para a masmorra.

### 2.3. Backend (API)
A View que retorna o estado atual da masmorra precisa incluir esses dados se a masmorra estiver concluída.
*   **Arquivo Afetado:** `core/views.py` (`DungeonCurrentView`)
*   **Ação:** Quando `is_completed=True`, serializar os novos campos para que o frontend possa renderizá-los.

### 2.4. Frontend (Interface de Resumo)
*   **Arquivo Afetado:** `src/app/dungeon/[id]/page.tsx`
*   **Lógica de Rank:**
    *   **S:** 95% - 100% de Precisão
    *   **A:** 85% - 94% de Precisão
    *   **B:** 70% - 84% de Precisão
    *   **C:** 50% - 69% de Precisão
    *   **D:** < 50% de Precisão
*   **Visual:** Cards de estatísticas (Trophy, Timer, Target), grade animada, feedback sonoro simulado (efeitos visuais), e botões para voltar à Home ou ver o histórico.

## 3. Plano de Implementação

1. **Fase 1: Backend - Modelagem**
   - Atualizar `core/models.py`.
   - Rodar `makemigrations` e `migrate`.
   
2. **Fase 2: Backend - Rastreamento**
   - Atualizar `AnswerService.submit_answer` para incrementar os campos.
   - Atualizar `DungeonCurrentView` para retornar os `summary_stats` se `completed == True`.

3. **Fase 3: Frontend - Layout Épico**
   - Criar interfaces de tipo para os novos `summary_stats` na `DungeonPage`.
   - Construir a UI de Rank e Estatísticas.

## 4. Testes e Verificação
- Atualizar os testes de progressão e itens para garantir que os campos de sessão são incrementados corretamente.
- Testar a conclusão de uma masmorra no frontend e verificar se o Rank é calculated com base na taxa de acerto correta (ex: 100 acertos = Rank S).