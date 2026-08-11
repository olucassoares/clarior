# Decisões de produto e engenharia — Clarior

## 1. Dinheiro em centavos

Todos os valores são armazenados como inteiros. Isso evita resultados imprecisos de ponto flutuante em somas e comparações monetárias. A conversão para reais acontece apenas na entrada e na apresentação.

## 2. Identidade definida no servidor

O cliente não envia o proprietário de uma transação. A API obtém a identidade autenticada e aplica o mesmo filtro em leituras, alterações e exclusões, reduzindo o risco de acesso a registros de outro usuário.

## 3. Lançamentos repetidos

A criação aceita uma chave de idempotência. Quando uma ação é reenviada por falha de rede ou clique repetido, a mesma operação não gera duas transações.

## 4. Exportação tratada como superfície de segurança

O CSV neutraliza células iniciadas por caracteres interpretados como fórmulas por planilhas. A exportação também respeita o mesmo isolamento de usuário aplicado às telas.

## 5. Escopo reduzido

Metas, investimentos e integração bancária seriam produtos próprios dentro do domínio financeiro. Foram deixados fora para que orçamento, transações e relatórios tivessem comportamento completo e testável.
