# Resultado — Monitor + PWA iPhone, 23/10/2026

Status:
- Flutter branch operacional possebon: quatro correções sem dependência do backend aplicadas (toque iPhone, Web Push data-only, bootstrap FCM/iOS, gravação GPS local).
- Flutter branch técnica fix/monitor-ios-pwa-20261023: ações de desvincular passageiro da parada (sem alterar rota/assento) e cancelar viagem sem salvar; PR #6 em draft, **não integrada** à produção.
- Backend MAD Builder: patch preparado e validado com php -l a partir do ZIP de 22/10 12:09, mas **não instalado** no backend vivo. Arquivo app/custom/TransporteWorkflowFirebaseTrait.php.
- CI 39961406035: sucesso em flutter analyze, node --check e flutter build web release.
- Vercel: confirmação do deployment bloqueada por permissão 403 do conector; não declarar runtime validado.
- Teste real de push, toques e GPS no iPhone: pendente.

Decisão funcional permanente confirmada pelo usuário:
- Monitor opera no APP POSSEBON.
- Gestão administrativa de Transporte permanece no POSSEBON Web.
- Remoção da parada não é remoção da rota.
- Cancelar viagem não é finalizar/salvar percurso.
- iOS PWA não garante GPS em segundo plano.


## Complemento 23/10 — exclusão de parada ocupada
**Estado: active / patch preparado; não validado em produção.**
- Regressão confirmada no Flutter operacional e branch de PR: `lib/screens/meu_transporte_screen.dart` desabilita o botão Excluir quando `quantidade_passageiros > 0`. Backend do ZIP 22/10 em `TransporteWorkflowFirebaseTrait.php::transporteExcluirParadaBanco` retorna HTTP 409 e exige mover passageiros. Isto contraria regra confirmada pelo usuário.
- Regra correta: o monitor pode excluir a própria parada mesmo contendo passageiros, sem exigir outra parada. Após confirmação, desativar somente a parada S e os embarques E ligados a ela, limpar o ponto do colaborador afetado que não tiver outro embarque, **preservar rota, assento e cadastro**, com transação e histórico.
- Frontend corrigido na branch técnica `fix/monitor-ios-pwa-20261023`, commit `0766c63ca795bea914e0a3719ad8b48ed443fe08`; **não integrado à branch operacional**.
- Pacote atualizado `POSSEBON_MONITOR_EXCLUIR_PARADA_COM_PASSAGEIROS_23-10-2026.zip` preparado e aprovado no `php -l`; **não instalado no MAD Builder**. Inclui correções de desvincular passageiro e cancelar viagem do pacote anterior.
- Testar: parada vazia, parada com 2 passageiros, última parada da rota, monitor sem autorização, outra unidade, auditoria e ausência de reaparecimento no mapa. Backend vivo precisa ser reconciliado antes de instalar, e PR só deve entrar após API funcionar.
- Prioridade do usuário continua sendo **Meu RDO**. Gestão administrativa de rotas/trajetos permanece pendente no Web.
