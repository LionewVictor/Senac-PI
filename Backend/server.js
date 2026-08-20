const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { db, testarBanco } = require("./database");

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const app = express();

const PORT = 3000;

const pastaUploads = path.join(__dirname, "uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(
  session({
    secret: "senac-sistema-pedagogico-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

app.use("/uploads", express.static(pastaUploads));

// ============================================================
// UPLOAD
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, pastaUploads);
  },

  filename: (req, file, callback) => {
    const extensao = path.extname(file.originalname);

    const nome = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

    callback(null, nome);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase();

    const permitidas = [".png", ".jpg", ".jpeg", ".xlsx", ".csv"];

    if (permitidas.includes(extensao)) {
      callback(null, true);
    } else {
      callback(new Error("Tipo de arquivo não permitido."));
    }
  },
});

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function respostaErro(res, status, mensagem) {
  return res.status(status).json({
    sucesso: false,
    mensagem,
  });
}

function respostaSucesso(res, mensagem, dados = null) {
  return res.json({
    sucesso: true,
    mensagem,
    dados,
  });
}

function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    return respostaErro(res, 401, "Usuário não autenticado.");
  }

  next();
}

function exigirPedagogico(req, res, next) {
  if (!req.session.usuario) {
    return respostaErro(res, 401, "Usuário não autenticado.");
  }

  if (req.session.usuario.perfil !== "pedagogico") {
    return respostaErro(
      res,
      403,
      "Acesso permitido somente ao setor pedagógico.",
    );
  }

  next();
}

function valorOpcional(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  return valor;
}

// ============================================================
// DISPONIBILIDADE SEMANAL DOS PROFESSORES
// ============================================================

/*
 * Guarda o estado semanal de cada professor por dia e período.
 *
 * Valores possíveis para status:
 * - disponivel
 * - breve
 * - indisponivel
 * - sem_info
 *
 * "agendada" não é gravado aqui: quando existe uma alocação
 * no dia/horário, a aula tem prioridade e é exibida como
 * Aula Agendada nas interfaces.
 */

db.exec(`
    CREATE TABLE IF NOT EXISTS disponibilidades_professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professor_id INTEGER NOT NULL,
        dia_da_semana TEXT NOT NULL,
        periodo TEXT NOT NULL,
        horario_inicio TEXT,
        horario_fim TEXT,
        status TEXT NOT NULL DEFAULT 'sem_info',
        observacao TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (
            professor_id,
            dia_da_semana,
            periodo
        ),

        FOREIGN KEY (professor_id)
            REFERENCES professores(id)
            ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_disponibilidade_professor
        ON disponibilidades_professores(professor_id);
`);

// ============================================================
// ROTA INICIAL
// ============================================================

app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API do Sistema Pedagógico SENAC funcionando!",
  });
});

// ============================================================
// STATUS DA SESSÃO
// ============================================================

app.get("/api/sessao", (req, res) => {
  return respostaSucesso(
    res,
    "Sessão consultada.",
    req.session.usuario || null,
  );
});

// ============================================================
// LOGIN
// ============================================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return respostaErro(res, 400, "E-mail e senha são obrigatórios.");
    }

    const usuario = db
      .prepare(
        `
                    SELECT *
                    FROM usuarios
                    WHERE email = ?
                    AND ativo = 1
                `,
      )
      .get(email.trim().toLowerCase());

    if (!usuario) {
      return respostaErro(res, 401, "E-mail ou senha inválidos.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return respostaErro(res, 401, "E-mail ou senha inválidos.");
    }

    req.session.usuario = {
      id: usuario.id,

      nome: usuario.nome,

      email: usuario.email,

      perfil: usuario.perfil,

      unidade: usuario.unidade,

      cargo: usuario.cargo,
    };

    return respostaSucesso(
      res,
      "Login realizado com sucesso.",
      req.session.usuario,
    );
  } catch (erro) {
    console.error("Erro no login:", erro);

    return respostaErro(res, 500, "Erro interno ao realizar login.");
  }
});

// ============================================================
// LOGOUT
// ============================================================

app.post("/api/logout", (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      return respostaErro(res, 500, "Não foi possível encerrar a sessão.");
    }

    return respostaSucesso(res, "Sessão encerrada.");
  });
});

// ============================================================
// CADASTRO DE USUÁRIO PEDAGÓGICO
// ============================================================

