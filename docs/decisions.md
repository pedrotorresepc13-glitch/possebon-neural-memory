# Decisões fundamentais — POSSEBON App

Este arquivo registra decisões que **não devem ser reinterpretadas a cada conversa**.

## 2026-09 — Fonte de verdade

- Flutter: GitHub do app, branch `possebon`.
- Backend/MAD Builder: ZIP/arquivo mais recente validado e confirmado pelo usuário.
- Memória estrutural: este repositório separado.
- Memória não substitui inspeção do código real antes da edição.

## 2026-09 — Branch operacional do usuário

- O usuário trabalha localmente na branch `possebon`.
- Branches técnicas podem existir para automação/PR, mas o resultado final precisa ser integrado à `possebon`.
- Antes de `pull`, `restore`, `stash pop/drop` ou reset, conferir mudanças locais e conflitos; não apagar trabalho não inspecionado.

## 2026-09 — Sessão permanente

- Access token pode expirar normalmente.
- Refresh token mantém a sessão do aparelho.
- Falha de rede não deve provocar logout.
- Apenas revogação/autenticação realmente inválida deve exigir novo login.
- Renovação deve ser single-flight para impedir múltiplos refreshes concorrentes.
- Cerca Virtual, Transporte e notificações não podem depender de relogin diário.

## 2026-09 — Unidade como fronteira

- Conteúdo funcional deve ser isolado por `unit_id`.
- Ter acesso administrativo a duas unidades não transforma o mesmo vínculo funcional em vínculo nas duas.
- Cache também deve ser contextual por Pessoa + Unidade.
- Backend precisa validar o contexto; UI sozinha não é barreira suficiente.

## 2026-09 — Pessoa e vínculos

- Pessoa não deve ser duplicada ao virar Colaborador.
- Candidato é um contexto/vínculo, não uma segunda identidade.
- Vínculo oficial com vaga é criado pelo RH; ação do candidato no app não cria automaticamente esse vínculo.

## 2026-09 — Segurança Operacional

- Minha Ronda Gerencial é o padrão oficial de UX e fluxo quando houver equivalência funcional.
- Dono de Área não deve ter um fluxo visual próprio divergente sem necessidade de negócio.
- Audicomp segue a mesma família visual/estrutural.
- Equipe é opcional.
- Registros pessoais devem ser filtrados pelo usuário atual quando a regra é “meus registros”.
- PDFs oficiais já gerados devem ser reaproveitados.
- Foto/evidência do registro que gera plano deve continuar acessível conforme o contrato do plano/origem.

## 2026-09 — Dono de Área

- Identificação segue o padrão da Minha Ronda.
- Etapa Segurança deve funcionar como Minha Ronda quando a lógica for equivalente.
- Subcategorias oficiais conhecidas: IDs 35..62.

## 2026-09 — Meu Amigo do Peito

- Fluxo visual simplificado.
- Resolvido no local: encerra sem plano.
- Não resolvido: gera Plano de Ação automático.
- Responsável automático: Gerente SMS.
- Prazo padrão: +7 dias.

## 2026-09 — Planos de Ação

- O responsável atual pelo plano pode ser diferente do criador do registro que originou o plano.
- O executor deve poder abrir o registro/PDF de origem por vínculo do plano, não por autoria.
- Não gerar um segundo relatório da origem quando o PDF oficial já existir.
- Replanejamento deve preservar histórico anterior.
- Motivo é obrigatório no replanejamento.
- Transferência de responsável é opcional.
- Conclusão também deve acrescentar histórico, sem apagar registros de replanejamento.

## 2026-09 — RDO

- Mostrar somente RDOs do usuário atual.
- Offline-first com fila local persistente.
- Arquivado: somente leitura.
- Emissão: editável na próxima etapa.

## 2026-09 — Transporte / Cerca Virtual

- Presença por Cerca Virtual e Transporte pertence ao contexto da unidade.
- Códigos de origem conhecidos: `C` = Cerca Virtual, `T` = Transporte.
- Tracking de rota não deve ser interrompido por expiração normal de sessão.

