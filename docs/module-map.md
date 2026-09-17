# Mapa funcional — módulo → tela → arquivos → backend

Use este arquivo para descobrir rapidamente **onde alterar** cada comportamento.

## Bootstrap / Login / Sessão

### Telas
- `lib/screens/splash_screen.dart`
- `lib/screens/acesso_screen.dart`

### Serviços/estado
- `lib/services/session_service.dart`
- `lib/core/session/auth_session_manager.dart`
- `lib/core/session/session_storage.dart`
- `lib/core/session/jwt_token_info.dart`

### Responsabilidades
- recuperar sessão salva;
- renovar access token silenciosamente;
- não deslogar por falha de rede;
- selecionar unidade e identificar Pessoa;
- primeiro acesso/senha;
- ativar/revogar sessão permanente.

### Backend conhecido
- `/api/app/sessao/ativar`
- `/api/app/sessao/refresh`
- `/api/app/sessao/revogar`
- rotas de identificação/autenticação vigentes no `api.php` do baseline atual.

---

## Home

### Tela principal
- `lib/screens/home_screen.dart`

### Responsabilidades
- dados do usuário;
- contexto da unidade;
- Quadro de Avisos;
- capabilities;
- navegação;
- notificações;
- disponibilidade de RDO/crachá/cerca/Segurança Operacional.

### Atenção
A Home concentra responsabilidades demais e é alvo de refatoração de performance, mas mudanças devem ser graduais.

---

## Meus Dados / Foto / Treinamentos

### Telas
- `lib/screens/meus_dados_screen.dart`
- `lib/screens/foto_oficial_screen.dart`
- variantes `*_native.dart` / `*_web.dart`
- `lib/screens/meus_treinamentos_screen.dart`

### Repositório/cache
- `lib/repositories/app_repository.dart`
- `lib/repositories/app_repository_native.dart`
- `lib/repositories/app_repository_web.dart`
- `lib/services/offline_file_service.dart`

### Regras
- Pessoa única;
- funcional por unidade;
- cache contextual;
- treinamentos podem abrir do cache e atualizar silenciosamente.

---

## Processo admissional / documentos

### Telas
- `lib/screens/processo_documentos_screen.dart`
- `lib/screens/documento_imagem_screen.dart`
- variantes native/web.

### Regra central
O RH cria o vínculo oficial com a vaga. O app apenas reflete os documentos/etapas vinculados ao processo daquela Pessoa + unidade.

---

## Quadro de Avisos

### Tela
- `lib/screens/quadro_avisos_screen.dart`

### Repositório/estado
- `lib/repositories/quadro_avisos_repository.dart`
- `lib/services/notice_state_service.dart`

### Regra central
Nunca vazar aviso entre unidades. Público-base é definido por candidato/colaborador e refinado pelos filtros válidos.

---

## Segurança Operacional — entrada

### Entrada/fachada
- `lib/features/seguranca_operacional/presentation/seguranca_operacional_screen.dart`
- `lib/features/seguranca_operacional/domain/seguranca_modulo.dart`

### Regra
Minha Ronda Gerencial é a referência oficial quando os comportamentos são equivalentes.

---

## Minha Ronda Gerencial

### Tela
- `lib/features/seguranca_operacional/presentation/minha_ronda_gerencial_screen.dart`

### Responsabilidades
- identificação;
- condições/achados;
- evidências/fotos;
- planos;
- revisão;
- relatório PDF.

### Backend relacionado
- `RondaGerencialAppApiTrait.php` no baseline backend vigente.

---

## Dono de Área

### Telas/fluxo
- `lib/features/seguranca_operacional/presentation/dono_area_screen.dart`
- `lib/features/seguranca_operacional/presentation/seguranca_operacional_legacy.dart` quando o fluxo compartilhado estiver ativo.

### Regra
- mesmo padrão base da Minha Ronda;
- equipe opcional;
- subcategorias oficiais 35..62;
- diferenças apenas onde a regra de negócio exigir.

### Backend relacionado
- `SegurancaOperacionalAppApiTrait.php` no baseline backend vigente.

