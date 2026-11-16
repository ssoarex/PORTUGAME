# PORTUGAME

Jogo educacional de Língua Portuguesa feito com HTML, CSS e JavaScript puro. Não usa backend, banco de dados ou instalação de dependências.

## Executar

Abra `index.html` no navegador ou use a extensão Live Server no VS Code. O projeto usa arquivos JavaScript clássicos, então também funciona ao abrir a página diretamente como arquivo local.

## Organização

- `index.html`: estrutura e pontos de entrada da interface.
- `css/styles.css`: apresentação e layout responsivo.
- `js/app.js`: interação, progresso, perfil e renderização.
- `js/data/phases.js`: mundos, fases e habilidades.
- `js/data/questions.js`: perguntas, alternativas, respostas e explicações.

O catálogo tem três mundos, nove fases e 45 questões. Para criar uma fase, inclua seus metadados em `js/data/phases.js` e associe cinco questões com o mesmo identificador em `js/data/questions.js`.

## Recursos

- Perfil local com nome e avatar.
- Correção automática com explicações pedagógicas.
- XP, moedas, níveis e conquistas.
- Avatares desbloqueáveis com moedas conquistadas ao responder questões.
- Desempenho por habilidade e progresso por fase.
- Salvamento com LocalStorage no navegador.

O progresso fica salvo apenas no navegador e dispositivo utilizados; não há contas nem sincronização entre aparelhos.
