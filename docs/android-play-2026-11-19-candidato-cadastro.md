# Google Play — POSSEBON App 1.1.5+9 preparado em 19/11/2026

## Pedido do usuário
Usuário relatou que a versão ainda em circulação não envia e-mail no primeiro acesso e o PHP vivo exige e-mail para criar usuários novos. Considerou retirar a regra de e-mail como login, mas decidiu priorizar a preparação imediata de uma atualização pela Google Play.

## Estado real confirmado por GitHub
- Main Flutter no momento da preparação: `925f12152c2479b0376c59084712b64242b65aa2` (`version: 1.1.4+8`).
- PR #15: `fix/cadastro-contato-pessoa-20261118` (`c1b3ff1b7a7d586870317198d0121dc13ef4349d`), rascunho, com cadastro de email e telefone e regularização; testes CI anteriores com `failure`. PHP de produção **não atualizado**.
- PR #16 novo: https://github.com/pedrotorresepc13-glitch/possebon/pull/16
  - Branch `release/possebon-android-1.1.5-contatos-20261119`, criada a partir do PR #15 (inclui mudanças de cadastro).
  - `pubspec.yaml` atualizado para `version: 1.1.5+9`, commit `7d52f3a9016b35f811ab8783aac8519a8eaf8bf1`.
  - Workflow de validação ajustado na branch, commit `c11489c50c2a8d5b06e1d61cc3095f5216dff692`. CI run `44532325677` terminou `failure`, e logs não retornaram.
  - Novo workflow de AAB assinado com **chave oficial** (segredos GitHub, não em código), caminho `.github/workflows/android-play-build-signed.yml`, commit `f6da9cf2d3dc2f0a847affe0a78b4d9da37cf60a`. Requer 4 secrets: `POSSEBON_ANDROID_UPLOAD_KEYSTORE_BASE64`, `POSSEBON_ANDROID_UPLOAD_STORE_PASSWORD`, `POSSEBON_ANDROID_UPLOAD_KEY_PASSWORD`, `POSSEBON_ANDROID_UPLOAD_KEY_ALIAS`.
  - Run `44532693527` **failure**; a API devolve job sem etapas (`steps=null`) e logs BlobNotFound. **Não foi possível determinar motivo ou gerar artefato oficial.**
- Branch mais antiga `release/possebon-android-1.1.5-20261118` / PR #14 foi feita antes das mudanças de cadastro e não deve ser distribuída para corrigir o problema de candidatos.
- Pacote `br.com.possebon.app`, targetSdk 36. Código 9 ainda precisa ser confirmado como disponível na Play Console.
- Sem conexão com Play Console; nenhuma versão foi enviada, testada por Play, promovida ou publicada.
- Não inventar AAB `sandbox:` nem alegar geração de pacote. Workflow oficial depende de assinatura oficial e testes passando. Nunca compartilhar ou commitar keystore/senhas.

## Backend — incompatibilidade crítica
- PHP vivo foi identificado no servidor por SHA-256 `fb008f6c72923b0de6b4836c61f69aafe581fee171e0b3ea45f9b6139ec4c6cf` em 18/11, mas o arquivo completo vivo ainda não foi fornecido para comparação e publicação do patch.
- Arquivo histórico `ApiAppController.php` de 17/11 requer email para criar SystemUsers e gera login igual email. App antigo não envia; PR #15/16 coleta e transmite email, mas não está comprovado que backend atual grava email nos novos cadastros, nem que valida titularidade e posse de email.
- `meusDados` e `atualizarContato` do arquivo histórico usavam `pessoa_id` controlável pelo cliente, sem conferência de identidade JWT; arquivo PHP **preparado** em outra conversa adicionou a conferência mas **não está publicado**. Segurança e vínculo de conta precisam ser validados antes de usar.
- Identificação por CPF e verificação só com DOB/nome da mãe não substituem prova de posse de email/identidade para gerar novas credenciais (risco apropriação).

## Próximos bloqueios
1. Obter e comparar o PHP vivo e fazer patch compatível sem perder logins existentes; implementar verificação segura de titularidade/contatos.
2. Diagnosticar a causa dos workflows falhos, executar Flutter analyze/test, build assinado com chave oficial (não temporária), teste Android e compatibilidade PWA.
3. Confirmar `versionCode` disponível, upload key correta e telas de declaração/Play Console; distribuir primeiro para teste fechado.
4. Não assumir que atualizar Play resolve imediatamente usuários antigos bloqueados: backend deve ser compatível com cliente anterior durante rollout.
