# Espelho de Ponto POSSEBON — fidelidade ao Meu RH (17/11/2026)

**Estado: `attention` / contrato do produto confirmado, implementação incompleta, não declarar concluído.**

## Pedido original do usuário — prioridade máxima

O objetivo é **reproduzir funcionalmente o Espelho de Ponto completo do Meu RH do TOTVS** no aplicativo POSSEBON, com **apresentação própria do POSSEBON**. Não é um cartão de marcações nem um relatório estimado.

**Única exceção de fonte**: entrada/saída, incluindo horários disponibilizados antes de chegar ao RM, vem do banco POSSEBON, `controle_acesso` `tipo='P'`, escopado por pessoa e unidade. **Todos os demais fatos e cálculos** vêm do RH do TOTVS em consulta, sem gravar os resultados em PostgreSQL: dias trabalhados, folgas, feriados, atestados e justificativas, faltas, atrasos, abonos, compensações, extras a pagar, totais oficiais e demais ocorrências conforme existirem no Meu RH.

**Regras de UX**:
- Não citar nome TOTVS, RM, PT_23, endpoint, fonte ou detalhes de integração em nenhuma mensagem, título ou componente visível ao colaborador.
- Exibir resumo do período com os mesmos significados do Meu RH. Distinções importantes: `extras a pagar` não é sinônimo de `extras executadas`, `extras autorizadas` ou `extras calculadas`; não renomear uma grandeza para imitar outra.
- Lista de **todos os dias do período oficial**, inclusive aqueles sem marcação, com status e ocorrências oficiais, não apenas datas com batidas.
- Dia individual mostra horários reais do POSSEBON e situação/apuração/justificativas oficiais do RH.
- Não inventar escala, pausa, saldo, horas ou feriados por calendário genérico; não deduzir atestado ou falta de ausência de batidas.

## Referência visual previamente descrita na conversa APP 13

Os prints do usuário do Meu RH mostraram fechamento **21/10/2026 a 20/11/2026**, e resumo citado no histórico: **09:11 extras a pagar**, **02:49 atrasos**, **09:00 faltas**. O detalhe de 16/11/2026 havia sido descrito como entrada 07:00, saída 12:00, entrada 17:04 e saída ausente. O usuário também destacou situações e ocorrências como feriado, falta, abono, justificativas e atestados.

A imagem original dos prints anteriores não está acessível nesta etapa; usar esses valores apenas como referência de aceitação a ser conferida contra a fonte antes de transformá-los em testes de produção.

## Falhas comprovadas no código atual

- PHP `app/custom/ControleAcessoAppApiTrait.php` instalado em produção com SHA256 `4dece1167259d1e9a9f2e0f2f27679b9b0432b159d8568940fd8bb81d86eb3c8` consulta `PT_23`, busca batidas no `controle_acesso`, mas envia `'ocorrencias' => []` para **todos** os dias. Assim atestados/folgas/feriados/faltas tratados não podem aparecer como registros de ocorrência.
- `dias` é construído de `array_unique(array_merge(array_keys($marcacoes), array_keys($apuracaoPorDia)))`. Dias sem batida e sem AAFHTFUN ficam **invisíveis**, contrariando referência visual.
- Consulta `docs/totvs/rh-ponto/PT_23.sql` do repo Flutter usa `APERIODO` e `AAFHTFUN`. Retorna `PERIODO`, `DIA`, `RESUMO` e somente minutos (trabalhadas/base/extras executadas/autorizadas/calculadas/atrasos/faltas/abonos/compensados/feriado). **Não contém fonte/atributo do atestado, justificativa, status diário, dia trabalhado, folga, nem total específico `EXTRAS_A_PAGAR_MINUTOS`**. Não se pode prometer reprodução total usando-a como está.
- Flutter `lib/features/meu_rh/presentation/espelho_ponto_screen.dart` main foi alterado em `925f12152c2479b0376c59084712b64242b65aa2` para retirar textos técnicos e acrescentar extras executadas; atualização **não foi confirmada no celular**. Captura em 17/11 mostra ainda build anterior com textos técnicos e sem resumo do período.

## Diagnóstico resolvido do acesso à PT_23

- A PT_23 havia sido cadastrada em `GCONSSQL` coligada 0, aplicação T, portanto `PT_23/3/T` retornava HTTP 404 FE011.
- Usuário corrigiu cadastro em 17/11 e confirmou `PT_23/3/T` HTTP **200**, com 0 linhas para matrícula **fictícia**. Isso prova acesso à consulta, mas não prova apuração do colaborador real.
- Backend PHP ativo faz fallback silencioso para batidas se consulta não responder com payload completo/esperado; ainda requer teste real autenticado e validação de `PERIODO`, `DIA`, `RESUMO` com identidade da sessão, sem imprimir dados pessoais.
- Não repetir testes de coligada, sistema ou recriar PT_23: esta parte já foi corrigida.

## Correção futura (não implementada nesta documentação)

1. Usar prints Meu RH como especificação funcional, mapear os campos e ocorrências oficiais reais na base TOTVS, sem inventar nomes de tabelas/colunas nem valores de apuração.
2. **Ampliar a consulta existente ou criar contrato de consulta validado** para incluir status diário, feriados, atestados, justificativas, dias sem movimento, extras a pagar e totais exatos do Meu RH. Preservar tratamento oficial e competência APERIODO.
3. Ajustar PHP para devolver todos os dias do período e `ocorrencias` reais com escopo por JWT/pessoa/unidade, mantendo batidas POSSEBON e sem persistência de apuração.
4. Ajustar Flutter para espelho completo com a experiência POSSEBON e absolutamente nenhuma referência ao sistema de origem.
5. Validar com exemplo autorizado do colaborador, comparando telas e totais 1:1, e só então divulgar como funcional.

Este documento registra **regra e diagnóstico**, não a correção pronta ou publicada.