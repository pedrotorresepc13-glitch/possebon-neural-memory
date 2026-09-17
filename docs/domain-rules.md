# Regras de domínio — POSSEBON App

Atualizado em 2026-09-17.

Este arquivo registra regras que não devem ser reinventadas a cada tarefa.

## Identidade, Pessoa e unidade

- `Pessoa` representa a identidade principal e não deve ser duplicada por mudança de vínculo.
- Quando um candidato é contratado, a mesma Pessoa recebe vínculo de Colaborador.
- A unidade selecionada no login é uma fronteira rígida de contexto, equivalente a uma empresa operacional distinta.
- Conteúdo contextual deve respeitar `unit_id`: avisos, treinamentos, cursos, vagas, processo admissional, documentos, RDO, transporte, cerca virtual, auditorias, Segurança Operacional e demais módulos.
- Um usuário administrativo com acesso a várias unidades não transforma automaticamente o mesmo Colaborador em funcionário de todas elas.
- Dados pessoais pertencem à Pessoa; dados funcionais pertencem ao vínculo funcional e devem respeitar a unidade atual.

## Candidato e processo seletivo

- Pessoa sem vínculo de vaga na unidade atual não deve ser tratada como candidata daquela unidade.
- Candidato contextual por unidade existe quando a Pessoa está vinculada a uma vaga da mesma `unit_id` por `histograma_vaga`.
- Visualizar vaga aberta é permitido.
- A ação do candidato de enviar currículo não cria candidatura formal nem vínculo com a vaga.
- O currículo fica associado à Pessoa para reutilização futura.
- O vínculo oficial Pessoa ↔ vaga é criado pelo RH no MAD Builder.
- Depois do vínculo, o app exibe documentos exigidos para aquela vaga e permite envio individual.
- Treinamentos, cursos e etapas posteriores só aparecem quando já existem e estão vinculados no sistema.

## Sessão permanente

- O app deve permanecer autenticado por longos períodos sem exigir login diário.
- Access token pode expirar normalmente.
- Refresh token mantém a sessão do aparelho e renova o access token silenciosamente.
- Apenas um refresh deve ocorrer por vez.
- Falha de rede, timeout ou indisponibilidade temporária não deve apagar autenticação nem provocar logout.
- Revogação real/credencial definitivamente inválida pode exigir nova autenticação.
- Cerca virtual, transporte, notificações e tarefas de background não podem depender de o usuário abrir o app diariamente para refazer login.

## Cache e offline

- Cache local deve ser isolado por `pessoa_id + unit_id` quando o dado é contextual.
- Erro de negócio, permissão ou desligamento não deve ser mascarado por cache antigo.
- Cache pode ser usado quando a falha for realmente de conectividade/indisponibilidade e houver dado válido local.
- RDO pendente só sai da fila local após confirmação do servidor.
- Imagens/arquivos cacheados devem respeitar a identidade e contexto corretos.

## Mensagens de erro para usuário

- Nunca exibir host, URL interna, ClientException, stack trace, nome de classe, SQL, token ou detalhes técnicos ao usuário final.
- Exibir mensagens simples e orientadas à ação.
- CPF inválido deve ser explicado de forma compreensível, sem mensagem técnica.

## Quadro de Avisos

- Não pode haver vazamento entre unidades.
- `tipo_destinatario = C`: candidatos. Pode selecionar Pessoa específica que não seja Colaborador; sem Pessoa específica, público-base = todos os candidatos válidos da unidade.
- `tipo_destinatario = F`: funcionários/Colaboradores. Pode refinar por Colaborador, Gerência, Equipe, Função, Supervisor, Coordenador ou todos os colaboradores ativos.
- Encarregado não faz parte do filtro atual.
- A população de funcionários deve usar colaboradores ativos da unidade, não snapshot histórico de efetivo.
- `qtd_env` representa pessoas, não quantidade de dispositivos/tokens.
- O app recebe apenas mensagens que o backend resolveu como destinadas à Pessoa atual.
- Push deve navegar para o destino correto sem alterar a regra de persistência do registro.

## Segurança Operacional — regra de família

Módulos:
- Minha Ronda Gerencial
- Dono de Área
- Audicomp
- Meu Amigo do Peito
- Meus Planos de Ação

