// =====================================================
// BANCO DE DADOS
// =====================================================

let banco;


// Inicialização do banco
async function iniciarBanco() {

    const SQL = await initSqlJs({
        locateFile: (file) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
    });

    banco = new SQL.Database();

    criarTabelas();
    inserirDados();
    atualizarDashboard();

    // Preenche os filtros
    preencherSelect(cidade, "cidade");
    preencherSelect(diaDaSemana, "dia_da_semana");
    preencherSelect(horario, "horario");
    preencherSelect(turma, "turma");
    preencherSelect(assistenteAdm, "assistente_administrativo");
    preencherSelect(periodo, "periodo");

    // Mostra inicialmente todos os professores
    buscarProfessores();
}


// =====================================================
// CRIAÇÃO DAS TABELAS
// =====================================================

function criarTabelas() {

    banco.run(`
        CREATE TABLE IF NOT EXISTS dashboard (
            professores_disponiveis INTEGER,
            professores_alocados INTEGER,
            turmas INTEGER,
            alocacoes_pendentes INTEGER
        );
    `);


    banco.run(`
        CREATE TABLE IF NOT EXISTS professores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            area TEXT,
            status TEXT,
            horas INTEGER,
            cidade TEXT,
            dia_da_semana TEXT,
            horario TEXT,
            turma TEXT,
            assistente_administrativo TEXT,
            periodo TEXT
        );
    `);
}


// =====================================================
// INSERÇÃO DOS DADOS
// =====================================================

function inserirDados() {

    banco.run(`
        INSERT INTO dashboard (
            professores_disponiveis,
            professores_alocados,
            turmas,
            alocacoes_pendentes
        )
        VALUES (
            130,
            350,
            256,
            24
        );
    `);


    banco.run(`
        INSERT INTO professores (
            nome,
            area,
            status,
            horas,
            cidade,
            dia_da_semana,
            horario,
            turma,
            assistente_administrativo,
            periodo
        )
        VALUES

        (
            'João Silva',
            'Gestão de Negócios',
            'disponivel',
            16,
            'Arapiraca',
            'Segunda',
            '12:00',
            '2',
            'nenhum',
            'manha'
        ),

        (
            'Maria Santos',
            'Informática',
            'breve',
            16,
            'Palmeira dos Índios',
            'Terça',
            '13:00',
            '3',
            'nenhum',
            'tarde'
        ),

        (
            'Carlos Souza',
            'Saúde',
            'indisponivel',
            16,
            'Itapera',
            'Quarta',
            '14:00',
            '4',
            'nenhum',
            'noite'
        ),

        (
            'Ana Oliveira',
            'Turismo',
            'disponivel',
            20,
            'Arapiraca',
            'Quinta',
            '15:00',
            '5',
            'nenhum',
            'tarde'
        ),

        (
            'Pedro Santos',
            'Beleza',
            'breve',
            12,
            'Arapiraca',
            'Sexta',
            '16:00',
            '6',
            'nenhum',
            'noite'
        );
    `);
}


// =====================================================
// ATUALIZAÇÃO DOS CARDS SUPERIORES
// =====================================================

function atualizarDashboard() {

    const resultado = banco.exec(`
        SELECT *
        FROM dashboard;
    `);


    if (resultado.length === 0) {

        console.log("Nenhum dado encontrado no dashboard.");

        return;
    }


    const linha = resultado[0].values[0];


    document.getElementById("spn-profDisponiveis").textContent = linha[0];

    document.getElementById("spn-profAlocados").textContent = linha[1];

    document.getElementById("spn-turmasAtivas").textContent = linha[2];

    document.getElementById("spn-alocacoesPendentes").textContent = linha[3];
}


// =====================================================
// ELEMENTOS DOS FILTROS
// =====================================================

const cidade = document.getElementById("selectCidade");

const diaDaSemana =
    document.getElementById("selectDiaDaSemana");

const horario =
    document.getElementById("selectHorario");

const turma =
    document.getElementById("selectTurma");

const assistenteAdm =
    document.getElementById("selectAssistenteAdm");