app.post("/api/cadastro", async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone, unidade, cargo } = req.body;

    if (!nome || !email || !senha || !cpf || !telefone || !unidade || !cargo) {
      return respostaErro(res, 400, "Preencha todos os campos obrigatórios.");
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = db
      .prepare(
        `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    OR cpf = ?
                `,
      )
      .get(emailNormalizado, cpf);

    if (usuarioExistente) {
      return respostaErro(
        res,
        409,
        "Já existe um usuário com esse e-mail ou CPF.",
      );
    }

    const senhaValida =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(senha);

    if (!senhaValida) {
      return respostaErro(
        res,
        400,
        "A senha não atende aos requisitos de segurança.",
      );
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const resultado = db
      .prepare(
        `
                    INSERT INTO usuarios (
                        nome,
                        email,
                        senha,
                        cpf,
                        telefone,
                        unidade,
                        cargo,
                        perfil,
                        ativo
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pedagogico', 1)
                `,
      )
      .run(
        nome.trim(),

        emailNormalizado,

        senhaHash,

        cpf.trim(),

        telefone.trim(),

        unidade,

        cargo,
      );

    return respostaSucesso(res, "Cadastro realizado com sucesso.", {
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    return respostaErro(res, 500, "Erro interno ao realizar cadastro.");
  }
});

// ============================================================
// PROFESSORES - LISTAR
// ============================================================

app.get("/api/professores", exigirPedagogico, (req, res) => {
  try {
    const { nome, status, unidade, cidade } = req.query;

    let sql = `
                SELECT
                    p.*,

                    (
                        SELECT
                            GROUP_CONCAT(
                                pa.area,
                                ', '
                            )
                        FROM professor_areas pa
                        WHERE
                            pa.professor_id = p.id
                    ) AS areas

                FROM professores p
                WHERE 1 = 1
            `;

    const valores = [];

    if (nome) {
      sql += `
                    AND p.nome LIKE ?
                `;

      valores.push(`%${nome}%`);
    }

    if (status) {
      sql += `
                    AND p.status = ?
                `;

      valores.push(status);
    }

    if (unidade) {
      sql += `
                    AND p.unidade_vinculo = ?
                `;

      valores.push(unidade);
    }

    if (cidade) {
      sql += `
                    AND EXISTS (
                        SELECT 1
                        FROM alocacoes a
                        WHERE
                            a.professor_id = p.id
                            AND a.cidade = ?
                    )
                `;

      valores.push(cidade);
    }

    sql += `
                ORDER BY p.nome
            `;

    const professores = db.prepare(sql).all(...valores);

    return respostaSucesso(res, "Professores encontrados.", professores);
  } catch (erro) {
    console.error("Erro ao listar professores:", erro);

    return respostaErro(res, 500, "Erro ao consultar professores.");
  }
});

// ============================================================
// PROFESSOR - BUSCAR POR ID
// ============================================================

app.get("/api/professores/:id", exigirPedagogico, (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return respostaErro(res, 400, "ID de professor inválido.");
    }

    const professor = db
      .prepare(
        `
                    SELECT *
                    FROM professores
                    WHERE id = ?
                `,
      )
      .get(id);

    if (!professor) {
      return respostaErro(res, 404, "Professor não encontrado.");
    }

    const areas = db
      .prepare(
        `
                    SELECT
                        id,
                        area
                    FROM professor_areas
                    WHERE professor_id = ?
                    ORDER BY area
                `,
      )
      .all(id);

    const alocacoes = db
      .prepare(
        `
                    SELECT *
                    FROM alocacoes
                    WHERE professor_id = ?
                    ORDER BY dia_da_semana, horario
                `,
      )
      .all(id);

    return respostaSucesso(res, "Professor encontrado.", {
      professor,
      areas,
      alocacoes,
    });
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao buscar professor.");
  }
});

// ============================================================
// PROFESSOR - CADASTRAR
// ============================================================

