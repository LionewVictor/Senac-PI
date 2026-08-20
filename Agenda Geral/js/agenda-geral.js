document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // API
  // ============================================================

  const API_URL = `http://${window.location.hostname}:3000`;

  // ============================================================
  // ELEMENTOS
  // ============================================================

  const professorSelect = document.getElementById("professor");

  const periodSelect = document.getElementById("period");

  const unitSelect = document.getElementById("unit");

  const axisSelect = document.getElementById("axis");

  const formFiltros = document.getElementById("agendaFiltros");

  const scheduleTable = document.querySelector(".schedule-table table");

  const profileButton = document.querySelector(".profile-button");

  const exportButton = document.querySelector(".export-button");

  // ============================================================
  // ESTADO
  // ============================================================

  let professores = [];

  let professorAtual = null;

  let agendaAtual = [];

  let disponibilidadeAtual = [];

  // ============================================================
  // API
  // ============================================================

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
      throw new Error(
        resultado.mensagem || "Erro na comunicação com o servidor.",
      );
    }

    return resultado;
  }

  // ============================================================
  // NORMALIZAR
  // ============================================================

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // ============================================================
  // STATUS DA AGENDA
  // ============================================================

  function obterClasseStatus(status) {
    const valor = normalizar(status);

    switch (valor) {
      case "ativa":
      case "agendada":
      case "alocado":
      case "ocupado":
        return "scheduled";

      case "pendente":
      case "breve":
        return "soon";

      case "disponivel":
        return "available";

      case "indisponivel":
      case "afastado":
      case "ferias":
        return "unavailable";

      default:
        return "no-info";
    }
  }

  // ============================================================
  // PROFESSORES
  // ============================================================

  async function carregarProfessores() {
    try {
      const resultado = await requisicao("/api/professores");

      professores = resultado.dados || [];

      professorSelect.innerHTML = `
                <option value="">
                    Selecione um professor
                </option>
            `;

      professores.forEach((professor) => {
        const option = document.createElement("option");

        option.value = professor.id;

        option.textContent = professor.nome;

        professorSelect.appendChild(option);
      });

      if (professores.length > 0) {
        professorSelect.value = professores[0].id;

        professorAtual = professores[0];

        preencherProfessor();

        await carregarAgenda();
      }
    } catch (erro) {
      console.error("Erro ao carregar professores:", erro);
    }
  }

  // ============================================================
  // PREENCHER PROFESSOR
  // ============================================================

  function preencherProfessor() {
    if (!professorAtual) {
      return;
    }

    const nome = document.querySelector(".teacher-name");

    const area = document.querySelector(".teacher-area");

    const status = document.querySelector(".teacher-status");

    const foto = document.querySelector(".teacher-photo img");

    if (nome) {
      nome.textContent = professorAtual.nome;
    }

    if (area) {
      area.textContent = professorAtual.area || "Área não informada";
    }

    if (status) {
      status.textContent = professorAtual.status || "Sem informação";
    }

    if (foto && professorAtual.foto) {
      foto.src = `${API_URL}${professorAtual.foto}`;
    }
  }

  // ============================================================
  // TROCAR PROFESSOR
  // ============================================================

  professorSelect.addEventListener("change", async () => {
    const id = Number(professorSelect.value);

    if (!id) {
      professorAtual = null;

      agendaAtual = [];

      disponibilidadeAtual = [];

      limparAgenda();

      atualizarResumoHoras();

      return;
    }

    professorAtual = professores.find(
      (professor) => Number(professor.id) === id,
    );

    if (!professorAtual) {
      return;
    }

    preencherProfessor();

    await carregarAgenda();
  });

  // ============================================================
  // CARREGAR AGENDA
  // ============================================================

  async function carregarAgenda() {
    if (!professorAtual) {
      return;
    }

    try {
      const parametros = new URLSearchParams();

      const periodo = periodSelect?.value || "";

      const unidade = unitSelect?.value || "";

      const eixo = axisSelect?.value || "";

      if (periodo) {
        parametros.set("periodo", periodo);
      }

      if (unidade) {
        parametros.set("unidade", unidade);
      }

      if (eixo) {
        parametros.set("eixo", eixo);
      }

      const query = parametros.toString();

      const rota = query
        ? `/api/agenda/${professorAtual.id}?${query}`
        : `/api/agenda/${professorAtual.id}`;

      const resultado = await requisicao(rota);

      /*
       * A API retorna as alocações e a disponibilidade
       * do professor.
       */

      agendaAtual = resultado.dados?.alocacoes || [];

      disponibilidadeAtual = resultado.dados?.disponibilidades || [];

      renderizarAgenda();

      atualizarResumoHoras();
    } catch (erro) {
      console.error("Erro ao carregar agenda:", erro);

      agendaAtual = [];

      disponibilidadeAtual = [];

      renderizarAgenda();

      atualizarResumoHoras();
    }
  }

  // ============================================================
  // RESUMO DE CARGA HORÁRIA
  // ============================================================

  function atualizarResumoHoras() {
    const cards = document.querySelectorAll(".mini-card h3");

    if (!cards || cards.length < 4) {
      return;
    }

    if (!professorAtual) {
      cards[0].textContent = "0h";

      cards[1].textContent = "0h";

      cards[2].textContent = "0h";

      cards[3].textContent = "0%";

      return;
    }

    /*
     * A carga contratada vem do cadastro do professor.
     *
     * Exemplo:
     *
     * João Silva = 40h
     * Maria Santos = 30h
     * Carlos Souza = 20h
     */

    const horasContratadas = Number(professorAtual.horas_contratadas) || 40;

    /*
     * Cada horário registrado na agenda representa
     * uma hora alocada nesta primeira versão.
     *
     * Removemos duplicidades de dia + horário para
     * evitar contar o mesmo horário duas vezes.
     */

    const horariosUnicos = new Set();

    agendaAtual.forEach((alocacao) => {
      if (!alocacao.dia_da_semana || !alocacao.horario) {
        return;
      }

      const chave = `
                        ${normalizar(alocacao.dia_da_semana)}
                        -
                        ${normalizar(alocacao.horario)}
                    `;

      horariosUnicos.add(chave);
    });

    /*
     * Horas efetivamente ocupadas.
     */

    const horasAlocadas = horariosUnicos.size;

    /*
     * Nunca deixamos horas livres negativas.
     */

    const horasLivres = Math.max(0, horasContratadas - horasAlocadas);

    /*
     * Percentual utilizado.
     */

    const utilizacao =
      horasContratadas > 0
        ? Math.round((horasAlocadas / horasContratadas) * 100)
        : 0;

    cards[0].textContent = `${horasContratadas}h`;

    cards[1].textContent = `${horasAlocadas}h`;

    cards[2].textContent = `${horasLivres}h`;

    cards[3].textContent = `${utilizacao}%`;
  }

  // ============================================================
  // LOCALIZAR CÉLULA
  // ============================================================

  function localizarCelula(dia, horario) {
    if (!scheduleTable) {
      return null;
    }

    const linhas = scheduleTable.querySelectorAll("tbody tr");

    const cabecalho = scheduleTable.querySelectorAll("thead th");

    let indiceDia = -1;

    cabecalho.forEach((th, indice) => {
      if (normalizar(th.textContent) === normalizar(dia)) {
        indiceDia = indice;
      }
    });

    if (indiceDia === -1) {
      return null;
    }

    for (const linha of linhas) {
      const primeiraCelula = linha.querySelector("td");

      if (!primeiraCelula) {
        continue;
      }

      if (primeiraCelula.textContent.trim() === horario) {
        const celulas = linha.querySelectorAll("td");

        return celulas[indiceDia];
      }
    }

    return null;
  }

  // ============================================================
  // LIMPAR AGENDA
  // ============================================================

  function limparAgenda() {
    scheduleTable
      ?.querySelectorAll(".event")
      .forEach((evento) => evento.remove());
  }

  // ============================================================
  // EVENTO DA AULA
  // ============================================================

  function criarEvento(alocacao) {
    if (!alocacao.dia_da_semana || !alocacao.horario) {
      return;
    }

    const celula = localizarCelula(alocacao.dia_da_semana, alocacao.horario);

    if (!celula) {
      return;
    }

    const evento = document.createElement("div");

    evento.classList.add("event", obterClasseStatus(alocacao.status));

    /*
     * Não colocamos texto dentro da célula.
     * A cor representa o status.
     */

    evento.textContent = "";

    const detalhes = [];

    if (alocacao.curso) {
      detalhes.push(alocacao.curso);
    }

    if (alocacao.turma) {
      detalhes.push(`Turma: ${alocacao.turma}`);
    }

    if (alocacao.horario) {
      detalhes.push(`Horário: ${alocacao.horario}`);
    }

    if (alocacao.status) {
      detalhes.push(`Status: ${alocacao.status}`);
    }

    evento.title = detalhes.join(" | ") || "Aula";

    celula.appendChild(evento);
  }

  // ============================================================
  // DISPONIBILIDADE
  // ============================================================

  function encontrarDisponibilidade(dia, horario) {
    if (!disponibilidadeAtual || disponibilidadeAtual.length === 0) {
      return null;
    }

    const hora = converterHora(horario);

    return (
      disponibilidadeAtual.find((disponibilidade) => {
        if (normalizar(disponibilidade.dia_da_semana) !== normalizar(dia)) {
          return false;
        }

        const inicio = converterHora(disponibilidade.horario_inicio);

        const fim = converterHora(disponibilidade.horario_fim);

        if (!inicio || !fim || !hora) {
          return false;
        }

        return hora >= inicio && hora < fim;
      }) || null
    );
  }

  // ============================================================
  // CONVERTER HORA
  // ============================================================

  function converterHora(valor) {
    if (!valor) {
      return null;
    }

    const partes = String(valor).split(":");

    if (partes.length < 2) {
      return null;
    }

    const hora = Number(partes[0]);

    const minuto = Number(partes[1]);

    if (Number.isNaN(hora) || Number.isNaN(minuto)) {
      return null;
    }

    return hora * 60 + minuto;
  }

  // ============================================================
  // EVENTOS DE DISPONIBILIDADE
  // ============================================================

  function renderizarDisponibilidades() {
    if (!scheduleTable) {
      return;
    }

    const linhas = scheduleTable.querySelectorAll("tbody tr");

    linhas.forEach((linha) => {
      const primeiraCelula = linha.querySelector("td");

      if (!primeiraCelula) {
        return;
      }

      const horario = primeiraCelula.textContent.trim();

      const celulas = linha.querySelectorAll("td");

      const dias = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo",
      ];

      dias.forEach((dia, indiceDia) => {
        const celula = celulas[indiceDia + 1];

        if (!celula) {
          return;
        }

        const disponibilidade = encontrarDisponibilidade(dia, horario);

        if (!disponibilidade) {
          return;
        }

        /*
         * A disponibilidade somente aparece
         * quando NÃO existe uma aula naquele
         * horário.
         */

        const possuiAula = celula.querySelector(".event");

        if (possuiAula) {
          return;
        }

        const classe = obterClasseStatus(disponibilidade.status);

        const bloco = document.createElement("div");

        bloco.classList.add("event", classe);

        bloco.title = `${formatarStatusDisponibilidade(
          disponibilidade.status,
        )} - ${dia} ${horario}`;

        celula.appendChild(bloco);
      });
    });
  }

  // ============================================================
  // FORMATA STATUS DE DISPONIBILIDADE
  // ============================================================

  function formatarStatusDisponibilidade(status) {
    const mapa = {
      disponivel: "Disponível",

      breve: "Disponível em Breve",

      indisponivel: "Indisponível",

      "sem-info": "Sem Informação",
    };

    return mapa[normalizar(status)] || status || "Sem Informação";
  }

  // ============================================================
  // RENDERIZAR AGENDA
  // ============================================================

  function renderizarAgenda() {
    limparAgenda();

    /*
     * Primeiro colocamos as aulas.
     */

    agendaAtual.forEach(criarEvento);

    /*
     * Depois completamos os horários
     * com a disponibilidade do professor.
     */

    renderizarDisponibilidades();
  }

  // ============================================================
  // FILTROS
  // ============================================================

  formFiltros?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!professorAtual) {
      alert("Selecione um professor.");

      return;
    }

    await carregarAgenda();
  });

  // ============================================================
  // LIMPAR FILTROS
  // ============================================================

  formFiltros?.addEventListener("reset", () => {
    setTimeout(() => {
      carregarAgenda();
    }, 0);
  });

  // ============================================================
  // VER PERFIL
  // ============================================================

  profileButton?.addEventListener("click", () => {
    if (!professorAtual) {
      alert("Selecione um professor.");

      return;
    }

    alert(
      `Professor: ${professorAtual.nome}\nÁrea: ${
        professorAtual.area || "Não informada"
      }`,
    );
  });

  // ============================================================
  // EXPORTAR
  // ============================================================

  exportButton?.addEventListener("click", () => {
    alert("A exportação da agenda será implementada posteriormente.");
  });

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  carregarProfessores();
});
