# POSSEBON App — cadastro, regularização de contato e duplicidade de Pessoa (18/11/2026)

**Estado: diagnóstico técnico (attention), implementação NÃO aplicada, publicação Play bloqueada.**

## Solicitação do usuário e evidências
- Cadastro novo de candidato/Pessoa precisa exigir **e-mail** e **telefone com DDD**, além dos campos atuais.
- Pessoa já existente sem contato obrigatório ao tentar entrar: mostrar mensagem "Precisamos atualizar suas informações", seguir para uma tela de revisão **somente leitura** dos dados pessoais (após prova de identidade), permitir cadastrar **somente e-mail e telefone**, salvar na mesma Pessoa e retomar o login/criação de acesso sem criar outra Pessoa.
- Usuário relatou duas Pessoas com nomes como "João" e "Joao"; verificar causa real (CPF, importação, concorrência, vínculo) sem fazer merge por nome/acento.
- Prints de 18/11: formulário de Pessoa sem campos de e-mail/telefone; primeiro acesso de funcionário mostra erro "Informe um e-mail válido para concluir o primeiro acesso" após digitar senha.
- O segundo print expôs credenciais legíveis: orientar troca imediata, jamais copiar para documentação/logs.
- Release draft PR #14 1.1.5+9 NÃO publicado; publicar só depois de homologar este fluxo e demais bloqueios.

## Código inspecionado (baseline antes de mudanças)
Flutter `pedrotorresepc13-glitch/possebon` `main@925f12152c2479b0376c59084712b64242b65aa2`:
- `lib/screens/acesso_screen.dart`: `_CadastroCandidatoSheetState` não possui `emailController`/ `telefoneController`. `_salvar()` envia CPF, nome, nascimento, mãe, endereço, mas não contato. O passo `_criarPrimeiroAcesso()` tenta criar senha ANTES de capturar e-mail, e só coleta e-mail + nascimento + nome da mãe via diálogo, nunca telefone; uma detecção textual de erro reabre o diálogo de e-mail.
- `lib/services/api_service.dart`: `cadastrarCandidato()` não aceita nem transmite e-mail/telefone; `primeiroAcesso()` aceita `email` opcional, mas não telefone. `atualizarContato()` existe e chama `POST /api/app/meus-dados/contato` com JWT; não pode servir como recuperação ainda sem autenticação.
- `android` Google Play release draft permanece bloqueado.

Backend de referência: arquivo completo `ApiAppController.php` compartilhado em 17/11/2026, NÃO assumir automaticamente que é o PHP ativo atual:
- `cadastrarCandidato()` aceita `telefone` opcional, salva `pessoa.fone` se enviado. Não recebe/salva `email` no cadastro novo.
- `primeiroAcesso()` exige e-mail válido para novos `system_users`, quando `pessoa.email` vazio. Já permite receber `email`, `dt_nascimento` e `nome_mae`, com verificação de coincidência desses últimos (isso não substitui confirmação de posse do e-mail). Não exige telefone. Não altera login de usuário existente.
- `identificar()` devolve `precisa_cadastrar_email` somente para novo usuário e-mail inválido; falta `precisa_atualizar_contato` para celular/e-mail pendentes, inclusive contas existentes.
- `atualizarContato()` recebe `pessoa_id` fornecido por cliente e altera `Pessoa::find($pessoaId)`, mas seu corpo **não confere que esse ID corresponde a identidade JWT**; embora rota esteja no bloco AppApiBearerMiddleware, isto deve ser revisado como possível IDOR. Corrigir vínculo servidor-side antes de reutilizar endpoint.
- `cadastrarCandidato()` verifica `Pessoa::where('documento','=',$cpf)->first()` antes de `new Pessoa()->store()`. Isto previne CPF exatamente igual na rota (serial), mas não garante unicidade global/normalização (CPF antigo formatado, importadores, escrita concorrente ou ausência de índice UNIQUE).
- O login legado ainda possui fallback por `LOWER(TRIM(system_users.name))`+unidade: nomes com e sem acento não são necessariamente iguais. Não usar nome como chave de identidade; preferir CPF/pessoa_id com prova de identidade, preservar logins e vínculos.
- Campos reais: `pessoa.documento`, `pessoa.nome`, `pessoa.dt_nascimento`, `pessoa.email`, `pessoa.fone`, `pessoa.deleted_at`; `colaborador.pessoa_id` e `unit_id`.

## Regras para correção
1. Validação **no Flutter e no PHP** de e-mail/telefone novos. Valores precisam estar associados à mesma Pessoa existente; nomes/CPF/nascimento/endereço nunca editáveis na regularização.
2. Diferenciar Pessoa nova, Pessoa existente sem usuário, usuário com senha existente e candidato sem vínculo; preservar login/senha existentes, unidade e JWT.
3. Prova de identidade além de CPF e dados estáticos (p. ex., verificação presencial com RH/desafio), confirmar posse de e-mail e telefone por OTP antes da ativação; não expor dados completos a mero conhecedor de CPF; limitar tentativas. Fallback RH para quem não tem canal.
4. Pós-verificação, atualizar somente `Pessoa.email` e `Pessoa.fone` na sessão correta, e retornar automaticamente ao login/primeiro acesso da mesma Pessoa. Operação idempotente, sem criar `Pessoa` nova.
5. Auditar duplicados com SQL **somente SELECT**: CPF normalizado, nome sem acento+data nascimento, índices/regras de unicidade; separar Pessoas distintas que têm nome semelhante. Investigar importadores e concorrência antes de deduplicar.
6. Se houver CPFs realmente repetidos, preservar e migrar vínculos antes de qualquer consolidação; não aplicar `UPDATE`, `DELETE`, `UNIQUE` antes de relatório e backup.
7. Bloquear PR de release Play até testes reais de cadastro, regularização, recuperação, contas legadas e ausência de duplicação.

**Nada alterado em Flutter/PHP/bancos neste diagnóstico.**