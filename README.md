# Clarior

> Controle financeiro pessoal com orçamento, relatórios e persistência real.

[![Aplicação](https://img.shields.io/badge/demo-online-147d64?style=flat-square)](https://clarior-rho.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/olucassoares/clarior/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/olucassoares/clarior/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square)

Aplicação full stack que transforma movimentações em uma visão clara de saldo, orçamento e hábitos, com isolamento por usuário, regras financeiras no servidor, relatórios e exportação segura.

**[Abrir aplicação](https://clarior-rho.vercel.app)** · **[Arquitetura](docs/ARCHITECTURE.md)** · **[API](docs/API.md)** · **[Segurança](docs/SECURITY.md)**

## Avaliação rápida

1. Alterne entre mês atual, 30 e 90 dias e confira como o período recalcula o painel.
2. Cadastre uma receita ou despesa e observe os indicadores recalculados.
3. Pesquise o histórico, abra os relatórios e teste a exportação CSV.

O principal ponto técnico é a consistência financeira: valores em centavos, validação no servidor, idempotência e isolamento dos registros pelo usuário.

## Contexto do produto

O cenário inicial acompanha um mês financeiro de Lucas: entradas, gastos, orçamento e comparações com períodos anteriores. Os números do painel sempre vêm dos lançamentos salvos e das mesmas regras usadas nos relatórios.

## O problema

Planilhas financeiras exigem trabalho manual e tornam difícil responder perguntas simples: quanto sobrou, quais categorias consomem mais renda e se o orçamento mensal está sendo respeitado. O Clarior centraliza essas respostas sem esconder as regras de negócio.

## Funcionalidades

- Dashboard com saldo, receitas, despesas e taxa de economia.
- Filtro real de período para mês atual, últimos 30 e últimos 90 dias.
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

A suíte verifica conversão monetária, percentuais, taxa de economia, validação de transações, proteção do CSV e resposta das principais rotas. O teste de navegador registra uma despesa e confirma a persistência após recarregar. No CI, um PostgreSQL temporário isola o fluxo E2E de cada execução.

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
