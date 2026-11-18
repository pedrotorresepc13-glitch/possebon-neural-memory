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

## Implementação preparada em 18/11 — ainda NÃO homologada / NÃO publicada

- Flutter em branch separada `fix/cadastro-contato-pessoa-20261118`, draft PR **#15**: https://github.com/pedrotorresepc13-glitch/possebon/pull/15. Base `main@925f12152c2479b0376c59084712b64242b65aa2`.
- `lib/screens/acesso_screen.dart`: cadastro novo inclui e-mail obrigatório e telefone com DDD obrigatório; confirmação inicial de nascimento/mãe e contatos faltantes; após JWT válido, dialog de regularização do cadastro atual com campos pessoais só leitura, contato faltante editável, validação servidor-side após gravação. Não cria Pessoa adicional.
- `lib/services/api_service.dart`: payload `cadastrarCandidato` envia `email` e `telefone`; `primeiroAcesso` aceita telefone opcional; mantém token e rotas já existentes.
- `lib/utils/contact_validator.dart`, `test/utils/contact_validator_test.dart`: validação isolada para e-mail e telefone brasileiros (10/11 dígitos com DDD).
- Workflow de CI `.github/workflows/validar-cadastro-contato.yml` preparado, mas run `44316956174` reportou **failure** e não retornou logs/etapas pelo conector. **Flutter analyze, test e build não estão aprovados.**
- Arquivo PHP completo preparado localmente a partir do arquivo `ApiAppController.php` fornecido em 17/11, com `php -l` OK; NUNCA assumir idêntico ao backend ativo sem comparar SHA. Ajusta cadastro: email e telefone obrigatórios; guarda CPF normalizado com consulta em PostgreSQL e advisory lock; identifica contatos ausentes; primeiro acesso envia telefone, confere nascimento/mãe; `meusDados` e `atualizarContato` exigem `app_pessoa_id` da sessão em vez de confiar apenas no ID enviado. **Não foi aplicado no servidor.**
- Questões bloqueadoras de produção: (1) confirmar SHA/base do PHP vivo antes de aplicar arquivo completo; (2) implementação e teste da confirmação de posse do e-mail e telefone (OTP ou fluxo validado pelo RH) especialmente para primeira senha de Pessoa sem conta; dados estáticos como nome da mãe e nascimento não substituem validação de posse; (3) testes Flutter e integração HTTP com JWT real; (4) ainda existem duplicadas 2765, 2767 e 2774, apesar das 21 participações já transferidas; não removê-las antes das 2 tabelas restritas auditadas.
- Release Play PR #14 `1.1.5+9` continua bloqueado; nenhum AAB oficial foi gerado nem enviado.
