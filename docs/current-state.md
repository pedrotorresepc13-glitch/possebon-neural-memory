# Estado atual conhecido — POSSEBON App/Web

Atualizado em 17/09/2026.

O snapshot estruturado autoritativo está em `data/current-state.json`.

## Fontes de verdade

- Flutter: `pedrotorresepc13-glitch/possebon`, branch `possebon`.
- HEAD Flutter confirmado: `19fcb0f563aa76c90ffd5fffa84c3f8b9165581a` — `Seguranca/RDO: Audicomp oficial, plano obrigatorio e supervisao`.
- Backend MAD Builder analisado: `possebon_web-17-09-2026-14-55-37.zip`.
- Para PHP exato do MAD Builder, o ZIP/arquivo mais recente enviado pelo usuário prevalece sobre GitHub Web.

## Regra de edição MAD Builder

Priorizar Designer/MAD Builder, `app/custom`, depois `app/routes`/`app/controller` quando necessário. Não sobrescrever manualmente `app/model` nem páginas `app/control` geradas por inteiro.

## Dono de Área — VALIDADO EM RUNTIME

O usuário confirmou em 17/09 que o Dono de Área está funcionando perfeitamente. Preservar esse fluxo como baseline.

Correções já aplicadas/confirmadas no custom:
- `Pessoa.fone` no lugar de `Pessoa.telefone` para o PDF;
- `audicomp_auditor` grava `unit_id`, `criado_por` e `criado_em`, tornando o auditor visível no MAD Builder;
- PhotoReport/PDF/nota do fluxo atual preservados.

## Novo pacote backend — preparado, ainda não confirmado como aplicado

`POSSEBON_AJUSTES_SEGURANCA_RDO_17-09-2026.zip`

Contém somente:
- `app/custom/SegurancaOperacionalAppApiTrait.php`
- `app/custom/RondaGerencialAppApiTrait.php`
- `app/custom/RdoAppApiTrait.php`

Não altera Model, Control, Routes ou Controller.

Validação: `php -l` nos três arquivos OK e composição dos traits OK.

### Condição insegura

Toda condição insegura deve possuir pelo menos um Plano de Ação. A validação está no Flutter compartilhado e é revalidada pelo backend para Dono/Audicomp/Ronda.

### PDF Dono de Área

Mantém o relatório completo já validado e acrescenta no final, dentro do próprio custom:
- quadro `Dono de Área por Área e mês`: Área, Dono da Área, Técnico Segurança e Sem 1..5;
- quadro `Avaliação de Área`: categorias AC.1..AC.9 e percentuais Sem 1..5.

Isso não exige sobrescrever DBQuery/Model/Control gerado para o PDF.

### Audicomp

O formulário oficial nativo é quantitativo, não um checklist Sim/Não/N/A. O app/backend passam a trabalhar com as subcategorias oficiais A.1 até F.3, IDs:
`1,2,3,4,6-13,15-21,23-25,27-29,31-33`.

O usuário registra ocorrência, quantidade, tipo de desvio, descrição/tratativa e evidência.

### Meu RDO

Regra preparada:
- usuário comum vê somente RDOs criados por ele;
- supervisor vê os próprios e os RDOs criados por colaboradores ativos das equipes em que ele é `supervisor_id`;
- RDO de subordinado é somente leitura;
- somente RDO próprio em status `E` (Emissão) pode editar;
- card mostra lápis quando `pode_editar = true`;
- ao ver RDO de subordinado, mostra o criador;
- prioridade 4 de edição por `rdo_id` e preservação de IDs/anexos de paralisações continua mantida.

## Flutter — novo HEAD validado estaticamente

Commit: `19fcb0f563aa76c90ffd5fffa84c3f8b9165581a`.

O workflow `POSSEBON Ajustes Seguranca e RDO 17-09` passou:
- aplicação do patch;
- `flutter pub get`;
- `dart format`;
- `flutter analyze --no-fatal-warnings --no-fatal-infos`;
- commit/push.

Alterações Flutter:
- Plano obrigatório no editor compartilhado de condição insegura;
- Audicomp oficial quantitativo;
- Meu RDO com lápis, diferenciação próprio/subordinado e equipes supervisionadas.

## Minha Ronda Gerencial

Preservada. Continua aparecendo somente quando o usuário possui participação. A única mudança nova é a exigência de Plano de Ação ao cadastrar condição insegura.

## Não aplicar manualmente

Continuam proibidos os Models/Control do pacote antigo de 8 arquivos:
- `app/model/EdDonoAreaPorAreaMes.php`
- `app/model/EdAvaliacaoArea.php`
- `app/model/EdAvaliacaoAreaGrafico.php`
- `app/model/EdDonoAreaGraficoSem.php`
- `app/control/sms/SmsDonoDeAreaDashboard.php`

## Próximos testes

1. Aplicar somente os 3 arquivos `app/custom` do novo pacote.
2. Atualizar Flutter local para `19fcb0f...`.
3. Dono: condição sem plano deve bloquear; com plano deve salvar; conferir os dois quadros novos no final do PDF.
4. Audicomp: validar categorias A-F, ocorrências e quantidades.
5. Meu RDO comum: somente próprios.
6. Meu RDO supervisor: próprios + subordinados; subordinado somente leitura; lápis só no próprio em Emissão.
7. Confirmar Minha Ronda continua filtrada por participação.
8. Depois retomar sessão permanente + Cerca Virtual.
