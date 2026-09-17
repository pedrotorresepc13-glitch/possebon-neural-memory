# Fonte de verdade — POSSEBON App

Atualizado em 2026-09-17.

## Flutter

Fonte operacional oficial:

- Repositório: `pedrotorresepc13-glitch/possebon`
- Branch: `possebon`
- Package Android: `br.com.possebon.app`

Snapshot remoto observado em 2026-09-17: `23d7bbb8d2ffad5eef3405b211bcd20ea5006bf7`.

Esse SHA é somente um ponto de referência. Antes de qualquer edição deve ser consultado o HEAD atual da branch e, quando o trabalho ocorrer no PC do usuário, também `git status`, porque a árvore local pode conter mudanças ainda não enviadas.

### Regra de Git

- trabalhar na branch `possebon`;
- evitar `main` e detached HEAD para o app;
- não usar `git pull` cegamente quando houver alterações locais;
- antes de reset/restauração, verificar mudanças staged, unstaged, unmerged e stashes;
- depois de consolidar uma mudança, confirmar commit/push e estado da árvore local.

## Backend / POSSEBON Web / MAD Builder

O GitHub Web **não é fonte autoritativa** do backend.

Fonte operacional = ZIP/arquivo mais recente enviado e confirmado pelo usuário, acrescido apenas das alterações que o usuário confirmou ter aplicado manualmente.

Baseline conhecido mais recente nesta memória:

`possebon_web-15-09-2026-11-23-26.zip`

Essa referência não deve ser assumida eterna. Se o usuário informar ou enviar versão posterior, atualizar esta memória.

### Padrão MAD Builder

- priorizar recursos nativos do MAD Builder/Adianti;
- Designer, propriedades, eventos, ações, filtros, fontes de dados e navegação antes de código manual;
- não editar blocos gerados quando existir ponto oficial de extensão;
- confirmar models, relacionamentos, regras e tabelas no código real antes de inferir;
- quando o usuário enviar um arquivo completo e pedir correção, devolver o arquivo completo corrigido.

## Memória neural

Repositório:

`pedrotorresepc13-glitch/possebon-neural-memory`

A memória neural é fonte para:
- arquitetura;
- mapa de módulos;
- regras de negócio;
- decisões;
- estado conhecido;
- histórico de mudanças;
- padrões visuais;
- problemas conhecidos;
- localização provável dos arquivos envolvidos.

Ela **não substitui o código-fonte exato** quando uma alteração depende da implementação atual.

## Ordem de precedência

1. Confirmação explícita mais recente do usuário.
2. Arquivo/código atual da fonte operacional.
3. `data/current-state.json` quando marcado como confirmado.
4. `docs/decisions.md` e `docs/domain-rules.md`.
5. Memória histórica/conversas antigas.

## Estado aplicado x preparado

Uma alteração só pode ser descrita como "aplicada" quando houver confirmação objetiva: usuário confirmou substituição/implantação, commit/push verificado, CI validado quando aplicável ou comportamento testado.

Pacote gerado, script criado ou código preparado = **não aplicado** até confirmação.

Essa distinção é obrigatória para evitar que uma conversa futura trate uma proposta como estado real do sistema.
