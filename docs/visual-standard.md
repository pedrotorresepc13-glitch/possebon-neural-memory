# Padrão visual oficial — POSSEBON App

Este documento evita que novas telas “fujam do padrão”.

## Regra central

Quando uma nova tela for funcionalmente equivalente a outra já aprovada, **reutilizar o padrão existente**. Não criar uma identidade visual própria por módulo.

## Design system global

Arquivos-base:

- `lib/core/theme/app_theme.dart`
- `lib/core/theme/app_colors.dart`
- widgets compartilhados em `lib/core/ui/`

Ao criar tela nova:

1. usar tema global;
2. usar cores compartilhadas;
3. reaproveitar componentes existentes;
4. só criar componente novo se houver necessidade real;
5. se novo componente virar padrão, registrar aqui e no `project-memory.json`.

## Segurança Operacional

### Referência oficial

**Minha Ronda Gerencial** é o padrão visual e comportamental.

Dono de Área, Audicomp e demais fluxos equivalentes devem manter:

- estrutura de tela;
- padrão de AppBar;
- identificação;
- barra/indicador de progresso;
- espaçamentos;
- cards;
- inputs;
- botões;
- comportamento de etapas;
- estados de carregamento/erro;
- revisão final;
- padrão de sucesso/retorno.

### O que pode mudar

- título do módulo;
- texto das perguntas;
- catálogos/subcategorias;
- dados específicos;
- regras de negócio particulares;
- campos realmente exclusivos.

### O que não pode mudar arbitrariamente

- cores;
- tipo de barra de progresso;
- estilo de botões;
- sequência visual equivalente;
- padrão de identificação;
- comportamento de seleção de equipe;
- navegação base;
- apresentação de erro/sucesso.

## Equipe

Equipe é opcional na Segurança Operacional. A UI deve comunicar isso claramente e não usar aparência/validação de campo obrigatório.

## PDFs / registros salvos

Quando um módulo gera PDF oficial:

- item salvo deve poder abrir o relatório existente;
- não reconstruir uma segunda versão visual desnecessária;
- Plano de Ação deve apontar para o registro de origem sem confundir autoria/responsável.

## Performance visual

Evitar:

- `setState` da tela inteira por alteração de um campo;
- animação pesada em árvores grandes;
- rebuild completo durante abertura do teclado;
- imagens sem dimensionamento/cache;
- mapas reconstruídos por mudanças pequenas de UI.

Preferir:

- widgets `const`;
- estados locais;
- `ValueListenableBuilder`/`AnimatedBuilder` onde apropriado;
- subtree pequena dependente de `MediaQuery.viewInsets`;
- `RepaintBoundary` quando medição justificar.

## Regra de aprovação

Se uma tela nova divergir visualmente de um padrão já aprovado, a divergência precisa ser intencional e baseada em necessidade funcional — nunca acidente de implementação.