app.post(
  "/api/professores",
  exigirPedagogico,
  upload.single("foto"),
  (req, res) => {
    try {
      const dados = req.body;

      if (!dados.nome_completo) {
        return respostaErro(res, 400, "Nome completo é obrigatório.");
      }

      if (!dados.email) {
        return respostaErro(res, 400, "E-mail é obrigatório.");
      }

      const professorExistente = dados.cpf
        ? db
            .prepare(
              `
                        SELECT id
                        FROM professores
                        WHERE cpf = ?
                    `,
            )
            .get(dados.cpf)
        : null;

      if (professorExistente) {
        return respostaErro(
          res,
          409,
          "Já existe um professor cadastrado com esse CPF.",
        );
      }

      const foto = req.file ? `/uploads/${req.file.filename}` : null;

      const inserirProfessor = db.prepare(`
                    INSERT INTO professores (
                        nome,
                        nome_social,
                        data_nascimento,
                        genero,
                        cpf,
                        email,
                        estado_civil,
                        telefone,
                        status,
                        unidade_vinculo,
                        tipo_vinculo,
                        data_admissao,
                        area,
                        horas_contratadas,
                        observacoes,
                        foto
                    )
                    VALUES (
                        @nome,
                        @nome_social,
                        @data_nascimento,
                        @genero,
                        @cpf,
                        @email,
                        @estado_civil,
                        @telefone,
                        @status,
                        @unidade_vinculo,
                        @tipo_vinculo,
                        @data_admissao,
                        @area,
                        @horas_contratadas,
                        @observacoes,
                        @foto
                    )
                `);

      const resultado = inserirProfessor.run({
        nome: dados.nome_completo.trim(),

        nome_social: valorOpcional(dados.nome_social),

        data_nascimento: valorOpcional(dados.data_nascimento),

        genero: valorOpcional(dados.genero),

        cpf: valorOpcional(dados.cpf),

        email: dados.email.trim().toLowerCase(),

        estado_civil: valorOpcional(dados.estado_civil),

        telefone: valorOpcional(dados.telefone),

        status: dados.status || "disponivel",

        unidade_vinculo: valorOpcional(dados.unidade_vinculo),

        tipo_vinculo: valorOpcional(dados.tipo_vinculo),

        data_admissao: valorOpcional(dados.data_admissao),

        area: valorOpcional(dados.area),

        horas_contratadas: Number(dados.horas_contratadas) || 40,

        observacoes: valorOpcional(dados.observacoes),

        foto,
      });

      const professorId = resultado.lastInsertRowid;

      // ====================================================
      // SALVAR ÁREAS DE ATUAÇÃO
      // ====================================================

      let areas = [];

      if (dados.areas_atuacao) {
        try {
          areas = JSON.parse(dados.areas_atuacao);
        } catch (erro) {
          console.error("Erro ao interpretar áreas:", erro);

          areas = [];
        }
      }

      const inserirArea = db.prepare(`
                    INSERT INTO professor_areas (
                        professor_id,
                        area
                    )
                    VALUES (?, ?)
                `);

      const salvarAreas = db.transaction((listaAreas) => {
        for (const area of listaAreas) {
          if (typeof area === "string" && area.trim() !== "") {
            inserirArea.run(professorId, area.trim());
          }
        }
      });

      salvarAreas(areas);

      return respostaSucesso(res, "Professor cadastrado com sucesso.", {
        id: professorId,

        areas,
      });
    } catch (erro) {
      console.error("Erro ao cadastrar professor:", erro);

      return respostaErro(res, 500, "Erro ao cadastrar professor.");
    }
  },
);

// ============================================================
// PROFESSOR - ATUALIZAR
// ============================================================

