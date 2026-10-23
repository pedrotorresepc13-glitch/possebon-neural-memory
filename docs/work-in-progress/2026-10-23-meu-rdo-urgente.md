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
