# SENAC - Sistema Pedagógico

Sistema web desenvolvido para o SENAC, com o objetivo de auxiliar a equipe pedagógica no gerenciamento de professores, alocações, agendas, disponibilidade semanal e informações acadêmicas.

---

## Sobre o projeto

O Sistema Pedagógico foi desenvolvido como um projeto de aplicação web durante o curso de Programador Web.

A aplicação possui uma área destinada à equipe pedagógica para consulta e gerenciamento das informações relacionadas aos professores, turmas, alocações e agendas.

O projeto utiliza uma arquitetura separando o frontend, responsável pela interface e interação com o usuário, do backend, responsável pela API, autenticação e comunicação com o banco de dados.

---

## Objetivos

- Facilitar o gerenciamento de professores.
- Permitir a consulta de informações dos professores.
- Organizar as alocações de professores em turmas.
- Disponibilizar uma agenda geral por professor.
- Controlar a disponibilidade semanal dos professores.
- Facilitar a visualização de horários e períodos.
- Disponibilizar indicadores através de um dashboard.
- Permitir o gerenciamento de configurações do sistema.
- Permitir importação de dados através de planilhas.
- Armazenar os dados utilizando SQLite.
- Organizar o sistema de forma modular para facilitar manutenção e evolução.

---

## Funcionalidades

### Dashboard

- Visualização dos principais indicadores do sistema.
- Quantidade de professores disponíveis.
- Quantidade de professores alocados.
- Quantidade de turmas ativas.
- Quantidade de alocações pendentes.
- Busca de professores.
- Filtros por cidade.
- Filtros por dia da semana.
- Filtros por horário.
- Filtros por turma.
- Filtros por assistente administrativo.
- Filtros por período.
- Visualização do cronograma semanal.
- Visualização do resumo de carga horária.

### Professores

- Cadastro de professores.
- Edição de professores.
- Exclusão de professores.
- Consulta de professores.
- Cadastro de informações pessoais.
- Cadastro de e-mail.
- Cadastro de telefone.
- Cadastro de CPF.
- Cadastro de cidade ou unidade.
- Cadastro de área de atuação.
- Cadastro de carga horária.
- Controle de status.
- Cadastro de foto.
- Definição da disponibilidade semanal.

### Disponibilidade semanal

A disponibilidade do professor é organizada por:

- Segunda-feira;
- Terça-feira;
- Quarta-feira;
- Quinta-feira;
- Sexta-feira;
- Sábado;
- Domingo.

Cada dia pode possuir os períodos:

- Manhã;
- Tarde;
- Noite.

Os períodos podem possuir os seguintes estados:

- Disponível;
- Disponível em Breve;
- Indisponível;
- Sem Informação.

### Cronograma semanal

O cronograma utiliza uma representação visual através de cores:

| Cor | Status |
|---|---|
| Azul | Aula Agendada |
| Laranja | Disponível em Breve |
| Verde | Disponível |
| Vermelho | Indisponível |
| Cinza | Sem Informação |

No Dashboard, o cronograma apresenta a disponibilidade de forma resumida por dia e período.

Na Agenda Geral, a visualização é detalhada por dia e horário.

Quando existe uma aula alocada em determinado horário, a aula possui prioridade sobre a disponibilidade cadastrada.

### Agenda Geral

- Seleção de professor.
- Seleção de período.
- Seleção de unidade.
- Seleção de eixo tecnológico.
- Visualização dos horários.
- Visualização das aulas agendadas.
- Visualização da disponibilidade.
- Visualização de horários indisponíveis.
- Visualização de horários sem informação.
- Resumo da carga horária.
- Consulta de agenda individual.

### Alocações

- Cadastro de alocações.
- Edição de alocações.
- Exclusão de alocações.
- Consulta de alocações.
- Filtros de busca.
- Controle de status.
- Associação entre professor e turma.
- Associação entre professor e curso.
- Definição de dia e horário.
- Definição de período.
- Informações de cronograma.
- Informações de assistente administrativo.

### Resumo de carga horária

O sistema apresenta:

- Horas contratadas;
- Horas alocadas;
- Horas livres;
- Percentual de utilização.

A carga contratada é obtida a partir do cadastro do professor.

Na versão atual, o cálculo operacional de horas alocadas considera os horários registrados nas alocações.

### Configurações

- Configurações gerais.
- Início da semana.
- Unidade padrão.
- Formato de exportação.
- Carga horária máxima semanal.
- Intervalo mínimo entre aulas.
- Distância máxima entre unidades.
- Prioridade de disciplina.
- Alertas de alocações pendentes.
- Lembretes de aulas.
- Notificações de mudanças na agenda.
- Relatórios semanais.
- Configurações de sessão.
- Configurações de autenticação.
- Política de senha.
- Controle de sessões ativas.

### Importação de dados

O sistema possui uma área destinada à importação de informações através de planilhas.

Formatos utilizados:

- `.xlsx`
- `.csv`

A estrutura utilizada nas planilhas pode conter:

- Professores;
- Alocações;
- Disponibilidade semanal;
- Resumo.

---

## Tecnologias utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express

### Banco de dados

- SQLite
- better-sqlite3

### Bibliotecas

- bcrypt
- cors
- express-session
- multer

---

## Estrutura do projeto

