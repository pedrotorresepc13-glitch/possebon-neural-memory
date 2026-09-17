# POSSEBON Neural Memory

Repositório separado do código do POSSEBON App. Ele existe para ser a **memória externa viva** do projeto e a visualização estrutural do desenvolvimento.

## O que fica aqui

- mapa visual de telas, módulos, serviços e dependências;
- regras de negócio que não podem ser esquecidas;
- estado de cada módulo: estável, em evolução, atenção ou planejado;
- decisões técnicas importantes;
- problemas conhecidos e próximos passos;
- auditorias de performance;
- referências dos arquivos-chave do app;
- foco atual de desenvolvimento.

## O que NÃO fica aqui

Nunca armazenar:

- senhas;
- Client Secrets;
- REST keys;
- access tokens ou refresh tokens;
- CPF;
- dados pessoais de colaboradores/candidatos;
- credenciais de banco;
- qualquer outro segredo operacional.

## Estrutura

- `index.html` — interface visual principal.
- `styles.css` — tema e canvas infinito.
- `app.js` — pan, zoom, busca, relações e inspector.
- `data/project-memory.json` — memória estruturada legível por máquina.
- `docs/architecture.md` — visão arquitetural do app.
- `docs/decisions.md` — decisões que precisam permanecer rastreáveis.
- `docs/performance-audit.md` — auditoria contínua de performance.

## Regra de uso no desenvolvimento

1. Antes de uma mudança estrutural, consultar esta memória.
2. Implementar a mudança no repositório correto do app/backend.
3. Validar a mudança.
4. Só então atualizar aqui o estado, regra e histórico correspondente.
5. Mudança não validada não deve ser marcada como estável.

## Publicação no Vercel

Este repositório já é uma página estática na raiz. No Vercel:

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: vazio
- Root Directory: raiz do repositório

A página principal é `index.html`.
