# Quality Gates — POSSEBON App

Nenhuma mudança relevante deve ser tratada como concluída apenas porque compilou uma vez.

## Gate 1 — Fonte correta

Antes da edição:

- Flutter: conferir branch `possebon` e working tree local/remoto.
- Backend: confirmar ZIP/arquivo baseline atual.
- Memória: ler regras e estado do módulo.

Falha neste gate = não editar ainda.

## Gate 2 — Regra de negócio

Confirmar:

- Pessoa correta;
- unidade correta;
- autoria/responsabilidade correta;
- capability/permissão correta;
- status correto do registro;
- efeito offline/notificação/tracking quando aplicável.

## Gate 3 — Código

Flutter:

- format;
- `flutter analyze` sem novos `error`;
- testes direcionados;
- evitar regressão em sessão/unidade;
- sem conflito Git/markers.

Backend PHP:

- `php -l` nos arquivos alterados;
- rotas/controller/traits coerentes;
- transações fechadas corretamente;
- sem alterar schema sem necessidade explícita;
- isolamento por unidade validado no servidor.

## Gate 4 — Build/plataforma

Quando aplicável:

- Android debug/profile/release conforme risco;
- Web/PWA quando a mudança afeta Web;
- iPhone/PWA/touch quando o módulo é usado nesses ambientes;
- permissões nativas para câmera/localização/notificações quando afetadas.

## Gate 5 — Teste funcional

Testar fluxo feliz e pelo menos uma falha relevante.

Exemplos:

### Sessão
- abrir no dia seguinte;
- access token vencido;
- rede temporariamente indisponível;
- logout explícito.

### Segurança
- criar;
- salvar;
- reabrir PDF;
- foto/evidência;
- registro de outro usuário não aparecer em “meus”.

### Planos
- plano criado por outra pessoa mas atribuído ao usuário;
- abrir origem;
- replanejar sem trocar responsável;
- replanejar trocando responsável;
- concluir;
- histórico permanecer.

### RDO
- criar online;
- criar offline;
- sincronizar;
- editar Emissão;
- tentar editar Arquivado.

### Transporte/Cerca
- iniciar rota;
- tracking;
- presença;
- mudança de conectividade;
- sessão renovada em background.

## Gate 6 — Performance

Mudança de performance exige medição em `profile` no aparelho real sempre que possível.

Comparar:

- abertura da tela;
- toque no TextField;
- abertura do teclado;
- digitação;
- scroll;
- frames > 16,7 ms e > 33 ms;
- raster/UI/GC.

Não aceitar “parece melhor” como única evidência quando o problema é reproduzível.

## Gate 7 — Memória neural

Depois de validar:

- atualizar `current-state.json`;
- atualizar nó/regra pertinente;
- atualizar contrato de API se mudou;
- registrar decisão permanente se necessário;
- registrar changelog;
- marcar `stable` apenas se realmente validado.

## Gate 8 — Entrega

A resposta/entrega deve dizer claramente:

- o que mudou;
- onde mudou;
- o que foi realmente aplicado;
- o que ainda depende do usuário/backend;
- como testar;
- como reverter quando houver risco relevante.
