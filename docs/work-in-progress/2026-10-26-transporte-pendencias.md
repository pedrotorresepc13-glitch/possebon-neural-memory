# Transporte — retomada 26/10/2026
Status: active / em execução técnica; SEM implantação confirmada no MAD Builder.

Escopo confirmado:
- APP monitor: excluir parada com passageiros inclusive última, desvincular passageiro da parada mantendo rota/assento, cancelar viagem sem salvar, tracking local/offline respeitando limitação iOS PWA.
- POSSEBON Web: gestão administrativa de rotas (criar, editar, excluir) e zerar/excluir percurso gravado, sem incluir painel administrativo no app.
- Isolamento por unit_id; grupo 33 para gestor da unidade inteira, monitor atua nas rotas permitidas.
- Firebase somente push; banco POSSEBON é a fonte de dados operacional.

Fontes verificadas:
- Brain protocol, current-state.json, project-memory.json, business-rules, decisions, WIP monitor.
- Flutter repositório pedrotorresepc13-glitch/possebon: operacional HEAD 6218feae..., PR #6 em draft HEAD 0766c63... sem merge.
- Backend exportado pelo usuário em ZIP possebon_web-22-10-2026-12-09-54(1).zip; export NÃO certifica estado runtime.
- Patch POSSEBON_MONITOR_EXCLUIR_PARADA_COM_PASSAGEIROS_23-10-2026.zip preparado, instalação não comprovada.
- RotaTransporteList/Form gerados já contêm onSave, onEdit e onDelete; não editar páginas geradas inteiras. Reset do trajeto não pode ser exclusão do cadastro.

Plano:
1. Revisar patch PHP e PR #6 contra o schema do banco no ZIP; corrigir falhas de sincronização das paradas, segurança e cancelamento.
2. Preparar PHP revisado apenas em app/custom e Flutter em PR técnica, com testes.
3. Não mesclar app que dependa de backend não implantado; fornecer roteiro de implantação/validação.
4. Para o Web, priorizar Designer e custom actions, preservar gerados.
5. Marcar stable somente depois dos testes reais e deploy. Não prometer GPS contínuo em iPhone PWA bloqueado.
## Resultado da preparação técnica 26/10
- Flutter em PR #6 técnica (draft, NÃO merged), HEAD `affd3aae184cb8c6553910dedd83327972e1748e`. Botão retirar passageiro diretamente na lista da parada; confirmação/API isoladas; só mostra sucesso de exclusão após `excluido=true`. Já continha cancelar viagem e retomada de percurso local.
- CI Flutter da revisão [40346630070](https://github.com/pedrotorresepc13-glitch/possebon/actions/runs/40346630070) concluída com **SUCCESS**, incluindo build Web release. Testes de operações reais pendentes.
- Pacote corrigido `POSSEBON_TRANSPORTE_PENDENCIAS_CORRIGIDAS_26-10-2026.zip` gerado no container e PHP lint OK nos **2 arquivos**: `app/custom/TransporteWorkflowFirebaseTrait.php` (substituição controlada a partir da exportação 22/10) e `app/control/adm_financeiro/TransporteTrajetoWebAdmin.php` (novo).
- Corrigido erro no patch PHP antigo: ao desvincular apenas o registro E mais recente, registros E antigos ativos podiam reaparecer. A revisão valida o E atual da parada, soft-deleta todos os E ativos daquele passageiro na mesma rota; preserva rota e assento.
- Na exclusão da parada S, a revisão soft-deleta todos os E apontando para S; para quem estava atualmente em S, também desativa E antigos para impedir retorno falso; não remove passageiro de outra parada onde ele esteja agora. Renumeração mantida. `unit_id` e monitor autorizados por funções existentes.
- `TransporteTrajetoWebAdmin`: extensão TPage sem alterar `RotaTransporteList/Form` gerados, grupo 33 e vínculo de unidade revalidados, checa viagem V ativa, soft-delete somente R da rota/unidade; exige ação do Designer no grid para funcionar visualmente no Web. Cadastro de rotas já possui ações de criar/editar/excluir nativas — permissão da tela configurável no Designer.
- **Estado real: ACTIVE/PREPARED, NÃO INSTALADO NEM TESTADO em servidor vivo**. Backend exportado de 22/10 pode estar desatualizado. PR #6 não mesclar antes da instalação/verificação. Auditar fotos, presenças, mapa, rastreio após deploy; Safari PWA não garante GPS bloqueado.
- A ação de reset em Web **não foi ligada no Designer**; não anunciar como disponível aos gestores. Próximos passos: confirmar versões backend vivas; backup/merge; instalar custom PHP, cadastrar ação Web, testes positivos/403/cross-unit, merge Flutter, confirmar Vercel, teste iPhone/Android.
