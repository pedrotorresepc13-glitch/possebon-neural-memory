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
