
//DADOS DOS CARDS SUPERIORES

//criar o banco de dados que vai armazenar as informações necessárias

let banco;

async function iniciarBanco() {

    const SQL = await initSqlJs({
        locateFile: file =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });

    banco = new SQL.Database();

    criarTabelas();

    inserirDados();

    atualizarDashboard();
}

iniciarBanco();

function criarTabelas(){

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
        edital TEXT,
        dia_da_semana TEXT,
        horario TIME,
        turma TEXT, 
        cronograma TEXT,
        assistente_administrativo TEXT,
        periodo TEXT
        );
        `);
}

function inserirDados(){
    banco.run(`
        INSERT INTO dashboard
        (professores_disponiveis, professores_alocados, turmas, alocacoes_pendentes)

        VALUES 
        (130, 350, 256, 24);
    `);

    banco.run(`
        INSERT INTO professores
        (cidade, edital, dia_da_semana, horario, turma, cronograma, assistente_administrativo, periodo)
        
        VALUES
        ('arapiraca','sem informação', 'quarta', '12:00', '2026.38.457',  )
        `)
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

