# Mapa Backend / API / MAD Builder

## Fonte de verdade do backend

O backend POSSEBON Web é MAD Builder/Adianti/PHP/PostgreSQL.

**Regra obrigatória:** não usar o GitHub Web como baseline autoritativo do backend. Antes de editar PHP/rotas/models, usar o ZIP/arquivo mais recente validado no trabalho corrente ou outro baseline explicitamente confirmado pelo usuário.

A memória neural registra nomes de arquivos, regras e contratos, mas não substitui a conferência do código backend real.

## Arquivos backend recorrentes

### Rotas
- `app/routes/api.php`

### Controller
- `app/controller/ApiAppController.php`

### Sessão permanente
- `app/custom/AppSessaoApiTrait.php`
- `app/middleware/AppApiBearerMiddleware.php` ou middleware equivalente vigente
- model `AppDispositivo.php`

### Segurança Operacional
- `app/custom/RondaGerencialAppApiTrait.php`
- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/AmigoPeitoAppApiTrait.php`

Os nomes acima são referências funcionais conhecidas; sempre confirmar no baseline atual antes da edição.

## Sessão permanente — contrato conceitual

### Ativar
`POST /api/app/sessao/ativar`

- autenticado com bearer válido;
- recebe/relaciona `dispositivo_uid`;
- gera access + refresh token;
- reutiliza `app_dispositivo`.

### Refresh
`POST /api/app/sessao/refresh`

- recebe refresh token;
- emite novas credenciais quando sessão/dispositivo seguem válidos;
- não exige senha em renovação normal.

### Revogar
`POST /api/app/sessao/revogar`

- revoga sessão permanente do aparelho.

## AppDispositivo — semântica conhecida

Campos/regras já utilizadas na evolução da sessão incluem:

- `unit_id`;
- `dispositivo_uid`;
- `refresh_token_hash`;
- `sessao_ativa`;
- `fcm_token` pode ser nulo conforme baseline vigente.

Não criar tabela nova de sessão sem revisar essa decisão.

## Planos de Ação — entidades relevantes

Model conhecido: `PlanoAcao`.

Campos funcionais importantes registrados em versões recentes:

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

### Regra de origem

`active_record + primary_key` identifica o registro que originou o plano.

Casos conhecidos:

- `AudicompItem` → `audicomp_item.id` → `audicomp_id` → `audicomp.arquivo`;
- `CondicaoInsegura` → `condicao_insegura.id` → `audicomp_id` → `audicomp.arquivo`.

Antes de alterar a resolução do PDF, confirmar no banco/backend atual se todos os quatro módulos de Segurança continuam resolvendo por esses tipos ou se há novos tipos.

### Foto/evidência do plano

No Web, evidência/foto de Plano de Ação foi observada usando relação `photo_report` com:

- `active_record = 'Ocorrencia'`;
- `primary_key = id do PlanoAcao`.

Ao transportar foto da origem para o plano, preservar a distinção entre evidência do registro de origem e evidência específica da execução do plano.

## Segurança Operacional

### Minha Ronda
Backend relacionado: `RondaGerencialAppApiTrait.php`.

### Dono de Área / Audicomp
Backend compartilhado/relacionado: `SegurancaOperacionalAppApiTrait.php`.

### Amigo do Peito
Backend: `AmigoPeitoAppApiTrait.php`.

### Regras comuns
- unidade atual obrigatória;
- autoria dos registros pessoais respeitada;
- equipe opcional;
- PDF oficial reaproveitado;
- fotos/evidências vinculadas corretamente;
- nenhum acesso administrativo deve ampliar silenciosamente “meus registros”.

## API do app — rotas conhecidas

Rotas observadas ao longo do projeto incluem famílias para:

- unidades;
- identificação/autenticação;
- sessão permanente;
- dispositivo/FCM;
- meus dados;
- foto oficial;
- treinamentos;
- processo/documentos;
- Quadro de Avisos;
- Segurança Operacional;
- Planos de Ação;
- RDO;
- Transporte;
- Cerca Virtual/Controle de Acesso.

Para nomes exatos e payloads conhecidos, consultar `data/api-contracts.json` e o `api.php` atual.

## MAD Builder — regra de edição

- Priorizar Designer, propriedades, eventos, filtros, fontes de dados e recursos nativos do MAD Builder.
- Código manual somente quando realmente necessário.
- Evitar editar trechos gerados que o Builder sobrescreve; preferir pontos de extensão/eventos quando disponíveis.
- Ao entregar correção de arquivo completo solicitada pelo usuário, devolver o arquivo completo corrigido.

## Regra de produção

Este projeto trabalha diretamente no ambiente real. Portanto:

- mudança backend deve ser mínima e rastreável;
- lint/sintaxe deve ser verificado antes da aplicação;
- pacote preparado não deve ser tratado como aplicado até confirmação;
- banco/rotas devem ser alterados somente quando necessários;
- qualquer dependência entre traits/controller/rotas deve ser explicitada antes da substituição.
