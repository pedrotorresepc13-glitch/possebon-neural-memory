# Padrões de UI/UX — POSSEBON App

Atualizado em 2026-09-17.

## Princípio

O app não deve parecer uma coleção de telas independentes. Módulos equivalentes precisam compartilhar linguagem visual, navegação, estados, componentes e comportamento.

## Segurança Operacional

Fonte visual oficial: componentes e tokens de `lib/features/seguranca_operacional/presentation/widgets/seguranca_workflow_ui.dart`, que reproduzem o padrão aprovado da Minha Ronda Gerencial.

Tokens observados no código:
- primary: `#00AEEF`
- primary dark: `#007EAD`
- background: `#F5F6F7`
- surface: branco
- text: `#191C1D`
- secondary text: `#526772`
- border: `#E4E9EC`
- inactive progress: `#E1E5E8`
- success: `#2E7D32`
- danger: `#B3261E`

Regras:
- Dono de Área e Audicomp devem consumir tokens/componentes compartilhados em vez de criar cores/spacing locais.
- A barra de progresso deve ser a mesma quando a estrutura de etapas for equivalente.
- A tela de identificação deve reutilizar o mesmo padrão da Minha Ronda quando os dados forem equivalentes.
- Botões de ação devem permanecer previsíveis entre etapas.
- Cards, mensagens de erro/sucesso e campos obrigatórios devem seguir padrão único.

## Tema global x legado

O projeto também possui `AppTheme`/`AppColors` globais, atualmente com `AppColors.primary = #006C8F`, enquanto diversas telas legadas usam `#00AEEF`.

Isso é uma inconsistência conhecida. Não corrigir escolhendo uma cor arbitrariamente em uma tela isolada. A unificação precisa ser deliberada e testada. Para Segurança Operacional, enquanto não houver decisão global posterior, prevalecem os tokens compartilhados da própria família Segurança.

## Inputs e teclado

- Campos devem focar rapidamente sem rebuild pesado da tela inteira.
- Evitar listeners que chamem `setState` global a cada caractere quando somente um contador/trecho pequeno precisa mudar.
- Isolar `MediaQuery.viewInsets` no menor subtree possível quando o teclado altera layout.
- Em formulários longos, preservar scroll e visibilidade do campo focado.
- Não executar chamadas de rede ou trabalho pesado no thread de UI ao ganhar foco.

## Navegação

- Abertura de tela deve responder imediatamente, exibindo cache/skeleton/loading quando a rede ainda estiver carregando.
- Não bloquear a navegação esperando sincronizações globais que possam ocorrer em background.
- PDFs/arquivos devem abrir a partir do registro já persistido; não regenerar arquivo duplicado sem necessidade de negócio.
- Um item de lista deve fazer a ação esperada de forma consistente: abrir detalhe ou abrir PDF conforme regra registrada do módulo.

## Estados

Toda tela de dados deve considerar:
- carregando;
- dados disponíveis;
- vazio;
- erro recuperável;
- sem permissão;
- offline/cache quando aplicável.

Evitar telas travadas sem feedback.

## Performance visual

- Preferir widgets `const` onde possível.
- Separar áreas dinâmicas em widgets menores.
- Evitar `setState(() {})` no State da tela inteira para mudança pequena.
- Mapas, câmera, imagens pesadas e animações devem ter áreas de repaint/rebuild isoladas.
- Imagens remotas devem usar dimensões adequadas e cache quando o fluxo permitir.

## Responsividade

O app é Android-first, mas possui Web e outras plataformas em partes do código. Mudanças não devem quebrar conditional imports/exports ou telas específicas native/web.

## Linguagem

- Mensagens para usuário em português claro e amigável.
- Não exibir termos internos de API, exceção, stack trace, SQL, host ou token.
- Labels devem descrever a ação real. Exemplo: em Plano de Ação usar “Abrir registro de origem”, não “Abrir Minha Ronda”, porque o executor pode não ser o autor da origem.
