# Meu RH — Espelho de Ponto (30/10/2026)

## Fonte e decisão do usuário
- Usuário pediu implementar Espelho de Ponto no POSSEBON App para colaborador ativo, usando `controle_acesso.tipo = P`, como parte do Meu RH. Folha de pagamento fica para depois.
- Fonte histórica de dados: CSV `sql1289442827.csv`, 209.617 registros de controle_acesso, destes **192.509 tipo P** e todos esses P da `unit_id 3` no recorte. Por colaborador/dia, a maioria dos conjuntos de P tem **2 batidas**; 4 batidas são raras. Portanto, **não inventar 12h e 13h como marcações reais**; só horário previsto e intervalo presumido explicitado.
- Backend baseline: `possebon_web-26-10-2026-22-21-50.zip`; modelos `ControleAcesso`, `TotvsAtestado`, `Colaborador`. ZIP não contém tabela/modelo estruturado de feriado: calendário atual em `/api/app/calendario` lê imagens institucionais `app_mensagem`, **não** deve ser interpretado como feriado por data.
- Turno **dia**: seg–qui 07:00–12:00 / 13:00–17:00 (9h), sexta 07:00–12:00 / 13:00–16:00 (8h). Sábados, domingos e feriados nacionais trabalhados contam como extra estimada. Turno noite sem escala confirmada: **não implementar cálculos presumidos noturnos**.
- Atestados vêm de `totvs_atestado` por `colaborador_id + unit_id`, entre `dtinicio/dtfinal`, sem expor CID, médico, documento ou motivos ao Flutter. Sem batida não implica falta automaticamente. Horas extras são estimativas, não remuneração ou fechamento homologado de folha.

## Alterações no Flutter — implementadas, NÃO mescladas
- Repo `pedrotorresepc13-glitch/possebon`, branch `feat/espelho-ponto-20261030`, base `feature/meu-rh-20261027` para preservar Meu RH (a branch operacional `possebon` não contém ainda esse módulo).
- Draft PR **#12**: https://github.com/pedrotorresepc13-glitch/possebon/pull/12
- `lib/features/meu_rh/data/meu_rh_api.dart`: `buscarEspelhoPonto(unitId,competencia)`, GET autenticado com sessão JWT, no-store, sem enviar pessoa_id/CPF/CHAPA; erros limpos.
- `lib/features/meu_rh/presentation/meu_rh_screen.dart`: habilita card 'Espelho de Ponto' sem mexer nos cards Envelope de Pagamentos e Histórico Salarial.
- `lib/features/meu_rh/presentation/espelho_ponto_screen.dart`: tela de competência com resumo, cartões por dia, horário previsto vs real, atestado e feriado, extra estimada, alertas, jornada atual em andamento. Não é segunda folha.
- Testes Flutter (analyze/test/build Android/Web) pendentes: Flutter SDK não disponível no runtime onde o código foi preparado. Não liberar PR antes da verificação de compile.

## Backend PHP — preparado, NÃO instalado
- Pacote `/mnt/data/POSSEBON_ESPELHO_PONTO_30-10-2026.zip` criado na conversa; não assumir acesso a esse caminho em novas sessões.
- Arquivos COMPLETOS em `app/custom/ControleAcessoAppApiTrait.php` (somente novas funções `espelhoPonto`, `pontoFeriadoNacional` e `pontoCalcularDia` acrescentadas, resto preservado da exportação) e `app/routes/api.php` (somente nova rota `GET /api/app/meu-rh/espelho-ponto` no middleware JWT).
- Reaproveita identidade obrigatória `controleAcessoIdentidadeSessao` (`app_pessoa_id,app_unit_id,app_usuario_id`); confirma colaborador status A, `tipo_contrato = C`, sem desligamento, da unidade; sem aceitar identidade pessoal arbitrária via URL. Consulta read-only `controle_acesso` tipo P por intervalo do mês e `totvs_atestado` do colaborador. Feriados nacionais fixos são computados; municipais/estaduais precisam de fonte estruturada, não existia na baseline.
- Dois registros completos com intervalo 12h–13h coberto: presumir 60 min de pausa e marcar `intervalo_presumido_minutos=60`; quatro ou mais pares: somar intervalos reais; batidas ímpares/anômalas sem cálculo de extra/saldo; dia atual aberto aparece 'em andamento'. Não atribuir faltas automaticamente. Sábado, domingo, feriado: toda jornada estimada fica em extras estimadas, sem fator financeiro.
- `php -l` OK nos dois arquivos; `php test_php.php` OK com exemplos de segunda, sexta, sábado, 4 batidas, incompletos e feriado. Sem testes de API real, DB ou dispositivo.
- **Não substituir arquivo PHP do servidor sem comparar com versão atual**: ZIP é exportação 26/10, servidor pode ter mudado. Manter Designer páginas geradas intactas. Sem SSH/DB/produção modificados.

