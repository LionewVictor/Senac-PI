const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// ============================================================
// CAMINHO DO BANCO
// ============================================================

const pastaDados = path.join(__dirname, "data");

if (!fs.existsSync(pastaDados)) {
  fs.mkdirSync(pastaDados, { recursive: true });
}

const caminhoBanco = path.join(pastaDados, "senac.db");

// ============================================================
// CONEXÃO
// ============================================================

const db = new Database(caminhoBanco);

// Ativa suporte a chaves estrangeiras
db.pragma("foreign_keys = ON");

// ============================================================
// TABELA DE USUÁRIOS
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        cpf TEXT UNIQUE,
        telefone TEXT,
        unidade TEXT,
        cargo TEXT,
        perfil TEXT NOT NULL DEFAULT 'pedagogico',
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// ============================================================
// TABELA DE PROFESSORES
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nome TEXT NOT NULL,
        nome_social TEXT,
        data_nascimento TEXT,
        genero TEXT,
        cpf TEXT UNIQUE,
        email TEXT,
        estado_civil TEXT,
        telefone TEXT,

        status TEXT NOT NULL DEFAULT 'disponivel',

        unidade_vinculo TEXT,
        tipo_vinculo TEXT,
        data_admissao TEXT,

        area TEXT,
        horas_contratadas INTEGER DEFAULT 40,

        observacoes TEXT,
        foto TEXT,

        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// ============================================================
// TABELA DE ÁREAS DOS PROFESSORES
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS professor_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        professor_id INTEGER NOT NULL,
        area TEXT NOT NULL,

        FOREIGN KEY (professor_id)
            REFERENCES professores(id)
            ON DELETE CASCADE
    );
`);

// ============================================================
// TABELA DE ALOCAÇÕES
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS alocacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        professor_id INTEGER NOT NULL,

        nome_professor TEXT,
        instrutor TEXT,

        cidade TEXT,
        edital TEXT,

        dia_da_semana TEXT,
        horario TEXT,

        codigo TEXT,
        turma TEXT,
        curso TEXT,

        cronograma TEXT,

        assistente_administrativo TEXT,

        periodo TEXT,

        pratica_pi TEXT,

        insumos TEXT,

        material_ptd TEXT,

        avaliacao TEXT,

        feedback TEXT,

        status TEXT NOT NULL DEFAULT 'pendente',

        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (professor_id)
            REFERENCES professores(id)
            ON DELETE CASCADE
    );
`);

// ============================================================
// TABELA DE CONFIGURAÇÕES
// ============================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        chave TEXT NOT NULL UNIQUE,
        valor TEXT,

        atualizado_em DATETIME
            DEFAULT CURRENT_TIMESTAMP
    );
`);

// ============================================================
// ÍNDICES
// ============================================================

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_professores_nome
    ON professores(nome);

    CREATE INDEX IF NOT EXISTS idx_professores_status
    ON professores(status);

    CREATE INDEX IF NOT EXISTS idx_alocacoes_professor
    ON alocacoes(professor_id);

    CREATE INDEX IF NOT EXISTS idx_alocacoes_turma
    ON alocacoes(turma);

    CREATE INDEX IF NOT EXISTS idx_alocacoes_cidade
    ON alocacoes(cidade);

    CREATE INDEX IF NOT EXISTS idx_alocacoes_dia
    ON alocacoes(dia_da_semana);

    CREATE INDEX IF NOT EXISTS idx_alocacoes_horario
    ON alocacoes(horario);
`);

// ============================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================

const inserirConfiguracao = db.prepare(`
    INSERT OR IGNORE INTO configuracoes
    (chave, valor)
    VALUES (?, ?)
`);

const configuracoesPadrao = [
  ["inicio_semana", "segunda"],
  ["unidade_padrao", ""],
  ["exportacao", "xlsx"],
  ["carga_horaria", "40"],
  ["intervalo", "15"],
  ["distancia", "20"],
  ["prioridade_disciplina", "media"],
  ["alerta_alocacoes", "sim"],
  ["lembrete_aulas", "30"],
  ["mudancas_agenda", "sim"],
  ["relatorios", "sim"],
  ["sessao_automatica", "8"],
  ["2fa", "desativado"],
  ["politica_senha", "forte"],
  ["sessoes_ativas", "permitir"],
];

const inserirConfiguracoes = db.transaction(() => {
  for (const [chave, valor] of configuracoesPadrao) {
    inserirConfiguracao.run(chave, valor);
  }
});

inserirConfiguracoes();

// ============================================================
// FUNÇÃO PARA TESTAR O BANCO
// ============================================================

function testarBanco() {
  const tabelas = db
    .prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
    `,
    )
    .all();

  console.log("Banco SQLite iniciado com sucesso.");
  console.log("Tabelas:");

  tabelas.forEach((tabela) => {
    console.log(`- ${tabela.name}`);
  });
}

// ============================================================
// EXPORTAÇÃO
// ============================================================

module.exports = {
  db,
  testarBanco,
};
