# Correções POSSEBON App monitor + PWA iPhone — 23/10/2026

**Estado:** planned / em análise. Este documento não afirma publicação nem validação funcional.

## Escopo confirmado pelo usuário
- **App:** ações do monitor (gerenciar paradas: desvincular passageiro da parada mantendo-o na rota; cancelar gravação de trajeto iniciada por engano sem salvar; manter presença manual, QR, pontos, GPS), estabilidade do PWA no iPhone, notificações e performance.
- **POSSEBON Web:** gestão administrativa do Transporte, não recriar CRUD administrativo no app.
- Fonte Flutter: GitHub `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- Backend: só usar versão vivo/ZIP validado, nunca o `possebon_web` GitHub desatualizado.
- Respeitar `unit_id`, identidade e autorização servidor; não aproveitar endpoints não comprovados.
- Não prometer GPS em segundo plano de iPhone PWA, limitado pelo iOS.

## Gates
1. Conferir contratos e arquivos do backend antes de incorporar ações que alteram dados.
2. Evitar mexer no Android/desktop sem necessidade; preservar notificações/caches/sessão existentes.
3. Passar analyze/test/build (ou reportar indisponibilidade).
4. Revisão + teste iPhone real antes de `stable`.

## Mudanças previstas
- Corrigir listener/polling e interações com atualização repetida; proteger tela de mapa.
- Permitir ação separada para desvincular ponto sem remover vínculo da rota, **dependente de contrato backend**.
- Permitir cancelar aprendizado da rota sem tornar trajeto operacional; **depende de cancelar viagem em backend**.
- Melhorar persistência/observabilidade de falhas de tracking e subscription de Web Push.
- Deixar o fluxo administrativo da Gestão de Transporte no Web.

Nenhuma etapa foi certificada como implementada neste registro inicial.
