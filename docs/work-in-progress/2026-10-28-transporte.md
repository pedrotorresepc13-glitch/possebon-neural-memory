# Transporte — correções consolidadas 28/10/2026

## Pedido do usuário (requisitos não negociáveis)
- Monitor excluir parada mesmo ocupada, **sem excluir colaboradores/rota/assentos**, desvincular um passageiro de parada e reordenar paradas persistindo ordem e refletindo no mapa.
- Gestor com grupo **33 App_Minha Rota** pode limpar gravação GPS **e paradas** (registros operacionais R, S, E), não somente GPS, preservando cadastro da rota, colaboradores, assentos e auditoria e respeitando `unit_id`.
- Monitor/motorista deve finalizar viagem automaticamente quando chegar de verdade ao destino configurado.
- **É REGRESSÃO GRAVE** tirar do colaborador a opção de **acompanhar seu ônibus em tempo real no mapa** do Meu Transporte. Não condicionar a ser monitor/gestor.
- Problemas de PWA iOS, toques, notificação, perda de GPS offline permanecem itens de homologação, não alegar que iOS consegue GPS contínuo com app suspenso.
- Não perder Meu RH PT_07 e outras funções.

## Implementado no repositório Flutter (NÃO implantado/validado em produção)
- Repo `pedrotorresepc13-glitch/possebon`, branch `fix/transporte-completo-20261028` baseada em `feature/meu-rh-20261027`, draft PR **#10** `https://github.com/pedrotorresepc13-glitch/possebon/pull/10`. Mergeable=true, draft (não mesclar sem servidor compatível, testes e CI).
- Incorporadas implementações existentes da draft PR #6: monitor remove passageiros da parada sem perder vínculo de rota/assento, exclui parada ocupada e cancela viagem sem gravar trajeto; preserva suporte PWA anterior.
- Monitor pode mover parada para cima/baixo; POST `acao=monitor_parada_reordenar_v2` com `ordem_ids` completos e persistência pelo PHP.
- Gestor no Flutter tem ícone *Limpar trajeto e paradas*, confirmação e POST `acao=gestao_limpar_gravacao`, com bloqueio no backend quando viagem ativa.
- GPS em `lib/services/transporte_tracking_service.dart`: destino do último ponto do trajeto salvo ou última parada ordenada; distância entre primeiro/último >=250m, deve ver distância >=200m do destino, viagem >=2min, GPS <=25m precisão, 3 amostras diferentes e permanência >=25s dentro de 50m; fechamento pelo servidor; não finalizar com endpoint inexistente ou ao regravar usando destino obsoleto. PWA iOS em segundo plano NÃO garantido e exige teste real.
- Botão *Acompanhar ônibus no mapa* adicionado a `_transportePessoal()` de colaboradores com rota, sem permissão de monitor. Hotfix também diretamente na branch `feature/meu-rh-20261027` commit **ae320e5dca8d7b54baa03a02696e525413bf35db**, SEM confirmação de Vercel live.
- Workflow `.github/workflows/validate-transporte-completo-20261028.yml` (analyze, test transporte, build Web, check JS). Status de CI ainda **não confirmado**; Vercel check de commit visto pending.
- PR #10 draft, mergeable=true.

## Backend MAD Builder PHP — pacote criado e validado localmente; NÃO INSTALADO
- Fonte do backend VIVO: ZIP `possebon_web-26-10-2026-22-21-50.zip` fornecido usuário (GitHub possebon_web não é baseline).
- Pacote local verificado `/mnt/data/POSSEBON_TRANSPORTE_COMPLETO_28-10-2026.zip`, arquivos completos:
  - `app/custom/TransporteWorkflowFirebaseTrait.php`: métodos e cases de retirar passageiro, excluir parada ocupada, reordenar paradas e limpar gravação (gestor grupo33), cancelar viagem, JWT sessão/unit_id/escopo.
  - `app/control/adm_financeiro/RotaTransporteList.php`: ação grid nativa de limpar trajeto+paradas.
  - `app/control/adm_financeiro/TransporteTrajetoWebAdmin.php`: confirmação e soft-delete R/S/E, bloqueio viagem ativa, mantém pessoas e assentos e limpa rota_ponto.
  - `instalar_ssh.sh`: preflight só leitura para verificar SHA-256 do arquivo vivo e PHP lint; --aplicar somente com base reconhecida + backup em /var/backups/possebon-transporte-...; aborta se divergência.
