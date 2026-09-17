# AGENTS.md — protocolo obrigatório da memória neural

Este repositório existe para impedir perda de contexto entre conversas, tarefas e versões do POSSEBON App.

## Ordem de leitura antes de qualquer mudança

1. `data/current-state.json` — estado real conhecido, pendências e nível de confirmação.
2. `data/project-memory.json` — mapa estrutural do app.
3. `docs/source-of-truth.md` — qual fonte vale para cada parte do sistema.
4. `docs/domain-rules.md` — regras de negócio que não podem ser reinterpretadas.
5. `docs/current-state.md` — foco atual e mudanças aplicadas/não confirmadas.
6. `docs/ui-standards.md` — padrão visual e de interação.
7. `docs/app-inventory.md` — módulos, telas, serviços e dependências.
8. Para a tarefa específica, ler o código-fonte atual do repositório Flutter ou o arquivo/ZIP autoritativo do backend.

## Regra central

A memória neural explica **o que existe, por que existe, como se relaciona e qual é o estado conhecido**. Ela não autoriza editar código sem conferir a fonte atual.

- Flutter: fonte operacional = `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- Backend MAD Builder/PHP: fonte operacional = ZIP/arquivo mais recente confirmado pelo usuário. O GitHub Web não é fonte autoritativa do backend.
- Esta memória: fonte de arquitetura, regras, decisões, status, histórico e localização de responsabilidades.

## Precedência quando houver conflito

1. Confirmação explícita e mais recente do usuário.
2. Código/arquivo atual da fonte operacional correspondente.
3. Estado marcado como `confirmed` nesta memória.
4. Decisões registradas.
5. Conversas/hipóteses antigas.

Nunca escolher silenciosamente entre duas fontes conflitantes. Registrar a divergência como `attention`.

## Ciclo obrigatório para novas páginas, módulos e mudanças estruturais

### Antes de codificar
- registrar a intenção em `data/change-log.json` como `planned` ou `in_progress`;
- atualizar `data/current-state.json` com o foco atual;
- identificar módulos, arquivos, APIs e regras afetadas;
- validar se já existe componente/serviço equivalente que deve ser reutilizado.

### Durante a implementação
- não marcar como concluído apenas porque o código foi gerado;
- distinguir `implemented_unverified` de `validated`;
- não criar regra nova contradizendo `docs/domain-rules.md` sem decisão explícita.

### Depois da validação
- atualizar `data/project-memory.json`;
- atualizar `data/current-state.json`;
- registrar resultado em `data/change-log.json`;
- atualizar documentação afetada;
- só então mover o item para `stable`.

## Estados permitidos

- `planned`: definido, ainda não implementado.
- `in_progress`: em construção.
- `implemented_unverified`: código existe, ainda não foi validado pelo usuário/testes necessários.
- `attention`: problema, conflito ou comportamento que precisa correção/validação.
- `validated`: comportamento testado/confirmado, ainda podendo estar em estabilização.
- `stable`: validado e adotado como referência vigente.

## Segurança da memória

Este repositório é público. Nunca registrar:
- senhas;
- tokens JWT/refresh;
- REST keys;
- Client Secrets;
- chaves Firebase privadas;
- CPF ou dados pessoais;
- credenciais de servidor;
- documentos internos sensíveis;
- conteúdo de banco que identifique pessoas.

Registrar nomes de classes, tabelas, campos, rotas e regras é permitido quando necessário à arquitetura, desde que não carreguem dados pessoais reais.

## Regra para respostas futuras

Antes de afirmar que algo está aplicado, verificar `data/current-state.json` e a fonte operacional. Se a memória disser `unconfirmed`, dizer explicitamente que não há confirmação de implantação.

Antes de pedir ao usuário para reenviar informação estrutural, consultar este repositório. Pedir arquivo novamente apenas quando a tarefa exigir o conteúdo exato de uma fonte operacional que não esteja acessível ou quando existir versão mais nova que a registrada.
