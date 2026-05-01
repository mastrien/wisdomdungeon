# MVP

Para a primeira versão, vamos simplificar pontuação, ouro e xp.

Teremos um mundo focado em matemática, esse mundo poderá ter múltiplas dungeons (com diferentes assuntos referentes a matemática). Esse primeiro mundo será o mais simples de todos (de implementar), pois todas as questões poderão ser geradas automaticamente. Tratam-se de desafios simples de álgebra básica, cálculo, álgebra linear, geometria, etc... Vários assuntos serão vinculados a este mundo.

Mundos será um conceito que deixará claro para o usuário que futuras novidades estão por vir. O próximo mundo por exemplo, será o "mundo" do ENEM, onde vamos consumir a api enem.dev para alimentar questões dos assuntos das quatro áreas da prova. Mas isso NÃO é o foco do MVP, vamos focar na parte de matemática.

A stack de infraestrutura, backend, banco de dados, autenticação, frontend, tudo será igual, o usuário só precisará de um email, um username e uma senha para entrar.

Ao entrar ele escolherá um mundo (por enquanto apenas uma opção disponível)

E no mundo terá uma lista de dungeons disponíveis (masmorras). O sistema reseta as dungeons disponíveis em um intervalo de horas.

Os temas do primeiro mundo (Mundo da Matemática) estão listados abaixo. As questões deles serão geradas automáticamente e não ficarão previamente armazenadas em banco.

- Álgebra Linear
- Cálculo Básico
- Álgebra básica
- Geometria
- Probabilidade

Todo o histórico de questões feitas pelo usuário deverão ser salvas (qual era a questão e se ele acertou ou não)

> Alerta de possível problema no futuro. Aqui como as questões são geradas automaticamente, elas não tem um "ID" no banco, mas quando formos puxar questões da api enem.dev gostaríamos de poder se referir as questões através do seu ID, como resolveremos isso?