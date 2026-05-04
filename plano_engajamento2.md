# Novas estratégias para engajamento na plataforma

Esse documento detalha as novas mudanças nas mecânicas e estrutura da plataforma.

## Risco nas masmorras.

- Ao errar uma questão, agora ao plataforma mostra qual era a resposta correta e **pula esta questão** ao invés de mostrar a mesma questão para o usuário. Esse erro deve ser contabilizado e visível na taxa de acertos que agora voltará a ficar visível no card da masmorra na página inicial.
- Errar questões custam vida. Por padrão jogadores tem 3 vidas e perdem uma por erro. Ao ficar sem vidas, eles ainda podem fazer as questões mas não ganham a mesma quantidade de recursos. (25% por exemplo, ou 0%, essa quantidade ainda está em análise)

## Customização

- Uma das recompensas por subir de nível é a customização da plataforma. As cores principais (atualmente ambar) da plataforma devem estar modularmente definidas em um lugar que seja fácil trocar de acordo com as configurações que o usuário definir.
- O botão de logout agora é substituido por um botão de mais opções (ícone de três pontinhos verticais). Ao clicar, ele exibe três opções, um caminho para a página de configurações, um botão para alternar entre modo claro e escuro e o botão de logout.
- As configurações devem incluir inicialmente tamanho de fonte e cor (as cores ainda bloqueadas aparecem com um cadeado e o botão desabilitado)

## Loja

Adicione uma região para a loja futura entre a região de masmorras e a região de histórico. Por agora essa região da loja apenas terá uma mensagem de "Loja disponível em breve!" enquanto eu trabalho na mecânica da loja e os itens dela.

# Plano de implementação (Gemini CLI)

Este plano segue o procedimento de desenvolvimento Test-First descrito em `procedimento.md`.

## Fase 1: Mecânica de Risco e Vidas (Backend) [CONCLUÍDO]
- [x] **Teste:** Criar `core/tests/test_dungeon_risk.py` para validar:
    - Perda de vida (HP) ao errar questão.
    - Pulo de questão (incremento de index) mesmo em caso de erro.
    - Penalidade de recompensas (25%) quando HP chegar a 0.
    - Exibição da resposta correta no payload de resposta.
- [x] **Implementação:**
    - Atualizar `Profile` em `core/models.py` com `hp` (default 3) e `max_hp` (default 3).
    - Criar migração.
    - Refatorar `AnswerService.submit_answer` para implementar a lógica de perda de vida e avanço forçado.
    - Garantir que `AnswerView` retorne a resposta correta quando o usuário errar.

## Fase 2: Sistema de Tematização Modular (Frontend/CSS)
- [ ] **Implementação CSS:**
    - Refatorar `globals.css` para utilizar variáveis CSS (ex: `--brand-primary`, `--brand-primary-hover`) em vez de classes fixas `amber-500`.
    - Mapear cores principais para essas variáveis.
- [ ] **Fundação de Dados:**
    - Atualizar `Profile` no backend com `theme_color` (string) e `font_size` (string).
    - Atualizar `ProfileSerializer` e `ProfileView` para suportar a persistência dessas configurações.
- [ ] **Injeção de Tema:**
    - Criar um componente `ThemeProvider` ou atualizar o `AuthContext` para aplicar as variáveis CSS ao `document.documentElement` baseado nas preferências do perfil.

## Fase 3: Refatoração do Header e UI de Opções
- [ ] **Teste:** Atualizar `Header.test.tsx` para verificar:
    - Desaparecimento do botão de Logout direto.
    - Presença do botão de "Mais Opções" (ícone de três pontos).
    - Exibição do menu suspenso com as opções: Configurações, Alternar Tema e Logout.
- [ ] **Implementação:**
    - Refatorar `Header.tsx` utilizando componentes de Menu (ou implementação customizada com Lucide `MoreVertical`).
    - Adicionar toggle de Modo Escuro/Claro (inicialmente via estado local/localStorage).

## Fase 4: Página de Configurações e Loja (Placeholder)
- [ ] **Loja:**
    - Adicionar a seção "Loja disponível em breve!" na `HomePage.tsx` entre as masmorras e o histórico.
- [ ] **Configurações:**
    - Criar `src/app/settings/page.tsx` para permitir alteração de:
        - Tamanho de fonte (Pequeno, Médio, Grande).
        - Cor do Tema (Amber, Esmeralda, Rosa, etc).
        - Implementar visual de "Cadeado" para cores não liberadas.
- [ ] **Teste:** Criar `SettingsPage.test.tsx` para validar a persistência das mudanças.

## Fase 5: Ajustes na Dungeon e Home
- [ ] **Dungeon HUD:**
    - Adicionar visualizador de vidas (corações) no HUD da `DungeonPage`.
    - Garantir que ao errar, o modal de resultado mostre a resposta correta claramente.
- [ ] **Home Cards:**
    - Garantir que a taxa de acerto diária esteja visível e precisa em cada card de masmorra.