## Bloqueios para considerar pronto na produção
1. Validar backend vivo/mesclar cuidadosamente somente as mudanças customizadas em `ControleAcessoAppApiTrait.php` e `app/routes/api.php`; preservar demais evoluções posteriores.
2. Validar endpoint 200 colaborador, 401 sessão ausente, 403 unidade alheia, atestado, feriado nacional, marcações duplas e incompletas, data e timezone.
3. Rodar Flutter analyze/test/build e validar Web + Android.
4. Confirmar cadastro oficial de turno para distinguir jornada dia/noite e fonte de feriados municipais/estaduais específicos de cada unidade; nunca marcar folha como calculada por este módulo.

**STATUS: implemented_unverified — frontend em draft PR, backend preparado em arquivo, não em produção.**

## Integração da Home na main em 30/10

- O usuário relatou ausência de Meu RH e determinou centralização de **todo o App na main** com visibilidade apenas para colaboradores ativos **CLT** (status A, tipo_contrato C).
- Consolidado o conteúdo de PR #12, Transporte PR #10 e Segurança PR #11 com o estado mais atual do App. `main` confirmado em `d634bf7042b38ff852458d5f8ea7cea2bc95cf56`; backup `backup/main-pre-integracao-20261030` criado.
- Confirmados por leitura de código os três cards e a regra visual status A/contrato C. Conferidos imports e existência dos arquivos do módulo no Git; **não** é prova de compilação, publicação Web, Android ou backend ativo.
- `possebon` ainda é branch default do repositório; Vercel MCP recusou consulta ao projeto por 403 no escopo. Não afirmar mudança em produção; API PHP/endpoint Espelho continua pendente conforme pacote 30/10.

## Revisão após migração para main

- `main` HEAD confirmado: `5fb21fc462d70b559da8acf54cbc614cb90f8b89`, após o merge `d634bf7` e a verificação da visibilidade CLT/unidade.
- `podeExibirMeuRh` verifica `status=A`, `tipo_contrato=C` e `colaborador.unidade.id` coincidente com a unidade da sessão. O JSON real de `ApiAppController::meusDados` no ZIP de 26/10 contém `colaborador.unidade.id` e `tipo_contrato`. Isso evita exibir dados financeiros de unidade administrativa diferente.
- Testes manuais Dart anteriores foram atualizados e `test/features/meu_rh/meu_rh_acesso_test.dart` adicionado, mas Flutter não foi executado.
- Separar **código em main** de **publicação Web/Android**. GitHub default `possebon` permanece, Vercel não permitiu verificar projeto (403), produção não confirmada. PHP endpoints de Espelho não instalados.

## 30/10 — correções de regressão mensais (latest)

- Usuário mostrou Web de produção: Resumo da competência 184h Previstas e 112h26 Trabalhadas não deveriam ser apresentados como saldo previsto do mês; quer horas reais do mês selecionado e capacidade de navegar meses. Última instrução preserva os dois indicadores diários (horário da escala / previsto e trabalhado).
- Flutter `main`: `EspelhoPontoScreen` passa a computar resumo **só das batidas completas da competência selecionada**, mostrando horas trabalhadas e extras estimadas, dias com ponto e dias a conferir; mantém horários previstos e quantidade de horas previstas/trabalhadas no detalhe do dia. Domínio `calcularResumoPontoMensal` com testes de meses separados e marcações incompletas, a executar.
- CSV `sql1289442827.csv`: exportação P termina em **29/10/2026 14:52**, e 848 pessoas têm apenas uma batida em 29/10, por isso NÃO concluir falta ou saída não registrada na origem viva sem conferir importação posterior.
- Histórico Salarial **funcionava em 27/10** usando `app/custom/MeuRhAppApiTrait.php` e `TotvsRmApiService::getHistoricoSalarial`. Pacote PHP Espelho 30/10 trouxe `app/routes/api.php` desatualizado sem `/meu-rh/historico-salarial` e sem `/meu-rh/envelopes`; causa provável de 404 ao recolar arquivo. Corrigir por **mesclagem aditiva na versão ativa**, não recolar exportação inteira. Estado do backend vivo não verificado; não afirmar que já restaurou.
- Mensagem no Flutter 404/501 diferenciada de 503: 'consulta não disponível na versão atual' em vez de atribuir falsamente erro ao TOTVS. Documentação da correção no repo `docs/meu-rh-rotas-preservacao-20261030.md`.
- Nenhuma alteração de banco, PHP instalado ou publicação Android; somente Flutter e docs main. Compilação/testes Flutter reais pendentes.

