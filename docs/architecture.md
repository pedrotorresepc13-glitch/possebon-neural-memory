# Arquitetura viva — POSSEBON App

Atualizado em 2026-09-16.

## Fontes operacionais

- **Flutter:** `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- **Backend/MAD Builder:** ZIP/arquivo mais recente explicitamente validado no trabalho corrente. GitHub Web não é baseline autoritativo do backend.
- **Memória estrutural:** `pedrotorresepc13-glitch/possebon-neural-memory`.

A memória guarda contexto, regras e pontos de alteração. O código real continua sendo verificado antes de qualquer edição.

## Camadas do app

### 1. Apresentação

- `lib/screens/` para telas gerais;
- `lib/features/*/presentation/` para domínios estruturados;
- `lib/core/ui/` para componentes compartilhados;
- `lib/core/theme/` para design system.

Objetivo evolutivo: reduzir telas monolíticas, localizar rebuilds e reutilizar componentes equivalentes.

### 2. Domínio / feature

Domínios já explícitos incluem:

- Segurança Operacional;
- Transporte;
- Controle de Acesso.

Outras áreas ainda usam estrutura mais legada em `screens`, `repositories` e `services`.

### 3. Repositórios / offline

- repositórios encapsulam cache/API em áreas selecionadas;
- Drift/SQLite armazena contexto e filas locais;
- cache deve ser isolado por Pessoa + Unidade;
- erro de negócio/permissão não pode ser mascarado por cache velho;
- outbox do RDO só remove item após confirmação do servidor.

### 4. Rede / sessão

Há coexistência entre:

- `ApiService` legado/central;
- `ApiClient` novo em `core/network`.

Migração deve ser gradual. Não duplicar lógica de token.

A autenticação permanente é centralizada em `AuthSessionManager` + `SessionStorage` + `SessionService`.

### 5. Backend

MAD Builder/Adianti/PHP/PostgreSQL. O app usa API REST e traits/controllers customizados onde necessário, preservando o padrão nativo do MAD Builder sempre que possível.

## Eixos arquiteturais obrigatórios

### Sessão permanente

- access token curto;
- refresh token seguro;
- renovação silenciosa;
- single-flight para refresh;
- falha de rede não apaga sessão;
- revogação real/logout explícito continuam válidos.

### Unidade como fronteira

`unit_id` define contexto operacional rígido.

A regra vale para:

- conteúdo;
- vínculo funcional mostrado;
- Segurança;
- RDO;
- Transporte;
- Cerca;
- Quadro de Avisos;
- Processo admissional;
- treinamentos/contextos;
- demais módulos funcionais.

### Pessoa e vínculos

- Pessoa = identidade única;
- Colaborador = vínculo funcional;
- Candidato = contexto/vínculo;
- contratação promove a mesma Pessoa, sem duplicar cadastro.

### Segurança Operacional

Minha Ronda Gerencial é a referência oficial de comportamento e UX quando a função é equivalente.

Dono de Área e Audicomp devem reutilizar padrão/elementos compartilhados, alterando conteúdo e regras próprias.

### Planos de Ação

Plano e origem são relações independentes:

- `responsavel_id` define quem executa/recebe o plano;
- `active_record + primary_key` identifica o registro que originou o plano;
- autor da origem pode ser outra pessoa;
- PDF oficial da origem deve ser reutilizado quando existir.

### RDO

Offline-first. Sincronização protegida contra concorrência. Evolução planejada: editar apenas Emissão; arquivado somente leitura.

### Transporte e Cerca Virtual

Ambos participam de presença/controle de acesso e dependem de sessão persistente e contexto correto de unidade.

### Notificações

FCM integra comunicação e navegação contextual. Token e sessão precisam permanecer coerentes com o dispositivo atual.

## Design system

Arquivos-base:

- `lib/core/theme/app_theme.dart`;
- `lib/core/theme/app_colors.dart`;
- widgets compartilhados em `lib/core/ui/`;
- widgets compartilhados de Segurança em `lib/features/seguranca_operacional/presentation/widgets/`.

Regra: evitar paleta e padrões próprios por tela quando já existe solução compartilhada.

## Performance

Problema atual conhecido: teclado/IME e algumas aberturas de tela lentas.

Arquitetura deve caminhar para:

- menor subtree reagindo ao teclado;
- estados localizados;
- menos `setState` globais;
- widgets const/reutilizáveis;
- `RepaintBoundary` em áreas pesadas quando medição justificar;
- imagens dimensionadas/cacheadas;
- polling/tracking isolados;
- medição em profile antes/depois.

## Princípios de evolução

- regra compartilhada → componente/serviço compartilhado;
- diferença funcional real → comportamento específico explícito;
- sem duplicação silenciosa;
- sem mudança estrutural em massa sem teste incremental;
- sem declaração de sucesso sem evidência;
- toda mudança validada atualiza a memória neural.
