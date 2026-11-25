# POSSEBON Portal — cérebro compartilhado entre IAs

## Fontes de verdade

1. **Código real**: `pedrotorresepc13-glitch/possebon-portal`, sempre consultar SHA e branch atual.
2. **Produção REAL**: versão ativa vista no Studio; **não** inferir a partir de `main`.
3. **Studio / deploy**: `pedrotorresepc13-glitch/studio`. Só deve compilar por ação **Instalar**; Excluir build deve manter o commit.
4. **Memória operacional**: `data/portal-state.json`, com o estado *observado*, *preparado* e *publicado* separados.

## Ritual obrigatório de qualquer IA (incluindo Uchoa/Claude, ChatGPT, Kimi)

- Ler `data/portal-state.json`, depois conferir branch, PRs e commits atuais no GitHub.
- Comparar base de qualquer PR com o SHA em produção observado no Studio.
- Considerar alterações paralelas do Uchoa/Claude e de outras IAs; não sobrescrever.
- Não reescrever branches de outras IAs sem revisão. Não promover código não testado.
- Atualizar a memória quando uma alteração é **preparada**; marcar **publicada** só após confirmação do Studio.
- Nunca guardar senhas, tokens, credenciais PostgreSQL, dados pessoais ou detalhes sensíveis.
- O Portal React + Node usa o mesmo PostgreSQL do POSSEBON Web, mas é independente do PHP/MAD Builder.
- `unit_id` é fronteira rígida; a escrita em banco exige permissão, validação e auditoria.
- Push no GitHub **não** autoriza build nem instalação.

## Sincronização periódica

O workflow `sync-portal-state.yml` atualiza commits, branches e PRs do Portal com token técnico **somente leitura**, preservando o SHA de produção até evidência explícita. Se a credencial estiver ausente ou a API falhar, a memória exibe `attention`, **nunca** inventa estado `synced`.

**Nota:** o repositório neural também mantém informações do aplicativo Flutter. Esta seção é exclusiva do Portal, sem alterar contratos do App.
