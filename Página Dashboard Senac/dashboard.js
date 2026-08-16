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
        '08:00',
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
        '09:00',
        '3',
        'nenhum',
        'manha'
    ),

    
    (
        'Carlos Souza',
        'Saúde',
        'indisponivel',
        16,
        'Itapera',
        'Quarta',
        '10:00',
        '4',
        'nenhum',
        'manha'
    ),

    
    (
        'Ana Oliveira',
        'Turismo',
        'disponivel',
        20,
        'Arapiraca',
        'Quinta',
        '11:00',
        '5',
        'nenhum',
        'manha'
    ),

    
    (
        'Pedro Santos',
        'Beleza',
        'breve',
        12,
        'Arapiraca',
        'Sexta',
        '12:00',
        '6',
        'nenhum',
        'manha'
    ),

    
    (
        'Lucas Almeida',
        'Administração',
        'disponivel',
        16,
        'Maceió',
        'Segunda',
        '13:00',
        '7',
        'nenhum',
        'tarde'
    ),

    
    (
        'Juliana Costa',
        'Informática',
        'disponivel',
        20,
        'Arapiraca',
        'Terça',
        '14:00',
        '8',
        'nenhum',
        'tarde'
    ),

  
    (
        'Rafael Lima',
        'Gestão de Negócios',
        'breve',
        12,
        'Palmeira dos Índios',
        'Quarta',
        '15:00',
        '9',
        'nenhum',
        'tarde'
    ),

    
    (
        'Beatriz Alves',
        'Saúde',
        'disponivel',
        16,
        'Itapera',
        'Quinta',
        '16:00',
        '10',
        'nenhum',
        'tarde'
    ),

    
    (
        'Gabriel Martins',
        'Turismo',
        'indisponivel',
        20,
        'Arapiraca',
        'Sexta',
        '17:00',
        '11',
        'nenhum',
        'tarde'
    ),

    (
        'Larissa Souza',
        'Beleza',
        'disponivel',
        16,
        'Maceió',
        'Segunda',
        '18:00',
        '12',
        'nenhum',
        'noite'
    ),

    (
        'Felipe Oliveira',
        'Administração',
        'breve',
        12,
        'Arapiraca',
        'Terça',
        '19:00',
        '13',
        'nenhum',
        'noite'
    ),

    
    (
        'Camila Santos',
        'Informática',
        'disponivel',
        20,
        'Palmeira dos Índios',
        'Quarta',
        '20:00',
        '14',
        'nenhum',
        'noite'
    ),

    
    (
        'Bruno Ferreira',
        'Gestão de Negócios',
        'indisponivel',
        16,
        'Itapera',
        'Quinta',
        '21:00',
        '15',
        'nenhum',
        'noite'
    ),

    
    (
        'Amanda Rocha',
        'Saúde',
        'disponivel',
        20,
        'Arapiraca',
        'Sexta',
        '22:00',
        '16',
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

const btnLimparFiltros =
    document.getElementById(
        "btn-limpar-filtros"
    );


btnLimparFiltros.addEventListener(
    "click",
    () => {

        cidade.value = "";

        diaDaSemana.value = "";

        horario.value = "";

        turma.value = "";

        assistenteAdm.value = "";

        periodo.value = "";


        // Volta para todos os professores

        buscarProfessores();


        // Volta o cronograma para o estado inicial

        const nomeUsuario =
            document.getElementById(
                "nomeUsuarioAgenda"
            );

        const areaUsuario =
            document.getElementById(
                "areaUsuarioAgenda"
            );

        const avatar =
            document.getElementById(
                "usuarioAvatar"
            );


        if (nomeUsuario) {

            nomeUsuario.textContent =
                "Usuário";

        }


        if (areaUsuario) {

            areaUsuario.textContent =
                "Selecione um professor";

        }


        if (avatar) {

            avatar.textContent = "U";

        }

    }
);

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
// CRONOGRAMA SEMANAL
// =====================================================

function atualizarCronograma(dados) {

    const grade = document.querySelector(".grade");

    if (!grade) {
        return;
    }

    grade.innerHTML = "";


    // =================================================
    // DIAS DA SEMANA
    // =================================================

    const dias = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo"
    ];


    // =================================================
    // PERÍODOS
    // =================================================

    const periodos = [
        "manha",
        "tarde",
        "noite"
    ];


    // =================================================
    // CABEÇALHO
    // =================================================

    const espaco = document.createElement("div");

    grade.appendChild(espaco);


    dias.forEach((dia) => {

        const cabecalho = document.createElement("div");

        cabecalho.classList.add("cabecalho-dia");

        cabecalho.textContent =
            dia.substring(0, 3);

        grade.appendChild(cabecalho);

    });


    // =================================================
    // CRIA AS CÉLULAS
    // =================================================

    periodos.forEach((periodo) => {

        // Nome do período

        const nomePeriodo =
            document.createElement("div");

        nomePeriodo.classList.add(
            "periodo-cronograma"
        );

        nomePeriodo.textContent =
            formatarPeriodo(periodo);

        grade.appendChild(nomePeriodo);


        // Células dos dias

        dias.forEach((dia) => {

            const celula =
                document.createElement("div");

            celula.classList.add(
                "celula-cronograma",
                "sem-info"
            );


            // Guarda as informações da célula

            celula.dataset.dia = dia;

            celula.dataset.periodo = periodo;

            celula.title = "Sem informação";


            // Procura registros correspondentes

            const registros =
                dados.filter((linha) => {

                    const diaBanco = linha[6];

                    const periodoBanco = linha[10];

                    return (
                        diaBanco === dia &&
                        periodoBanco === periodo
                    );

                });


            // Se encontrou algum registro

            if (registros.length > 0) {

                const registro = registros[0];

                const status = registro[3];

                const horario = registro[7];

                aplicarStatusCelula(
                    celula,
                    status,
                    horario
                );

            }


            grade.appendChild(celula);

        });

    });

}

