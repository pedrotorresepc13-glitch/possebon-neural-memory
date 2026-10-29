# Diagnóstico — tipo_desvio = S indevido em audicomp_item (29/10/2026)

## Evidências verificadas
- Export CSV de `audicomp_item` recebido em 29/10: 16.818 registros, `tipo_desvio` = N: 9.005, vazio: 7.548, T: 235, S: 30. Todos os 30 S são `unit_id=3`, `tipologia=N` e foram criados de 29/07 a 09/10/2026. `audicomp_id` distinto em 20 registros; 21/30 possuem subcategoria_desvio_id >62, enquanto os 235 T têm IDs <=62. Isso indica fluxos de categorias distintos, mas **não identifica sozinho a ferramenta de cada linha sem join em audicomp.tipo**.
- Backend baseline verificado: `possebon_web-26-10-2026-22-21-50.zip`, NÃO o GitHub `possebon_web` desatualizado.
- `app/custom/RondaGerencialAppApiTrait.php`:
  - 159-162: catálogo Minha Ronda anuncia `S = Sistêmico`.
  - 868-872: aceita `C,N,S` na não conformidade.
  - 895-940: grava o valor diretamente em `audicomp_item.tipo_desvio` via UPDATE ou INSERT. **Fonte confirmada capaz de escrever S**.
- `app/custom/SegurancaOperacionalAppApiTrait.php`:
  - 377-381: catálogo compartilhado anuncia S.
  - 989-992: usa `segTipoDesvioParaBanco` na gravação.
  - 3609-3623: para tipos D e A, transforma S->T (correto); para outras famílias transforma T->S (contradição com padrão pretendido pelo usuário).
  - 3597-3600: converte T->S quando devolve itens ao app, mesmo para D/A.
- Telas MAD Builder geradas:
  - `app/control/sms/AudicompForm.php` linha 180, `app/control/sms/RondaGerencialForm.php` linha 177 e `app/control/home/MinhaRondaGerencialForm.php` linha 191: combo oferece `S = Sistêmico`; caminho de gravação do detalhe armazena valor.
  - `app/control/home/AudicompPublicForm.php` linha 392 e seguintes e `app/control/sms/DonoDeAreaPublicForm.php` linha 482 e seguintes oferecem **T = Sistêmico**.
  - `app/control/sms/AudicompItemCadastroForm.php` linha 57 oferece **T = Sistêmico**.
  - `app/control/sms/AudicompItemList.php` linha 62 equivocadamente oferece **S = Sem Desvio**, mas o transformer 168-177 só conhece C,T,N, logo S fica sem rótulo na lista.
- Flutter branch `possebon`:
  - `lib/features/seguranca_operacional/presentation/minha_ronda_gerencial_screen.dart` linha 1919 lê catálogo que anuncia S; ao enviar, o backend Ronda salva S diretamente.
  - `lib/features/seguranca_operacional/presentation/dono_area_screen.dart` linha 1425 e `seguranca_operacional_legacy.dart` linha 2526 usam S no dropdown; para D/A, o backend converte S->T, portanto esses fluxos NÃO explicam S persistido quando usam o trait custom atual.

## Conclusão
**Divergência de contrato e codificação**: 'S' tem usos inconsistentes entre Ronda (S=Sistêmico), formulário de lista (S=Sem Desvio) e formulários oficiais Dono/Audicomp (T=Sistêmico). Não é bug de CSV. Há múltiplos caminhos que aceitam/escrevem S. Sem o join em `audicomp.tipo` e logs de requisição não se pode atribuir as 30 linhas a uma ferramenta específica, mas o endpoint Ronda é causa demonstrável de gravação S.

## SQL somente leitura para rastrear os 30 valores
```sql
SELECT a.tipo AS origem_tipo, COUNT(*) AS qtd,
       MIN(i.criado_em) AS primeiro, MAX(i.criado_em) AS ultimo
FROM audicomp_item i
JOIN audicomp a ON a.id=i.audicomp_id
WHERE i.tipo_desvio='S' AND i.unit_id=3
GROUP BY a.tipo ORDER BY qtd DESC;

SELECT i.id, i.criado_em, i.criado_por, i.audicomp_id,
       a.tipo AS origem_tipo, i.subcategoria_desvio_id,
       i.tipo_desvio, i.tipologia
FROM audicomp_item i
JOIN audicomp a ON a.id=i.audicomp_id
WHERE i.tipo_desvio='S' AND i.unit_id=3
ORDER BY i.criado_em DESC;
```

## Correção recomendada; NÃO aplicada
1. Confirmar que valor canônico desejado para Sistêmico é `T` em **todas** as famílias, inclusive Ronda, antes de migrar dados. Usuário informou que `S` não existe.
2. Uniformizar catálogos backend/Flutter e combos no MAD Builder pelo **Designer** (não sobrescrever páginas geradas): `C = Crítico`, `N = Não classificado`, `T = Sistêmico`.
3. Aceitar `S` temporariamente apenas como legado de entrada e **normalizar para T antes da gravação** em todos os endpoints; nas respostas, retornar `T` canônico ou compatibilizar clientes antigos durante migração.
4. Revalidar validações, filtros/listas e PDFs para não chamar `S` de `Sem Desvio`.
5. Depois de conferir `audicomp.tipo`, histórico e eventuais exceções, preparar UPDATE transacional auditável para `S -> T` apenas onde S for legado de Sistêmico. Backup e conferência dos 30 IDs antes; não alterar outros campos nem apagar registros.

Status: **diagnosticado, não corrigido**, sem alteração em código de produção, banco ou Flutter.