```text
Senac-PI-Dashboard-front-and-back-end-updates/
│
├── Backend/
│   ├── database.js
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
│   ├── CSS/
│   ├── JS/
│   └── *.html
│
├── Página Dashboard Senac/
│   ├── CSS/
│   ├── js/
│   └── dashboard.html
│
├── Registro de Professores/
│   ├── CSS/
│   ├── JS/
│   └── *.html
│
├── Agenda Geral/
│   ├── CSS/
│   ├── JS/
│   └── *.html
│
├── Alocações de Professores/
│   ├── CSS/
│   ├── js/
│   └── *.html
│
├── Configurações/
│   ├── CSS/
│   ├── JS/
│   └── *.html
│
├── .gitignore
└── README.md
```

---

## Instalação

### Pré-requisitos

- Node.js
- npm

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd Senac-PI-Dashboard-front-and-back-end-updates
```

### 2. Instale as dependências

Entre na pasta do backend:

```bash
cd Backend
```

Depois:

```bash
npm install
```

### 3. Inicie o backend

Na pasta `Backend`:

```bash
node server.js
```

O servidor utiliza a porta configurada no projeto, normalmente:

```text
http://127.0.0.1:3000
```

ou:

```text
http://localhost:3000
```

### 4. Execute o frontend

Abra o projeto utilizando um servidor local, como o Live Server do VS Code.

Exemplo:

```text
http://127.0.0.1:5501
```

---

## API

O backend disponibiliza endpoints para comunicação entre o frontend e o banco de dados.

Entre os recursos utilizados estão:

```text
POST   /api/login
POST   /api/logout

GET    /api/professores
GET    /api/professores/:id
POST   /api/professores
PUT    /api/professores/:id
DELETE /api/professores/:id

GET    /api/agenda/:professorId

GET    /api/alocacoes
GET    /api/alocacoes/:id
POST   /api/alocacoes
PUT    /api/alocacoes/:id
DELETE /api/alocacoes/:id

GET    /api/configuracoes
PUT    /api/configuracoes

GET    /api/dashboard

POST   /api/importacao
```

Também existem rotas relacionadas à disponibilidade semanal dos professores.

> Os endpoints podem variar conforme a versão atual do backend.

---

## Banco de dados

O sistema utiliza SQLite para armazenamento das informações.

O banco possui estruturas relacionadas a:

- usuários;
- professores;
- áreas de atuação;
- alocações;
- configurações;
- disponibilidade semanal;
- informações relacionadas às agendas.

O frontend não acessa o SQLite diretamente.

Fluxo principal:

```text
Frontend
   ↓
JavaScript
   ↓
API Express
   ↓
database.js
   ↓
SQLite
```

---

## Segurança

O projeto possui mecanismos para:

- autenticação de usuários;
- controle de sessões;
- proteção das rotas administrativas;
- diferenciação de acesso;
- hash de senhas;
- validação de dados;
- controle de CORS;
- processamento controlado de uploads;
- controle das requisições ao backend.

Não coloque senhas, credenciais ou dados pessoais reais no repositório público.

---

## Testes realizados

Durante o desenvolvimento foram realizados testes de:

### Frontend

- carregamento das páginas;
- navegação entre páginas;
- login;
- cadastro de professores;
- edição de professores;
- busca de professores;
- filtros;
- cadastro de alocações;
- edição de alocações;
- exclusão de alocações;
- seleção de professores;
- Agenda Geral;
- cronograma semanal;
- disponibilidade por período;
- resumo de carga horária;
- configurações;
- importação de planilhas.

### Backend

- inicialização do servidor;
- conexão com o banco SQLite;
- autenticação;
- gerenciamento de sessão;
- consulta de professores;
- cadastro de professores;
- edição de professores;
- exclusão de professores;
- consulta de alocações;
- cadastro de alocações;
- edição de alocações;
- exclusão de alocações;
- consulta de agenda;
- consulta de disponibilidade;
- atualização de configurações;
- comunicação entre frontend e API.

### Banco de dados

- criação das tabelas;
- inserção de registros;
- consulta de registros;
- atualização de registros;
- exclusão de registros;
- armazenamento da disponibilidade semanal;
- relacionamento entre professores e alocações.

---

## Importação de planilhas

A importação permite trabalhar com dados de apresentação e testes.

A planilha pode possuir abas como:

```text
Importacao Completa
Professores
Alocacoes
Disponibilidade
Resumo
```

A aba `Importacao Completa` pode ser utilizada para importar informações relacionadas aos professores e às alocações.

A aba `Disponibilidade` representa a disponibilidade semanal dos professores.

---

## Dados de apresentação

As planilhas utilizadas para demonstração do sistema possuem dados fictícios.

Os dados são utilizados apenas para:

- testes;
- demonstração;
- apresentação do projeto;
- validação das funcionalidades.

Informações reais de professores ou usuários não devem ser publicadas no repositório.

---

## Publicação

O projeto foi desenvolvido inicialmente para execução em ambiente local utilizando Node.js, Express e SQLite.

A publicação em outro ambiente depende da configuração do servidor, banco de dados e variáveis utilizadas pelo projeto.

---

## Equipe

Projeto desenvolvido durante o curso de Programador Web, com participação da equipe responsável pelo desenvolvimento do Sistema Pedagógico do SENAC.

---

## Status do projeto

**Em desenvolvimento.**

As principais funcionalidades do sistema foram implementadas, incluindo cadastro de professores, alocações, agenda, disponibilidade semanal, dashboard, configurações e integração com banco de dados.

O projeto pode receber novas melhorias, correções e funcionalidades conforme a evolução do sistema.

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos e para utilização no projeto pedagógico do SENAC.

O uso, distribuição ou alteração do sistema deve respeitar os direitos e acordos definidos pela equipe responsável pelo projeto.