app.put(
  "/api/professores/:id",
  exigirPedagogico,
  upload.single("foto"),
  (req, res) => {
    try {
      const id = Number(req.params.id);

      const professor = db
        .prepare(
          `
                    SELECT *
                    FROM professores
                    WHERE id = ?
                `,
        )
        .get(id);

      if (!professor) {
        return respostaErro(res, 404, "Professor não encontrado.");
      }

      const dados = req.body;

      const foto = req.file ? `/uploads/${req.file.filename}` : professor.foto;

      db.prepare(
        `
                UPDATE professores
                SET
                    nome = ?,
                    nome_social = ?,
                    data_nascimento = ?,
                    genero = ?,
                    cpf = ?,
                    email = ?,
                    estado_civil = ?,
                    telefone = ?,
                    status = ?,
                    unidade_vinculo = ?,
                    tipo_vinculo = ?,
                    data_admissao = ?,
                    area = ?,
                    horas_contratadas = ?,
                    observacoes = ?,
                    foto = ?,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
      ).run(
        dados.nome_completo ?? professor.nome,

        valorOpcional(dados.nome_social),

        valorOpcional(dados.data_nascimento),

        valorOpcional(dados.genero),

        valorOpcional(dados.cpf),

        dados.email ?? professor.email,

        valorOpcional(dados.estado_civil),

        valorOpcional(dados.telefone),

        dados.status ?? professor.status,

        valorOpcional(dados.unidade_vinculo),

        valorOpcional(dados.tipo_vinculo),

        valorOpcional(dados.data_admissao),

        valorOpcional(dados.area),

        Number(dados.horas_contratadas) || professor.horas_contratadas || 40,

        valorOpcional(dados.observacoes),

        foto,

        id,
      );

      // ====================================================
      // ATUALIZAR ÁREAS
      // ====================================================

      if (dados.areas_atuacao) {
        let areas = [];

        try {
          areas = JSON.parse(dados.areas_atuacao);
        } catch (erro) {
          console.error("Erro ao interpretar áreas:", erro);
        }

        db.prepare(
          `
                    DELETE FROM professor_areas
                    WHERE professor_id = ?
                `,
        ).run(id);

        const inserirArea = db.prepare(`
                        INSERT INTO professor_areas (
                            professor_id,
                            area
                        )
                        VALUES (?, ?)
                    `);

        const atualizarAreas = db.transaction((listaAreas) => {
          for (const area of listaAreas) {
            if (typeof area === "string" && area.trim() !== "") {
              inserirArea.run(id, area.trim());
            }
          }
        });

        atualizarAreas(areas);
      }

      return respostaSucesso(res, "Professor atualizado com sucesso.");
    } catch (erro) {
      console.error(erro);

      return respostaErro(res, 500, "Erro ao atualizar professor.");
    }
  },
);

// ============================================================
// PROFESSOR - EXCLUIR
// ============================================================

app.delete("/api/professores/:id", exigirPedagogico, (req, res) => {
  try {
    const id = Number(req.params.id);

    const resultado = db
      .prepare(
        `
                    DELETE FROM professores
                    WHERE id = ?
                `,
      )
      .run(id);

    if (resultado.changes === 0) {
      return respostaErro(res, 404, "Professor não encontrado.");
    }

    return respostaSucesso(res, "Professor removido com sucesso.");
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao remover professor.");
  }
});

// ============================================================
// ALOCAÇÕES - LISTAR
// ============================================================

app.get("/api/alocacoes", exigirPedagogico, (req, res) => {
  try {
    const {
      professor_id,
      cidade,
      turma,
      dia_da_semana,
      horario,
      periodo,
      status,
    } = req.query;

    let sql = `
                SELECT
                    a.*,
                    p.nome AS professor_nome
                FROM alocacoes a
                LEFT JOIN professores p
                    ON p.id = a.professor_id
                WHERE 1 = 1
            `;

    const valores = [];

    if (professor_id) {
      sql += `
                    AND a.professor_id = ?
                `;

      valores.push(Number(professor_id));
    }

    if (cidade) {
      sql += `
                    AND a.cidade = ?
                `;

      valores.push(cidade);
    }

    if (turma) {
      sql += `
                    AND a.turma = ?
                `;

      valores.push(turma);
    }

    if (dia_da_semana) {
      sql += `
                    AND a.dia_da_semana = ?
                `;

      valores.push(dia_da_semana);
    }

    if (horario) {
      sql += `
                    AND a.horario = ?
                `;

      valores.push(horario);
    }

    if (periodo) {
      sql += `
                    AND a.periodo = ?
                `;

      valores.push(periodo);
    }

    if (status) {
      sql += `
                    AND a.status = ?
                `;

      valores.push(status);
    }

    sql += `
                ORDER BY
                    a.nome_professor,
                    a.dia_da_semana,
                    a.horario
            `;

    const alocacoes = db.prepare(sql).all(...valores);

    return respostaSucesso(res, "Alocações encontradas.", alocacoes);
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao consultar alocações.");
  }
});

// ============================================================
// ALOCAÇÃO - CADASTRAR
// ============================================================

app.post("/api/alocacoes", exigirPedagogico, (req, res) => {
  try {
    const dados = req.body;

    if (!dados.professor_id) {
      return respostaErro(res, 400, "O professor é obrigatório.");
    }

    const professor = db
      .prepare(
        `
                    SELECT
                        id,
                        nome
                    FROM professores
                    WHERE id = ?
                `,
      )
      .get(Number(dados.professor_id));

    if (!professor) {
      return respostaErro(res, 404, "Professor não encontrado.");
    }

    const resultado = db
      .prepare(
        `
                    INSERT INTO alocacoes (
                        professor_id,
                        nome_professor,
                        instrutor,
                        cidade,
                        edital,
                        dia_da_semana,
                        horario,
                        codigo,
                        turma,
                        curso,
                        cronograma,
                        assistente_administrativo,
                        periodo,
                        pratica_pi,
                        insumos,
                        material_ptd,
                        avaliacao,
                        feedback,
                        status
                    )
                    VALUES (
                        @professor_id,
                        @nome_professor,
                        @instrutor,
                        @cidade,
                        @edital,
                        @dia_da_semana,
                        @horario,
                        @codigo,
                        @turma,
                        @curso,
                        @cronograma,
                        @assistente_administrativo,
                        @periodo,
                        @pratica_pi,
                        @insumos,
                        @material_ptd,
                        @avaliacao,
                        @feedback,
                        @status
                    )
                `,
      )
      .run({
        professor_id: Number(dados.professor_id),

        nome_professor: professor.nome,

        instrutor: valorOpcional(dados.instrutor),

        cidade: valorOpcional(dados.cidade),

        edital: valorOpcional(dados.edital),

        dia_da_semana: valorOpcional(dados.dia_da_semana),

        horario: valorOpcional(dados.horario),

        codigo: valorOpcional(dados.codigo),

        turma: valorOpcional(dados.turma),

        curso: valorOpcional(dados.curso),

        cronograma: valorOpcional(dados.cronograma),

        assistente_administrativo: valorOpcional(
          dados.assistente_administrativo,
        ),

        periodo: valorOpcional(dados.periodo),

        pratica_pi: valorOpcional(dados.pratica_pi),

        insumos: valorOpcional(dados.insumos),

        material_ptd: valorOpcional(dados.material_ptd),

        avaliacao: valorOpcional(dados.avaliacao),

        feedback: valorOpcional(dados.feedback),

        status: dados.status || "pendente",
      });

    return respostaSucesso(res, "Alocação criada com sucesso.", {
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao criar alocação.");
  }
});

// ============================================================
// ALOCAÇÃO - ATUALIZAR
// ============================================================

app.put("/api/alocacoes/:id", exigirPedagogico, (req, res) => {
  try {
    const id = Number(req.params.id);

    const alocacao = db
      .prepare(
        `
                    SELECT *
                    FROM alocacoes
                    WHERE id = ?
                `,
      )
      .get(id);

    if (!alocacao) {
      return respostaErro(res, 404, "Alocação não encontrada.");
    }

    const dados = req.body;

    let nomeProfessor = alocacao.nome_professor;

    if (dados.professor_id) {
      const professor = db
        .prepare(
          `
                        SELECT nome
                        FROM professores
                        WHERE id = ?
                    `,
        )
        .get(Number(dados.professor_id));

      if (!professor) {
        return respostaErro(res, 404, "Professor informado não existe.");
      }

      nomeProfessor = professor.nome;
    }

    db.prepare(
      `
                UPDATE alocacoes
                SET
                    professor_id = ?,
                    nome_professor = ?,
                    instrutor = ?,
                    cidade = ?,
                    edital = ?,
                    dia_da_semana = ?,
                    horario = ?,
                    codigo = ?,
                    turma = ?,
                    curso = ?,
                    cronograma = ?,
                    assistente_administrativo = ?,
                    periodo = ?,
                    pratica_pi = ?,
                    insumos = ?,
                    material_ptd = ?,
                    avaliacao = ?,
                    feedback = ?,
                    status = ?,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
    ).run(
      dados.professor_id ? Number(dados.professor_id) : alocacao.professor_id,

      nomeProfessor,

      valorOpcional(dados.instrutor),

      valorOpcional(dados.cidade),

      valorOpcional(dados.edital),

      valorOpcional(dados.dia_da_semana),

      valorOpcional(dados.horario),

      valorOpcional(dados.codigo),

      valorOpcional(dados.turma),

      valorOpcional(dados.curso),

      valorOpcional(dados.cronograma),

      valorOpcional(dados.assistente_administrativo),

      valorOpcional(dados.periodo),

      valorOpcional(dados.pratica_pi),

      valorOpcional(dados.insumos),

      valorOpcional(dados.material_ptd),

      valorOpcional(dados.avaliacao),

      valorOpcional(dados.feedback),

      dados.status || alocacao.status,

      id,
    );

    return respostaSucesso(res, "Alocação atualizada com sucesso.");
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao atualizar alocação.");
  }
});

