# POSSEBON Neural Memory

Este repositório é a **memória externa viva e fonte de contexto operacional** do POSSEBON App. Ele é separado do código do aplicativo e existe para impedir perda de contexto entre conversas, etapas e versões.

## Regra principal

Para qualquer trabalho relevante no POSSEBON App:

1. **Ler esta memória antes de planejar ou alterar código.**
2. Conferir o estado atual do módulo em `data/current-state.json`.
3. Conferir regras e dependências em `data/project-memory.json` e `docs/`.
4. Identificar os arquivos exatos do Flutter/backend que precisam mudar.
5. Registrar a mudança como `planned`/`active` antes de tratar como concluída.
6. Implementar no repositório correto.
7. Validar com analyze/test/build e teste funcional correspondente.
8. Só depois atualizar esta memória para `stable` ou novo estado real.

**Nada é considerado implantado apenas porque foi planejado, gerado ou preparado.**

## Fontes de verdade

- **Flutter:** `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- **Backend / MAD Builder / Adianti:** ZIP/arquivo mais recente explicitamente validado no trabalho corrente. O GitHub Web não substitui esse baseline.
- **Memória estrutural, regras, decisões e continuidade:** este repositório `possebon-neural-memory`.

A memória indica **onde mexer e por quê**; a implementação sempre deve ser conferida na fonte operacional correspondente antes da edição.

## Ordem de leitura em uma nova conversa

Quando o trabalho continuar em outra conversa, usar esta sequência:

1. `README.md`
2. `data/current-state.json`
3. `data/project-memory.json`
4. `docs/operating-protocol.md`
5. documento do domínio envolvido em `docs/`
6. arquivos reais do app/backend apontados pela memória

Isso é o bootstrap do contexto do projeto.

## O que esta memória guarda

- arquitetura do app;
- módulos, telas e serviços;
- regras de negócio;
- padrões visuais;
- fluxo de sessão;
- contexto de unidade;
- contratos de API conhecidos;
- relacionamentos importantes entre entidades;
- estado atual de cada módulo;
- decisões já tomadas;
- problemas conhecidos;
- próximos passos;
- arquivos exatos relacionados a cada área;
- histórico de mudanças e validações;
- auditorias de performance e qualidade.

## O que nunca deve entrar aqui

- senhas;
- Client Secrets;
- REST keys;
- access tokens / refresh tokens;
- CPF ou dados pessoais;
- credenciais de banco;
- conteúdo confidencial de usuários;
- qualquer segredo operacional.

## Estrutura

### Dados legíveis por máquina

- `data/project-memory.json` — grafo neural e regras estruturais.
- `data/current-state.json` — estado operacional atual, foco e pendências.
- `data/api-contracts.json` — contratos/rotas conhecidas e responsáveis.
- `data/change-log.json` — histórico resumido.

### Documentação humana

- `docs/operating-protocol.md` — como usar a memória em todo trabalho futuro.
- `docs/architecture.md` — arquitetura viva.
- `docs/business-rules.md` — regras de negócio que não podem ser reinterpretadas.
- `docs/module-map.md` — mapa funcional módulo → tela → arquivos → backend.
- `docs/backend-map.md` — relação Flutter/API/MAD Builder.
- `docs/decisions.md` — decisões permanentes.
- `docs/app-inventory.md` — inventário técnico/funcional.
- `docs/performance-audit.md` — auditoria contínua de desempenho.
- `docs/quality-gates.md` — critérios mínimos antes de declarar uma mudança concluída.

## Semântica de estado

- `stable`: implementado e validado.
- `active`: implementado parcialmente ou em evolução.
- `attention`: existe, mas há bug, divergência ou validação pendente.
- `planned`: ainda não implementado.
- `blocked`: depende de informação/arquivo/acesso ainda não disponível.

## Regra de continuidade

A memória deve sempre distinguir três coisas:

- **o que já está aplicado/validado**;
- **o que está preparado, mas ainda não aplicado**;
- **o que está apenas planejado**.

Essa distinção é obrigatória para evitar que uma conversa futura trate uma preparação como produção.

## Publicação no Vercel

Este repositório é uma página estática na raiz:

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: vazio
- Root Directory: raiz do repositório

A página principal é `index.html`.
