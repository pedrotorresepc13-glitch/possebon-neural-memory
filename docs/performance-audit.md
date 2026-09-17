# Auditoria de performance — POSSEBON App

Atualizado em 2026-09-16.

## Sintomas relatados

- algumas telas demoram a abrir;
- teclado/IME abre lentamente, quase travando;
- percepção de lentidão varia conforme a tela.

## Achados iniciais no código

### Telas grandes e stateful

`home_screen.dart`, `acesso_screen.dart`, `seguranca_operacional_legacy.dart`, `minha_ronda_gerencial_screen.dart` e telas de mapa concentram muita UI, estado e lógica no mesmo widget. Mudanças pequenas podem reconstruir árvores grandes.

### Rebuild durante abertura do teclado

Telas que usam `MediaQuery.viewInsetsOf(context).bottom` em um `build()` amplo podem reconstruir durante toda a animação do teclado. O padrão é funcionalmente correto, mas precisa ser isolado em widgets menores quando a tela é pesada.

### setState por tecla

`ManifestacaoScreen` usa listener do `TextEditingController` e `setState` a cada alteração para atualizar contador. Em tela pequena é tolerável, mas o padrão deve ser evitado em árvores grandes; preferir `ValueListenableBuilder` ou estado local isolado.

### Home muito centralizada

`HomeScreen` gerencia usuário, avisos, capabilities, RDO, crachá, cerca, segurança, notificações e navegação. Carregamentos independentes atualizam o mesmo State e podem reconstruir a Home inteira várias vezes.

### Mapas e tracking

`TransporteMapaScreen` possui polling, tracking, animação de veículo e atualizações frequentes. Rebuilds devem ser localizados para não redesenhar overlays e controles desnecessariamente.

### Inicialização global

`main.dart` aguarda locale, Firebase e NotificationService antes de `runApp`. Isso impacta startup, embora não explique sozinho a lentidão do teclado.

### Rede

O app ainda possui `ApiService` grande e um `ApiClient` novo. A consolidação deve ser gradual para não criar regressões, mas padronização de timeouts, cancelamento e observabilidade ajudará a distinguir lentidão de rede de lentidão de UI.

## Pontos positivos

- `AuthSessionManager` usa single-flight para evitar refresh concorrente.
- `RdoSyncService` impede sincronizações simultâneas da fila.
- partes do app já usam cache/offline e carregamento local primeiro.

## Plano de medição

Antes de otimizar em massa:

1. rodar `flutter run --profile` em aparelho real;
2. abrir DevTools Performance;
3. medir abrir tela, tocar TextField, abrir teclado e digitar rapidamente;
4. repetir em Login, Dono de Área, Minha Ronda, Planos de Ação, RDO, Transporte e Manifestação;
5. registrar frames acima de 16,7 ms e 33 ms;
6. separar custo de UI thread, raster, GC, plugin nativo e rede;
7. aplicar uma correção por vez e comparar antes/depois.

## Candidatos de otimização

- dividir telas monolíticas em widgets pequenos e `const`;
- isolar `MediaQuery.viewInsetsOf` no menor subtree possível;
- usar `ValueListenableBuilder`/estado local para contadores e campos;
- evitar `setState(() {})` no State da tela inteira;
- usar `RepaintBoundary` em mapas, imagens pesadas, câmera e áreas independentes;
- dimensionar/cachear imagens;
- reduzir rebuilds de Home ao carregar capabilities separadas;
- medir startup e mover inicializações não críticas para depois do primeiro frame quando seguro;
- consolidar gradualmente chamadas de rede em camada observável.

## Critério de pronto

Uma melhoria de performance só é considerada concluída quando:

- não quebra fluxo funcional;
- `flutter analyze` não ganha novos errors;
- testes principais continuam passando;
- a interação medida mostra melhora clara em Profile Mode no aparelho real.
