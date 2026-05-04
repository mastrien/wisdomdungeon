# Estrutura de Itens - Wisdom Dungeon

Este documento detalha os atributos e características que podem ser usados para criar itens equilibrados e variados para a plataforma, focando em mecânicas de RPG e engajamento.

## 1. Atributos Moduladores

Para criar centenas de variações de itens, utilizamos um conjunto de atributos parametrizáveis:

### 1.1 Metadados e Identidade
- **ID/Nome/Raridade:** (Comum, Raro, Épico, Lendário).
- **Slot:** (Equipável Permanente, Consumível, Amuleto de Inventário).
- **Tags de Sinergia:** (Ex: "Matemática", "Velocidade").

### 1.2 Atributos de Recompensa (Modificadores de Saída)
- **Flat Bonus (XP/Ouro):** Valor fixo adicionado por evento.
- **Percentual Bonus (XP/Ouro):** Multiplicador sobre o ganho base (ex: +15% XP).
- **Chance de Crítico Acadêmico:** Probabilidade (0-100%) de disparar um "Crítico".
- **Multiplicador de Crítico:** O quanto o crítico aumenta a recompensa (ex: 2.0x).
- **Bônus de Maestria:** Acelera o ganho de proficiência em tópicos específicos.

### 1.3 Sistema de Cargas e Sustentabilidade
- **Cargas Máximas:** Quantas vezes o item pode ser usado.
- **Evento de Consumo:** O gatilho que gasta a carga (ex: `AO_USAR_ATIVAMENTE`, `AO_ERRAR_QUESTAO`).
- **Evento de Recarga:** O gatilho que devolve cargas (ex: `AO_COMPLETAR_SALA`, `AO_ACERTAR_5_SEGUIDAS`).
- **Taxa de Recarga:** Quantidade de cargas recuperadas por evento.

### 1.4 Gatilhos e Condições (Trigger System)
- **Evento Disparador:** `ON_CORRECT_ANSWER`, `ON_WRONG_ANSWER`, `ON_COMBO_BREAK`, `ON_TIMER_EXPIRED`.
- **Condição de Ativação:**
    - **Tempo:** "Responder em menos de X segundos".
    - **Combo:** "Combo atual maior que X".
    - **Dificuldade:** "Questões com taxa de acerto global < 30%".

### 1.5 Mecânicas de Risco e Aposta (Gambling)
- **Fator de Aposta (Wager):** Quantidade de Ouro/XP apostada ao iniciar um evento.
- **Condição de Vitória:** (Ex: "Terminar a sala sem erros").
- **Multiplicador de Sucesso:** Retorno sobre o valor apostado.
- **Penalidade de Falha:** O que o jogador perde se não cumprir a condição.

---

## 2. Novas Características Sugeridas

1. **Índice de Perseverança (Error Shield):** % de chance de manter o combo mesmo errando a questão.
2. **Raio de Revelação (Oracle Chance):** % de chance de eliminar uma alternativa incorreta ao iniciar a questão.
3. **Magnetismo de Consumíveis:** Aumenta a chance de "drop" de itens ao finalizar uma sala.
4. **Eco Cognitivo (Combo Multiplier):** O bônus do item aumenta conforme o combo cresce.
5. **Vigor de Sessão:** Recompensa o tempo contínuo de estudo (Deep Work).
6. **Sinergia com Masmorra:** Bônus específicos para Masmorras de Elite ou temas específicos.

---

## 3. Exemplo de Implementação (JSON)

```json
{
  "nome": "Moeda do Destino Acadêmico",
  "raridade": "Épico",
  "estatisticas_passivas": {
    "chance_critico_adicional": 0.15,
    "multiplicador_critico": 2.5
  },
  "mecanica_aposta": {
    "evento_disparador": "INICIO_SALA",
    "custo_ouro": 100,
    "condicao_vitoria": "TERMINAR_SALA_SEM_ERROS",
    "recompensa_sucesso_xp_percentual": 2.0,
    "penalidade_falha_ouro": 200
  },
  "cargas": {
    "atual": 1,
    "max": 1,
    "recarga_por_evento": 1,
    "evento_recarga": "COMPLETAR_SALA"
  }
}
```