---

## Audicomp

### Fluxo
Compartilha a família Segurança Operacional. Conferir `seguranca_operacional_legacy.dart`, repositórios e enum/configuração de módulo antes de mudar.

### Regra
Perguntas próprias, padrão UX compartilhado.

---

## Meu Amigo do Peito

### Tela
- `lib/features/seguranca_operacional/presentation/amigo_peito_screen.dart`

### Repositório
- `lib/features/seguranca_operacional/data/amigo_peito_repository.dart`

### Backend
- `AmigoPeitoAppApiTrait.php`

### Regra
Resolvido = encerra. Não resolvido = plano automático para Gerente SMS, prazo +7 dias.

---

## Meus Planos de Ação

### Tela
- `lib/features/seguranca_operacional/presentation/planos_acao_screen.dart`

### Repositório
- `lib/features/seguranca_operacional/data/seguranca_operacional_repository.dart`

### Backend principal conhecido
A rota efetivamente usada pela tela deve ser conferida no app atual. No estado recente, `GET /api/app/seguranca/meus-planos` é atendida pela implementação relacionada à Ronda/Segurança.

### Regra crítica
- plano lista pelo responsável atual;
- origem é independente do responsável;
- abrir PDF do registro original via referência do plano;
- replanejamento preserva histórico;
- motivo obrigatório;
- responsável novo opcional.

---

## Meu RDO

### Tela
- `lib/screens/meu_rdo_screen.dart`

### Repositório/sync
- `lib/repositories/rdo_repository.dart`
- `lib/services/rdo_sync_service.dart`
- banco local Drift relacionado.

### Regra
Offline-first; somente usuário atual; Emissão editável na evolução; arquivado somente leitura.

---

## Meu Transporte

### Telas
- `lib/screens/meu_transporte_screen.dart`
- `lib/screens/transporte_mapa_screen.dart`

### Serviços/repositórios
- `lib/repositories/transporte_repository.dart`
- `lib/services/transporte_tracking_service.dart`
- `lib/services/location_disclosure_service.dart`

### Domínio
- `lib/features/transporte/domain/transport_attendance.dart`
- geometria/summary/widgets em `lib/features/transporte/`.

### Regra
Contexto por unidade; tracking persistente durante rota; monitor/motorista/passsageiro têm capacidades distintas.

---

## Cerca Virtual / Controle de Acesso

### Tela
- `lib/screens/cerca_virtual_admin_screen.dart`

### API/automação
- `lib/features/access_control/data/access_control_api.dart`
- `lib/services/access_presence_automation_service.dart`
- serviço nativo de geofence relacionado.

### Regra
`C` = Cerca Virtual; `T` = Transporte para origem de presença conhecida.

---

## Cadastro de Crachá

### Telas
- `lib/screens/cadastro_cracha_screen.dart`
- `lib/screens/qr_cracha_scanner_screen.dart`

### Serviços
- OCR/QR/câmera em `lib/services/`.

### Dependências
- `mobile_scanner`
- ML Kit Text Recognition
- camera/image picker conforme fluxo.

---

## Sugestões / Manifestação

### Tela
- `lib/screens/manifestacao_screen.dart`

### Observação de performance
Listener de controller com `setState` por tecla deve ser isolado se provocar rebuild amplo.

---

## API / Rede

### Legado/central
- `lib/services/api_service.dart`

### Novo cliente
- `lib/core/network/api_client.dart`
- `lib/core/network/api_uri_builder.dart`
- `lib/core/network/api_exception.dart`

### Regra
Não duplicar lógica de token; migração deve ser gradual e validada.

---

## Tema / Design

### Arquivos
- `lib/core/theme/app_theme.dart`
- `lib/core/theme/app_colors.dart`
- widgets compartilhados em `lib/core/ui/`
- UI compartilhada da Segurança em `lib/features/seguranca_operacional/presentation/widgets/`.

### Regra
Novo módulo deve partir do design system/padrão existente; não criar paleta própria sem necessidade.
