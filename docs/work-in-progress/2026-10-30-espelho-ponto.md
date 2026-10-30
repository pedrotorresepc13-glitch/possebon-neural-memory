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
