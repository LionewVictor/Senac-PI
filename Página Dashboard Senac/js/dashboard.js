document.addEventListener("DOMContentLoaded", () => {
  const API_URL = `http://${window.location.hostname}:3000`;

  let professores = [];
  let alocacoes = [];
  let professorSelecionado = null;

  const cidade = document.getElementById("selectCidade");
  const diaDaSemana = document.getElementById("selectDiaDaSemana");
  const horario = document.getElementById("selectHorario");
  const turma = document.getElementById("selectTurma");
  const assistenteAdm = document.getElementById("selectAssistenteAdm");
  const periodo = document.getElementById("selectPeriodo");
  const btnBuscar = document.getElementById("btn_buscar");
  const btnLimpar = document.getElementById("btn-limpar-filtros");
  const tabelaResultados = document.getElementById("resultadosBusca");
  const nomeUsuarioAgenda = document.getElementById("nomeUsuarioAgenda");
  const areaUsuarioAgenda = document.getElementById("areaUsuarioAgenda");
  const usuarioAvatar = document.getElementById("usuarioAvatar");

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

  function normalizar(texto) {
    return String(texto ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function escaparHtml(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizarPeriodo(periodoValor) {
    const valor = normalizar(periodoValor);
    if (valor === "manha") return "manha";
    if (valor === "tarde") return "tarde";
    if (valor === "noite") return "noite";
    return valor;
  }

  function periodoDoHorario(horarioValor) {
    if (!horarioValor) return null;
    const hora = Number.parseInt(String(horarioValor).slice(0, 2), 10);
    if (!Number.isFinite(hora)) return null;
    if (hora < 12) return "manha";
    if (hora < 18) return "tarde";
    return "noite";
  }

  function formatarStatus(status) {
    const mapa = {
      disponivel: "Disponível",
      breve: "Disponível em breve",
      indisponivel: "Indisponível",
      afastado: "Afastado",
      ferias: "Férias",
    };
    return mapa[normalizar(status)] || status || "Sem informação";
  }

  function statusDisponibilidade(item) {
    const status = normalizar(item?.status);
    if (status === "disponivel") return "disponivel";
    if (status === "breve") return "breve";
    if (["indisponivel", "afastado", "ferias"].includes(status))
      return "indisponivel";
    return "sem-info";
  }

  function statusDoPeriodo(dados, dia, periodoValor) {
    const alocacoesDoPeriodo = dados.filter((item) => {
      const periodoItem =
        normalizarPeriodo(item.periodo) || periodoDoHorario(item.horario);
      return (
        normalizar(item.dia_da_semana) === normalizar(dia) &&
        periodoItem === periodoValor
      );
    });

    // Qualquer aula já alocada domina a cor do período.
    if (alocacoesDoPeriodo.length > 0) {
      return "agendada";
    }

    const disponibilidade = dados.__disponibilidades?.find(
      (item) =>
        normalizar(item.dia_da_semana) === normalizar(dia) &&
        normalizarPeriodo(item.periodo) === periodoValor,
    );

    return statusDisponibilidade(disponibilidade);
  }

  async function carregarDados() {
    try {
      const [resultadoProfessores, resultadoAlocacoes, resultadoDashboard] =
        await Promise.all([
          requisicao("/api/professores"),
          requisicao("/api/alocacoes"),
          requisicao("/api/dashboard"),
        ]);

      professores = resultadoProfessores.dados || [];
      alocacoes = resultadoAlocacoes.dados || [];
      atualizarCards(resultadoDashboard.dados);
      preencherFiltros();
      mostrarResultados(professores);
    } catch (erro) {
      console.error("Erro ao carregar dashboard:", erro);
    }
  }

  function atualizarCards(dados) {
    const elementos = {
      professores_disponiveis: document.getElementById("spn-profDisponiveis"),
      professores_alocados: document.getElementById("spn-profAlocados"),
      turmas_ativas: document.getElementById("spn-turmasAtivas"),
      alocacoes_pendentes: document.getElementById("spn-alocacoesPendentes"),
    };

    Object.entries(elementos).forEach(([chave, elemento]) => {
      if (elemento) elemento.textContent = dados?.[chave] ?? 0;
    });
  }

  function preencherFiltros() {
    preencherSelect(cidade, "cidade");
    preencherSelect(diaDaSemana, "dia_da_semana");
    preencherSelect(horario, "horario");
    preencherSelect(turma, "turma");
    preencherSelect(assistenteAdm, "assistente_administrativo");
    preencherSelect(periodo, "periodo");
  }

  function preencherSelect(select, campo) {
    if (!select) return;

    const textoInicial = select.options[0]?.textContent || "Todos";
    const valores = [
      ...new Set(
        alocacoes
          .map((item) => item[campo])
          .filter(
            (valor) =>
              valor !== null &&
              valor !== undefined &&
              String(valor).trim() !== "",
          )
          .map(String),
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    select.innerHTML = `<option value="">${textoInicial}</option>`;
    valores.forEach((valor) => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });
  }

  function obterFiltros() {
    return {
      cidade: cidade?.value || "",
      dia_da_semana: diaDaSemana?.value || "",
      horario: horario?.value || "",
      turma: turma?.value || "",
      assistente_administrativo: assistenteAdm?.value || "",
      periodo: periodo?.value || "",
    };
  }

  function buscarProfessores(event) {
    event?.preventDefault();
    const filtros = obterFiltros();
    const possuiFiltro = Object.values(filtros).some((valor) => valor !== "");

    if (!possuiFiltro) {
      mostrarResultados(professores);
      return;
    }

    const compativeis = alocacoes.filter((alocacao) => {
      if (
        filtros.cidade &&
        normalizar(alocacao.cidade) !== normalizar(filtros.cidade)
      )
        return false;
      if (
        filtros.dia_da_semana &&
        normalizar(alocacao.dia_da_semana) !== normalizar(filtros.dia_da_semana)
      )
        return false;
      if (
        filtros.horario &&
        normalizar(alocacao.horario) !== normalizar(filtros.horario)
      )
        return false;
      if (
        filtros.turma &&
        normalizar(alocacao.turma) !== normalizar(filtros.turma)
      )
        return false;
      if (
        filtros.assistente_administrativo &&
        normalizar(alocacao.assistente_administrativo) !==
          normalizar(filtros.assistente_administrativo)
      )
        return false;
      if (
        filtros.periodo &&
        normalizar(alocacao.periodo) !== normalizar(filtros.periodo)
      )
        return false;
      return true;
    });

    const ids = new Set(compativeis.map((item) => Number(item.professor_id)));
    mostrarResultados(
      professores.filter((professor) => ids.has(Number(professor.id))),
    );
  }

  function mostrarResultados(lista) {
    if (!tabelaResultados) return;

    tabelaResultados.innerHTML = "";

    if (!lista || lista.length === 0) {
      tabelaResultados.innerHTML = `
                <tr>
                    <td colspan="5" class="sem-resultados">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <strong>Nenhum professor encontrado</strong>
                        <span>Tente alterar os filtros da busca.</span>
                    </td>
                </tr>
            `;
      limparCronograma();
      return;
    }

    lista.forEach((professor) => {
      const tr = document.createElement("tr");
      const nome = professor.nome || "Professor";
      const area = professor.area || "Área não informada";
      const status = professor.status || "Sem informação";
      const horas = Number(professor.horas_contratadas) || 0;

      tr.innerHTML = `
                <td>
                    <div class="professor-info">
                        <div class="professor-avatar">${escaparHtml(nome.charAt(0).toUpperCase())}</div>
                        <div>
                            <strong>${escaparHtml(nome)}</strong>
                            <small>${escaparHtml(area)}</small>
                        </div>
                    </div>
                </td>
                <td><span class="area-professor">${escaparHtml(area)}</span></td>
                <td>
                    <span class="status status-${normalizar(status)}">
                        <span class="status-dot"></span>
                        ${escaparHtml(formatarStatus(status))}
                    </span>
                </td>
                <td><strong class="horas-professor">${horas}h</strong></td>
                <td>
                    <button type="button" class="btn-agenda" data-professor-id="${professor.id}">
                        <i class="fa-regular fa-calendar"></i> Ver Agenda
                    </button>
                </td>
            `;

      tabelaResultados.appendChild(tr);
    });

    tabelaResultados.querySelectorAll(".btn-agenda").forEach((botao) => {
      botao.addEventListener("click", () =>
        verAgenda(Number(botao.dataset.professorId)),
      );
    });

    verAgenda(lista[0].id);
  }

  async function verAgenda(id) {
    try {
      const professor = professores.find(
        (item) => Number(item.id) === Number(id),
      );
      if (!professor) return;

      professorSelecionado = professor;
      if (nomeUsuarioAgenda) nomeUsuarioAgenda.textContent = professor.nome;
      if (areaUsuarioAgenda)
        areaUsuarioAgenda.textContent = professor.area || "Área não informada";
      if (usuarioAvatar)
        usuarioAvatar.textContent = professor.nome.charAt(0).toUpperCase();

      const resultado = await requisicao(`/api/agenda/${professor.id}`);
      const dados = resultado.dados?.alocacoes || [];
      dados.__disponibilidades = resultado.dados?.disponibilidades || [];
      atualizarCronograma(dados);
    } catch (erro) {
      console.error("Erro ao carregar agenda:", erro);
      limparCronograma();
    }
  }

  function atualizarCronograma(dados) {
    const grade = document.querySelector(".grade");
    if (!grade) return;

    grade.innerHTML = "";

    const dias = [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ];
    const periodos = [
      { valor: "manha", nome: "Manhã" },
      { valor: "tarde", nome: "Tarde" },
      { valor: "noite", nome: "Noite" },
    ];

    grade.appendChild(document.createElement("div"));

    dias.forEach((dia) => {
      const cabecalho = document.createElement("div");
      cabecalho.className = "cabecalho-dia";
      cabecalho.textContent = dia.substring(0, 3);
      grade.appendChild(cabecalho);
    });

    periodos.forEach((periodoItem) => {
      const label = document.createElement("div");
      label.className = "periodo-cronograma";
      label.textContent = periodoItem.nome;
      grade.appendChild(label);

      dias.forEach((dia) => {
        const celula = document.createElement("div");
        celula.className = "celula-cronograma";

        const status = statusDoPeriodo(dados, dia, periodoItem.valor);
        celula.classList.add(status);

        const aulas = dados.filter((item) => {
          const periodoItemAlocacao =
            normalizarPeriodo(item.periodo) || periodoDoHorario(item.horario);
          return (
            normalizar(item.dia_da_semana) === normalizar(dia) &&
            periodoItemAlocacao === periodoItem.valor
          );
        });

        if (aulas.length) {
          const detalhes = aulas.map((item) => {
            const partes = [];
            if (item.curso) partes.push(item.curso);
            if (item.turma) partes.push(`Turma: ${item.turma}`);
            if (item.horario) partes.push(`Horário: ${item.horario}`);
            return partes.join(" | ");
          });
          celula.title = detalhes.join("\n") || `${dia} - ${periodoItem.nome}`;
        } else {
          const disponibilidade = dados.__disponibilidades?.find(
            (item) =>
              normalizar(item.dia_da_semana) === normalizar(dia) &&
              normalizarPeriodo(item.periodo) === periodoItem.valor,
          );
          celula.title = `${dia} - ${periodoItem.nome}: ${formatarStatus(
            disponibilidade?.status || "Sem informação",
          )}`;
        }

        grade.appendChild(celula);
      });
    });
  }

  function limparCronograma() {
    const grade = document.querySelector(".grade");
    if (grade) grade.innerHTML = "";
  }

  btnLimpar?.addEventListener("click", () => {
    [cidade, diaDaSemana, horario, turma, assistenteAdm, periodo].forEach(
      (elemento) => {
        if (elemento) elemento.value = "";
      },
    );
    mostrarResultados(professores);
  });

  btnBuscar?.addEventListener("click", buscarProfessores);

  carregarDados();
});
