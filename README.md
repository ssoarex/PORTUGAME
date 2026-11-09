# PORTUGAME — versão compacta

Protótipo RPG educacional de Língua Portuguesa, feito com HTML, CSS e JavaScript puro.

## Como executar no VS Code
1. Extraia a pasta `PORTUGAME_GitHub`.
2. Abra a pasta no VS Code.
3. Abra `index.html` no navegador. Recomendado: extensão **Live Server** no VS Code e clique em **Go Live**.
4. O jogo funciona sem instalação de Python ou banco de dados.

## Como publicar no GitHub Pages
1. Entre no GitHub e crie um repositório público chamado `portugame`.
2. Envie o arquivo `index.html` para a raiz do repositório (o `README.md` é opcional).
3. Abra **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`, depois clique em **Save**.
6. Aguarde a publicação. O endereço ficará parecido com `https://SEU-USUARIO.github.io/portugame/`.

## O que está funcionando
- Perfil local com nome e avatar.
- Três mundos e 15 questões demonstrativas.
- Correção automática e explicação pedagógica.
- XP, moedas, níveis e medalhas.
- Desempenho por competência.
- Salvamento com LocalStorage no navegador.

## Limitações desta versão
- O progresso fica salvo no navegador/dispositivo utilizado. Não há sincronização entre aparelhos ou contas.
- Não há login real nem painel remoto de professor.
- As questões são demonstrativas e podem ser ampliadas/editadas no objeto `missions` dentro do `index.html`.
- Para uma plataforma com vários alunos e professor acompanhando dados centralizados, será necessário adicionar backend e banco de dados.
