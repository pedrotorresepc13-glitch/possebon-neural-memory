# POSSEBON APP — Espelho de Ponto PT_23 (17/11/2026)

**Status:** `backend_applied_runtime_unverified` — PHP aplicado em produção e validado por SHA/sintaxe; ainda sem apuração PT_23 comprovada na API. O Flutter recebeu ajuste de texto na main, não publicado em Play.

## Estado confirmado
- Flutter `pedrotorresepc13-glitch/possebon`, branch `main`, commit `eddb09f963e33f18e0cd39eb5d339d7952b30588`: tela e contrato PT_23 preparados. A branch padrão remota `possebon` não é fonte atual para o Flutter.
- Backend vivo auditado por SSH: `app/custom/MeuRhAppApiTrait.php` SHA256 `71669bac90f3e73be21879e005973c9275cb1cc11b02225ba469daa5fce0d08a`, contém apenas `historicoSalarialMeuRh`; `espelhoPonto` está em `app/custom/ControleAcessoAppApiTrait.php`. Não foi localizado método `envelopesMeuRh` no diagnóstico do servidor, apesar de a rota continuar presente.
- `app/routes/api.php` já aponta `/api/app/meu-rh/espelho-ponto` para `ApiAppController::espelhoPonto` sob `AppApiBearerMiddleware`.
- `TotvsRmApiService::executarConsultaSql` está disponível no backend; a chamada prevista à sentença `PT_23` usa `CODCOLIGADA`, `CHAPA`, `ANO`, `MES` resolvidos pelo servidor.
- O handler antigo em ControleAcessoAppApiTrait era somente marcações e estimava horários/intervalos, horas e extras com jornada fixa; isso não é apuração oficial.
- O teste local no Windows não atualizou o Flutter: `git pull --ff-only origin main` retornou `Cannot fast-forward to multiple branches` e o teste `espelho_ponto_periodo_test.dart` não existia localmente. `flutter run` compilou a versão local, que pode estar defasada.

## Regra do produto
- Fonte das batidas de entrada/saída = PostgreSQL `controle_acesso` (`tipo='P'`), escopada por `pessoa_id` e `unit_id`; pode estar mais atual do que TOTVS.
- Fonte dos períodos oficiais e da apuração (trabalhadas, extras, faltas, atrasos, abonos e compensações) = TOTVS RM/PT_23, em tempo real.
- Não recalcular horas por pares de marcações, não presumir almoço/escala, não inventar feriados e não gravar apuração TOTVS no PostgreSQL.
- JWT resolve identidade, valida CLT ativo na unidade, empresa/codcoligada e CHAPA; não aceitar matrícula do app.
- API mantém resposta do Flutter com `periodos`, `periodo`, `dias[*].batidas`, `dias[*].apuracao_totvs`, `resumo_totvs`; sem PT_23, mostra somente batidas e nenhum total estimado.
- Cache de RH no telefone é item separado e exige proteção criptográfica e isolamento por usuário/unidade; não afirmar que já está implementado.

## Implementação preparada fora de produção
- Artefato `ControleAcessoAppApiTrait_PT23_CORRIGIDO.php`, SHA256 `4dece1167259d1e9a9f2e0f2f27679b9b0432b159d8568940fd8bb81d86eb3c8`.
- Instalador `instalar_espelho_pt23_seguro.py`, SHA256 `1c77c90ba76e9d95e98bd92654c206d3f1c791e7415fed92ac7cd3e0404741ff`, dry-run por padrão, hash guard, lint antes de instalar, backup e resta do arquivo preservado.
- Testes de simulação PHP: sucesso para período de 21/10/2026 a 20/11/2026, quatro batidas do dia 21/10, resumo oficial de minutos, e fallback sem PT_23; `php -l` aprovado.
- Não foram modificados arquivos na produção, repositório Flutter nem banco de dados por esta preparação.

## Pendências obrigatórias
1. Transferir instalador ao servidor, rodar dry-run, comparar o hash do método real, conferir backup e aplicar somente após validação.
2. Testar PT_23 ao vivo e conferir se a consulta está cadastrada no mesmo escopo da chamada (coligada/sistema), sem assumir que responde somente por estar cadastrada no RM.
3. Fazer teste JWT autenticado da EPC13: datas 21/10–20/11, marcações, apuração diária e resumo, comparando com RH do TOTVS.
4. Corrigir atualização local do Flutter sem descartar arquivos; rodar o teste de período e validação no dispositivo.
5. Auditar a ausência do método `envelopesMeuRh` no PHP vivo antes de declarar Envelopes em produção funcional.


## Confirmação de instalação em produção e incidente em 17/11/2026
- Usuário confirmou SSH: `app/custom/ControleAcessoAppApiTrait.php` em produção SHA256 `4dece1167259d1e9a9f2e0f2f27679b9b0432b159d8568940fd8bb81d86eb3c8`, alterado às 12:37:06 (-03), `php -l` OK e verificações textuais do método PT_23/serviço/controle_acesso/resumo_totvs OK.
- Screenshot às 12:44 mostra nova UI Flutter `Meu RH · EPC13`, exibe marcações de 06/11 mas texto `O TOTVS ainda não enviou a apuração deste dia`. Não comprova ausência de apuração no RM; pode ser falha de request ou validação PHP.
- Causa técnica para ocultação: `espelhoPonto` envolve consulta PT_23/parse em `try/catch(Throwable)`; ao falhar, descarrega período/resumo/dias apurados e retorna só `controle_acesso`. Só registra classe da exceção em `error_log`. A consulta HTTP real e os dados do resumo permanecem NÃO VERIFICADOS.
- Regra UX reafirmada: interface não deve mencionar TOTVS/PT_23, mensagens de integração nem termos de desenvolvimento; precisa resumo de horas trabalhadas, horas extras executadas/autorizadas/calculadas e demais valores oficiais, diário de entradas/saídas reais, feriados e demais ocorrências quando confirmados.
- Flutter UI corrigido na branch `main` commit `925f12152c2479b0376c59084712b64242b65aa2`: esconde termos técnicos nas mensagens, títulos neutros e adiciona horas extras executadas nos resumos e detalhes diários. Atualização de código apenas, sem build/teste local nem publicação na Play.
- Próximo passo de diagnóstico: localizar registro `[MeuRh PT23]` nos logs efetivos do PHP do servidor, identificar se falha de HTTP/cadastro/escopo da sentença ou validação de linhas; confirmar resposta da API autenticada sem expor CHAPA/token/CPF; só depois corrigir backend. Não afirmar funcional enquanto resumo e diário não aparecerem com valores reais.
