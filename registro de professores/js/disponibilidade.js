document.addEventListener("DOMContentLoaded", () => {
    const API_URL = `http://${window.location.hostname}:3000`;

    const professorSelect = document.getElementById("professor-disponibilidade");
    const grade = document.getElementById("disponibilidade-grade");
    const btnSalvar = document.getElementById("btnSalvarDisponibilidade");
    const btnLimpar = document.getElementById("btnLimparDisponibilidade");

    const DIAS = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo",
    ];

    const PERIODOS = [
        { valor: "manha", nome: "Manhã" },
        { valor: "tarde", nome: "Tarde" },
        { valor: "noite", nome: "Noite" },
    ];

    const STATUS = [
        "sem_info",
        "disponivel",
        "breve",
        "indisponivel",
    ];

    let professores = [];
    let disponibilidade = new Map();

    async function requisicao(rota, opcoes = {}) {
        const resposta = await fetch(`${API_URL}${rota}`, {
            ...opcoes,
            credentials: "include",
        });

        let resultado;

        try {
            resultado = await resposta.json();
        } catch {
            throw new Error("O servidor retornou uma resposta inválida.");
        }

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || "Erro na comunicação com o servidor.");
        }

        return resultado;
    }

    function chave(dia, periodo) {
        return `${dia}|${periodo}`;
    }

    function rotuloStatus(status) {
        return {
            sem_info: "Sem Informação",
            disponivel: "Disponível",
            breve: "Disponível em Breve",
            indisponivel: "Indisponível",
        }[status] || "Sem Informação";
    }

    function construirGrade() {
        if (!grade) return;

        grade.innerHTML = "";

        const canto = document.createElement("div");
        canto.className = "disponibilidade-canto";
        grade.appendChild(canto);

        DIAS.forEach((dia) => {
            const cabecalho = document.createElement("div");
            cabecalho.className = "disponibilidade-dia";
            cabecalho.textContent = dia.substring(0, 3);
            grade.appendChild(cabecalho);
        });

        PERIODOS.forEach((periodo) => {
            const label = document.createElement("div");
            label.className = "disponibilidade-periodo";
            label.textContent = periodo.nome;
            grade.appendChild(label);

            DIAS.forEach((dia) => {
                const botao = document.createElement("button");
                botao.type = "button";
                botao.className = "disponibilidade-celula sem-info";
                botao.dataset.dia = dia;
                botao.dataset.periodo = periodo.valor;
                botao.title = `${dia} - ${periodo.nome}: Sem Informação`;

                botao.addEventListener("click", () => {
                    const atual = disponibilidade.get(chave(dia, periodo.valor)) || "sem_info";
                    const indice = STATUS.indexOf(atual);
                    const proximo = STATUS[(indice + 1) % STATUS.length];

                    disponibilidade.set(
                        chave(dia, periodo.valor),
                        proximo,
                    );

                    atualizarCelula(botao, proximo, dia, periodo.nome);
                });

                grade.appendChild(botao);
            });
        });
    }

    function atualizarCelula(botao, status, dia, periodo) {
        botao.className = `disponibilidade-celula ${status}`;
        botao.title = `${dia} - ${periodo}: ${rotuloStatus(status)}`;
    }

    function atualizarGrade() {
        if (!grade) return;

        grade.querySelectorAll(".disponibilidade-celula").forEach((celula) => {
            const dia = celula.dataset.dia;
            const periodo = celula.dataset.periodo;
            const status = disponibilidade.get(chave(dia, periodo)) || "sem_info";
            const nomePeriodo = PERIODOS.find((item) => item.valor === periodo)?.nome || periodo;

            atualizarCelula(celula, status, dia, nomePeriodo);
        });
    }

    async function carregarProfessores() {
        const resultado = await requisicao("/api/professores");
        professores = resultado.dados || [];

        professorSelect.innerHTML = `<option value="">Selecione um professor</option>`;

        professores.forEach((professor) => {
            const option = document.createElement("option");
            option.value = professor.id;
            option.textContent = professor.nome;
            professorSelect.appendChild(option);
        });
    }

    async function carregarDisponibilidade(professorId) {
        disponibilidade = new Map();

        DIAS.forEach((dia) => {
            PERIODOS.forEach((periodo) => {
                disponibilidade.set(
                    chave(dia, periodo.valor),
                    "sem_info",
                );
            });
        });

        if (!professorId) {
            atualizarGrade();
            return;
        }

        const resultado = await requisicao(
            `/api/professores/${professorId}/disponibilidade`,
        );

        (resultado.dados?.disponibilidades || []).forEach((item) => {
            disponibilidade.set(
                chave(item.dia_da_semana, item.periodo),
                item.status || "sem_info",
            );
        });

        atualizarGrade();
    }

    professorSelect?.addEventListener("change", async () => {
        try {
            await carregarDisponibilidade(professorSelect.value);
        } catch (erro) {
            alert(erro.message);
        }
    });

    btnSalvar?.addEventListener("click", async () => {
        const professorId = Number(professorSelect?.value);

        if (!professorId) {
            alert("Selecione um professor para salvar a disponibilidade.");
            return;
        }

        const disponibilidades = [];

        DIAS.forEach((dia) => {
            PERIODOS.forEach((periodo) => {
                disponibilidades.push({
                    dia_da_semana: dia,
                    periodo: periodo.valor,
                    status:
                        disponibilidade.get(
                            chave(dia, periodo.valor),
                        ) || "sem_info",
                });
            });
        });

        const texto = btnSalvar.innerHTML;
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = "Salvando...";

        try {
            await requisicao(
                `/api/professores/${professorId}/disponibilidade`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ disponibilidades }),
                },
            );

            alert("Disponibilidade semanal salva com sucesso.");
        } catch (erro) {
            alert(erro.message);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = texto;
        }
    });

    btnLimpar?.addEventListener("click", () => {
        DIAS.forEach((dia) => {
            PERIODOS.forEach((periodo) => {
                disponibilidade.set(
                    chave(dia, periodo.valor),
                    "sem_info",
                );
            });
        });

        atualizarGrade();
    });

    construirGrade();

    carregarProfessores().catch((erro) => {
        console.error("Erro ao carregar professores:", erro);
    });
});
