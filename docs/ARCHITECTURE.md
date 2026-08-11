# Arquitetura do Clarior

## Visão geral

O Clarior segue uma arquitetura em camadas. A interface não acessa o banco diretamente: todas as gravações passam por rotas de API, validação de domínio e autorização por proprietário.

## Camadas

1. **Interface:** componentes React, estado de navegação, formulários e apresentação de métricas.
2. **API:** contratos HTTP, tratamento de erros e definição do usuário autenticado.
3. **Domínio:** conversão monetária, validação, percentuais e regras de economia.
4. **Persistência:** consultas preparadas no PostgreSQL, migrações Drizzle e índices.

## Modelo de dados

### `categories`

- `id`
- `owner_id`
- `name`
- `color`
- `type`: `income` ou `expense`

### `transactions`

- `id`
- `owner_id`
- `description`
- `amount_cents`
- `type`
- `category_id`
- `occurred_at`
- `notes`
- `idempotency_key`
- timestamps

### `budgets`

- `id`
- `owner_id`
- `month`
- `amount_cents`
- timestamps

## Fluxo de criação

1. A interface envia descrição, valor, tipo, categoria e data.
2. A API resolve o proprietário pelo cabeçalho autenticado.
3. O domínio normaliza o valor para centavos e valida todos os campos.
4. A API reutiliza ou cria a categoria do mesmo proprietário.
5. A chave de idempotência é consultada antes da inserção.
6. A transação é persistida e o dashboard é recalculado.

## Consistência

- Valores financeiros são inteiros em centavos.
- Índices aceleram leitura por proprietário e data.
- Restrições `UNIQUE` evitam categorias, orçamentos e requisições duplicadas.
- Inicialização idempotente permite executar o serviço em um banco vazio.
