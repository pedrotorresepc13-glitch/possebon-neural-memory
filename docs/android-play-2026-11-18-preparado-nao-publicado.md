# Android / Play Store POSSEBON — 18/11/2026

**Status: `prepared_not_published`.**

Usuário solicitou publicar a nova versão do POSSEBON App na Play Store.

## Auditoria realizada em 18/11/2026
- GitHub Flutter repositório `pedrotorresepc13-glitch/possebon`, branch `main` head `925f12152c2479b0376c59084712b64242b65aa2`.
- `pubspec.yaml` main `version: 1.1.4+8`; `android/app/build.gradle.kts` `applicationId=br.com.possebon.app`, `targetSdk=36` (exigência Google Play atual para update).
- Workflow `android-release-smoke.yml` usa **certificado TEMPORÁRIO do CI**; AAB deste CI é somente para emulador, não é a chave de upload da Play.
- CI Android no run `44106435664` (commit `4860f87`) passou analyze, Flutter tests, AAB release, bundletool, **falhou** na instalação/reabertura no emulador. Último workflow main `44119145890` de `925f1215` também `failure`, sem etapas detalhadas retornadas.
- Não há acesso autenticado/connector Play Console disponível neste turno; não foi possível verificar versão máxima publicada, certificado de upload nem fazer rollout.
- Feature Espelho de Ponto **ainda incompleta**: ausência de atestados/totais reais, PT_23/ocorrências pendentes de compatibilidade backend/Flutter. Não mencionar como corrigida em release notes.
- Branch desenvolvimentos transporte anterior é separada com backend condicional não homologado; não declarar todo transporte corrigido.

## Preparação efetivamente realizada
- Branch `release/possebon-android-1.1.5-20261118` criada a partir do head main.
- `pubspec.yaml` nela alterado para **1.1.5+9**; este código só é utilizável se o código máximo já enviado à Play for menor que 9, confirmar antes de publicar.
- Documento `docs/release-playstore-20261118-candidato.md` criado com checklist de assinatura e testes.
- Draft PR **#14**: https://github.com/pedrotorresepc13-glitch/possebon/pull/14. **Não mesclado e não publicado**.
- Nenhum AAB oficial foi construído, nenhum build assinado com chave Play realizado, nenhuma alteração publicada em lojas.

## Próximas ações bloqueadoras
1. Confirmar maior versionCode na Play Console e a trilha atual (antes era teste fechado), confirmar assinatura de upload original.
2. Gerar AAB em máquina com Flutter/Android toolchain e `android/key.properties` apontando para a keystore original, sem expor chave/senha ao chat ou GitHub.
3. Passar analyze, tests, abrir/reabrir app em Android físico, validar login, permissões, Meu RH/RDO e Transporte; corrigir eventual falha.
4. Enviar AAB à Play Console na trilha de teste fechado, revisão e distribuição aos testers, depois promover para produção somente após homologação.
5. Atualizar memória com `production_published` apenas após evidência da Play Console, nunca antes.
