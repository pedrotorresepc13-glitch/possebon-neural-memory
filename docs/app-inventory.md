# Inventário funcional e técnico — POSSEBON App

Atualizado em 2026-09-16.

## Identidade técnica

- Flutter app: `pedrotorresepc13-glitch/possebon`
- Branch operacional: `possebon`
- Package Android: `br.com.possebon.app`
- Backend: POSSEBON Web / MAD Builder / Adianti / PHP / PostgreSQL
- Firebase/FCM ativo
- Drift/SQLite para armazenamento local selecionado
- Secure Storage para credenciais persistentes
- Geolocator/native geofence para localização
- Flutter Map para mapas
- Camera / QR / OCR / ML Kit para captura e leitura
- Web/PWA possui caminhos e implementações condicionais em algumas telas/serviços

## Boot do app

### `lib/main.dart`
Responsabilidades observadas:

- inicializa locale;
- inicializa Firebase;
- inicializa notificações fora da Web;
- inicia sincronização global de RDO;
- abre `SplashScreen`.

### Splash

- lê sessão local;
- tenta atualizar dados;
- falha transitória de rede não força logout;
- garante foto oficial para colaborador quando aplicável;
- solicita permissões/contexto de localização conforme regra.

## Acesso / sessão

### Telas
- Splash
- seleção de unidade
- identificação por CPF
- senha / primeiro acesso

### Arquitetura
- `AuthSessionManager`
- `SessionStorage`
- `SessionService`

### Regras
- sessão permanente;
- refresh silencioso;
- dispositivo persistente;
- contexto de unidade;
- logout explícito/revogação.

## Home

Hub principal de módulos e capabilities.

Principais entradas conhecidas:

- Meus Dados;
- Quadro de Avisos;
- Cardápio;
- Calendário;
- Sugestões/Manifestação;
- Processo/Documentos;
- Cadastro de Crachá;
- Cerca Virtual administrativa;
- Meu Transporte;
- Meu RDO;
- Segurança Operacional;
- Meus Planos de Ação;
- demais destinos via notificação.

A Home é um ponto atual de atenção de performance porque concentra estado e carregamentos de várias áreas.

## Segurança Operacional

### Minha Ronda Gerencial
Status conceitual: referência oficial.

Funções:
- identificação;
- condições/achados;
- evidências/fotos;
- ação/plano;
- revisão;
- PDF.

### Dono de Área
Status: atenção/validação.

Regras:
- mesma base visual/funcional da Ronda quando equivalente;
- subcategorias 35..62;
- equipe opcional.

### Audicomp
Status: ativo.

- perguntas próprias;
- padrão compartilhado da Segurança.

### Meu Amigo do Peito
Status: ativo.

- fluxo simplificado;
- resolvido no local encerra;
- não resolvido gera plano;
- Gerente SMS;
- +7 dias.

### Meus Planos de Ação
Status: atenção.

- lista pelo responsável atual;
- origem independente de autoria;
- vínculo por referência do plano;
- PDF oficial de origem;
- replanejamento com histórico;
- transferência opcional;
- execução/conclusão.

## Meu RDO

### Componentes
- tela de lista/criação;
- repositório;
- Drift/local storage;
- outbox;
- `RdoSyncService`.

### Estado
- offline-first já existe;
- sincronização protegida;
- próxima evolução: edição somente Emissão, arquivado somente leitura.

## Transporte

### Telas
- Meu Transporte;
- Mapa do Transporte.

### Funções
- rota;
- confirmação de uso;
- ponto/percurso quando disponível;
- monitor/motorista;
- viagem ativa;
- GPS/tracking;
- mapa;
- presença;
- comunicação/notificação de início.

## Cerca Virtual / Controle de Acesso

### Funções
- configuração administrativa;
- geofence;
- presença automática;
- relação com unidade;
- origem C/T de presença.

## Quadro de Avisos

- avisos por unidade;
- candidato/colaborador como público-base;
- filtros funcionais;
- estado local de leitura;
- retenção visual pós-leitura;
- navegação via push quando aplicável.

## Perfil

### Meus Dados
- dados da Pessoa;
- dados funcionais;
- foto oficial;
- entrada para treinamentos.

### Foto Oficial
- implementação nativa/web separada;
- câmera/processamento conforme plataforma.

### Treinamentos
- cache local primeiro;
- sincronização silenciosa;
- logos locais/remotos.

## Processo admissional / documentos

- vínculo oficial com vaga vem do RH;
- documentos exigidos aparecem após vínculo;
- envio individual;
- visualização de imagens/documentos;
- contexto por unidade.

## Cadastro de Crachá

- busca de colaborador;
- QR da frente;
- OCR do verso;
- câmera/ML Kit;
- fluxo nativo de captura.

## Sugestões / Manifestação

- Sugestão;
- Reclamação;
- Elogio;
- Dúvida;
- possibilidade de anonimato conforme fluxo;
- contador de relato.

## Notificações

- Firebase Messaging;
- notificações locais;
- destinos contextuais;
- abertura para processo, transporte ou avisos conforme payload;
- token do dispositivo precisa permanecer coerente com sessão/unidade.

## Offline / cache

Áreas conhecidas com estratégia local:

- Meus Dados;
- Treinamentos;
- Transporte;
- RDO;
- arquivos/imagens selecionados;
- estado do Quadro de Avisos.

## Design system

- `AppTheme`
- `AppColors`
- componentes `core/ui`
- componentes compartilhados da Segurança Operacional.

Regra: não criar estilo isolado por módulo quando já existe padrão compartilhado.

## Dependências relevantes

- `http`
- `url_launcher`
- `flutter_secure_storage`
- `firebase_core`
- `firebase_messaging`
- `flutter_local_notifications`
- `drift`
- `sqlite3`
- `connectivity_plus`
- `shared_preferences`
- `geolocator`
- `flutter_map`
- `native_geofence`
- `permission_handler`
- `camera`
- `mobile_scanner`
- `google_mlkit_text_recognition`
- `google_mlkit_face_detection`
- `image_picker`
- `file_picker`
- `pdf`
- `path_provider`
- `package_info_plus`

## Riscos atuais conhecidos

- telas grandes/stateful e rebuilds amplos;
- performance de teclado/IME;
- Home concentrando responsabilidades;
- mapa/tracking com polling/animação;
- divergência histórica entre módulos de Segurança;
- branch remota Flutter pode ficar atrás do working tree local se scripts/correções forem aplicados sem commit;
- backend possui pacotes preparados que não podem ser confundidos com produção sem confirmação.

Este inventário deve ser atualizado quando um módulo, dependência, regra ou fluxo estrutural mudar.