const periodo =
    document.getElementById("selectPeriodo");

const btnBuscar =
    document.getElementById("btn_buscar");


// =====================================================
// PREENCHER SELECTS
// =====================================================

function preencherSelect(select, coluna) {

    const resultado = banco.exec(`
        SELECT DISTINCT ${coluna}
        FROM professores
        WHERE ${coluna} IS NOT NULL
        ORDER BY ${coluna};
    `);


    if (resultado.length === 0) {
        return;
    }


    resultado[0].values.forEach((linha) => {

        const valor = linha[0];

        const option = document.createElement("option");

        option.value = valor;
        option.textContent = valor;

        select.appendChild(option);
    });
}


// =====================================================
// BUSCA
// =====================================================

btnBuscar.addEventListener("click", buscarProfessores);


function buscarProfessores(event) {

    // Evita o formulário recarregar a página
    if (event) {
        event.preventDefault();
    }


    const cidadeSelecionada = cidade.value;

    const diaSelecionado = diaDaSemana.value;

    const horarioSelecionado = horario.value;

    const turmaSelecionada = turma.value;

    const assistenteSelecionado = assistenteAdm.value;

    const periodoSelecionado = periodo.value;


    const filtros = [];

    const valores = [];


    if (cidadeSelecionada) {

        filtros.push("cidade = ?");

        valores.push(cidadeSelecionada);
    }


    if (diaSelecionado) {

        filtros.push("dia_da_semana = ?");

        valores.push(diaSelecionado);
    }


    if (horarioSelecionado) {

        filtros.push("horario = ?");

        valores.push(horarioSelecionado);
    }


    if (turmaSelecionada) {

        filtros.push("turma = ?");

        valores.push(turmaSelecionada);
    }


    if (assistenteSelecionado) {

        filtros.push("assistente_administrativo = ?");

        valores.push(assistenteSelecionado);
    }


    if (periodoSelecionado) {

        filtros.push("periodo = ?");

        valores.push(periodoSelecionado);
    }


    let sql = `
        SELECT *
        FROM professores
    `;


    if (filtros.length > 0) {

        sql += `
            WHERE ${filtros.join(" AND ")}
        `;
    }


    sql += `
        ORDER BY nome;
    `;


    const resultado = banco.exec(sql, valores);


    mostrarResultados(resultado);
}


// =====================================================
// MOSTRAR RESULTADOS
// =====================================================

