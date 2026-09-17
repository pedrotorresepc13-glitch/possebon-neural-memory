# Modelo de dados conceitual — entidades conhecidas

Este documento registra **relações funcionais conhecidas**. Não substitui o schema real do PostgreSQL; antes de migration/SQL, conferir o model/table atual no backend validado.

## Pessoa

Identidade central do app.

Relações conceituais:

- Pessoa pode ter vínculo de Colaborador;
- Pessoa pode participar de processo/vaga;
- Pessoa pode possuir foto oficial/currículo/documentos;
- contratação mantém a mesma Pessoa.

Regra: não duplicar Pessoa para representar novo papel.

## Colaborador

Vínculo funcional da Pessoa.

Contexto importante:

- unidade;
- função;
- equipe;
- gerência;
- supervisor/coordenador quando aplicável;
- capacidades/módulos.

Ter usuário administrativo com acesso a múltiplas unidades não cria vínculo funcional em todas elas.

## Vaga / vínculo de processo

O app pode mostrar vagas, mas o vínculo oficial Pessoa ↔ vaga é criado pelo RH no Web/MAD Builder.

Depois do vínculo oficial, o app pode refletir:

- documentos exigidos;
- treinamentos/cursos;
- etapas do processo;
- estado admissional.

## AppDispositivo

Entidade reutilizada para sessão/dispositivo.

Campos/regras conhecidos em versões recentes:

- `unit_id`;
- `dispositivo_uid`;
- `refresh_token_hash`;
- `sessao_ativa`;
- `fcm_token` opcional/nulo conforme baseline.

Função:

- relacionar dispositivo;
- sessão permanente;
- FCM/contexto do aparelho.

### Estado de produção observado em 2026-09-17

Em exportação real de `app_dispositivo` com 78 registros, `dispositivo_uid`, `refresh_token_hash` e `sessao_ativa` estavam vazios em todos os registros. Portanto a sessão permanente **não deve ser considerada validada em produção** até esses campos passarem a ser gravados e o refresh funcionar após vencimento do access token.

## PlanoAcao

Campos funcionais conhecidos:

- `id`;
- `dt_planejada`;
- `responsavel_id`;
- `dt_execucao`;
- `dt_replanejada`;
- `nao_conformidade`;
- `descricao_acao`;
- `active_record`;
- `primary_key`;
- `solicitante_id`;
- `origem`;
- `dt_encerramento`;
- `status`;
- `nota_execucao`;
- `nota_solicitante`;
- `safety_area_id`.

### Relação com origem

`active_record + primary_key` identifica o registro de origem.

Casos conhecidos:

- `AudicompItem` → `audicomp_item.id` → `audicomp_id` → `audicomp.arquivo`;
- `CondicaoInsegura` → `condicao_insegura.id` → `audicomp_id` → `audicomp.arquivo`.

Regra: `responsavel_id` do plano não identifica o autor da origem.

### Conteúdo necessário no executor do plano

O detalhe do plano deve mostrar, além de origem/área/responsável/solicitante/prazo:

- descrição/não conformidade;
- ação/tratativa;
- histórico de execução/replanejamento;
- botão para abrir o registro/PDF de origem.

A imagem da ocorrência **não deve ser duplicada visualmente** dentro do executor do Plano de Ação; quem precisar dela abre o registro de origem.

## Audicomp / itens / condições

`Audicomp` funciona como registro-pai para relatórios/arquivos em fluxos de Segurança Operacional.

Relações observadas:

- `audicomp_item` pode apontar para `audicomp_id`;
- `condicao_insegura` pode apontar para `audicomp_id`;
- `audicomp.arquivo` pode armazenar caminho do relatório PDF oficial.

Confirmar os tipos exatos usados por cada módulo antes de criar nova resolução de origem.

## PhotoReport / imagens da Segurança Operacional

O model `PhotoReport` possui, entre outros:

- `title`;
- `description`;
- `caminho`;
- `reference_date`;
- `active_record`;
- `primary_key`;
- `unit_id`;
- `criado_por`.

### Plano de Ação

No Web/MAD Builder vigente analisado, `MeuPlanoAcaoForm` abre o formulário de imagens usando:

- `active_record = 'PlanoAcao'`;
- `primary_key = PlanoAcao.id`.

Portanto imagens de conclusão executadas pelo app devem usar esse mesmo vínculo, sem criar storage paralelo.

Regra aprovada:

- pode haver **uma ou mais imagens** de conclusão do Plano de Ação;
- `title = 'Plano de Ação #<id>'`;
- `description = nota de execução`;
- `active_record = 'PlanoAcao'`;
- `primary_key = id do PlanoAcao`;
- usar o mesmo caminho/política de armazenamento da Minha Ronda.

### Condição insegura / não conformidade

A Minha Ronda já usa `PhotoReport` por `active_record + primary_key` para evidências de `AudicompItem` e `CondicaoInsegura`.

A regra deve ser compartilhada por Ronda, Audicomp e Dono de Área.

### Reconhecimento seguro

O backend atual ainda grava reconhecimentos como texto simples. Evolução aprovada:

- descrição continua sendo o texto do reconhecimento;
- imagem opcional;
- a imagem usa `PhotoReport` e o mesmo armazenamento da Segurança;
- `title` deve ser contextual e numerado (por exemplo `Ronda #123 - Reconhecimento seguro 1` ou equivalente do módulo);
- `description = descrição do reconhecimento`;
- não criar tabela/storage de imagem separado.

Manter separação conceitual entre:

1. evidência do registro original;
2. imagens do reconhecimento/condição pertencentes ao registro de Segurança;
3. imagens específicas da execução/conclusão do Plano de Ação.

## Dono de Área

Estado do código Flutter remoto analisado em 2026-09-17:

- etapa 1/identificação existe, mas a validação remota ainda exige `equipe_id`; regra correta é equipe opcional;
- etapa 2 mostra todos os grupos/categorias abertos; deve permitir expandir/recolher;
- etapa 3 usa `List<String>` para condições inseguras e reconhecimentos seguros;
- por isso condições inseguras do Dono não carregam hoje o mesmo draft estruturado de imagem + Plano de Ação da Minha Ronda.

Direção obrigatória: reutilizar o editor/modelo compartilhado da Minha Ronda, e não recriar implementação paralela.

## RDO

O RDO pertence ao usuário/contexto operacional.

Regras:

- lista “Meu RDO” não amplia por privilégio administrativo;
- status controla edição;
- fila offline local representa operações ainda não confirmadas pelo servidor.

## Quadro de Avisos

Público-base conhecido:

- `C`: candidatos;
- `F`: funcionários/colaboradores.

Filtros refinam o público-base e devem respeitar unidade.

## Transporte / presença

Presença pode ter origem conhecida:

- `T`: Transporte;
- `C`: Cerca Virtual.

Rota/viagem/passageiro/monitor/motorista devem permanecer no contexto da unidade e da sessão corrente.

### Dependência da sessão permanente

O callback nativo da Cerca Virtual lê a sessão local e o `AccessControlApi` solicita token por `SessionService.getToken()`. Portanto, depois que o access token vence, a presença automática só continua se o refresh token permanente estiver realmente funcionando.

## Relações que precisam de confirmação antes de mudança de schema

- tabelas/PKs exatas do processo admissional;
- tabela final de vínculo Pessoa ↔ vaga;
- schema completo de RDO;
- schema completo de Transporte;
- tipos adicionais possíveis em `PlanoAcao.active_record`;
- forma final de armazenar histórico de replanejamento/execução.

Quando essas informações forem confirmadas no backend real, atualizar este documento e `data/project-memory.json`.
