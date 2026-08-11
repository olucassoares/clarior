# API

Todas as respostas de dados são JSON, exceto a exportação CSV.

## `GET /api/dashboard`

Retorna resumo mensal, orçamento, transações recentes e gastos por categoria.

## `GET /api/transactions?limit=30`

Lista transações do usuário. `limit` é limitado a 100.

## `POST /api/transactions`

Cria uma transação.

```json
{
  "description": "Mercado",
  "amount": "149,90",
  "category": "Alimentação",
  "type": "expense",
  "occurredAt": "2026-08-08"
}
```

O cabeçalho opcional `Idempotency-Key` impede inserções repetidas.

## `DELETE /api/transactions/:id`

Exclui somente se o registro pertencer ao usuário autenticado.

## `GET /api/categories`

Lista categorias de receita e despesa do usuário.

## `GET /api/reports?days=30`

Consolida categorias para 7, 30 ou 90 dias.

## `GET /api/export`

Exporta todas as transações do usuário em CSV UTF-8.

## `GET /api/health`

Verifica aplicação e acesso ao PostgreSQL. Retorna `200` quando saudável e `503` quando o banco está indisponível.
