# Clarior

Aplicação full stack de gestão financeira pessoal. O projeto transforma movimentações em uma visão clara de saldo, orçamento e hábitos, com persistência real, isolamento por usuário, relatórios e exportação segura.

**Aplicação em produção:** [Abrir Clarior](https://clarior-rho.vercel.app)

![Painel financeiro do Clarior](public/screenshots/dashboard.jpg)

## Contexto do produto

O cenário inicial acompanha um mês financeiro de Lucas: entradas, gastos, orçamento e comparações com períodos anteriores. Os números do painel sempre vêm dos lançamentos salvos e das mesmas regras usadas nos relatórios.

## O problema

Planilhas financeiras exigem trabalho manual e tornam difícil responder perguntas simples: quanto sobrou, quais categorias consomem mais renda e se o orçamento mensal está sendo respeitado. O Clarior centraliza essas respostas sem esconder as regras de negócio.

## Funcionalidades

- Dashboard com saldo, receitas, despesas e taxa de economia.
- Cadastro de receitas e despesas com validação no servidor.
- Histórico persistente e pesquisa instantânea.
- Exclusão protegida por propriedade do registro.
- Orçamento mensal e distribuição por categoria.
- Relatórios consolidados em períodos de 7, 30 e 90 dias.
- Exportação CSV em UTF-8, compatível com Excel.
- Proteção contra injeção de fórmulas em CSV.
- Chave de idempotência para impedir lançamentos duplicados.
- Isolamento de dados pelo usuário autenticado.
- Endpoint de saúde da aplicação e do banco.
- Interface responsiva, navegação por teclado e tratamento global de erros.

O fluxo persistente desta versão cobre transações, categorias e orçamento. Metas, contas bancárias conectadas e investimentos ficaram deliberadamente fora do escopo.

## Arquitetura

```text
Interface React
      |
      v
Rotas de API (validação + autorização)
      |
      v
Serviço de domínio financeiro
      |
      v
PostgreSQL
```

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Stack

- React 19 + TypeScript
- Next.js App Router
- Vercel Functions
- PostgreSQL
- Drizzle ORM e migrações SQL
- CSS responsivo sem biblioteca visual externa
- Node Test Runner

## Executando localmente

```bash
npm ci
cp .env.example .env.local
npm run db:migrate
npm run dev
```

## Qualidade

```bash
npm run lint
npm test
npm run test:e2e
npm run typecheck
npm run build
```

A suíte verifica conversão monetária, percentuais, taxa de economia, validação de transações, proteção do CSV e resposta das principais rotas. O teste de navegador registra uma despesa e confirma a persistência após recarregar.

## Decisões importantes

- Valores são armazenados em centavos para evitar erros de ponto flutuante.
- Datas de transação usam `YYYY-MM-DD`, sem deslocamento involuntário de fuso.
- O servidor determina o proprietário a partir da identidade autenticada; o cliente nunca escolhe `owner_id`.
- Operações de criação aceitam `Idempotency-Key` para repetição segura.
- O banco possui índices compostos para consultas por proprietário e data.
- O schema é versionado em migrações e também inicializado de forma idempotente no runtime.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Segurança](docs/SECURITY.md)
- [Decisões de produto e engenharia](docs/DECISIONS.md)