// ============================================================
// ALOCAÇÃO - EXCLUIR
// ============================================================

app.delete("/api/alocacoes/:id", exigirPedagogico, (req, res) => {
  try {
    const id = Number(req.params.id);

    const resultado = db
      .prepare(
        `
                    DELETE FROM alocacoes
                    WHERE id = ?
                `,
      )
      .run(id);

    if (resultado.changes === 0) {
      return respostaErro(res, 404, "Alocação não encontrada.");
    }

    return respostaSucesso(res, "Alocação removida com sucesso.");
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao remover alocação.");
  }
});

// ============================================================
// DISPONIBILIDADE - CONSTANTES
// ============================================================

const DIAS_DISPONIBILIDADE = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const PERIODOS_DISPONIBILIDADE = ["manha", "tarde", "noite"];

const STATUS_DISPONIBILIDADE = [
  "disponivel",
  "breve",
  "indisponivel",
  "sem_info",
];

// ============================================================
// DISPONIBILIDADE - LISTAR POR PROFESSOR
// ============================================================

app.get(
  "/api/professores/:id/disponibilidade",
  exigirPedagogico,
  (req, res) => {
    try {
      const professorId = Number(req.params.id);

      if (!Number.isInteger(professorId)) {
        return respostaErro(res, 400, "ID de professor inválido.");
      }

      const professor = db
        .prepare(
          `
            SELECT id, nome
            FROM professores
            WHERE id = ?
          `,
        )
        .get(professorId);

      if (!professor) {
        return respostaErro(res, 404, "Professor não encontrado.");
      }

      const disponibilidades = db
        .prepare(
          `
            SELECT
              id,
              professor_id,
              dia_da_semana,
              periodo,
              horario_inicio,
              horario_fim,
              status,
              observacao,
              atualizado_em
            FROM disponibilidades_professores
            WHERE professor_id = ?
            ORDER BY
              CASE dia_da_semana
                WHEN 'Segunda' THEN 1
                WHEN 'Terça' THEN 2
                WHEN 'Quarta' THEN 3
                WHEN 'Quinta' THEN 4
                WHEN 'Sexta' THEN 5
                WHEN 'Sábado' THEN 6
                WHEN 'Domingo' THEN 7
                ELSE 8
              END,
              CASE periodo
                WHEN 'manha' THEN 1
                WHEN 'tarde' THEN 2
                WHEN 'noite' THEN 3
                ELSE 4
              END
          `,
        )
        .all(professorId);

      return respostaSucesso(res, "Disponibilidade carregada.", {
        professor,
        disponibilidades,
      });
    } catch (erro) {
      console.error("Erro ao listar disponibilidade:", erro);

      return respostaErro(
        res,
        500,
        "Erro ao consultar disponibilidade do professor.",
      );
    }
  },
);

