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

## 28/10 — DECISÃO MAIS RECENTE: Gestão de Transporte nos DOIS ambientes

Esta decisão do usuário **substitui** a orientação anterior de manter administração somente no POSSEBON Web. O POSSEBON App continuará com **Gestão de Transporte administrativa**, e o POSSEBON Web/MAD Builder também. O futuro Portal não implica remoção da gestão atual.

- Regra oficial: grupo 33 App_Minha Rota, todas as rotas/monitores da `unit_id`, sem condicionar a gestão ao colaborador ter rota, ser monitor ou ser passageiro. Backend continua revalidando autorização e identidade da sessão.
- Confirmado no Flutter branch `fix/transporte-completo-20261028`: commit `dd863e5420c47cd36c78dcaec862d60934e4dcf8` move consulta `gestao_acesso` da Home para fora do bloco `if (ehColaborador)`. Card e tela de gestão existentes permanecem.
- Inspecionado ZIP real `possebon_web-26-10-2026-22-21-50.zip`: `TransporteAppApiTrait.php` possui `gestao_acesso`, `gestao`, alterações de monitor/assento/transferência, grupo 33 e escopo `unit_id`. `TransporteWorkflowFirebaseTrait.php` do ZIP não possui `monitor_parada_reordenar_v2` nem `gestao_limpar_gravacao`; pacote preparado de 28/10 acrescenta as duas ações e outras correções, **sem implantação confirmada**.
- A gestão Web e App devem coexistir; ações da gestão App que ainda não possuem endpoint instalado no servidor ficam pendentes. Não afirmar conclusão até a validação de contrato e testes.

## 28/10 — implementação adicional CRUD administrativo no App (NÃO publicado)

- Branch da PR #10 atualizada para commit **`7ad863d7806f7f8830032738b8be31cf0bcaccd9`**. Flutter: `lib/screens/home_screen.dart` deixa a autorização de gestão depender apenas do retorno `gestao_acesso`; `lib/features/transporte/data/transport_management_api.dart` adiciona `gestao_rota_salvar` e `gestao_rota_excluir`; `lib/features/transporte/presentation/transport_management_screen.dart` adiciona cadastro, edição e exclusão de rota no App.
- Backend customizado **preparado** a partir do ZIP `possebon_web-26-10-2026-22-21-50.zip` e do pacote não aplicado de 28/10, sem alterar `app/control` gerado:
  - `app/custom/TransporteAppApiTrait.php` completo: grupo 33 com conferência de `system_user_unit` por `unit_id` e sessão JWT; permite gestor administrativo sem vínculo funcional de Colaborador na unidade, preservando regras operacionais de monitor/passageiro. SHA256 `3506fc81542b004e34d58936b2f527bfc3d2455a9554a29009761f98a4090bad`.
  - `app/custom/TransporteWorkflowFirebaseTrait.php` completo: inclui as ações `gestao_rota_salvar` (criar/editar, capacidade validada) e `gestao_rota_excluir` (soft-delete apenas sem passageiros ativos/viagem ativa), além das ações anteriores de monitor, reordenar e limpar. SHA256 `d001b6d586d30ad9c7da2c2f55e0c36fce365af42ebbfc3d0410723f33ff027c`.
- `php -l` nos dois traits: OK. Sem conexão ao banco de produção, teste de API, instalação em MAD Builder, build Flutter ou testes de aparelho. Não considerar aplicado/validado.
- Actions do Flutter no head continuam falhando antes do job (`steps=[]`, runner vazio). A falha é de infraestrutura/inicialização do CI, não prova erro de Dart; código não foi compilado.
- A PR continua **DRAFT**, base `feature/meu-rh-20261027`; não mesclar até reconciliação/validação. Quando o usuário quiser instalar PHP, entregar arquivos completos para colar manualmente. Não instalar via SSH nem sobrescrever páginas geradas.


## 30/10 — Gestão diária e separação Rotas/Frotas (main)

- Nova regra: cadastros com `codigo` iniciado em R são **Rotas** e os demais são **Frotas**. Não houve migração de banco; manter o cadastro `rota_transporte` e editar código/nome/quantidade de assentos/ponto, monitor, passageiro/assento por ferramentas já existentes.
- Monitor mostra todos na chamada, inclusive quem informou não usar, com **vermelho** para N, **verde** para S e **neutro** para não respondido. Marcação P/A continua manual e só P grava `controle_acesso T` pelo backend; não confundir resposta e presença.
- Gestão App main adiciona painel de operação por dia: GPS gravado, viagem ativa/finalizada, último início, saída/chegada/duração, múltiplas viagens do dia, chamada consolidada P por viagem cruzada com T no mesmo dia, alertas de não início/chamada, respostas por status. Grupo 33 e `unit_id` continuam obrigatórios. Novo painel se oculta sem contrato PHP para não mostrar zeros falsos.
- Backend customizado `app/custom/TransporteAppApiTrait.php` preparado a partir do ZIP real 30/10/2026 09:13: pacote `POSSEBON_TRANSPORTE_GESTAO_DIA_30-10-2026.zip`, apenas ação GET `gestao_operacao_dia` e novo método read-only. `php -l` OK, patch no pacote. **NÃO instalado**. Comparar versão viva antes de aplicar manualmente; nunca sobrescrever páginas geradas.
- Fonte Flutter única **main** `21fc4d58f354d66e3698566a7ad219dc9fb02490`; branch legada `possebon` sincronizada via fast-forward sem descartar commits (continua default configurada do GitHub). Flutter analyze/test/build e API real não homologados; últimos Vercel statuses ainda pendentes. Consulte `docs/transporte-gestao-operacao-dia-20261030.md` no repo do App.
