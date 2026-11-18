# Auditoria CPF duplicado — 18/11/2026 — POSSEBON

**Status:** comprovado em produção por diagnóstico somente-leitura; ainda não corrigido.

Resultado do diagnóstico em PostgreSQL `possebon_app` executado pelo usuário:
- **Três pares distintos** de `Pessoa` com mesmo CPF depois de retirar pontuação (6 registros envolvidos).
- Um dos três pares apresenta diferença de diacrítico no nome (equivalente a João/Joao); nome diferente não é a chave do problema.
- **Um quarto par** tem nome e nascimento equivalentes, mas CPF ainda não foi confrontado; **NÃO** tratar como duplicata comprovada.
- Nenhum registro alterado pelo diagnóstico.

O backend `ApiAppController.php` compartilhado em 17/11 usava `Pessoa::where('documento','=',$cpf)->first()` seguido de `new Pessoa()->store()` em cadastro do candidato. Uma consulta exata, sem verificação de unicidade de CPF normalizado no banco e sem controle de concorrência, pode deixar passar documentos formatados diferentemente, importadores alternativos ou corridas. **Hipótese de origem, não causa ainda comprovada.**

Próxima etapa: auditoria read-only por Pessoa das referências em tabelas que tenham `pessoa_id`, dos vínculos `colaborador`, e de `pessoa.system_user_id`, sem imprimir CPF, e confrontar CPFs do quarto par. Depois identificar Pessoa canônica por vínculos oficiais e origem, planejar migração preservando histórico. Nunca mesclar, apagar, renomear ou criar índice único antes da auditoria de todas as dependências e backup validado. Bloquear novas duplicações pela identidade CPF normalizada e restrição única apropriada apenas após saneamento, preservando clientes jurídicos e nulos.

Separar esse caso da pendência de cadastro obrigatório de e-mail/telefone e regularização do primeiro acesso. Candidato à Play Store PR #14 continua bloqueado.