// ============================================================
// DISPONIBILIDADE - SALVAR GRADE SEMANAL
// ============================================================

app.put(
  "/api/professores/:id/disponibilidade",
  exigirPedagogico,
  (req, res) => {
    try {
      const professorId = Number(req.params.id);

      if (!Number.isInteger(professorId)) {
        return respostaErro(res, 400, "ID de professor inválido.");
      }

      const professor = db
        .prepare(
          `
            SELECT id, nome
            FROM professores
            WHERE id = ?
          `,
        )
        .get(professorId);

      if (!professor) {
        return respostaErro(res, 404, "Professor não encontrado.");
      }

      if (!Array.isArray(req.body.disponibilidades)) {
        return respostaErro(res, 400, "Envie a lista de disponibilidades.");
      }

      const itens = req.body.disponibilidades;

      const salvar = db.transaction((lista) => {
        const inserir = db.prepare(`
          INSERT INTO disponibilidades_professores (
            professor_id,
            dia_da_semana,
            periodo,
            horario_inicio,
            horario_fim,
            status,
            observacao,
            atualizado_em
          )
          VALUES (
            @professor_id,
            @dia_da_semana,
            @periodo,
            @horario_inicio,
            @horario_fim,
            @status,
            @observacao,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (professor_id, dia_da_semana, periodo)
          DO UPDATE SET
            horario_inicio = excluded.horario_inicio,
            horario_fim = excluded.horario_fim,
            status = excluded.status,
            observacao = excluded.observacao,
            atualizado_em = CURRENT_TIMESTAMP
        `);

        for (const item of lista) {
          const dia = String(item.dia_da_semana || "").trim();
          const periodo = String(item.periodo || "")
            .trim()
            .toLowerCase();
          const status = String(item.status || "sem_info")
            .trim()
            .toLowerCase();

          if (!DIAS_DISPONIBILIDADE.includes(dia)) {
            throw new Error(`Dia da semana inválido: ${dia}`);
          }

          if (!PERIODOS_DISPONIBILIDADE.includes(periodo)) {
            throw new Error(`Período inválido: ${periodo}`);
          }

          if (!STATUS_DISPONIBILIDADE.includes(status)) {
            throw new Error(`Status de disponibilidade inválido: ${status}`);
          }

          inserir.run({
            professor_id: professorId,
            dia_da_semana: dia,
            periodo,
            horario_inicio: valorOpcional(item.horario_inicio),
            horario_fim: valorOpcional(item.horario_fim),
            status,
            observacao: valorOpcional(item.observacao),
          });
        }
      });

      salvar(itens);

      return respostaSucesso(
        res,
        "Disponibilidade semanal salva com sucesso.",
        {
          professor_id: professorId,
          total: itens.length,
        },
      );
    } catch (erro) {
      console.error("Erro ao salvar disponibilidade:", erro);

      return respostaErro(
        res,
        400,
        erro.message || "Erro ao salvar disponibilidade.",
      );
    }
  },
);

