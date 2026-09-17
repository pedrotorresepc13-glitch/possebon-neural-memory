# Inventário funcional e técnico — POSSEBON App

Atualizado em 2026-09-16.

## Identidade técnica

- Flutter app: `pedrotorresepc13-glitch/possebon`
- Branch operacional: `possebon`
- Package Android: `br.com.possebon.app`
- Flutter/Dart configurado no `pubspec.yaml`
- Firebase/FCM ativo
- Drift/SQLite para armazenamento local selecionado
- Secure Storage para credenciais persistentes
- Geolocator + geofence para localização
- Flutter Map para mapas
- Camera / QR / OCR / ML Kit para captura e leitura

## Módulos/telas conhecidos

### Acesso e sessão
- Splash
- seleção de unidade
- identificação por CPF
- senha / primeiro acesso
- sessão permanente

### Home
- Meus Dados
- Quadro de Avisos
- Cardápio
- Calendário
- Sugestões / manifestações
- Processo / documentos
- Cadastro de crachá
- Cerca Virtual administrativa
- Meu Transporte
- Meu RDO
- Segurança Operacional

### Segurança Operacional
- Minha Ronda Gerencial
- Dono de Área
- Audicomp
- Meu Amigo do Peito
- Meus Planos de Ação

### Transporte / acesso
- Meu Transporte
- mapa de transporte
- monitor/motorista
- presença por transporte
- presença por cerca virtual

### RDO
- lista de RDOs
- criação
- cache/offline
- fila de sincronização
- edição controlada planejada

### Perfil e treinamento
- Meus Dados
- Foto Oficial
- Meus Treinamentos

### Processo admissional
- documentos exigidos por vínculo de vaga
- envio individual
- visualização de imagens/documentos

## Configurações/regras que não podem se perder

- `unit_id` delimita o contexto funcional.
- candidato só existe no contexto de unidade quando há vínculo com vaga daquela unidade.
- Colaborador é vínculo da Pessoa, não uma Pessoa duplicada.
- Quadro de Avisos não pode vazar entre unidades.
- Segurança Operacional deve seguir o padrão visual/funcional da Minha Ronda quando equivalente.
- Plano de Ação pertence ao responsável atual e mantém vínculo independente com seu registro de origem.
- Sessão persistente deve sobreviver à expiração comum do access token usando refresh token.
- RDO não pode perder pendência offline; item sai da fila somente após confirmação do servidor.

## Dependências relevantes observadas

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

Este inventário deve ser atualizado quando um módulo, dependência ou regra estrutural mudar.
