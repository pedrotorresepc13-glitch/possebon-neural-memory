# Regras de negócio permanentes — POSSEBON App

Este arquivo reúne regras que não devem ser redescobertas ou reinterpretadas a cada mudança.

## Identidade, Pessoa e Unidade

- `Pessoa` é a identidade única.
- `Colaborador` é vínculo funcional; contratação não cria uma nova Pessoa.
- Candidato também é contextual: uma Pessoa só é candidata em uma unidade quando está vinculada a uma vaga dessa unidade.
- A unidade escolhida no login é uma **fronteira rígida de dados**.
- Ter acesso administrativo a várias unidades não transforma automaticamente o vínculo funcional em vínculo com todas elas.
- Dados pessoais pertencem à Pessoa; dados funcionais e conteúdos contextuais pertencem ao contexto da unidade.

## Conteúdo que deve respeitar `unit_id`

Inclui, entre outros:

- logo/contexto da unidade;
- Quadro de Avisos;
- vagas e processo admissional;
- documentos;
- treinamentos/cursos contextuais;
- RDO;
- Segurança Operacional;
- cardápio/calendário;
- transporte;
- cerca virtual;
- auditorias;
- demais módulos funcionais.

## Acesso e sessão

- Após autenticação válida, o usuário deve permanecer conectado até tocar em **Sair** ou ocorrer revogação real da sessão.
- Expiração normal do access token não deve exigir novo login.
- Refresh token mantém a sessão do aparelho.
- Falha transitória de internet/API não deve apagar a autenticação.
- Refresh concorrente deve ser serializado/single-flight.
- Tracking, cerca virtual, transporte e notificações não podem depender de relogin diário.

## Primeiro acesso

### Colaborador

Unidade obrigatória → CPF → identificação → senha se já existir ou fluxo de primeiro acesso → sessão persistente.

### Candidato

Cadastro inicial de Pessoa conforme campos definidos no app. O app não cria vínculo oficial com vaga apenas porque o candidato visualizou ou demonstrou interesse.

## Candidatura e processo admissional

- Visualizar vaga não cria candidatura/vínculo oficial.
- A ação do candidato serve para enviar/associar currículo à Pessoa quando aplicável.
- O vínculo oficial Pessoa ↔ vaga é criado pelo RH no sistema Web/MAD Builder.
- Após existir vínculo oficial, o app pode mostrar documentos, cursos, treinamentos e etapas que já estejam configurados no sistema.
- O app reflete o estado do processo; não inventa etapas paralelas.

## Quadro de Avisos

- Tipo `C` = Candidatos. Pode escolher Pessoa específica não Colaborador; sem Pessoa específica, público-base = todos os candidatos daquele contexto.
- Tipo `F` = Funcionários/Colaboradores. Pode refinar por Colaborador, Gerência, Equipe, Função, Supervisor, Coordenador e demais filtros válidos.
- Encarregado não deve ser usado como filtro neste módulo.
- Aviso de uma unidade não pode aparecer em outra.

## Segurança Operacional — regra geral

Módulos:

- Minha Ronda Gerencial;
- Dono de Área;
- Audicomp;
- Meu Amigo do Peito;
- Meus Planos de Ação.

Regras:

- Minha Ronda Gerencial é a referência oficial de UX/fluxo para funcionalidades equivalentes.
- Não criar um estilo diferente por módulo sem necessidade funcional real.
- Padrão de tela, cores, barra de progresso, identificação, botões e comportamento devem ser compartilhados quando equivalentes.
- Equipe é opcional.
- Quando a regra for “meus registros”, listar apenas registros criados pelo usuário atual, independentemente de permissões administrativas.
- Registros salvos que geram PDF devem permitir reabrir o PDF existente.
- Fotos/evidências associadas à ocorrência que gera Plano de Ação devem permanecer acessíveis ao plano conforme a regra do módulo.

## Minha Ronda Gerencial

- É o padrão visual e funcional da família Segurança Operacional.
- Trabalha com identificação, condições/achados, evidências, ação/plano e relatório PDF.
- Alterações em módulos equivalentes devem preferir reutilizar componentes/comportamentos da Ronda em vez de copiar e divergir.

