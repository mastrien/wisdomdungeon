# Planejamento da Refatoração de Inventário e Uso de Itens

Este documento planeja a reorganização da interface de inventário e a implementação da ativação manual de itens durante a exploração de masmorras.

## 1. Melhorias na Interface do Inventário

### 1.1. Restrição do Botão "Equipar"
O botão "Equipar" deve ser exibido **apenas** para itens do tipo `passive`.
*   **Locais:** `src/app/inventory/page.tsx`, `src/components/InventoryOverlay.tsx`.
*   **Ação:** Ocultar o botão completamente para itens `consumable` em vez de apenas desabilitá-lo.

### 1.2. Nova Região de Item Equipado (DungeonPage)
Na `DungeonPage`, será adicionada uma seção dedicada entre a área da questão e os indicadores de atributos.
*   **Conteúdo:**
    *   Nome do item equipado.
    *   Status visual: `Quebrado` (Vermelho), `Ativo/Em Uso` (Verde), `Disponível` (Azul/Branco).
    *   Indicador de cargas (ex: `Charges: 2/3`).
    *   **Botão de Ativação:** Para itens passivos ativáveis (como o Amuleto do Conhecimento), um botão manual substituirá a ativação automática.

## 2. Mudança na Mecânica de Ativação (Manual vs Automática)

### 2.1. Itens Passivos Ativáveis
Itens como o "Amuleto do Conhecimento" (reveal_wrong) não serão mais disparados no evento `on_question_start`.
*   **Nova Lógica:** O jogador deve clicar em "Ativar" na UI da masmorra.
*   **Impacto no Backend:** A estratégia `RevealWrongAmuletStrategy` usará o método `use()` em vez de `on_question_start`.

### 2.2. Feedback Visual
*   **Disponível:** Botão destacado.
*   **Ativo (Efeito em vigor):** Botão verde ou com brilho, desabilitado para evitar clique duplo na mesma questão.
*   **Sem Cargas:** Botão acinzentado e desabilitado.

---

## 3. Plano de Implementação (Passo a Passo)

### Passo 1: Limpeza da UI de Inventário
1.  Editar `src/app/inventory/page.tsx`: Remover botão de equipar para consumíveis.
2.  Editar `src/components/InventoryOverlay.tsx`: Ocultar botão de equipar para consumíveis.

### Passo 2: Refatoração do Backend (Ativação Manual)
1.  Modificar `wisdom_backend/core/services/items/reveal_wrong.py`:
    *   Remover lógica do `on_question_start`.
    *   Implementar a lógica no método `use(self, profile, inv_item)`.
    *   Garantir que o item só possa ser usado se houver uma questão ativa (verificar metadados de progresso).

### Passo 3: Nova UI na DungeonPage
1.  Criar o componente/seção de "Active Item Slot" na `DungeonPage`.
2.  Integrar com o estado do `profile` para identificar o item equipado.
3.  Implementar o botão de ativação que chama a API `/api/inventory/{id}/use/`.

### Passo 4: Estilização e Feedback
1.  Garantir que o status do item (Broken, Charges) seja atualizado em tempo real após o uso.
2.  Adicionar estados visuais claros para "Item Ativado nesta questão".

---

## 4. Riscos e Considerações
*   **Sincronização:** O frontend precisa saber se o item *já foi usado* na questão atual para desabilitar o botão. Podemos usar um campo temporário em `profile.metadata['item_used_this_turn']` que reseta a cada nova questão.
*   **Consumíveis vs Passivos Ativáveis:** O `InventoryOverlay` já permite usar consumíveis. A nova região na `DungeonPage` deve focar no item **equipado** (passivo ativável).

Este plano visa dar mais agência ao jogador, permitindo que ele escolha o momento estratégico de usar seus recursos.