- `php -l` passou nos 3 arquivos; `bash -n` passou; instalador preflight foi testado contra cópia da baseline 26/10 e passou SEM alterar arquivos. Sem deploy de backend no servidor, sem teste de API real, sem aprovação iOS/GPS. **Jamais afirmar que está em produção**.
- Não se deve substituir PHP se SHA real divergir. Usuário tem SSH root /var/www/html/possebon_app, preferir comando Bash completo em vez de SQL bruto.

## Passos para homologação
1. Conferir e instalar PHP no servidor com script/backup (ou conciliar diferenças reais se abortar).
2. Após CI Flutter, implantar App PWA/Android na branch correta, preservando Meu RH e os demais módulos. Evitar mesclar PR #6 isoladamente sem conferir funcionalidades.
3. Testar monitor ocupado + passageiro individual + reordenação persistente + limpeza Web/App com grupo33 e outra unidade bloqueada + mapa do colaborador + chegada automática real com GPS confiável e negativos (ruído, origem perto do destino, rota nova sem destino, PWA iOS suspenso).
4. Monitorar deploy Vercel e não afirmar que atualizou até conferência.

**Nota:** a regra de reordenação foi entregue com ações subir/descer (não arrastar); atende reordenar ordem de paradas e persistir, mas não implementa drag-and-drop por gesto.

## Validação após abertura da PR #10
- Draft PR #10 verificada `mergeable=true`, base `feature/meu-rh-20261027`, head `fix/transporte-completo-20261028`.
- Workflow GitHub Actions run **40668901059** na PR **FAILED** em ~2s, **antes de executar qualquer etapa**: job `validate` registra `steps=[]`, `runner_id=0`, `runner_name=""`; não há logs disponíveis (BlobNotFound). Isso aponta problema de inicialização/agendamento/ambiente CI, **não confirma erro Dart** e tampouco valida compilação. Investigar e rerodar CI antes de merge/deploy. Status de Vercel commit estava pending.
- Pacote final `/mnt/data/POSSEBON_TRANSPORTE_COMPLETO_28-10-2026.zip` verificado: 6 arquivos, 3 PHP com `php -l` OK, `bash -n` OK, instalação preflight sem alteração contra cópia do backend baseline 26/10 OK. Script preserva owner/group/mode dos arquivos ao aplicar; instalação real pendente. Atualização do ZIP conferida em 28/10. Sem prova de servidor atualizado.


## 28/10 — revisão solicitada: SOMENTE app, trabalhando com o Brain
- Usuário rejeitou procedimento de instalar ZIP por SSH e substituir páginas MAD Builder geradas. **Não voltar a propor instalador.** Quando PHP for necessário, o usuário solicita o arquivo COMPLETO para colar manualmente no editor e alterações em páginas geradas devem ser feitas no Designer, não por sobrescrita.
- Bootstrap Brain foi repetido antes da alteração: README, current-state, project-memory (nó transport), operating-protocol, business-rules, transport WIP e contratos. Código conferido na branch app `fix/transporte-completo-20261028`.
- Alterações app já nesta branch incluem botão `Acompanhar ônibus no mapa` para colaborador, remoção de passageiro da parada sem remover da rota, exclusão de parada ocupada, reordenação subir/descer, cancelamento de viagem e chegada automática pelo GPS. **Algumas ações dependem de backend customizado ainda não confirmado**. Não considerá-las operacionais até instalar o trait correto e fazer testes funcionais.
- Correção SOMENTE Flutter adicional no commit `23ee40214b571c74881bcf4799a9728dcb1c359f`: `lib/screens/transporte_mapa_screen.dart` agora reconhece transição `_tracking.encerrandoAutomaticamente` → parada confirmada, recarrega mapa e mostra mensagem após servidor indicar `viagem_ativa=null`. Se API falhar, tracking segue ativo e tela não afirma finalização.
- PR #10 atualizada para foco **Flutter/PWA e backend separado no MAD Builder**, continua draft, base `feature/meu-rh-20261027`. Nenhuma modificação no backend vivo nesta etapa.
- GitHub Actions run `40671926563` FALHOU antes de executar `steps` (`steps=null`); não equivale a bug Flutter confirmado, mas tampouco comprova compilação. Flutter SDK não está disponível no contêiner local para analyze/build. Testar via runner disponível antes de merge/deploy.
- Não considerar resolvida a Gestão Web de limpar GPS/paradas: a tela MAD Builder gerada NÃO foi alterada e precisa ação via Designer + serviço customizado no backend vivo. Não sugerir editar arquivo gerado pelo pacote antigo.
- Status atual: código Flutter em PR draft; sem deploy, sem confirmação do backend ou teste de campo.