Regras comuns:
- Minha Ronda Gerencial é a referência visual e funcional aprovada quando houver equivalência.
- Não criar um fluxo visual diferente só porque o módulo tem nome diferente.
- Diferenças devem ficar nas perguntas, modelos, catálogos e regras específicas.
- Equipe é opcional.
- Telas de identificação, barra de progresso, ações, cores, cards e feedback devem seguir o padrão compartilhado da família.
- Quando uma lista é “meus registros”, mostrar somente registros criados pelo usuário atual, independentemente de permissões administrativas amplas.
- Registro salvo deve gerar/usar PDF quando essa é a regra do módulo e o item da lista deve abrir o PDF correspondente.
- Evidências/fotos do contexto que gera Plano de Ação devem acompanhar o plano de forma consistente.

## Minha Ronda Gerencial

- Referência oficial de UX/fluxo para Segurança Operacional.
- Identificação e fluxo de condições servem de padrão para Dono de Área quando equivalentes.
- PDFs salvos devem permanecer reabríveis.
- Alterações nos módulos irmãos devem preferir reutilizar componentes da Ronda em vez de copiar e divergir.

## Dono de Área

- Etapa Segurança deve funcionar como Minha Ronda Gerencial, não apenas parecer com ela.
- Subcategorias oficiais conhecidas: IDs 35 a 62.
- Equipe opcional.
- Reconhecimentos/condições e ações devem usar o mesmo padrão de editor/validação compartilhado quando a regra for equivalente.

## Audicomp

- Mantém perguntas/regras próprias.
- Visual, navegação e padrões equivalentes permanecem alinhados com a família Segurança Operacional.
- “Meus registros” deve respeitar autoria do usuário atual.

## Meu Amigo do Peito

- Fluxo visual simplificado.
- Se resolvido no local, encerra sem Plano de Ação.
- Se não resolvido, gera Plano de Ação automaticamente.
- Responsável automático conhecido: Gerente SMS.
- Prazo padrão: +7 dias.
- O fluxo não deve inserir uma etapa visual desnecessária de edição manual de plano quando a regra é geração automática.

## Meus Planos de Ação

- A lista pertence ao responsável atual do plano, não ao criador do registro de origem.
- Quem executa um plano pode ser diferente de quem criou Ronda, Dono de Área, Audicomp ou Amigo do Peito que originou o plano.
- O plano deve manter vínculo com o registro de origem por referências do próprio plano (`active_record`/`primary_key` no backend atual conhecido).
- O responsável deve poder abrir o registro/PDF de origem sem precisar ser autor do registro.
- O rótulo deve ser neutro, por exemplo “Abrir registro de origem”, e não “Abrir Minha Ronda”.
- Replanejamento começa por uma ação explícita; não precisa manter todos os campos de replanejamento sempre abertos na ficha.
- Replanejamento exige motivo.
- Nova data é obrigatória.
- Troca de responsável é opcional.
- Histórico de replanejamento deve ser acrescentado, nunca sobrescrito.
- Execução/conclusão também deve preservar histórico anterior.
- Evidência de execução é uma evolução própria e não deve ser confundida com a evidência do registro de origem.

## Meu RDO

- Mostrar somente RDO do usuário atual.
- RDO arquivado: somente leitura.
- RDO em status Emissão: editável na etapa planejada.
- Offline-first: criação/pendência local deve sobreviver à falta de internet.
- Sincronização global não deve enviar pendência de outro usuário em aparelho compartilhado.

## Transporte

- Contexto rígido por unidade.
- Sessão expirada normalmente não pode interromper operação/tracking válido.
- Logout deve ser bloqueado enquanto houver rota ativa quando isso interromperia compartilhamento de localização necessário aos passageiros.
- Monitor/motorista e passageiro possuem responsabilidades distintas.
- Presença de transporte usa origem operacional `T` quando gravada no controle de acesso atual.

## Cerca Virtual / Controle de Acesso

- Configuração administrativa depende de capability/permissão.
- Presença e configuração devem respeitar unidade atual.
- Presença por cerca virtual usa origem operacional `C` no controle de acesso atual.
- Geofence precisa continuar funcional sem exigir login diário do usuário.

## Cadastro de Crachá

- Fluxo possui busca de colaborador, leitura QR da frente e OCR/ML Kit do verso.
- Operação deve respeitar acesso/capability e unidade atual.

## Padrão de mudança

- Antes de criar tela nova, verificar se já existe tela/componente com mesma função.
- Regra compartilhada deve preferir componente/serviço compartilhado.
- Não copiar código de uma tela para outra se isso criar duas implementações da mesma regra.
- Toda mudança validada deve atualizar esta memória neural.
