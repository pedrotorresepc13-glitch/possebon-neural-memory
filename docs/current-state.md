# Estado atual conhecido — POSSEBON App

Atualizado em 2026-09-17.

Este arquivo separa estado **confirmado**, **implementado sem confirmação** e **planejado**. Não reinterpretar essas categorias.

## Prioridade atual

1. Finalizar Meus Planos de Ação.
2. Corrigir/medir performance do app, principalmente teclado/IME e abertura de telas.
3. Depois seguir para edição controlada do Meu RDO.

## Flutter remoto

- Repositório: `pedrotorresepc13-glitch/possebon`
- Branch: `possebon`
- HEAD observado em 2026-09-17: `23d7bbb8d2ffad5eef3405b211bcd20ea5006bf7`
- Esse HEAD contém commits administrativos de inclusão/remoção temporária do mapa neural; o código Flutter não foi alterado por essa limpeza.

### Atenção: Flutter local x remoto

Durante o trabalho de Planos de Ação houve alterações locais/staged e um autostash. A árvore remota ainda mostra `planos_acao_screen.dart` na versão antiga observada pelo blob `ea868785f44f60a37feef9e4c63dfdd92f855a64`.

Portanto:
- não assumir que mudanças locais de origem PDF/replanejamento já estão consolidadas no GitHub do app;
- antes de novo patch nesse módulo, inspecionar `git status` e diffs locais;
- não apagar mudanças locais com reset amplo;
- não aplicar `stash pop` cegamente.

## Sessão permanente — CONFIRMADO NO BACKEND

Arquitetura confirmada/aplicada:
- `AppDispositivo.php`
- `AppSessaoApiTrait.php`
- `ApiAppController.php`
- `AppApiBearerMiddleware.php`
- `api.php`

Rotas conhecidas:
- `POST /api/app/sessao/ativar` — bearer
- `POST /api/app/sessao/refresh` — refresh token
- `POST /api/app/sessao/revogar` — refresh token

Banco reaproveita `app_dispositivo`; não criar tabela paralela. Campos conhecidos adicionados/ajustados: `unit_id`, `dispositivo_uid`, `refresh_token_hash`, `sessao_ativa`; `fcm_token` pode ser nulo.

Flutter usa `AuthSessionManager`, `SessionStorage` e `SessionService`, com refresh single-flight.

## Segurança Operacional — BACKEND CONFIRMADO

### Pacote base da Etapa 1 — aplicado

Arquivos confirmados:
- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/RondaGerencialAppApiTrait.php`
- `app/custom/AmigoPeitoAppApiTrait.php`
- `app/controller/ApiAppController.php`
- `app/routes/api.php`

Esse conjunto adicionou/ajustou rotas e traits necessários para a família Segurança Operacional e Amigo do Peito.

### Ajuste pós-teste de 16/09 — aplicado

Arquivos confirmados:
- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/AmigoPeitoAppApiTrait.php`

Regras incorporadas:
- Dono de Área usa subcategorias oficiais 35–62;
- equipe nullable/opcional;
- Amigo do Peito permite colaborador válido no contexto;
- Gerente SMS automático;
- prazo +7 dias;
- plano automático somente quando não resolvido.

## Segurança Operacional — NÃO TRATAR COMO APLICADO SEM NOVA CONFIRMAÇÃO

Foram preparados, mas não há confirmação suficiente nesta memória de que estejam em produção:
- pacote de correção de fotos/evidências e unificação Dono/Ronda;
- pacote isolado de origem PDF de Planos;
- correção posterior do endpoint real `/api/app/seguranca/meus-planos` no `RondaGerencialAppApiTrait.php`;
- pacote V2 de Planos/replanejamento gerado depois;
- scripts Flutter de origem PDF, replanejamento e rótulo neutro, enquanto não houver commit/push ou confirmação explícita.

Se o usuário disser que algum desses arquivos foi aplicado, atualizar este documento imediatamente.

## Minha Ronda Gerencial

Status: referência funcional/visual aprovada.

Regras vigentes:
- equipe opcional;
- lista própria do usuário;
- PDF gerado e reaberto ao tocar no registro;
- serve de padrão para etapas equivalentes de Dono de Área/Audicomp.

## Dono de Área

Status: `attention`.

Problemas históricos recentes:
- divergência visual/funcional em relação à Minha Ronda;
- condições/reconhecimentos com erros;
- subcategoria incompatível no salvamento;
- editor de texto em dialog apresentou problema.

Correções de regra já confirmadas no backend: subcategorias 35–62 e equipe opcional. A unificação completa de fluxo deve ser validada no app antes de marcar estável.

## Meu Amigo do Peito

Status: `validated/active` no fluxo principal, com pendência de evidência/foto do Plano de Ação.

Fluxo esperado:
- identificação;
- informar se foi resolvido no local;
- resolvido = finaliza;
- não resolvido = gera plano automático;
- responsável = Gerente SMS;
- prazo = +7 dias;
- sem editor manual de plano intermediário.

## Meus Planos de Ação

Status: `attention` / foco atual.

Regra desejada confirmada:
- lista = planos atribuídos ao responsável atual;
- executor pode não ser autor da origem;
- ficha não deve duplicar “Não conformidade” e “Ação/tratativa” quando o registro original já contém esses dados;
- mostrar bloco “Registro de origem” e ação neutra “Abrir registro de origem”;
- abrir o PDF já existente do registro que originou o plano;
- sem crash quando PDF estiver ausente;
- replanejamento começa por botão;
- nova data obrigatória;
- motivo obrigatório;
- responsável novo opcional;
- histórico acumulativo, nunca sobrescrito.

Ponto técnico conhecido do backend:
- `PlanoAcao` possui `active_record` e `primary_key` para localizar origem;
- origens de Segurança conhecidas podem resolver por `AudicompItem`/`CondicaoInsegura` até `audicomp.arquivo`;
- confirmar todas as origens atuais antes de consolidar uma implementação final.

## Performance

Status: `attention`.

Sintoma informado:
- teclado/IME abrindo muito lentamente;
- algumas telas demorando para abrir.

Achados iniciais:
- telas grandes/stateful;
- `setState` amplo em listeners;
- Home concentra muitas responsabilidades;
- mapas/tracking usam atualizações frequentes;
- uso de `MediaQuery.viewInsets` em árvore grande pode amplificar rebuild durante animação do teclado.

Regra: medir em `flutter run --profile` antes/depois de cada otimização relevante.

## Meu RDO

Status: `active`; próxima etapa depois de Planos/performance.

Regras futuras já decididas:
- somente RDO do usuário atual;
- Emissão = editável;
- Arquivado = somente leitura;
- manter offline/outbox e confirmação do servidor.

## Quadro de Avisos

Status: ativo.

Regras consolidadas:
- unidade rígida;
- C = candidatos;
- F = colaboradores com filtros funcionais;
- Encarregado excluído;
- população de funcionários = colaboradores ativos;
- app recebe destinatários já resolvidos pelo backend.

Pendência histórica a verificar em ciclo futuro:
- atualização de FCM token em startup de sessão salva, `onTokenRefresh` e desvinculação no logout.

## Fonte backend conhecida

Baseline autoritativo conhecido: `possebon_web-15-09-2026-11-23-26.zip` + alterações manualmente confirmadas acima.

Nunca reconstruir PHP atual somente a partir desta memória se a tarefa exigir código exato. Usar o ZIP/arquivo atual correspondente.
