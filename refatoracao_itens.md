# Planejamento da Refatoração do Sistema de Itens

Este documento avalia e planeja a refatoração do sistema de itens para utilizar o padrão **Observer** aliado ao **Polimorfismo (Strategy)**, isolando o comportamento de cada item em classes específicas.

## 1. Avaliação de Viabilidade e Isolamento de Sessão

**Viabilidade:** A refatoração é altamente viável e representa o caminho arquitetural correto (padrão da indústria) para sistemas de RPG e jogos com múltiplos efeitos reativos. A longo prazo, se o jogo tiver 50 itens diferentes, manter um arquivo `item_service.py` com 50 blocos `if/elif` seria insustentável.

**Isolamento de Sessão (Múltiplos Usuários):** 
**O isolamento está garantido por design na arquitetura web e no Django**, desde que uma regra de ouro seja seguida: **Classes de itens não devem guardar estado na própria instância da classe (Stateful Objects).**

No Django, cada requisição HTTP (ex: usuário A respondendo uma questão) ocorre em uma thread isolada. O fluxo seria:
1. O evento ocorre (ex: Resposta Correta).
2. O sistema busca no banco de dados quais itens o *Usuário A* tem equipados.
3. O sistema instancia as classes correspondentes a esses itens *no momento da requisição*, passando o objeto `Profile` do Usuário A e o objeto `InventoryItem` do Usuário A.
4. A classe calcula o efeito, altera os dados do *banco de dados* (via objeto `Profile` ou metadados) e é destruída ao fim da requisição.

**Risco de Vazamento (Cross-Talk):** O único risco de um item do Usuário A afetar o Usuário B seria se definíssemos variáveis de classe globais (ex: `class KatahaItem: acúmulos = 0`). Como não faremos isso, e todo estado persistente continuará sendo salvo no banco de dados (`InventoryItem.metadata`), o isolamento transacional do banco e o ciclo de vida da requisição garantem 100% de segurança.

---

## 2. Prós e Contras da Refatoração

### Prós
* **Open/Closed Principle (SOLID):** Para adicionar um item novo no futuro, não será mais necessário tocar no arquivo `item_service.py`. Bastará criar um novo arquivo (ex: `espada_fogo.py`) que implementa a interface base.
* **Encapsulamento e Coesão:** Toda a lógica, metadados e regras de quebra da "Lâmina de Kataha" ficarão isoladas em um só lugar.
* **Testabilidade:** Será trivial testar itens individuais de forma unitária, apenas instanciando a classe do item e passando um perfil mockado.
* **Sistema de Eventos Limpo:** O `ItemService` deixará de ser um monstro de lógicas espalhadas e se tornará apenas um "Dispatcher" (Despachante), que avisa os itens equipados: *"Ei itens, o usuário respondeu certo, façam o que tiverem que fazer"*.

### Contras e Possíveis Problemas
* **Overhead de Mapeamento:** Como o banco de dados guarda strings (ex: `effect_type = "kataha_effect"`), precisaremos de um "Registry" ou "Factory" (um dicionário) para mapear essa string para a classe Python correspondente. Se o desenvolvedor esquecer de registrar a classe na Factory, o item não fará nada.
* **Persistência de Estado:** Desenvolvedores menos experientes podem tentar usar propriedades de classe (`self.bonus = 1.0`) achando que isso vai persistir entre os dias. Temos que garantir que a interface force a leitura e escrita no `InventoryItem.metadata`.

---

## 3. Padrão Arquitetural Proposto

### 3.1. Interface Base (`BaseItemStrategy`)
Todos os itens herdarão de uma classe base que define os ganchos (hooks) dos eventos. Por padrão, eles não fazem nada.

```python
class BaseItemStrategy:
    def on_correct_answer(self, profile, inv_item, context):
        pass

    def on_wrong_answer(self, profile, inv_item, context):
        pass

    def on_room_complete(self, profile, inv_item, context):
        pass
        
    def on_equip(self, profile, inv_item):
        pass

    def on_unequip(self, profile, inv_item):
        pass

    def apply_modifiers(self, profile, inv_item, xp, gold):
        return xp, gold
```

### 3.2. Registry (A Fábrica)
Um dicionário central mapeando os `effect_type` do banco de dados para as implementações.

```python
ITEM_REGISTRY = {
    "kataha_effect": KatahaBladeStrategy,
    "reveal_wrong": RevealWrongAmuletStrategy,
    "xp_multiplier": XPMultiplierStrategy
}
```

### 3.3. O novo `ItemService` (Event Dispatcher)
O `trigger_event` ficará genérico:

```python
def trigger_event(self, profile, event_name, context=None):
    equipped_items = InventoryItem.objects.filter(...)
    for inv_item in equipped_items:
        StrategyClass = ITEM_REGISTRY.get(inv_item.item.effect_type)
        if StrategyClass:
            strategy = StrategyClass()
            # Dinamicamente chama o método: ex: strategy.on_correct_answer(...)
            method = getattr(strategy, event_name, None)
            if method:
                method(profile, inv_item, context)
```

---

## 4. Plano de Implementação (Passo a Passo)

1. **Fase 1: Estrutura Base**
   - Criar diretório `core/services/items/` (ou `strategies`).
   - Criar `base_item.py` com a interface `BaseItemStrategy`.
   - Criar `registry.py` com o dicionário `ITEM_REGISTRY`.

2. **Fase 2: Migração das Lógicas (Refatoração)**
   - Criar `kataha_blade.py` implementando a lógica de acúmulos, penalidade e reset no desequipar.
   - Criar `reveal_wrong.py` para o amuleto de conhecimento.
   - Criar `basic_stats.py` para itens básicos de XP e Ouro.

3. **Fase 3: Refatorar `ItemService`**
   - Remover as funções `_handle_kataha_event` e `_handle_reveal_wrong`.
   - Modificar `trigger_event`, `toggle_equip` e `apply_modifiers` para buscar as lógicas via `ITEM_REGISTRY`.

4. **Fase 4: Testes e Validação**
   - Rodar toda a suíte de testes (`test_item_advanced.py`, `test_item_system.py`). Como a refatoração é estrutural (comportamento externo não muda), todos os testes devem continuar passando sem grandes alterações.

Este plano foca em manutenibilidade e está pronto para ser executado. O isolamento entre jogadores é garantido pelo escopo da requisição e pela ausência de estado global nas classes propostas.