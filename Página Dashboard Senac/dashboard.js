//DADOS DOS CARDS SUPERIORES

//criar o banco de dados que vai armazenar as informações necessárias

console.log("cacildes bixo");
let banco;

async function iniciarBanco() {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
  });

  banco = new SQL.Database();

  criarTabelas();

  inserirDados();

  atualizarDashboard();

  function preencherSelect(select, coluna) {
    const resultado = banco.exec(`
            SELECT DISTINCT ${coluna} FROM professores;
        `);

    for (let i = 0; i < resultado[0].values.length; i++) {
      const valor = resultado[0].values[i][0];

      const option = document.createElement("option");
      option.textContent = valor;

      select.appendChild(option);
    }
  }

  preencherSelect(cidade, "cidade");
  preencherSelect(diaDaSemana, "dia_da_semana");
  preencherSelect(horario, "horario");
  preencherSelect(turma, "turma");
  preencherSelect(assistenteAdm, "assistente_administrativo");
  preencherSelect(periodo, "periodo");
}

iniciarBanco();

function criarTabelas() {
  banco.run(`
        CREATE TABLE IF NOT EXISTS dashboard(
            professores_disponiveis INTEGER,
            professores_alocados INTEGER,
            turmas INTEGER,
            alocacoes_pendentes INTEGER
            );
            `);

  //tabela do filtro
  banco.run(`
                CREATE TABLE IF NOT EXISTS professores (
                    cidade TEXT,
                    dia_da_semana TEXT,
                    horario TIME,
                    turma TEXT, 
                    assistente_administrativo TEXT,
                    periodo TEXT
                    );
                    `);
}

function inserirDados() {
  banco.run(`
                        INSERT INTO dashboard
                        (professores_disponiveis, professores_alocados, turmas, alocacoes_pendentes)
                        
                        VALUES 
                        (130, 350, 256, 24);
                        `);

  banco.run(`
                             INSERT INTO professores
                            (cidade, dia_da_semana, horario, turma, assistente_administrativo, periodo)
        
        VALUES
        ('Arapiraca', 'segunda', '12:00', '2', 'nenhum', 'manha'),        
        ('Palmeira dos índios', 'terça', '13:00', '3', 'nenhum', 'tarde'),
        ('Itapera', 'quarta', '14:00', '4', 'nenhum', 'noite');
        `);
}

function atualizarDashboard() {
  //ação pra selecionar tudo que ta dentro do banco
  const resultado = banco.exec(`
        SELECT * FROM dashboard;
    `);

  // Pra verificar se tem coisas no banco
  if (resultado.length === 0) {
    console.log("Nenhum dado encontrado.");
    return;
  }

  // variável pra pegar a primeira linha da tabela
  const linha = resultado[0].values[0];

  // Atualiza os spans
  document.getElementById("spn-profDisponiveis").textContent = linha[0];
  document.getElementById("spn-profAlocados").textContent = linha[1];
  document.getElementById("spn-turmasAtivas").textContent = linha[2];
  document.getElementById("spn-alocacoesPendentes").textContent = linha[3];
}

//FILTRO DE BUSCA

//fazer as variavéis que a gente vai guardar tudo
const cidade = document.getElementById("selectCidade");
const diaDaSemana = document.getElementById("selectDiaDaSemana");
const horario = document.getElementById("selectHorario");
const turma = document.getElementById("selectTurma");
const assistenteAdm = document.getElementById("selectAssistenteAdm");
const periodo = document.getElementById("selectPeriodo");
const buscarFiltro = document.getElementById("btn_buscar");

//buscar os dados dentro do banco

//colocar esses dados nos ids
