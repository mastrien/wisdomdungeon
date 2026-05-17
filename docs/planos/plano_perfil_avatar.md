# Plano de Implementação: Engajamento, UI do Perfil e Avatar Customizado

## Objetivo
Melhorar a consistência visual da página de perfil, fornecer melhor interatividade para a rede social (seguidores) e recompensar jogadores dedicados (Nível 5+) com a capacidade de fazer upload e personalizar sua foto de perfil.

## Fase 1: Consistência Visual do Perfil
**Problema:** O layout do cabeçalho do perfil muda de tamanho dependendo do tamanho do nome do usuário ou status, e a caixa do ícone nem sempre é perfeitamente redonda.
**Ações:**
1. **Frontend (`ProfilePage.tsx`):**
   - Refatorar a div do avatar para forçar `aspect-square`, `rounded-full` e `overflow-hidden`, garantindo um círculo perfeito independentemente da imagem ou placeholder interno.
   - Refatorar a estrutura do cabeçalho (ícone + informações + botão) utilizando um `grid` com larguras fixas ou `flex` com tamanhos mínimos (`min-w`) para garantir que os elementos não sejam esmagados ou esticados baseados no conteúdo do texto adjacente.

## Fase 2: Modal de Rede (Seguidores e Seguindo)
**Problema:** Atualmente só existem os contadores de seguidores, sem forma de ver quem são.
**Ações:**
1. **Backend (`core/views.py`):**
   - Criar uma view/endpoint `FollowersListView` (`/api/profile/<username>/network/`) que retorne duas listas: `followers` e `following`, contendo os dados básicos (username, level, avatar_url) de cada usuário.
2. **Frontend (`ProfilePage.tsx` & Componentes):**
   - Tornar a área de contagem de seguidores/seguindo clicável.
   - Criar um componente modal `NetworkModal` que exibe duas colunas (ou abas).
   - Renderizar os perfis como botões/links navegáveis para suas respectivas páginas de perfil.

## Fase 3: Trilha de Recompensa (Nível 5)
**Ações:**
1. **Backend (`core/services/progression_service.py`):**
   - Atualizar o dicionário/lógica de recompensas para incluir "Avatar Customizado" como recompensa desbloqueada no Nível 5.
   - Retornar essa informação na API de progressão (`/api/progression/rewards/`).

## Fase 4: Upload e Edição de Avatar Customizado
**Regras de Negócio:** Desbloqueado no nível 5+, max 1MB, possibilita crop/zoom, e substitui a foto antiga no Firebase Storage.
**Ações:**
1. **Backend (`core/models.py` & API):**
   - Adicionar o campo `avatar_url` (URLField/CharField, nullable) ao modelo `Profile`. (Criar e aplicar migração).
   - Atualizar `ProfileSerializer` para ler e aceitar gravação (PATCH) desse novo campo.
2. **Frontend (Configuração do Firebase):**
   - Certificar-se de que o Firebase Storage está instanciado no `firebase.ts` (`getStorage`).
3. **Frontend (`ProfilePage.tsx` & `AvatarCropper.tsx`):**
   - **Botão:** Adicionar um botão "Alterar Ícone" sobre o avatar no perfil (visível apenas para o dono). Se `level < 5`, o botão exibe um cadeado e um tooltip explicando o requisito.
   - **Upload & Validação:** Ao clicar (nível 5+), abrir seletor de arquivos. Validar se o arquivo é imagem e se o tamanho é <= 1MB.
   - **Crop & Zoom:** Criar um modal de edição (utilizando recursos nativos do Canvas ou uma lib leve como `react-easy-crop`) para permitir arrastar e aplicar zoom na imagem, gerando um recorte quadrado.
   - **Armazenamento:**
     - Converter o recorte final para Blob/File.
     - Fazer o upload diretamente para o Firebase Storage no caminho `avatars/{firebase_uid}.jpg`. Como o nome do arquivo será sempre o UID do usuário, o Firebase sobrescreverá o arquivo automaticamente, garantindo que não armazenaremos as fotos antigas.
     - Após o sucesso do upload, pegar a URL de download gerada pelo Firebase Storage.
   - **Atualização:** Enviar um `PATCH` para a API do backend `/profile/` atualizando o campo `avatar_url`.
   - **Sincronização:** Disparar `refreshProfile` do `AuthContext` para atualizar o header da aplicação e o próprio perfil na tela.

---
*Este plano está pronto para execução. Aguardando aprovação.*