# SENAC — Sistema Pedagógico

Sistema web desenvolvido para auxiliar a equipe pedagógica do SENAC no gerenciamento de professores, alocações, agendas, disponibilidade semanal e configurações do sistema.

## Sobre o projeto

O sistema centraliza informações utilizadas pela equipe pedagógica para facilitar a consulta e o gerenciamento de professores, turmas e alocações.

A aplicação possui uma interface web com páginas independentes e um backend responsável pela comunicação com o banco de dados SQLite.

## Funcionalidades

- Login de acesso ao sistema
- Dashboard pedagógico
- Cadastro e edição de professores
- Busca e consulta de professores
- Consulta de agenda geral
- Gerenciamento de alocações de professores
- Disponibilidade semanal dos professores
- Cronograma semanal com indicação visual de status
- Resumo de carga horária
- Configurações do sistema
- Importação de dados por planilha
- Banco de dados SQLite

## Status visual do cronograma

O sistema utiliza cinco estados principais para representar a situação do professor:

| Cor | Status |
|---|---|
| Azul | Aula Agendada |
| Laranja | Disponível em Breve |
| Verde | Disponível |
| Vermelho | Indisponível |
| Cinza | Sem Informação |

No Dashboard, o cronograma é apresentado de forma resumida por **dia e período**.

Na Agenda Geral, as informações são apresentadas de forma detalhada por **dia e horário**.

## Tecnologias utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Inter

### Back-end

- Node.js
- Express
- SQLite
- better-sqlite3
- Multer

### Dados

- Banco de dados SQLite
- Importação de arquivos `.xlsx`
- Importação de arquivos `.csv`

## Estrutura do projeto

```text
Senac-PI-Dashboard/
│
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── uploads/
│   └── ...
│
├── Global/
│   ├── CSS/
│   │   ├── global.css
│   │   └── Logo-senac-80.png
│   │
│   └── JS/
│       └── global.js
│
├── Login/
│   ├── login.html
│   ├── CSS/
│   └── JS/
│
├── Página Dashboard Senac/
│   ├── dashboard.html
│   ├── CSS/
│   └── js/
│
├── Registro de Professores/
│   ├── registro.html
│   ├── CSS/
│   └── JS/
│
├── Agenda Geral/
│   ├── agenda-geral.html
│   ├── CSS/
│   └── JS/
│
├── Alocações de Professores/
│   ├── alocacoes.html
│   ├── CSS/
│   └── js/
│
├── Configurações/
│   ├── configuracoes.html
│   ├── CSS/
│   └── JS/
│
├── .gitignore
└── README.md
```

## Como executar

### 1. Clonar o repositório

```bash
git clone SEU_LINK_DO_GITHUB
```

Entre na pasta do projeto:

```bash
cd Senac-PI-Dashboard
```

### 2. Instalar as dependências do backend

```bash
cd Backend
npm install
```

### 3. Iniciar o servidor

```bash
npm start
```

O backend ficará disponível, conforme a configuração do projeto, em:

```text
http://localhost:3000
```

### 4. Abrir o front-end

Abra o projeto utilizando um servidor local, como o **Live Server** do VS Code.

É recomendado utilizar um servidor local em vez de abrir os arquivos HTML diretamente pelo `file://`.

## Banco de dados

O projeto utiliza SQLite para armazenamento local dos dados.

O banco possui informações relacionadas a:

- Professores
- Áreas de atuação
- Alocações
- Configurações
- Usuários
- Disponibilidade semanal

O banco não deve ser versionado no GitHub caso contenha dados reais.

## Importação de dados

A tela de Configurações possui uma área de importação de planilhas.

O modelo de apresentação utilizado pelo projeto pode conter as seguintes abas:

```text
Importação Completa
Professores
Disponibilidade
Resumo
```

A aba de **Importação Completa** pode ser utilizada para dados de professores e alocações.

A aba de **Disponibilidade** representa a disponibilidade semanal dos professores.

## Segurança e versionamento

Não envie para o GitHub:

```text
node_modules/
.env
*.db
*.sqlite
*.sqlite3
uploads/*.xlsx
uploads/*.csv
```

Arquivos com dados reais de professores, usuários ou outras informações pessoais também não devem ser publicados no repositório.

## Dados de apresentação

Os dados utilizados nas planilhas de demonstração são fictícios e servem apenas para testes e apresentação do sistema.

## Observação

O sistema está preparado para execução em ambiente local e para demonstração das principais funcionalidades do fluxo pedagógico.

