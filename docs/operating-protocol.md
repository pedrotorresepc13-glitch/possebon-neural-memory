# Protocolo operacional da Memória Neural

Este documento define **como todo trabalho futuro no POSSEBON App deve usar este repositório**.

## 1. Antes de qualquer alteração

Antes de criar, corrigir ou refatorar um módulo:

1. Ler `data/current-state.json`.
2. Ler o nó correspondente em `data/project-memory.json`.
3. Ler `docs/business-rules.md` e o documento do domínio envolvido.
4. Conferir a implementação real no repositório Flutter ou no baseline backend vigente.
5. Identificar dependências afetadas: sessão, unidade, API, cache, notificação, PDF, foto, permissões, offline, design e testes.
6. Registrar a intenção/estado como planejado ou ativo na memória quando a mudança for estrutural.

## 2. Durante a implementação

- Não inventar regra de negócio quando ela já estiver registrada.
- Não duplicar componente se já existir padrão compartilhado.
- Não declarar uma mudança aplicada sem confirmação real.
- Não usar um arquivo backend antigo só porque ele apareceu em conversa anterior.
- Não modificar módulo visualmente equivalente de forma divergente sem justificativa funcional.
- Toda leitura/escrita contextual deve considerar `Pessoa + unit_id` quando a regra exigir contexto de unidade.

## 3. Depois da implementação

Uma mudança só pode ser marcada como concluída quando houver evidência compatível com o risco:

- `flutter analyze` sem novos errors;
- testes relacionados passando quando existirem;
- build quando a alteração afetar integração/plataforma;
- teste funcional do fluxo alterado;
- validação do backend quando houver PHP/rotas/banco;
- atualização desta memória com o estado real.

## 4. Estados permitidos

- `planned`: intenção registrada, ainda não implementada.
- `active`: código existe, mas está em evolução ou validação.
- `attention`: existe problema conhecido ou divergência.
- `stable`: implementado + validado.
- `blocked`: depende de informação, arquivo, acesso ou decisão.

## 5. Regra de status rigorosa

Nunca transformar:

- arquivo gerado em "aplicado";
- pacote preparado em "implantado";
- workflow criado em "sucesso" sem conferir execução;
- memória antiga em baseline atual;
- hipótese em regra confirmada.

Quando houver dúvida, registrar explicitamente `unknown`/`attention` no texto do item.

## 6. Bootstrap em qualquer conversa

Ao retomar o POSSEBON em uma conversa nova, consultar primeiro:

`README.md` → `data/current-state.json` → `data/project-memory.json` → documento do módulo.

Em seguida abrir no GitHub do app os arquivos apontados pela memória.

Esse processo permite continuar sem reconstruir todo o histórico manualmente, desde que o repositório continue acessível.

## 7. Atualização da memória

Toda mudança estrutural validada deve atualizar, conforme aplicável:

- nó do módulo em `project-memory.json`;
- `current-state.json`;
- decisão em `docs/decisions.md` se houver regra permanente nova;
- contrato em `data/api-contracts.json` se rota/payload mudar;
- `change-log.json` com resumo e validação;
- mapa visual se o módulo/relacionamento mudou.

## 8. Segurança da memória

Nunca salvar:

- segredo;
- token;
- senha;
- CPF;
- e-mail pessoal;
- nome de colaborador como dado operacional;
- chave REST;
- credencial de banco;
- Client Secret;
- conteúdo sensível de denúncia/sugestão;
- localização individual de usuário.

A memória guarda **estrutura e regras**, não dados pessoais.