## 2026-09 — Quadro de Avisos

- Público-base `C` = candidatos.
- Público-base `F` = colaboradores.
- Filtros refinam o público-base.
- Encarregado não deve ser adicionado aos filtros deste módulo.
- Avisos não podem vazar entre unidades.

## 2026-09 — MAD Builder

- Priorizar recursos nativos do MAD Builder/Adianti.
- Evitar editar blocos gerados que o Builder sobrescreve quando houver ponto de extensão equivalente.
- Código manual apenas quando necessário.

## 2026-09 — Performance

- Problema de teclado/IME e abertura lenta deve ser diagnosticado em `profile` antes de refatoração ampla.
- Otimização deve ser incremental e medida.
- Preferir estado/rebuild localizado a `setState` de tela inteira.

## 2026-09 — Memória neural

- Este repositório é separado do código do app.
- Deve ser consultado antes de trabalho relevante no POSSEBON.
- Estado atual precisa distinguir aplicado, preparado e planejado.
- Só registrar uma mudança como estável depois de implementada e validada.
- Nunca armazenar credenciais, tokens, senhas ou dados pessoais aqui.
- Em conversa nova, bootstrap obrigatório: `README` → `current-state` → `project-memory` → docs do módulo → código real.

## 2026-10-22 — Hard gate da Neural Memory

- Nenhuma alteração do POSSEBON App pode ocorrer sem consultar primeiro `possebon-neural-memory`.
- A intenção deve entrar na memória como `planned`/`in_progress` antes da edição.
- Flutter atual e backend vivo precisam ser conferidos depois da memória.
- Depois da implementação, a memória deve refletir o estado real.
- Preparado/gerado não significa aplicado; compilado não significa validado.

## 2026-10-22 — Transporte: fonte de verdade e notificações

- Persistência de paradas, solicitações e estado operacional do Transporte pertence ao POSSEBON/banco operacional confirmado.
- Firebase Storage não deve ser usado como segunda fonte de verdade do Transporte.
- Firebase/FCM permanece apropriado para PUSH.
- Comunicação gestor→monitor pode reutilizar `AppMensagem` com tipo destinatário `T = Transporte`; esta direção está **planned**, não implementada/validada.
- Lista de paradas e mapa devem consumir o mesmo estado.
- Monitor solicita inclusão/transferência; gestor aprova/recusa antes da alteração permanente de rota.


## 2026-10-22 — Transporte: solicitação permanente de passageiro

- O fluxo monitor→gestor para incluir/transferir passageiro deve seguir o mesmo padrão decisório da carona, mas com efeito permanente somente após aprovação.
- Ao solicitar, nenhuma alteração é feita em `colaborador.rota_transporte_id`.
- Aprovação do gestor: validar rota/assento/capacidade, transferir o colaborador para a rota de destino, limpar o ponto de embarque antigo para que o monitor da nova rota vincule a pessoa a uma parada válida, marcar a solicitação aprovada e enviar PUSH/notificação aos envolvidos.
- Recusa do gestor: não alterar rota/assento/ponto do colaborador, marcar a solicitação recusada e enviar PUSH/notificação.
- O monitor da rota de destino é quem vincula o passageiro a uma das paradas reutilizáveis da rota.
- As solicitações permanentes serão persistidas no POSSEBON; Firebase Storage não participa deste fluxo. No schema atual, `app_transporte.tipo_registro` é `char(1)` sem constraint de domínio e a letra `Q` não é usada pelo backend vivo, portanto `Q = solicitação permanente de inclusão/transferência` fica formalizada como novo tipo operacional do Transporte.


## 2026-10-22 — Auditoria iOS, PWA, FCM e travamentos

**Status: auditoria estática confirmada, runtime/aparelhos pendente. Não declarar corrigido.**

Achados verificados no Flutter branch `possebon` HEAD `73bedbb350b762327d8bfd353997aafc3600ed3f`:

