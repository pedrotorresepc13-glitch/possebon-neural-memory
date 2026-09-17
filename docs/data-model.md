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

## Audicomp / itens / condições

`Audicomp` funciona como registro-pai para relatórios/arquivos em fluxos de Segurança Operacional.

Relações observadas:

- `audicomp_item` pode apontar para `audicomp_id`;
- `condicao_insegura` pode apontar para `audicomp_id`;
- `audicomp.arquivo` pode armazenar caminho do relatório PDF oficial.

Confirmar os tipos exatos usados por cada módulo antes de criar nova resolução de origem.

## PhotoReport / evidência

No fluxo Web de Plano de Ação foi observada associação de evidência usando:

- `active_record = 'Ocorrencia'`;
- `primary_key = PlanoAcao.id`.

Manter separação conceitual entre:

1. evidência do registro original;
2. evidência anexada/duplicada ao plano quando necessário;
3. evidência específica da execução/conclusão.

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

## Relações que precisam de confirmação antes de mudança de schema

- tabelas/PKs exatas do processo admissional;
- tabela final de vínculo Pessoa ↔ vaga;
- schema completo de RDO;
- schema completo de Transporte;
- tipos adicionais possíveis em `PlanoAcao.active_record`;
- forma final de armazenar histórico de replanejamento/execução.

Quando essas informações forem confirmadas no backend real, atualizar este documento e `data/project-memory.json`.