// ============================================================
// DISPONIBILIDADE - REMOVER GRADE
// ============================================================

app.delete(
  "/api/professores/:id/disponibilidade",
  exigirPedagogico,
  (req, res) => {
    try {
      const professorId = Number(req.params.id);

      if (!Number.isInteger(professorId)) {
        return respostaErro(res, 400, "ID de professor inválido.");
      }

      const resultado = db
        .prepare(
          `
            DELETE FROM disponibilidades_professores
            WHERE professor_id = ?
          `,
        )
        .run(professorId);

      return respostaSucesso(res, "Disponibilidade removida com sucesso.", {
        removidos: resultado.changes,
      });
    } catch (erro) {
      console.error("Erro ao remover disponibilidade:", erro);

      return respostaErro(res, 500, "Erro ao remover disponibilidade.");
    }
  },
);

// ============================================================
// AGENDA
// ============================================================

app.get("/api/agenda/:professorId", exigirPedagogico, (req, res) => {
  try {
    const professorId = Number(req.params.professorId);

    const professor = db
      .prepare(
        `
                    SELECT
                        id,
                        nome,
                        area,
                        status,
                        foto,
                        horas_contratadas
                    FROM professores
                    WHERE id = ?
                `,
      )
      .get(professorId);

    if (!professor) {
      return respostaErro(res, 404, "Professor não encontrado.");
    }

    const filtros = {
      periodo: req.query.periodo || null,

      unidade: req.query.unidade || null,

      eixo: req.query.eixo || null,
    };

    let sql = `
                SELECT
                    *
                FROM alocacoes
                WHERE professor_id = ?
            `;

    const valores = [professorId];

    if (filtros.unidade) {
      sql += `
                    AND cidade = ?
                `;

      valores.push(filtros.unidade);
    }

    if (filtros.eixo) {
      sql += `
                    AND curso = ?
                `;

      valores.push(filtros.eixo);
    }

    sql += `
                ORDER BY
                    dia_da_semana,
                    horario
            `;

    const alocacoes = db.prepare(sql).all(...valores);

    const disponibilidades = db
      .prepare(
        `
          SELECT
            id,
            professor_id,
            dia_da_semana,
            periodo,
            horario_inicio,
            horario_fim,
            status,
            observacao,
            atualizado_em
          FROM disponibilidades_professores
          WHERE professor_id = ?
        `,
      )
      .all(professorId);

    return respostaSucesso(res, "Agenda encontrada.", {
      professor,
      filtros,
      alocacoes,
      disponibilidades,
    });
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao consultar agenda.");
  }
});

// ============================================================
// CONFIGURAÇÕES - LISTAR
// ============================================================