1. `lib/screens/acesso_screen.dart::_registrarDispositivo` envia `plataforma: 'android'` incondicionalmente, inclusive em iOS nativo. O backend aceita `android`, `ios`, `web`. Falha de cadastro é capturada, e login prossegue silenciosamente. Corrigir identificação de plataforma, registro FCM e observabilidade.
2. `lib/services/notification_service.dart::mostrarNotificacao` constrói `NotificationDetails(android: ...)` mesmo no iOS; não fornece `DarwinNotificationDetails` para foreground. Investigar permissões/APNs e apresentação remota iOS; não inferir entrega pelo Firebase só por existir token.
3. `ios/Runner.xcodeproj/project.pbxproj` ainda usa `PRODUCT_BUNDLE_IDENTIFIER = com.example.possebon`; `firebase_options.dart` iOS também usa `com.example.possebon`. A árvore Git iOS não contém Runner.entitlements com `aps-environment` nem configuração `CODE_SIGN_ENTITLEMENTS` no pbxproj. Isto não prova o estado do projeto Xcode distribuído ou APNs do Firebase, que devem ser verificados no arquivo de build/Apple Developer.
4. `lib/main.dart` espera `Firebase.initializeApp` e `NotificationService.inicializar` antes de `runApp`, sem tratamento de falha. Erro ou hang de push/bootstrap pode impedir renderização; `NotificationService._inicializado` vira true antes de operações assíncronas terminarem.
5. `web/index.html` registra worker FCM; `web/firebase-messaging-sw.js` possui apenas `onBackgroundMessage` com console.debug (sem lógica própria de clique/exibição). `home_screen.dart` recebeu snackbar somente no foreground Web. Inspecionar entrega background, actions click, e não duplicar notificação quando payload `notification` é usado.
6. `web/ios_webkit_touch_recovery.js` implementa workaround por pointercancel sintetizado; compara `PointerEvent.pointerId` contra `Touch.identifier` diretamente e despacha eventos sintéticos. A equivalência não é garantida; avaliar se provoca cancels falsos/travas de interação. Testar nos devices antes de substituir.
7. `lib/core/network/api_uri_builder.dart` Web usa `/backend/api/...`, que `vercel.json` redireciona diretamente para origem técnica `:19302`; `api/proxy.js` injeta Basic auth mas não é usado pelo fluxo principal. Risco de inconsistência HTTP/erros; origem de `/api/app/unidades` não confirmada como causa. `AppRepository` Web não persiste cache de unidades e `AcessoScreen` esconde status/body sob mensagem genérica de internet.
8. `lib/core/observability/app_log_service.dart` tem reporter opcional mas não foi confirmado instalado. Ausência de logs persistentes impede investigação de falhas em dispositivos.
9. `TransporteTrackingService` filtra precisão, reenvia posição mais recente na reconexão e salva trajeto em modo aprendizado, mas NÃO tem fila durável de todos os pontos GPS a serem enviados ao backend; não declarar resiliência offline completa. Em iOS Web/PWA tela bloqueada, GPS contínuo não pode ser garantido.
10. O pacote preparado `FirebaseNotificationTrait.php` envia `notification`+`data` via FCM e `webpush.fcm_options.link` para a URL raiz. Precisa validar roteamento conforme estado de app e entrega APNs/FCM real, além da implantação efetiva no MAD Builder.
11. Deploy Vercel `possebon.vercel.app` foi confirmado READY para HEAD `73bedbb...` na inspeção de deployment, mas logs de runtime deram 403 (sem acesso). Status READY não valida funcionamento. Não assumir publicação do pacote PHP.

Próximo quality gate: confirmar app iOS nativo vs PWA instalado, APNs Apple Developer e capacidades iOS (push+background), FCM token por plataforma (não armazenar token em brain), worker e permissão por navegador, logs HTTP status/body para unidades e sessão, testes iPhone Safari/Home Screen, Android e Chrome desktop, benchmark de startup/reload, GPS offline, registros de entrega e clique. Preferir correções isoladas, testes regressão e implantação gradativa.
