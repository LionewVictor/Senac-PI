document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // API
  // ============================================================

  const API_URL = `http://${window.location.hostname}:3000`;

  // ============================================================
  // ELEMENTOS
  // ============================================================

  const btnNovaAlocacao = document.getElementById("btnNovaAlocacao");

  const modal = document.getElementById("modalEdicao");

  const formEdicao = document.getElementById("formEdicao");

  const fecharModalBtn = document.getElementById("fecharModal");

  const cancelarEdicaoBtn = document.getElementById("cancelarEdicao");

  const tituloModal = document.getElementById("tituloModal");

  const subtituloModal = document.getElementById("subtituloModal");

  const tabela = document.getElementById("tabelaAlocacoes");

  const formFiltro = document.getElementById("formFiltro");

  // ============================================================
  // ESTADO
  // ============================================================

  let professores = [];

  let alocacoes = [];

  let alocacoesFiltradas = [];

  let statusAtual = "todos";

  let paginaAtual = 1;

  let itensPorPagina = 5;

  // ============================================================
  // FUNÇÃO PARA ABRIR MODAL
  // ============================================================

  function abrirModal() {
    if (!modal) {
      console.error("Modal #modalEdicao não encontrado.");
      return;
    }

    if (!formEdicao) {
      console.error("Formulário #formEdicao não encontrado.");
      return;
    }

    // Limpa o formulário
    formEdicao.reset();

    // ID vazio = nova alocação
    const id = document.getElementById("editarId");

    if (id) {
      id.value = "";
    }

    // Primeiro professor disponível
    const selectProfessor = document.getElementById("editarProfessor");

    if (selectProfessor && professores.length > 0) {
      selectProfessor.value = String(professores[0].id);
    }

    // Status padrão
    const status = document.getElementById("editarStatus");

    if (status) {
      status.value = "pendente";
    }

    if (tituloModal) {
      tituloModal.textContent = "Nova Alocação";
    }

    if (subtituloModal) {
      subtituloModal.textContent = "Preencha os dados da nova alocação.";
    }

    // IMPORTANTE:
    // hidden = false faz o modal aparecer
    modal.hidden = false;
  }

  // ============================================================
  // BOTÃO NOVA ALOCAÇÃO
  // ============================================================

  if (btnNovaAlocacao) {
    btnNovaAlocacao.addEventListener("click", (event) => {
      event.preventDefault();

      event.stopPropagation();

      abrirModal();
    });
  } else {
    console.error("Botão #btnNovaAlocacao não encontrado.");
  }

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  function fecharModal() {
    if (modal) {
      modal.hidden = true;
    }
  }

  fecharModalBtn?.addEventListener("click", (event) => {
    event.preventDefault();

    fecharModal();
  });

  cancelarEdicaoBtn?.addEventListener("click", (event) => {
    event.preventDefault();

    fecharModal();
  });

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModal();
    }
  });

  // ============================================================
  // API
  // ============================================================

  async function requisicao(rota, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      credentials: "include",
    });

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem || "Erro na comunicação com o servidor.",
      );
    }

    return resultado;
  }

  // ============================================================
  // CARREGAR PROFESSORES
  // ============================================================

  async function carregarProfessores() {
    try {
      const resultado = await requisicao("/api/professores");

      professores = resultado.dados || [];

      const selectProfessor = document.getElementById("editarProfessor");

      if (!selectProfessor) {
        return;
      }

      selectProfessor.innerHTML = "";

      if (professores.length === 0) {
        selectProfessor.innerHTML = `
                    <option value="">
                        Nenhum professor cadastrado
                    </option>
                `;

        return;
      }

      professores.forEach((professor) => {
        const option = document.createElement("option");

        option.value = professor.id;

        option.textContent = professor.nome;

        selectProfessor.appendChild(option);
      });
    } catch (erro) {
      console.error("Erro ao carregar professores:", erro);
    }
  }

  // ============================================================
  // CARREGAR ALOCAÇÕES
  // ============================================================

  async function carregarAlocacoes() {
    try {
      const resultado = await requisicao("/api/alocacoes");

      alocacoes = resultado.dados || [];

      alocacoesFiltradas = [...alocacoes];

      atualizarCards();

      preencherFiltros();

      aplicarFiltros();
    } catch (erro) {
      console.error("Erro ao carregar alocações:", erro);

      alocacoes = [];

      alocacoesFiltradas = [];

      atualizarCards();

      renderizarTabela();
    }
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
  // FILTROS
  // ============================================================

  function preencherFiltros() {
    const campos = {
      turma: "turma",

      curso: "curso",

      cidade: "cidade",

      cronograma: "cronograma",

      horario: "horario",

      periodo: "periodo",

      edital: "edital",

      assistente: "assistente_administrativo",

      pratica: "pratica_pi",

      insumos: "insumos",

      material: "material_ptd",

      avaliacao: "avaliacao",

      feedback: "feedback",
    };

    Object.entries(campos).forEach(([id, campo]) => {
      const select = document.getElementById(id);

      if (!select) {
        return;
      }

      const valores = [
        ...new Set(
          alocacoes
            .map((item) => item[campo])
            .filter(
              (valor) =>
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== "",
            ),
        ),
      ];

      select.innerHTML = `<option value="">Todos</option>`;

      valores.forEach((valor) => {
        const option = document.createElement("option");

        option.value = valor;

        option.textContent = valor;

        select.appendChild(option);
      });
    });
  }

  function aplicarFiltros() {
    const instrutor = document.getElementById("instrutor")?.value || "";

    const turma = document.getElementById("turma")?.value || "";

    const curso = document.getElementById("curso")?.value || "";

    const cidade = document.getElementById("cidade")?.value || "";

    const horario = document.getElementById("horario")?.value || "";

    const periodo = document.getElementById("periodo")?.value || "";

    const edital = document.getElementById("edital")?.value || "";

    const codigo = document.getElementById("codigo")?.value || "";

    alocacoesFiltradas = alocacoes.filter((item) => {
      if (
        statusAtual !== "todos" &&
        normalizar(item.status) !== normalizar(statusAtual)
      ) {
        return false;
      }

      if (
        instrutor &&
        !normalizar(item.instrutor).includes(normalizar(instrutor))
      ) {
        return false;
      }

      if (turma && normalizar(item.turma) !== normalizar(turma)) {
        return false;
      }

      if (curso && normalizar(item.curso) !== normalizar(curso)) {
        return false;
      }

      if (cidade && normalizar(item.cidade) !== normalizar(cidade)) {
        return false;
      }

      if (horario && normalizar(item.horario) !== normalizar(horario)) {
        return false;
      }

      if (periodo && normalizar(item.periodo) !== normalizar(periodo)) {
        return false;
      }

      if (edital && normalizar(item.edital) !== normalizar(edital)) {
        return false;
      }

      if (codigo && !normalizar(item.codigo).includes(normalizar(codigo))) {
        return false;
      }

      return true;
    });

    paginaAtual = 1;

    renderizarTabela();
  }

  // ============================================================
  // CARDS
  // ============================================================

  function atualizarCards() {
    const total = alocacoes.length;

    const ativas = alocacoes.filter(
      (item) => normalizar(item.status) === "ativa",
    ).length;

    const pendentes = alocacoes.filter(
      (item) => normalizar(item.status) === "pendente",
    ).length;

    const encerradas = alocacoes.filter(
      (item) => normalizar(item.status) === "encerrada",
    ).length;

    document.getElementById("totalAlocacoes").textContent = total;

    document.getElementById("alocacoesAtivas").textContent = ativas;

    document.getElementById("alocacoesPendentes").textContent = pendentes;

    document.getElementById("alocacoesEncerradas").textContent = encerradas;

    document.getElementById("percentualAtivas").textContent =
      `${porcentagem(ativas, total)}% do total`;

    document.getElementById("percentualPendentes").textContent =
      `${porcentagem(pendentes, total)}% do total`;

    document.getElementById("percentualEncerradas").textContent =
      `${porcentagem(encerradas, total)}% do total`;
  }

  function porcentagem(valor, total) {
    if (!total) {
      return 0;
    }

    return Math.round((valor / total) * 100);
  }

  // ============================================================
  // TABELA
  // ============================================================

  function renderizarTabela() {
    if (!tabela) {
      return;
    }

    tabela.innerHTML = "";

    const inicio = (paginaAtual - 1) * itensPorPagina;

    const fim = inicio + itensPorPagina;

    const registros = alocacoesFiltradas.slice(inicio, fim);

    if (!registros.length) {
      tabela.innerHTML = `
                <tr>
                    <td
                        colspan="19"
                        class="sem-resultados"
                    >
                        Nenhuma alocação cadastrada.
                    </td>
                </tr>
            `;
    } else {
      registros.forEach((item) => {
        const tr = document.createElement("tr");

        const nome = item.professor_nome || item.nome_professor || "Professor";

        tr.innerHTML = `

                        <td>
                            <div class="professor">

                                <div class="avatar">
                                    ${nome.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h4>
                                        ${nome}
                                    </h4>
                                </div>

                            </div>
                        </td>

                        <td>
                            ${item.instrutor || "-"}
                        </td>

                        <td>
                            ${item.turma || "-"}
                        </td>

                        <td>
                            ${item.curso || "-"}
                        </td>

                        <td>
                            ${item.cidade || "-"}
                        </td>

                        <td>
                            ${item.cronograma || "-"}
                        </td>

                        <td>
                            ${item.dia_da_semana || "-"}
                        </td>

                        <td>
                            ${item.horario || "-"}
                        </td>

                        <td>
                            ${item.periodo || "-"}
                        </td>

                        <td>
                            ${item.edital || "-"}
                        </td>

                        <td>
                            ${item.assistente_administrativo || "-"}
                        </td>

                        <td>
                            ${item.pratica_pi || "-"}
                        </td>

                        <td>
                            ${item.insumos || "-"}
                        </td>

                        <td>
                            ${item.material_ptd || "-"}
                        </td>

                        <td>
                            ${item.avaliacao || "-"}
                        </td>

                        <td>
                            ${item.feedback || "-"}
                        </td>

                        <td>
                            ${item.codigo || "-"}
                        </td>

                        <td>
                            <span
                                class="status-badge ${normalizar(item.status)}"
                            >
                                ${item.status || "-"}
                            </span>
                        </td>

                        <td>
                            <button
                                type="button"
                                class="btn-editar"
                                data-id="${item.id}"
                            >
                                <i class="fa-solid fa-pen"></i>
                                Editar
                            </button>
                        </td>

                    `;

        tabela.appendChild(tr);
      });
    }

    atualizarRodape();
  }

  // ============================================================
  // RODAPÉ
  // ============================================================

  function atualizarRodape() {
    const total = alocacoesFiltradas.length;

    const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));

    const inicio = total === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;

    const fim = Math.min(paginaAtual * itensPorPagina, total);

    const contador = document.getElementById("contadorTabela");

    if (contador) {
      contador.textContent =
        total === 0
          ? "Mostrando 0 registros"
          : `Mostrando ${inicio} a ${fim} de ${total}`;
    }

    const paginaElemento = document.getElementById("paginaAtual");

    if (paginaElemento) {
      paginaElemento.textContent = paginaAtual;
    }

    const anterior = document.getElementById("paginaAnterior");

    const proxima = document.getElementById("paginaProxima");

    if (anterior) {
      anterior.disabled = paginaAtual <= 1;
    }

    if (proxima) {
      proxima.disabled = paginaAtual >= totalPaginas;
    }
  }

  // ============================================================
  // EDITAR EXISTENTE
  // ============================================================

  tabela?.addEventListener("click", (event) => {
    const botao = event.target.closest(".btn-editar");

    if (!botao) {
      return;
    }

    const id = Number(botao.dataset.id);

    const item = alocacoes.find((alocacao) => Number(alocacao.id) === id);

    if (!item) {
      return;
    }

    preencherModal(item);

    if (tituloModal) {
      tituloModal.textContent = "Editar Alocação";
    }

    if (subtituloModal) {
      subtituloModal.textContent = "Altere os dados da alocação selecionada.";
    }

    modal.hidden = false;
  });

  // ============================================================
  // PREENCHER MODAL
  // ============================================================

  function preencherModal(item) {
    const valores = {
      editarId: item.id,

      editarProfessor: item.professor_id,

      editarInstrutor: item.instrutor,

      editarTurma: item.turma,

      editarCurso: item.curso,

      editarCidade: item.cidade,

      editarCronograma: item.cronograma,

      editarDia: item.dia_da_semana,

      editarHorario: item.horario,

      editarPeriodo: item.periodo,

      editarEdital: item.edital,

      editarAssistente: item.assistente_administrativo,

      editarPratica: item.pratica_pi,

      editarInsumos: item.insumos,

      editarMaterial: item.material_ptd,

      editarAvaliacao: item.avaliacao,

      editarFeedback: item.feedback,

      editarCodigo: item.codigo,

      editarStatus: item.status,
    };

    Object.entries(valores).forEach(([id, valor]) => {
      const campo = document.getElementById(id);

      if (campo) {
        campo.value = valor ?? "";
      }
    });
  }

  // ============================================================
  // SALVAR NOVA / EDITAR
  // ============================================================

  formEdicao?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("editarId").value;

    const dados = {
      professor_id: Number(document.getElementById("editarProfessor").value),

      instrutor: document.getElementById("editarInstrutor").value.trim(),

      turma: document.getElementById("editarTurma").value.trim(),

      curso: document.getElementById("editarCurso").value.trim(),

      cidade: document.getElementById("editarCidade").value.trim(),

      cronograma: document.getElementById("editarCronograma").value.trim(),

      dia_da_semana: document.getElementById("editarDia").value,

      horario: document.getElementById("editarHorario").value.trim(),

      periodo: document.getElementById("editarPeriodo").value,

      edital: document.getElementById("editarEdital").value.trim(),

      assistente_administrativo: document
        .getElementById("editarAssistente")
        .value.trim(),

      pratica_pi: document.getElementById("editarPratica").value.trim(),

      insumos: document.getElementById("editarInsumos").value.trim(),

      material_ptd: document.getElementById("editarMaterial").value.trim(),

      avaliacao: document.getElementById("editarAvaliacao").value.trim(),

      feedback: document.getElementById("editarFeedback").value.trim(),

      codigo: document.getElementById("editarCodigo").value.trim(),

      status: document.getElementById("editarStatus").value,
    };

    try {
      if (id) {
        await requisicao(`/api/alocacoes/${id}`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dados),
        });

        alert("Alocação atualizada com sucesso!");
      } else {
        await requisicao("/api/alocacoes", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dados),
        });

        alert("Alocação criada com sucesso!");
      }

      modal.hidden = true;

      await carregarAlocacoes();
    } catch (erro) {
      console.error(erro);

      alert(erro.message);
    }
  });

  // ============================================================
  // FILTRO
  // ============================================================

  formFiltro?.addEventListener("submit", (event) => {
    event.preventDefault();

    aplicarFiltros();
  });

  // ============================================================
  // RESET
  // ============================================================

  formFiltro?.addEventListener("reset", () => {
    setTimeout(() => {
      statusAtual = "todos";

      document
        .querySelectorAll(".abas button")
        .forEach((botao) => botao.classList.remove("ativo"));

      document
        .querySelector('.abas button[data-status="todos"]')
        ?.classList.add("ativo");

      aplicarFiltros();
    }, 0);
  });

  // ============================================================
  // ABAS
  // ============================================================

  document.querySelectorAll(".abas button").forEach((aba) => {
    aba.addEventListener("click", () => {
      document
        .querySelectorAll(".abas button")
        .forEach((item) => item.classList.remove("ativo"));

      aba.classList.add("ativo");

      statusAtual = aba.dataset.status || "todos";

      aplicarFiltros();
    });
  });

  // ============================================================
  // PAGINAÇÃO
  // ============================================================

  document
    .getElementById("itensPorPagina")
    ?.addEventListener("change", (event) => {
      itensPorPagina = Number(event.target.value) || 5;

      paginaAtual = 1;

      renderizarTabela();
    });

  document.getElementById("paginaAnterior")?.addEventListener("click", () => {
    if (paginaAtual > 1) {
      paginaAtual--;

      renderizarTabela();
    }
  });

  document.getElementById("paginaProxima")?.addEventListener("click", () => {
    const totalPaginas = Math.max(
      1,
      Math.ceil(alocacoesFiltradas.length / itensPorPagina),
    );

    if (paginaAtual < totalPaginas) {
      paginaAtual++;

      renderizarTabela();
    }
  });

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  carregarProfessores();

  carregarAlocacoes();
});