## 30/10 — Inspeção do backend exportado 09:13:19 (último recebido)

- Fonte: `possebon_web-30-10-2026-09-13-19.zip`, 4.953 entradas; `app/routes/api.php` 1.465 linhas e **única rota Meu RH** `GET /meu-rh/espelho-ponto` na linha 312; ausentes `GET /meu-rh/historico-salarial` e `GET /meu-rh/envelopes`.
- `app/controller/ApiAppController.php` já carrega e usa `MeuRhAppApiTrait` (linhas 23/45). `app/custom/MeuRhAppApiTrait.php` já fornece `historicoSalarialMeuRh` (PT_07) e `app/service/TotvsRmApiService.php` já possui `getHistoricoSalarial`. Portanto basta adicionar a rota existente no grupo JWT para recuperar esta consulta, após comparar backend vivo.
- Comparação exata `MeuRhAppApiTrait.php` do ZIP atual vs versão revisada anterior de 27/10: apenas a descrição e os campos `funcao` / `codigo_funcao` com histórico de cargos estão ausentes no ZIP; recuperei somente esses acréscimos no arquivo revisado.
- **Envelope de Pagamentos**: não há endpoint implementado no ZIP, apesar de PT_13 e PT_14 previamente testadas na origem; não inventar método nem prometer funcionalidade.
- Artefato preparado `POSSEBON_MEU_RH_RECUPERACAO_30-10-2026.zip`: PHP completo `app/routes/api.php` com rota aditiva, `app/custom/MeuRhAppApiTrait.php` restaurado, patch isolado e instruções; `php -l` OK nos dois. **Não instalado**. Não substituir arquivos em produção se mudaram depois da exportação.

## 30/10 12:29 — correção da versão publicada / branches

- Requisito confirmado pelo usuário: fonte única de desenvolvimento sempre `main` sem branches divergentes. `main` sincronizada com a branch padrão antiga `possebon` por **fast-forward** no commit `c0ee868d16d727229534d1583496c7aa3a6ce626`; backup `backup/possebon-pre-sync-20261030` antes de mudar a referência. Não houve force ou descarte de commits.
- UI final na main: **nenhuma ocorrência de texto 'Previsto' na tela**; mantém duas marcações reais inicial/final, Trabalhado e Extra estimada por dia. Resumo usa SOMENTE competência selecionada, sem previsão nem saldo apurado para dias sem ponto; dias incompletos não mostram trabalho '--:--'; dia corrente sem marcação fica 'Aguardando marcações'; largura máxima 1080 no desktop.
- Versão do servidor: ZIP `possebon_web-30-10-2026-09-13-19.zip` possui implementação PT_07 em trait `MeuRhAppApiTrait.php`, mas falta rota historico-salarial em `app/routes/api.php`; não há endpoint de envelopes implementado. Preparado script **`POSSEBON_Corrigir_Rota_Meu_RH_Seguro.sh`**: altera *somente* a rota faltante no arquivo ativo, exige trait e controlador existentes, salva backup e roda `php -l`. Testado em diretório temporário com ZIP real e idempotência, sem tocar produção.
- Não foi possível consultar/configurar Vercel porque equipe pedrotorresepc13-glitch exige autorização, 403; link de consentimento fornecido no chat. GitHub status Vercel para commit sincronizado: pending. GitHub Actions falhando antes de steps/runner, não é validação de build Flutter. Não confirmar produção corrigida até validar deploy e executar patch PHP.