// =====================================================
// FORMATAR PERÍODO
// =====================================================

function formatarPeriodo(periodo) {

    const periodos = {

        manha: "Manhã",

        tarde: "Tarde",

        noite: "Noite"

    };

    return periodos[periodo] || periodo;

}


// =====================================================
// APLICAR STATUS NA CÉLULA
// =====================================================

function aplicarStatusCelula(
    celula,
    status,
    horario
) {

    celula.classList.remove(
        "agendada",
        "breve",
        "disponivel",
        "indisponivel",
        "sem-info"
    );


    if (
        status === "alocado" ||
        status === "ocupado" ||
        status === "agendada"
    ) {

        celula.classList.add("agendada");

        celula.title =
            `Aula agendada${horario ? ` - ${horario}` : ""}`;

        return;

    }


    if (status === "breve") {

        celula.classList.add("breve");

        celula.title =
            `Disponível em breve${horario ? ` - ${horario}` : ""}`;

        return;

    }


    if (status === "disponivel") {

        celula.classList.add("disponivel");

        celula.title =
            `Disponível${horario ? ` - ${horario}` : ""}`;

        return;

    }


    if (status === "indisponivel") {

        celula.classList.add("indisponivel");

        celula.title =
            `Indisponível${horario ? ` - ${horario}` : ""}`;

        return;

    }


    celula.classList.add("sem-info");

    celula.title = "Sem informação";

}

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


    // =================================================
    // DADOS DO PROFESSOR
    // =================================================

    const nome = professor[1];

    const area = professor[2];


    // =================================================
    // ALTERA USUÁRIO DO CRONOGRAMA
    // =================================================

    const nomeUsuario =
        document.getElementById(
            "nomeUsuarioAgenda"
        );

    const areaUsuario =
        document.getElementById(
            "areaUsuarioAgenda"
        );

    const avatar =
        document.getElementById(
            "usuarioAvatar"
        );


    if (nomeUsuario) {

        nomeUsuario.textContent =
            nome;

    }


    if (areaUsuario) {

        areaUsuario.textContent =
            area;

    }


    if (avatar) {

        avatar.textContent =
            nome.charAt(0).toUpperCase();

    }


    // =================================================
    // BUSCA TODOS OS REGISTROS DESSE PROFESSOR
    // =================================================

    const agenda =
        banco.exec(`
            SELECT *
            FROM professores
            WHERE nome = ?
            ORDER BY
                dia_da_semana,
                horario;
        `, [nome]);


    let dadosAgenda = [];


    if (
        agenda.length > 0
    ) {

        dadosAgenda =
            agenda[0].values;

    }


    // =================================================
    // MOSTRA O CRONOGRAMA
    // =================================================

    atualizarCronograma(
        dadosAgenda
    );


    // =================================================
    // ATUALIZA RESUMO
    // =================================================

    atualizarHoras(
        dadosAgenda
    );

}

// =====================================================
// INICIAR SISTEMA
// =====================================================

iniciarBanco();