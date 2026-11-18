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


## Auditoria das referências (18/11, continuação, evidência real no servidor)

- Pares canônicos confirmados pelos dados cadastrais e vínculos:
  - pessoa 2745 <- 2765 (6 participações da duplicada, 4 da principal);
  - pessoa 2754 <- 2767 (7 participações, 0 da principal), principal com system_user_id 367 e dispositivo associado;
  - pessoa 2773 <- 2774 (8 participações, 0 da principal), status do colaborador da principal = G, preservar.
- `event_participant` possui índice UNIQUE parcial `ux_event_participant_evento_pessoa_data` em `(event_id,person_id,event_date) WHERE deletado_em IS NULL`.
- Conferência read-only de eventos em comum: **zero** para os três pares.
- Auditoria de todas FKs simples para Pessoa encontrou somente 21 referências nas duplicadas, todas em `public.event_participant.person_id`, MAS duas tabelas **não puderam ser consultadas**: `public.procurement_oc_item.fornecedor_id` e `public.totvs_fornecedor_vinculo.pessoa_id`. SQLSTATE `42501`, permissão insuficiente. Não declarar inspeção completa.
- Nenhuma alteração realizada até aqui. Próximo passo seguro: **migrar apenas as 21 participações** por transação/backup, sem eliminar/inativar Pessoas. Validar contagem, destino e restrição UNIQUE, e manter integridade dos metadados originais.
- Para excluir/inativar registros duplicados no futuro: verificar as duas tabelas com papel de auditoria autorizado e qualquer dependência não declarada; preservar backups e idempotência.
- Investigação de causa: duplicadas incompletas com participações; comparar eventos e timestamps/criado_por/importação. A origem exata ainda não foi comprovada.
