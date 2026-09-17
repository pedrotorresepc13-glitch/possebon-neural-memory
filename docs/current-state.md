# Estado atual conhecido — POSSEBON App/Web

Atualizado em 17/09/2026.

Este arquivo é um resumo humano do estado operacional. O snapshot estruturado autoritativo está em `data/current-state.json`. Não marcar nada como aplicado em produção sem confirmação/teste do usuário.

## Fontes de verdade atuais

- Flutter: `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- HEAD Flutter confirmado: `c35188f865dafa502fef0bfe5302ca9c5c8c137a`.
- Backend MAD Builder atual analisado: `possebon_web-17-09-2026-14-55-37.zip`, enviado pelo usuário.
- GitHub Web não é fonte autoritativa do PHP do MAD Builder quando houver ZIP/backend mais recente enviado pelo usuário.

## Flutter — prioridades 1 a 4

- Prioridade 1 Planos: aplicada no Flutter.
- Prioridade 2 Segurança Operacional: aplicada no Flutter.
- Prioridade 3 Performance teclado/telas: aplicada e validada estaticamente; runtime pendente.
- Prioridade 4 RDO: aplicada e validada estaticamente; runtime pendente.

Commits confirmados relevantes:
- Segurança unificada: `12da8bc83a322954d3bca783e556b98ce142c3e3`.
- Performance: `718ee93a`.
- RDO edição: `c35188f865dafa502fef0bfe5302ca9c5c8c137a`.

## Backend — correção preparada em 17/09

Pacote atual preparado, **ainda não confirmado como aplicado**:

`POSSEBON_CORRECAO_DONO_PHOTOREPORT_PDF_17-09-2026.zip`

Base exata usada para produzi-lo:

`possebon_web-17-09-2026-14-55-37.zip`

Arquivos alterados:
- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/RondaGerencialAppApiTrait.php`
- `app/custom/AmigoPeitoAppApiTrait.php`
- `app/model/EdDonoAreaPorAreaMes.php`
- `app/model/EdAvaliacaoArea.php`
- `app/model/EdAvaliacaoAreaGrafico.php`
- `app/model/EdDonoAreaGraficoSem.php`
- `app/control/sms/SmsDonoDeAreaDashboard.php`

Validação estática concluída:
- `php -l` nos 8 arquivos: OK;
- composição `SegurancaOperacionalAppApiTrait + RondaGerencialAppApiTrait + AmigoPeitoAppApiTrait`: OK;
- contrato Flutter de múltiplas evidências da conclusão do Plano: conferido;
- vínculos PhotoReport `AudicompItem`, `CondicaoInsegura`, `ReconhecimentoSeguro` e `PlanoAcao`: conferidos;
- fórmula de referência 27 conformes + 1 não conforme = 96,43%: conferida.

## Dono de Área — regra de cálculo

Regra oficial preservada:

`Resultado = SIM / (SIM + NÃO) * 100`

N/A não entra no denominador.

O app moderno grava `tipologia`:
- `C` = Conforme/Sim;
- `N` = Não conforme/Não;
- `A` = N/A.

As consultas do MAD Builder foram preparadas para usar `tipologia` e manter compatibilidade com registros antigos em que `descricao` continha `Sim`/`N/A`/outros valores. Também passam a ignorar `audicomp` e `audicomp_item` excluídos logicamente.

O Dashboard deixa de truncar percentuais decimais; exemplo: 96,43% não deve virar 96%.

## PDF Dono/Audicomp/Amigo

O backend preparado gera o relatório com os dados disponíveis no registro:
- identificação;
- avaliação;
- não conformidades;
- tipo e quantidade;
- ação/tratativa;
- evidência da ocorrência;
- Planos de Ação;
- responsável, planejado/replanejado, status e histórico/execução;
- imagens de conclusão do Plano;
- Condições Inseguras com imagens e 0..N planos;
- Reconhecimentos Seguros com imagens;
- observação geral;
- no final, Dono da Área e Técnico de Segurança da `SafetyArea`, com dados da Pessoa quando disponíveis.

## PhotoReport — regra preparada

Toda imagem operacional desses fluxos deve possuir vínculo oficial no `photo_report`:
- item/não conformidade: `active_record = AudicompItem`;
- condição insegura: `active_record = CondicaoInsegura`;
- reconhecimento seguro: `active_record = ReconhecimentoSeguro`;
- conclusão do Plano de Ação: `active_record = PlanoAcao`, `primary_key = plano_acao.id`.

A conclusão aceita até 10 imagens. O caminho legado em `audicomp_item.evidencia` é mantido como espelho quando necessário para compatibilidade.

Meu Amigo do Peito também passa a registrar sua evidência de item no PhotoReport.

## Ronda Gerencial

Minha Ronda continua como referência funcional/visual.

No backend preparado:
- reconhecimento seguro mantém ID durante edição;
- imagem de reconhecimento vai ao PhotoReport;
- PDF mostra imagem do reconhecimento;
- PDF mostra histórico e imagens de conclusão dos Planos de Ação.

Ao concluir/replanejar Plano ligado a `AudicompItem` ou `CondicaoInsegura`, o PDF da origem é regenerado para refletir o estado atual quando a origem for D/A/P/R.

## RDO

Flutter da prioridade 4 continua aplicado/validado estaticamente. Este novo pacote de Segurança não altera `RdoAppApiTrait.php`; validar RDO separadamente no baseline atual antes de qualquer novo patch.

## Sessão permanente / background

Ainda é pendência crítica depois de fechar prioridades atuais. Problema conhecido observado em produção: `dispositivo_uid`, `refresh_token_hash` e `sessao_ativa` não estavam sendo preenchidos de forma suficiente para considerar sessão permanente/geofence estáveis.

## Próximo passo

1. Aplicar somente os 8 arquivos do pacote `POSSEBON_CORRECAO_DONO_PHOTOREPORT_PDF_17-09-2026.zip`.
2. Rodar `php -l` nos 8 arquivos no servidor.
3. Testar Dono com C/N/A, condição + imagem + planos, reconhecimento + imagem e observação.
4. Conferir os registros na `PhotoReportList`.
5. Concluir um Plano com 2+ imagens e confirmar PhotoReport + PDF regenerado.
6. Testar Ronda e Amigo do Peito.
7. Só depois marcar o backend como estável/aplicado.
8. Validar RDO runtime e então retomar sessão permanente + Cerca Virtual.
