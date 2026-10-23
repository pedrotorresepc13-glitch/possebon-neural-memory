# Meu RDO urgente — 23/10/2026

Estado: **attention / diagnóstico técnico confirmado, não corrigido nem validado em produção**.

## Prioridade definida pelo usuário

1. Meu RDO totalmente funcional, antes de avançar com a Gestão de Transporte.
2. Gestão de Transporte administrativa (criar/editar/excluir rota e zerar trajeto gravado) permanece no POSSEBON Web, sem implantação comprovada.
3. Funções do monitor permanecem no APP. Há nova falha crítica de excluir parada com passageiros, analisada no WIP Monitor.

## Evidências Meu RDO de 23/10

- Capturas do app: mensagem `Route not found` ao interagir com RDO e na etapa de PT/LT/PTT.
- Flutter branch `possebon`, `lib/services/api_service.dart`: `GET /api/app/meu-rdo/pdf` e `POST /api/app/meu-rdo/permissao`.
- ZIP de backend fornecido em 22/10 às 12:09: `app/routes/api.php` contém apenas `/meu-rdo/acesso`, `/meu-rdo`, `/meu-rdo/enviar`, **não** rotas PDF/permissão.
- Flutter `lib/screens/meu_rdo_screen.dart`: data selecionável de 2020 até +30 dias; nova regra exigida pelo usuário é aceitar apenas hoje ou ontem. Não alterar automaticamente a edição de RDO antigo sem análise de exceções.
- PT, LT e PTT inexistente deve poder ser cadastrado dentro do app usando cadastro WorkPermit da mesma unidade, sem duplicar tabelas.
- RDO salvo deve abrir PDF oficial; edição deve preservar arquivo/regeração segundo regras existentes.

## Correção necessária, critérios

- Validar data no app **e na API** usando calendário da unidade (operacionalmente `America/Sao_Paulo`) e impedir envio indevido, mantendo rascunhos e edição antiga conforme regra vigente.
- Implementar/reconciliar rotas de PDF e criação de permissão no backend **vivo** MAD Builder, respeitando `Pessoa`, `unit_id`, autorização e hierarquia; inspecionar Trait RDO antes de alterar.
- Preservar grupo 20 `App_Meu RDO` para visibilidade e hierarquia para operação/escopo.
- Build Flutter, PHP lint e testes reais de login, PDF, novo RDO, criação PT/LT/PTT, edição e datas, antes de marcar `stable`.

Fontes de verdade: GitHub `pedrotorresepc13-glitch/possebon`, branch `possebon`; backend MAD Builder `app.possebon.com.br:19302` e ZIP de 22/10 12:09; Brain. GitHub `possebon_web` não deve ser assumido backend vivo.

## Entrega técnica preparatória 23/10/2026

