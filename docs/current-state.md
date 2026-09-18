# Estado atual conhecido — POSSEBON App/Web

Atualizado em 18/09/2026.

Este arquivo é um resumo humano. O snapshot estruturado autoritativo está em `data/current-state.json`.

## Segurança Operacional e RDO — runtime validado

O usuário confirmou em teste real que estão funcionando:
- Dono de Área;
- condição insegura exigindo pelo menos um Plano de Ação;
- Audicomp no modelo oficial;
- Meu RDO, incluindo edição/lápis e visibilidade;
- Minha Ronda Gerencial preservando a regra de participação.

Flutter validado para este bloco: `19fcb0f563aa76c90ffd5fffa84c3f8b9165581a`.

## PDF do Dono de Área — única pendência atual deste bloco

O PDF já leva:
- Dono de Área por Área e mês;
- Avaliação de Área por semana.

Pendente em 18/09/2026:
- acrescentar o gráfico Avanço Mensal;
- melhorar a paginação das evidências, pois o PDF atual pode desperdiçar uma página quase inteira com uma única imagem.

Pacote preparado:
`POSSEBON_FIX_PDF_DONO_GRAFICO_LAYOUT_18-09-2026.zip`

Ele altera somente:
`app/custom/SegurancaOperacionalAppApiTrait.php`

Ajustes:
- gráfico mensal compacto no fechamento gerencial;
- eixo Y 0–100%;
- semanas sem avaliação não viram pontos no gráfico;
- ocorrências deixam de ser blocos indivisíveis no Dompdf;
- evidências ficam compactas, até 47% da largura e 45 mm de altura, permitindo melhor aproveitamento da página.

## Regra MAD Builder

Para PHP exato, o ZIP/backend mais recente enviado pelo usuário continua sendo fonte de verdade. Não sobrescrever Model/Control gerado. Priorizar Designer/MAD Builder e `app/custom`.

## Próximo bloco depois do PDF

Assim que o novo PDF passar no teste runtime:
1. marcar Segurança Operacional + RDO como estáveis;
2. retomar sessão permanente;
3. comprovar ativação/renovação/revogação e persistência de `dispositivo_uid`, `refresh_token_hash` e `sessao_ativa`;
4. validar Cerca Virtual e transporte em background depois da expiração do access token, sem novo login;
5. criar testes automatizados do ciclo da sessão;
6. corrigir o registro FCM de plataforma hardcoded quando retomarmos autenticação/background.