## Dono de Área

- Etapa de identificação deve seguir o padrão da Minha Ronda.
- Etapa Segurança deve funcionar como Minha Ronda quando a lógica for equivalente.
- Subcategorias oficiais conhecidas: IDs `35..62`.
- Diferenças permitidas: conteúdo, modelo/perguntas e regras específicas de negócio; não o padrão-base de UX.

## Audicomp

- Perguntas/regras próprias, dentro do mesmo padrão visual/estrutural da Segurança Operacional.
- Não deve criar um design independente quando a interação é equivalente.

## Meu Amigo do Peito

- Fluxo visual simplificado.
- Etapa inicial + decisão sobre resolução + revisão/finalização; evitar etapa artificial só para “criar plano”.
- Se resolvido no local, encerra sem Plano de Ação.
- Se não resolvido, gera Plano de Ação automaticamente.
- Responsável automático: Gerente SMS.
- Prazo padrão do plano: +7 dias.
- Foto/evidência do registro não resolvido deve acompanhar a origem/plano conforme implementação backend vigente.

## Meus Planos de Ação

- O plano pertence ao **responsável atual**.
- O responsável atual pode ser diferente da pessoa que criou o registro de origem.
- Nunca confundir `responsavel_id` do plano com autor/criador da origem.
- O plano deve manter referência ao registro de origem por `active_record + primary_key` (ou contrato equivalente vigente).
- O executor deve poder abrir o registro/PDF de origem por esse vínculo, mesmo que outra pessoa tenha criado a Ronda/Dono/Audicomp/Amigo.
- Não gerar um segundo PDF de origem se já existe o PDF oficial do registro salvo.
- Se o PDF de origem não existir, mostrar indisponibilidade sem crash.
- Replanejamento começa por ação explícita do usuário.
- Replanejamento exige nova data + motivo.
- Trocar o responsável durante replanejamento é opcional.
- Histórico de replanejamento deve ser acrescentado, nunca sobrescrito.
- Execução/conclusão também deve preservar histórico anterior.

## Meu RDO

- Mostrar somente RDOs do usuário atual.
- Offline-first: pendência local só sai da fila após confirmação do servidor.
- Status `Emissão`: editável na evolução planejada.
- Arquivado: somente leitura.
- Sincronização global e sincronização manual devem compartilhar proteção contra concorrência.

## Transporte

- Contexto por Pessoa + Unidade.
- Início de rota deve comunicar os usuários/passageiros conforme regra funcional vigente.
- Tracking ativo não deve ser interrompido por logout acidental/expiração normal da sessão.
- Quando não houver percurso/configuração compatível, não exibir ações sem sentido como atualização de ponto de embarque.
- Monitor/motorista e passageiro têm capacidades distintas.

## Cerca Virtual / Controle de Acesso

- Cerca Virtual respeita a unidade atual.
- Origem conhecida de presença: `C` = Cerca Virtual; `T` = Transporte.
- Configuração administrativa depende de capability/permissão.
- A rotina automática deve continuar funcional com sessão persistente.

## Notificações

- FCM é parte do fluxo funcional.
- Abertura de notificação deve navegar para o destino correto quando possível.
- Token do dispositivo deve permanecer coerente com a sessão atual e ser atualizado quando necessário.
- Notificação não deve misturar unidade/contexto de outra sessão.

## UI/Design

- Evitar cores soltas por tela.
- Preferir `AppTheme`, `AppColors` e widgets compartilhados.
- Segurança Operacional deve manter padrão único.
- Barra de progresso e identificação não devem variar arbitrariamente entre Ronda/Dono/Audicomp.
- Código novo deve privilegiar componentes reutilizáveis e estados localizados.

## Regra de implantação

Planejado ≠ aplicado.
Preparado ≠ implantado.
Workflow criado ≠ workflow executado com sucesso.
Arquivo gerado ≠ arquivo validado.

Sempre registrar o estado real.