- **Estado real: active / blocked no backend vivo. Não está corrigido em produção.**
- Flutter: branch técnica `fix/meu-rdo-api-pdf-permissoes-data-20261023`, draft [PR #7](https://github.com/pedrotorresepc13-glitch/possebon/pull/7). Preserva feature flag real de edição de RDO status E e valida apenas novo lançamento hoje/ontem. Campos PT/LT/PTT emitente/horários obrigatórios informados manualmente, sem forjar dados.
- Flutter PWA: clique explícito para abrir PDF após geração (evita bloqueador de popup após chamada assíncrona no iPhone).
- Backend derivado exclusivamente de ZIP MAD Builder de 22/10/2026, 12:09: pacote `POSSEBON_RDO_CORRECAO_BACKEND_23-10-2026.zip` (3 arquivos completos: app/routes/api.php, app/custom/RdoAppApiTrait.php, app/control/adm_contratual/RdoDocument.php). `php -l` OK nos 3. **Não instalado** no backend vivo.
- Implementação esperada: rotas GET /api/app/meu-rdo/pdf e POST /api/app/meu-rdo/permissao. PDF usa RdoDocument oficial, endereço tmp via proxy media. WorkPermit grava no cadastro já existente com grupo 20 + escopo funcional, unit_id, duplicidade, applicant_id corrente.
- CI Flutter [run 39984344877](https://github.com/pedrotorresepc13-glitch/possebon/actions/runs/39984344877): success para versão anterior ao ajuste de clique PDF. CI do head final deve ser confirmado independentemente.
- Pendências para stable: mesclar com PHP **atual** do MadBuilder (ZIP exportado pode ter alterações posteriores), aplicar com backup, testar PDF real Web/iPhone, criação PT/LT/PTT e regra de datas com unidade e hierarquia; só então integrar PR #7 à branch operacional e verificar deployment Vercel. Não prometer entrega automática ou afirmar produção funcional.

- **CI do head final** [39984502471](https://github.com/pedrotorresepc13-glitch/possebon/actions/runs/39984502471), commit `fd5fbc65df4b6a28e6a05a5d5c127006a55b0370`: **success** (Flutter pub get, dart format local runner, Flutter analyze, Flutter build web release). Continua **sem backend implantado**, PR em draft.\n
## Revisão 23/10 — arquivos protegidos do MAD Builder NÃO devem ser alterados

- O usuário esclareceu que **não pode/não quer alterar `app/control/adm_contratual/RdoDocument.php`**, que é gerado e protegido pelo MAD Builder. O objetivo é ter PDF funcionando **apenas no aplicativo**, sem depender do PDF Web administrativo.
- O pacote anterior de **3 arquivos fica INVALIDADO** e NÃO DEVE SER INSTALADO: `POSSEBON_RDO_CORRECAO_BACKEND_23-10-2026.zip`.
- Novo pacote seguro com **somente** `app/routes/api.php` e `app/custom/RdoAppApiTrait.php`: `POSSEBON_RDO_APP_SEM_RDODOCUMENT_23-10-2026.zip`.
- O PDF do app é independente, gerado no trait pela biblioteca `Dompdf` que já vem no `vendor` da exportação do MAD Builder, sem chamar `RdoDocument` e sem usar o template gerado. Resposta mantém `data.arquivo_pdf` no caminho `tmp/` esperado pelo Flutter. Novo relatório tem aparência independente do PDF Web.
- Verificações no ambiente de preparação: `php -l` OK nos 2 arquivos; conteúdo do ZIP verificado; nenhuma chamada `RdoDocument` no trait; biblioteca Dompdf presente no ZIP de origem. **Não houve teste funcional contra banco ou runtime vivo**; status `active / blocked` até instalação/teste no MAD Builder.
- Preservar merge/backup do código real do servidor e controle de unidade/escopo. Usar apenas esse novo pacote. PR Flutter #7 permanece draft, sem publicação operacional.

## Confirmacao das versoes enviadas pelo usuario — 23/10/2026 17:38
- Usuario forneceu `RdoAppApiTrait.php` completo (2128 linhas) e `api.php` completo (1449 linhas).
- Comparacao com patch anterior (normalizacao CRLF/LF): arquivos originais coincidem integralmente; apenas **3 blocos adicionados no trait** e **1 bloco nas rotas**, sem deletar ou substituir linhas.
- Novo pacote reconstituido a partir dos anexos originais: `POSSEBON_RDO_CORRIGIDO_VERSOES_ENVIADAS_23-10-2026.zip`, contendo somente os dois PHP e README.
- Nao alterar `RdoDocument.php`. `php -l` passou nos dois PHP. Um metodo PDF, um cadastro PT, um helper de data; uma rota PDF e uma de permissao.
- SHA256 dos **originais enviados**: Trait `3d416cea6db3481362397a13e0b8d1c58c29b047fd6058ab210c1e4abc2377fe`; routes `6a5d4090102c88bc648619a912c3f06c8aabe6a147bc681961bae18ca630ca05`.
- Estado: patch entregue para instalacao **pelo usuario**, backend MAD Builder vivo **nao alterado nem testado em banco**. Fazer backup e reconfirmar codigo atual antes de sobrescrever caso tenha havido edicoes apos o envio.

## Revisão posterior — PDF do RDO retorna 401 em /media/tmp, comparação AUDICOMP (23/10/2026)
- Captura PWA confirmou resposta do endpoint PDF com caminho `tmp/rdo_app_<hash>.pdf`, mas GET `https://possebon.vercel.app/media/tmp/...` retorna **HTTP 401**. Também houve modal extra "PDF do RDO → Abrir PDF", que usuário NÃO quer.
- Referência funcional **somente**: relatório AudiComp publicado em `app/output/seguranca_operacional/audicomp_...pdf` e aberto diretamente por `launchUrl(..., LaunchMode.platformDefault)`. **Não alterar AudiComp.**
- Raiz confirmada no código Vercel operacional: `vercel.json` rewrite de `/media/:path*` para `/api/media?path=:path*`; `api/media.js` acessa backend por `fetch` sem JWT. Pasta `tmp/` demanda autorização e devolve 401; `app/output/seguranca_operacional/` funciona para relatórios publicados.
- Novo pacote **substitui todos os anteriores para esta correção**: `POSSEBON_RDO_PDF_CORRIGIDO_SEM_MODAL_23-10-2026.zip`. Possui `app/custom/RdoAppApiTrait.php`, `app/routes/api.php` (rotas INALTERADAS nessa revisão) e README. Trait baseado nos originais enviados pelo usuário às 17:37 + patch RDO anterior. `php -l` OK nos 2 PHP.
- Backend RDO grava PDFs em `app/output/seguranca_operacional/rdo_app_<unitId>_<rdoId>_<128bit_random>.pdf`, retorna `rdos[].relatorio_pdf` na listagem do próprio escopo, atualiza automaticamente ao salvar/editar e informa `pdf_gerado` verdadeiro somente quando realmente conseguiu criar arquivo. Se falha a edição, invalida o PDF anterior. Não exige alterar schema do banco, `RdoDocument.php`, AudiComp, media.js nem vercel.json. Método GET /meu-rdo/pdf permanece como regeneração sob demanda para RDO antigo.
- Teste local isolado via Reflection PHP confirmou descoberta de PDF por unidade/id, bloqueio de cross-unit na indexação e invalidação; não é teste contra banco, runtime, browser ou usuário de produção.
- Flutter PR #7 draft atualizada em `lib/screens/meu_rdo_screen.dart` commit `5b27713be962263913c9d9b7b12210019582153f`: remove modal intermediário, abre diretamente o `relatorio_pdf` persistido, tenta gerar PDF para registros antigos sem caminho, mostra chip PDF gerado, usa a flag `pdf_gerado` na mensagem de sucesso. **PWA iPhone pode bloquear a primeira abertura de um PDF antigo gerado após chamada assíncrona; PDFs já salvos abrem imediatamente pelo clique.**
- **Estado: pacote preparado; implantação no MAD Builder, merge Flutter, deploy Vercel e smoke test funcional AINDA PENDENTES. NÃO afirmar que está resolvido em produção.**

### Validação final da implementação de caminho persistido — 23/10/2026
- Backend pacote em disco `POSSEBON_RDO_PDF_CORRIGIDO_SEM_MODAL_23-10-2026.zip`, somente 2 PHP e README. `app/routes/api.php` SHA-256 idêntico à versão base enviada às 17:37; pode permanecer instalado. `RdoAppApiTrait.php` tem alterações isoladas de PDF. `php -l` dos dois PHP: OK.
- O salvamento do RDO gera PDF automaticamente em `app/output/seguranca_operacional/rdo_app_<unit>_<rdo>_<32hex>.pdf` e retorna `pdf_gerado` e `arquivo_pdf` quando concretamente escrito no filesystem. Listagem autorizada volta com `relatorio_pdf` para permitir abertura direta. Em edição, substitui o PDF após nova gravação e invalida se falha, evitando versão antiga.
- Teste unitário PHP local indexou arquivo salvo correto por unidade/RDO, isolou outra unidade e testou invalidação, todos OK; **não houve teste com o servidor vivo**. A URL pública possui 128 bits aleatórios, mas a leitura do PDF por detentor do URL funciona sem login, como no AudiComp: não compartilhar o endereço.
- Flutter PR #7 atualizado commit `713d98b4ee4a57324837141ed184363a5e319380`: no primeiro PDF antigo gerado, persiste caminho no estado da listagem; Safari PWA pode exigir mais um toque se popup foi bloqueado, mas não exibe mais modal intermediário; PDFs já registrados abrem no primeiro clique.
- CI de commit `5b27713be962263913c9d9b7b12210019582153f`: success [40000765429](https://github.com/pedrotorresepc13-glitch/possebon/actions/runs/40000765429). Aguardar CI do head `713d98b4` antes de merge.
- **A implantação continua pendente**, e o problema 401 não deve ser dito como resolvido em produção até o usuário aplicar o Trait, integrar Flutter, validar Vercel e testar o PDF.

- **CI final para o commit 713d98b4ee4a57324837141ed184363a5e319380**: [GitHub Actions 40001293618](https://github.com/pedrotorresepc13-glitch/possebon/actions/runs/40001293618) **SUCCESS**, incluindo `flutter analyze` e `flutter build web --release`. Este sucesso não substitui a validação do backend nem teste no navegador.\n