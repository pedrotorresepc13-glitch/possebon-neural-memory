# Arquitetura viva — POSSEBON App

Atualizado em 2026-09-16.

## Fonte operacional

- Flutter: repositório `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- Backend/MAD Builder: usar ZIP/arquivo mais recente validado e enviado no trabalho corrente. O GitHub Web não é fonte operacional do backend.
- Esta memória: repositório `possebon-neural-memory`.

## Eixos arquiteturais

### Sessão

A sessão permanente usa access token curto, refresh token persistido de forma segura e renovação silenciosa. O app não deve transformar indisponibilidade de rede em logout.

### Unidade

`unit_id` é fronteira rígida de contexto. Conteúdo funcional, módulos, vaga, avisos, transporte, RDO, segurança e demais dados contextuais devem respeitar a unidade atual.

### Pessoa e vínculos

Pessoa representa a identidade única. Colaborador, candidato e demais relações são vínculos/contextos. A contratação deve promover a mesma Pessoa para Colaborador sem duplicação.

### Offline

O app já usa cache local e Drift/SQLite em áreas selecionadas. Cache deve ser isolado por Pessoa + Unidade. Erro de negócio/permissão não deve ser mascarado por cache antigo.

### Segurança Operacional

Minha Ronda Gerencial é a referência visual/funcional. Dono de Área, Audicomp e fluxos relacionados devem reutilizar o padrão sempre que a regra for equivalente, alterando apenas conteúdo/regra específicos.

### Planos de Ação

O Plano pertence ao responsável atual, mas o registro que o originou pode ter sido criado por outra pessoa. O vínculo com a origem deve ser feito por referências do plano, não pela identidade do executor.

### RDO

Fluxo offline-first com fila local. Próxima evolução: edição controlada somente enquanto status estiver em Emissão; arquivados permanecem somente leitura.

### Transporte e Cerca Virtual

Ambos participam do controle de presença. Tracking e contexto de unidade não podem ser perdidos por expiração comum de sessão.

## Princípios

- regra compartilhada deve virar componente/serviço compartilhado;
- evitar telas monolíticas e `setState` de árvore inteira para mudanças pequenas;
- estado de negócio e UI devem ser separáveis;
- cada mudança relevante deve atualizar a memória neural depois de validada;
- nunca armazenar segredos ou dados pessoais neste repositório.
