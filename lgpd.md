# Diretrizes LGPD - Wisdom Dungeon

A conformidade com a Lei Geral de Proteção de Dados (LGPD) é essencial para o Wisdom Dungeon, especialmente por lidar com dados de estudantes e performance acadêmica.

## 1. Princípios Fundamentais
*   **Minimização:** Coletar apenas o necessário (E-mail, Nickname, Senha). Evitar pedir dados como CPF ou endereço, a menos que se tornem estritamente necessários.
*   **Transparência:** Manter Termos de Uso e Política de Privacidade claros, explicando que os dados de erros/acertos são usados para gerar métricas de aprendizado.
*   **Segurança:** Implementar medidas técnicas (criptografia, firewalls) para proteger os dados contra acessos não autorizados.

## 2. Tratamento de Dados de Menores
Dado que o público-alvo são estudantes de vestibular (muitos entre 16 e 18 anos):
*   **Adolescentes (12-18 anos):** O tratamento deve ser feito em seu "melhor interesse". A coleta de dados de performance para fins educacionais se enquadra nisso, mas deve ser transparente.
*   **Crianças (< 12 anos):** Se a plataforma for usada por este público, é **obrigatório** obter o consentimento específico de um dos pais/responsável.

## 3. Direitos do Usuário (Titular)
A plataforma deve oferecer meios para que o usuário possa:
1.  **Acessar:** Ver quais dados a plataforma possui sobre ele.
2.  **Corrigir:** Alterar informações incompletas ou incorretas.
3.  **Excluir:** Deletar sua conta e todos os dados associados (Direito ao Esquecimento).
4.  **Portabilidade:** Exportar seus dados de progresso/maestria.

## 4. Gamificação e Privacidade
*   **Rankings:** Por padrão, usar apenas o **Nickname** em rankings públicos para evitar a identificação direta do indivíduo por terceiros.
*   **Perfilamento:** Informar o usuário que o sistema analisa seus erros/acertos para sugerir conteúdos (isso é considerado um perfilamento para fins pedagógicos).

## 5. Checklist de Implementação
- [ ] Criar página de Política de Privacidade.
- [ ] Criar fluxo de exclusão de conta definitivo.
- [ ] Implementar exportação de dados em formato legível (JSON/CSV).
- [ ] Garantir que o Firebase armazena os dados em regiões seguras.