app.get("/api/configuracoes", exigirPedagogico, (req, res) => {
  try {
    const configuracoes = db
      .prepare(
        `
                    SELECT
                        chave,
                        valor
                    FROM configuracoes
                    ORDER BY chave
                `,
      )
      .all();

    const objeto = {};

    configuracoes.forEach((item) => {
      objeto[item.chave] = item.valor;
    });

    return respostaSucesso(res, "Configurações carregadas.", objeto);
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao carregar configurações.");
  }
});

// ============================================================
// CONFIGURAÇÕES - ATUALIZAR
// ============================================================

app.put("/api/configuracoes", exigirPedagogico, (req, res) => {
  try {
    const dados = req.body;

    const atualizar = db.prepare(`
                    INSERT INTO configuracoes (
                        chave,
                        valor,
                        atualizado_em
                    )
                    VALUES (?, ?, CURRENT_TIMESTAMP)

                    ON CONFLICT(chave)
                    DO UPDATE SET
                        valor = excluded.valor,
                        atualizado_em = CURRENT_TIMESTAMP
                `);

    const transacao = db.transaction((objeto) => {
      for (const [chave, valor] of Object.entries(objeto)) {
        atualizar.run(chave, String(valor ?? ""));
      }
    });

    transacao(dados);

    return respostaSucesso(res, "Configurações atualizadas.");
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao atualizar configurações.");
  }
});

// ============================================================
// IMPORTAÇÃO DE PLANILHA
// ============================================================

app.post(
  "/api/importacao",
  exigirPedagogico,
  upload.single("arquivo"),
  (req, res) => {
    try {
      if (!req.file) {
        return respostaErro(res, 400, "Nenhum arquivo foi enviado.");
      }

      const tipo = req.body.tipo || "completo";

      /*
       * Nesta etapa o arquivo é apenas recebido e salvo.
       * A leitura do XLSX/CSV e a gravação dos registros
       * serão implementadas na próxima etapa.
       */

      return respostaSucesso(res, "Planilha recebida com sucesso.", {
        arquivo: req.file.filename,

        nome_original: req.file.originalname,

        tipo,

        caminho: `/uploads/${req.file.filename}`,
      });
    } catch (erro) {
      console.error(erro);

      return respostaErro(res, 500, "Erro ao receber a planilha.");
    }
  },
);

// ============================================================
// DASHBOARD
// ============================================================

app.get("/api/dashboard", exigirPedagogico, (req, res) => {
  try {
    const professoresDisponiveis = db
      .prepare(
        `
                    SELECT COUNT(*) AS total
                    FROM professores
                    WHERE status = 'disponivel'
                `,
      )
      .get().total;

    const professoresAlocados = db
      .prepare(
        `
                    SELECT COUNT(DISTINCT professor_id) AS total
                    FROM alocacoes
                    WHERE status = 'ativa'
                `,
      )
      .get().total;

    const turmasAtivas = db
      .prepare(
        `
                    SELECT COUNT(DISTINCT turma) AS total
                    FROM alocacoes
                    WHERE turma IS NOT NULL
                    AND turma <> ''
                `,
      )
      .get().total;

    const alocacoesPendentes = db
      .prepare(
        `
                    SELECT COUNT(*) AS total
                    FROM alocacoes
                    WHERE status = 'pendente'
                `,
      )
      .get().total;

    return respostaSucesso(res, "Dashboard carregado.", {
      professores_disponiveis: professoresDisponiveis,

      professores_alocados: professoresAlocados,

      turmas_ativas: turmasAtivas,

      alocacoes_pendentes: alocacoesPendentes,
    });
  } catch (erro) {
    console.error(erro);

    return respostaErro(res, 500, "Erro ao carregar dashboard.");
  }
});

// ============================================================
// ERROS DE UPLOAD / MIDDLEWARE
// ============================================================

app.use((erro, req, res, next) => {
  if (erro instanceof multer.MulterError) {
    if (erro.code === "LIMIT_FILE_SIZE") {
      return respostaErro(res, 400, "O arquivo excede o limite de 5MB.");
    }
  }

  if (erro) {
    console.error(erro);

    return respostaErro(
      res,
      400,
      erro.message || "Erro ao processar a requisição.",
    );
  }

  next();
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");

  console.log(" SENAC - SISTEMA PEDAGÓGICO");

  console.log("==========================================");

  console.log(`Servidor: http://localhost:${PORT}`);

  console.log(`API: http://localhost:${PORT}/api`);

  console.log("==========================================");

  testarBanco();

  console.log("");
});
