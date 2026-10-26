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