function mostrarResultados(resultado) {

    const tabela =
        document.getElementById("resultadosBusca");


    tabela.innerHTML = "";


    // Nenhum resultado
    if (
        resultado.length === 0 ||
        resultado[0].values.length === 0
    ) {

        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="sem-resultados">
                    <i class="fa-solid fa-magnifying-glass"></i>

                    <strong>Nenhum professor encontrado</strong>

                    <span>
                        Tente alterar os filtros da busca.
                    </span>
                </td>
            </tr>
        `;


        atualizarCronograma([]);

        atualizarHoras([]);

        return;
    }


    const dados = resultado[0].values;


    dados.forEach((linha) => {

        // Índices corretos da tabela
        const id = linha[0];

        const nome = linha[1];

        const area = linha[2];

        const status = linha[3];

        const horas = linha[4];


        // Texto bonito para o status
        const statusTexto = formatarStatus(status);


        const tr = document.createElement("tr");


        tr.innerHTML = `
            <td>
                <div class="professor-info">

                    <div class="professor-avatar">
                        ${nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <strong>${nome}</strong>

                        <small>
                            ${linha[5]}
                        </small>
                    </div>

                </div>
            </td>

            <td>
                <span class="area-professor">
                    ${area}
                </span>
            </td>

            <td>
                <span class="status status-${status}">
                    <span class="status-dot"></span>
                    ${statusTexto}
                </span>
            </td>

            <td>
                <strong class="horas-professor">
                    ${horas}h
                </strong>
            </td>

            <td>
                <button
                    class="btn-agenda"
                    onclick="verAgenda(${id})"
                >
                    <i class="fa-regular fa-calendar"></i>
                    Ver Agenda
                </button>
            </td>
        `;


        tabela.appendChild(tr);
    });


    atualizarCronograma(dados);

    atualizarHoras(dados);
}


// =====================================================
// FORMATAÇÃO DO STATUS
// =====================================================

function formatarStatus(status) {

    const statusMap = {

        disponivel: "Disponível",

        breve: "Disponível em breve",

        indisponivel: "Indisponível"
    };


    return statusMap[status] || status;
}


// =====================================================
// CRONOGRAMA
// =====================================================

function atualizarCronograma(dados) {

    const grade = document.querySelector(".grade");

    grade.innerHTML = "";

    if (dados.length === 0) {

        grade.innerHTML = `
            <div class="cronograma-vazio">
                <i class="fa-regular fa-calendar"></i>

                <span>
                    Nenhum horário encontrado.
                </span>
            </div>
        `;

        return;
    }


    const dias = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta"
    ];


    // Cria uma coluna para cada dia
    dias.forEach((dia) => {

        const coluna = document.createElement("div");

        coluna.classList.add("dia-cronograma");

        coluna.innerHTML = `
            <div class="dia-titulo">
                ${dia}
            </div>

            <div
                class="dia-conteudo"
                data-dia="${dia}"
            >
            </div>
        `;

        grade.appendChild(coluna);
    });


    // Coloca cada professor no dia correspondente
    dados.forEach((linha) => {

        const nome = linha[1];

        const dia = linha[6];

        const horario = linha[7];

        const turma = linha[8];


        const coluna =
            document.querySelector(
                `.dia-conteudo[data-dia="${dia}"]`
            );


        if (!coluna) {
            return;
        }


        const evento =
            document.createElement("div");

        evento.classList.add("evento-cronograma");


        evento.innerHTML = `
            <span class="evento-horario">
                ${horario}
            </span>

            <span class="evento-nome">
                ${nome}
            </span>

            <span class="evento-turma">
                Turma ${turma}
            </span>
        `;


        coluna.appendChild(evento);
    });
}


// =====================================================
// RESUMO DE CARGA HORÁRIA
// =====================================================

function atualizarHoras(dados) {

    const cards =
        document.querySelectorAll(".mini-card h3");


    if (cards.length < 4) {
        return;
    }


    if (dados.length === 0) {

        cards[0].textContent = "0h";
        cards[1].textContent = "0h";
        cards[2].textContent = "0h";
        cards[3].textContent = "0%";

        return;
    }


    // Cada professor possui 40h contratadas
    const horasContratadas =
        dados.length * 40;


    let horasAlocadas = 0;


    dados.forEach((linha) => {

        horasAlocadas += Number(linha[4]) || 0;
    });


    const horasLivres =
        Math.max(
            0,
            horasContratadas - horasAlocadas
        );


    const utilizacao =
        Math.round(
            (horasAlocadas / horasContratadas) * 100
        );


    cards[0].textContent =
        `${horasContratadas}h`;

    cards[1].textContent =
        `${horasAlocadas}h`;

    cards[2].textContent =
        `${horasLivres}h`;

    cards[3].textContent =
        `${utilizacao}%`;
}

// =====================================================
// VER AGENDA
// =====================================================

function verAgenda(id) {

    const resultado = banco.exec(`
        SELECT *
        FROM professores
        WHERE id = ${id};
    `);


    if (
        resultado.length === 0 ||
        resultado[0].values.length === 0
    ) {

        console.log("Professor não encontrado.");

        return;
    }


    const professor =
        resultado[0].values[0];


    console.log("Professor:", professor[1]);

    console.log("Área:", professor[2]);

    console.log("Status:", formatarStatus(professor[3]));

    console.log("Horas:", professor[4]);

    console.log("Cidade:", professor[5]);

    console.log("Dia:", professor[6]);

    console.log("Horário:", professor[7]);

    console.log("Turma:", professor[8]);

    console.log(
        "Assistente:",
        professor[9]
    );

    console.log(
        "Período:",
        professor[10]
    );
}


// =====================================================
// INICIAR SISTEMA
// =====================================================

iniciarBanco();