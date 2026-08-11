# Segurança

## Controles implementados

- **Isolamento por proprietário:** toda leitura, criação e exclusão inclui `owner_id` no servidor.
- **Sem confiança no cliente:** o cliente não pode informar o proprietário do registro.
- **Consultas preparadas:** valores nunca são concatenados em SQL.
- **Validação de entrada:** descrição, valor, data, tipo e categoria possuem limites explícitos.
- **Idempotência:** a mesma solicitação pode ser repetida sem gerar cobrança duplicada no histórico.
- **CSV seguro:** células iniciadas por `=`, `+`, `-` ou `@` são neutralizadas antes da exportação.
- **Valores inteiros:** cálculos usam centavos, reduzindo inconsistências numéricas.
- **Mensagens controladas:** falhas esperadas recebem códigos HTTP e mensagens objetivas.

## Modelo de identidade

Em produção, o usuário é identificado pelo cabeçalho autenticado encaminhado pela plataforma. No ambiente de demonstração local, existe um proprietário fixo apenas para permitir a avaliação do produto.

## Limitações conhecidas

- O projeto não conecta instituições bancárias reais.
- Não processa pagamentos nem armazena credenciais financeiras.
- A versão atual usa uma moeda principal por conta.
