# Decisões fundamentais

Este arquivo registra decisões que não devem ser reinterpretadas a cada conversa.

## 2026-09 — Fonte de verdade

- Flutter: GitHub do app, branch `possebon`.
- Backend/MAD Builder: ZIP/arquivo mais recente validado e confirmado pelo usuário.
- Memória estrutural: este repositório separado.

## 2026-09 — Sessão permanente

- Access token pode expirar normalmente.
- Refresh token mantém a sessão do aparelho.
- Falha de rede não deve provocar logout.
- Apenas revogação/autenticação realmente inválida deve exigir novo login.

## 2026-09 — Unidade como fronteira

- Conteúdo funcional deve ser isolado por `unit_id`.
- Ter acesso administrativo a duas unidades não transforma o mesmo vínculo funcional em vínculo nas duas.

## 2026-09 — Segurança Operacional

- Minha Ronda Gerencial é o padrão oficial de UX e fluxo quando houver equivalência funcional.
- Dono de Área não deve ter um fluxo visual próprio divergente sem necessidade de negócio.
- Equipe é opcional.
- Registros pessoais devem ser filtrados pelo usuário atual quando a regra é “meus registros”.

## 2026-09 — Meu Amigo do Peito

- Fluxo visual simplificado.
- Resolvido no local: encerra sem plano.
- Não resolvido: gera Plano de Ação automático.
- Responsável automático: Gerente SMS.
- Prazo padrão: +7 dias.

## 2026-09 — Planos de Ação

- O responsável atual pelo plano pode ser diferente do criador do registro que originou o plano.
- O executor deve poder abrir o registro/PDF de origem por vínculo do plano, não por autoria.
- Replanejamento deve preservar histórico anterior.
- Motivo é necessário no replanejamento.
- Transferência de responsável é opcional.

## 2026-09 — RDO

- Mostrar somente RDOs do usuário atual.
- Arquivado: somente leitura.
- Emissão: será editável na próxima etapa.

## 2026-09 — Memória neural

- Este repositório é separado do código do app.
- Só registrar uma mudança como estável depois de implementada e validada.
- Nunca armazenar credenciais, tokens, senhas ou dados pessoais aqui.
