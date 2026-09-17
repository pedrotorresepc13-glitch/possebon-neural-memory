# Estado atual conhecido — POSSEBON App/Web

Atualizado em 17/09/2026.

Este arquivo é um resumo humano. O snapshot estruturado autoritativo está em `data/current-state.json`.

## Fontes de verdade

- Flutter: `pedrotorresepc13-glitch/possebon`, branch `possebon`, HEAD confirmado `c35188f865dafa502fef0bfe5302ca9c5c8c137a`.
- Backend MAD Builder analisado: `possebon_web-17-09-2026-14-55-37.zip`.
- Para PHP exato do MAD Builder, o ZIP/arquivo mais recente enviado pelo usuário prevalece sobre GitHub Web.

## Regra de edição MAD Builder

Priorizar, nesta ordem:
1. recursos nativos do Designer/MAD Builder;
2. `app/custom`;
3. `app/routes` e `app/controller` quando a integração exigir;
4. código em pontos Custom Code explicitamente permitidos pelo Designer.

Não sobrescrever manualmente classes geradas em `app/model` nem páginas `app/control` inteiras. Se uma DBQuery/model gerada precisar mudar, alterar sua consulta pelo Designer/MAD Builder mantendo o mesmo nome.

## Segurança Operacional — aplicado pelo usuário em 17/09

O usuário confirmou que já aplicou estes três arquivos:

- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/RondaGerencialAppApiTrait.php`
- `app/custom/AmigoPeitoAppApiTrait.php`

`ApiAppController.php` já requer/usa esses traits e `app/routes/api.php` já possui as rotas necessárias de Segurança, Ronda, Planos e Amigo do Peito. Portanto não há mudança adicional de routes/controller necessária para a correção atual.

Esses traits implementam o fluxo de API necessário para:
- Dono/Audicomp trabalhar com `tipologia C/N/A`;
- gravar `result`, `escore`, `deviations` e `not_applicable` no cabeçalho;
- regra de nota `C / (C + N) * 100`, ignorando N/A;
- PhotoReport para `AudicompItem`, `CondicaoInsegura`, `ReconhecimentoSeguro` e `PlanoAcao`;
- PDF completo do fluxo Dono/Audicomp criado pelo app, incluindo avaliação, não conformidades, tratativa, condições inseguras, planos, reconhecimentos, imagens e observação;
- Dono da Área e Técnico de Segurança da `SafetyArea` no final do PDF, usando dados da Pessoa;
- Ronda com reconhecimento seguro em PhotoReport/PDF;
- Amigo do Peito com evidência no PhotoReport;
- múltiplas imagens de conclusão de Plano de Ação.

## Importante — pacote anterior de 8 arquivos

O pacote `POSSEBON_CORRECAO_DONO_PHOTOREPORT_PDF_17-09-2026.zip` continha também quatro Models gerados e a página `SmsDonoDeAreaDashboard.php`.

Esses cinco arquivos **não devem ser aplicados manualmente**:
- `app/model/EdDonoAreaPorAreaMes.php`
- `app/model/EdAvaliacaoArea.php`
- `app/model/EdAvaliacaoAreaGrafico.php`
- `app/model/EdDonoAreaGraficoSem.php`
- `app/control/sms/SmsDonoDeAreaDashboard.php`

A ideia técnica das consultas continua válida, mas deve ser aplicada pelo Designer/DBQuery do MAD Builder.

## Dashboard Dono de Área — pendente no Designer

`SmsDonoDeAreaDashboard` usa estas quatro DBQuery:
- `EdDonoAreaPorAreaMes`
- `EdAvaliacaoArea`
- `EdAvaliacaoAreaGrafico`
- `EdDonoAreaGraficoSem`

Problema das consultas atuais: elas contam `audicomp_item.descricao = 'Sim'/'N/A'`, enquanto o app moderno grava o resultado em `audicomp_item.tipologia` (`C`, `N`, `A`). Também precisam ignorar registros com `audicomp.deletado_em` ou `audicomp_item.deletado_em` preenchidos.

Regra da consulta nova:
- se `tipologia` for `C`, `N` ou `A`, ela é a fonte principal;
- para legado, `descricao = 'Sim'` vira `C`, `descricao = 'N/A'` vira `A`, demais viram `N`;
- excluir logicamente apagados;
- nota = `C / (C + N) * 100`.

A página também possui transformers com `intval($value)`, o que transforma 96,43 em 96. Esse ajuste deve ser feito apenas pelo Designer/Custom Code editável correspondente, nunca substituindo a página inteira.

## Flutter prioridades

- Prioridade 1 Planos: aplicada.
- Prioridade 2 Segurança: aplicada.
- Prioridade 3 Performance: aplicada estaticamente, runtime pendente.
- Prioridade 4 RDO: aplicada estaticamente, runtime pendente.

## Próximo passo

1. Não aplicar os Models/Control do pacote anterior.
2. Manter os três traits custom já instalados.
3. Testar Dono criado pelo app: nota, PDF completo e PhotoReport.
4. Corrigir as quatro DBQuery pelo próprio MAD Builder/Designer, uma de cada vez.
5. Ajustar a exibição decimal do dashboard apenas no ponto Custom Code/Designer permitido.
6. Validar Ronda e Amigo do Peito.
7. Depois validar RDO runtime e retomar sessão permanente + Cerca Virtual.
