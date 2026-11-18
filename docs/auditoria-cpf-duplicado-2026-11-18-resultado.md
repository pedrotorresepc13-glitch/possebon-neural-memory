# Auditoria CPF duplicado — 18/11/2026 — POSSEBON

## Operação de migração executada e confirmada pelo usuário — 18/11/2026, 10:26 BRT

**Status desta etapa: TRANSFERÊNCIA DOS VÍNCULOS CONCLUÍDA; PESSOAS DUPLICADAS NÃO REMOVIDAS.**

Evidência: saída real de PHP/SQL executada no servidor `epc-lap-srv01`, com conclusão transacional sem erro.

| Pessoa principal | Origem duplicada | Registros `event_participant` transferidos |
| --- | --- | ---: |
| 2745 | 2765 | 6 |
| 2754 | 2767 | 7 |
| 2773 | 2774 | 8 |
| **Total** | | **21** |

Validações relatadas pelo script aplicado:
- CPF de cada par confirmado; 21 participações travadas e contadas; nenhum conflito de evento; atualização do único campo `person_id`; checagem de todos os demais campos, de novos IDs e de zero registros restantes na origem; conclusão da transação.
- Backup integral antes da escrita: `/root/possebon-backups-pessoa/event-participant-20261118-102642-3301452.json` (no servidor; NÃO disponibilizar publicamente); SHA-256 `b8390b53eb51a4727b03b85224acc6fe385f2e38e471a52cf6aa5aeb87d108cf`.
- **Não foi feito UPDATE/DELETE em `pessoa`.** As seis linhas (três principais + três duplicadas) continuam existindo; não afirmar consolidação completa, tampouco resolução da causa.
- Auditoria de dependências ainda incompleta por `42501` em `procurement_oc_item.fornecedor_id` e `totvs_fornecedor_vinculo.pessoa_id`. Precisam de leitura autorizada antes de qualquer inativação/exclusão.
- Dupla suspeita 1742/1803 ainda não verificada por CPF.
- A rotina que recria pessoas incompletas, e o defeito de cadastro/primeiro acesso sem contato obrigatório, continuam pendentes e bloqueiam release à Play Store.

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

## Diagnóstico com leitura administrativa — 18/11/2026, após transferência

**Evidência fornecida pelo usuário no terminal do servidor:**
- `ApiAppController.php` **atualmente instalado**: SHA-256 `fb008f6c72923b0de6b4836c61f69aafe581fee171e0b3ea45f9b6139ec4c6cf`; `php -l` aprovado. **Não sobrescrever com patch de baseline antigo**; comparar antes.
- Backup original das 21 participações mostra `criado_por=28` para todos os eventos destas Pessoas; `unit_id=3`; participações em 04/11, 05/11 e 06/11. O usuário 28 inseriu **participações**, não está provado que criou as Pessoas. Investigar importador de treinamento, tela de eventos e logs a partir dessas datas.
- Acesso administrativo com `runuser -u postgres -- psql -d possebon_app` funcionou; ambas as tabelas antes sem privilégios foram consultadas com SELECT transacional READ ONLY. Resultado **0 linhas** nos IDs 2765,2767,2774 para `procurement_oc_item.fornecedor_id` e `totvs_fornecedor_vinculo.pessoa_id`.
- A mensagem `could not change directory to /home/acessoconsole01: Permission denied` foi aviso não fatal de execução sudo/runuser, não erro SQL. Resposta registrou `BEGIN`, `(0 rows)`, `ROLLBACK`.
- Auditoria de FKs com conta PHP anterior encontrou somente 21 `event_participant.person_id` nas duplicadas; estes **21 registros foram depois transferidos** com validação. As três Pessoas duplicadas ainda não foram apagadas/inativadas até este diagnóstico.
- Próxima ação: transação de limpeza guardada por precondições e backup local integral de linhas de `pessoa` (não imprimir dados pessoais), em conexão administrativa para checar novamente todas as FKs antes de qualquer exclusão; depois inspecionar origem e prevenir via unicidade por CPF normalizado.
- **Cuidado:** não tratar a ausência de referência em FKs como prova absoluta da ausência de referências sem FK. Se forem identificadas referências não declaradas ou triggers desconhecidos, não eliminar antes de reconciliar.

## Consolidação encerrada em produção — 18/11/2026, 11:01 BRT

**Conclusão confirmada no terminal do usuário, não apenas planejada:**

- Backup integral das seis Pessoas imediatamente antes da exclusão:
  - Arquivo **servidor** `/root/possebon-backups-pessoa/pessoa-antes-consolidacao-20261118-110110.json`
  - SHA-256 `1e4cb216f80046f597b0718f504433f427c7ba7fc3d3c699fc719de499b9b11a`
  - Script validou seis Pessoas, os três pares com CPF normalizado idêntico, ausência de referências FKs, ausência de participações nas origens, `system_user_id`/contatos/nascimento/CEP vazios nas duplicadas e ausência de trigger DELETE personalizado; `COMMIT` confirmado.
- **Pessoas eliminadas do PostgreSQL:** 2765, 2767, 2774. Verificação pós-COMMIT `duplicadas_restantes=0`. Dados principais 2745, 2754 e 2773 permaneceram.
- Participações pós-COMMIT: 2745=10, 2754=7, 2773=8, **total 25** (inclui 4 que Renato já tinha).
- As 21 participações antes associadas às duplicadas foram migradas na etapa anterior; esta operação removeu exclusivamente as três linhas redundantes de `pessoa`.
- **Não generalizar:** os 3 pares específicos foram saneados, mas a origem da duplicação não está comprovada; outras duplicidades podem existir. Par suspeito 1742/1803 ainda depende da comparação de CPF.
- **Pista:** no backup de event_participant original, todas as participações associadas às duplicadas foram cadastradas por `criado_por=28` (unidade 3) nas datas 04, 05 e 06/11/2026. Isso **não identifica com certeza** quem criou as Pessoas.
- PHP de produção `ApiAppController.php`: hash `fb008f6c72923b0de6b4836c61f69aafe581fee171e0b3ea45f9b6139ec4c6cf` em 18/11, sintaxe válida. Nunca instalar automaticamente o patch PHP preparado a partir de arquivo anterior sem diff e validação.
- PR Flutter #15 aberto em rascunho, não mesclado; testes de CI falharam e PHP vivo não foi alterado. Play Store segue não publicada.
