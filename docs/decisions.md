# Decisões fundamentais — POSSEBON App

Este arquivo registra decisões que **não devem ser reinterpretadas a cada conversa**.

## 2026-09 — Fonte de verdade

- Flutter: GitHub do app, branch `possebon`.
- Backend/MAD Builder: ZIP/arquivo mais recente validado e confirmado pelo usuário.
- Memória estrutural: este repositório separado.
- Memória não substitui inspeção do código real antes da edição.

## 2026-09 — Branch operacional do usuário

- O usuário trabalha localmente na branch `possebon`.
- Branches técnicas podem existir para automação/PR, mas o resultado final precisa ser integrado à `possebon`.
- Antes de `pull`, `restore`, `stash pop/drop` ou reset, conferir mudanças locais e conflitos; não apagar trabalho não inspecionado.

## 2026-09 — Sessão permanente

- Access token pode expirar normalmente.
- Refresh token mantém a sessão do aparelho.
- Falha de rede não deve provocar logout.
- Apenas revogação/autenticação realmente inválida deve exigir novo login.
- Renovação deve ser single-flight para impedir múltiplos refreshes concorrentes.
- Cerca Virtual, Transporte e notificações não podem depender de relogin diário.

## 2026-09 — Unidade como fronteira

- Conteúdo funcional deve ser isolado por `unit_id`.
- Ter acesso administrativo a duas unidades não transforma o mesmo vínculo funcional em vínculo nas duas.
- Cache também deve ser contextual por Pessoa + Unidade.
- Backend precisa validar o contexto; UI sozinha não é barreira suficiente.

## 2026-09 — Pessoa e vínculos

- Pessoa não deve ser duplicada ao virar Colaborador.
- Candidato é um contexto/vínculo, não uma segunda identidade.
- Vínculo oficial com vaga é criado pelo RH; ação do candidato no app não cria automaticamente esse vínculo.

## 2026-09 — Segurança Operacional

- Minha Ronda Gerencial é o padrão oficial de UX e fluxo quando houver equivalência funcional.
- Dono de Área não deve ter um fluxo visual próprio divergente sem necessidade de negócio.
- Audicomp segue a mesma família visual/estrutural.
- Equipe é opcional.
- Registros pessoais devem ser filtrados pelo usuário atual quando a regra é “meus registros”.
- PDFs oficiais já gerados devem ser reaproveitados.
- Foto/evidência do registro que gera plano deve continuar acessível conforme o contrato do plano/origem.

## 2026-09 — Dono de Área

- Identificação segue o padrão da Minha Ronda.
- Etapa Segurança deve funcionar como Minha Ronda quando a lógica for equivalente.
- Subcategorias oficiais conhecidas: IDs 35..62.

## 2026-09 — Meu Amigo do Peito

- Fluxo visual simplificado.
- Resolvido no local: encerra sem plano.
- Não resolvido: gera Plano de Ação automático.
- Responsável automático: Gerente SMS.
- Prazo padrão: +7 dias.

## 2026-09 — Planos de Ação

- O responsável atual pelo plano pode ser diferente do criador do registro que originou o plano.
- O executor deve poder abrir o registro/PDF de origem por vínculo do plano, não por autoria.
- Não gerar um segundo relatório da origem quando o PDF oficial já existir.
- Replanejamento deve preservar histórico anterior.
- Motivo é obrigatório no replanejamento.
- Transferência de responsável é opcional.
- Conclusão também deve acrescentar histórico, sem apagar registros de replanejamento.

## 2026-09 — RDO

- Mostrar somente RDOs do usuário atual.
- Offline-first com fila local persistente.
- Arquivado: somente leitura.
- Emissão: editável na próxima etapa.

## 2026-09 — Transporte / Cerca Virtual

- Presença por Cerca Virtual e Transporte pertence ao contexto da unidade.
- Códigos de origem conhecidos: `C` = Cerca Virtual, `T` = Transporte.
- Tracking de rota não deve ser interrompido por expiração normal de sessão.

## 2026-09 — Quadro de Avisos

- Público-base `C` = candidatos.
- Público-base `F` = colaboradores.
- Filtros refinam o público-base.
- Encarregado não deve ser adicionado aos filtros deste módulo.
- Avisos não podem vazar entre unidades.

## 2026-09 — MAD Builder

- Priorizar recursos nativos do MAD Builder/Adianti.
- Evitar editar blocos gerados que o Builder sobrescreve quando houver ponto de extensão equivalente.
- Código manual apenas quando necessário.

## 2026-09 — Performance

- Problema de teclado/IME e abertura lenta deve ser diagnosticado em `profile` antes de refatoração ampla.
- Otimização deve ser incremental e medida.
- Preferir estado/rebuild localizado a `setState` de tela inteira.

## 2026-09 — Memória neural

- Este repositório é separado do código do app.
- Deve ser consultado antes de trabalho relevante no POSSEBON.
- Estado atual precisa distinguir aplicado, preparado e planejado.
- Só registrar uma mudança como estável depois de implementada e validada.
- Nunca armazenar credenciais, tokens, senhas ou dados pessoais aqui.
- Em conversa nova, bootstrap obrigatório: `README` → `current-state` → `project-memory` → docs do módulo → código real.
