document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formFiltro");
  const linhas = document.querySelectorAll("tbody tr");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // CAMPOS DO FILTRO
    const instrutor = document.getElementById("instrutor").value.toLowerCase();
    const turma = document.getElementById("turma").value.toLowerCase();
    const curso = document.getElementById("curso").value.toLowerCase();
    const cidade = document.getElementById("cidade").value.toLowerCase();
    const cronograma = document
      .getElementById("cronograma")
      .value.toLowerCase();
    const horario = document.getElementById("horario").value.toLowerCase();
    const periodo = document.getElementById("periodo").value.toLowerCase();
    const edital = document.getElementById("edital").value.toLowerCase();
    const assistente = document
      .getElementById("assistente")
      .value.toLowerCase();
    const pratica = document.getElementById("pratica").value.toLowerCase();
    const insumos = document.getElementById("insumos").value.toLowerCase();
    const material = document.getElementById("material").value.toLowerCase();
    const avaliacao = document.getElementById("avaliacao").value.toLowerCase();
    const feedback = document.getElementById("feedback").value.toLowerCase();
    const codigo = document.getElementById("codigo").value.toLowerCase();

    linhas.forEach(function (linha) {
      const texto = linha.innerText.toLowerCase();

      let mostrar = true;

      // Instrutor (INPUT)
      if (instrutor !== "" && !texto.includes(instrutor)) {
        mostrar = false;
      }

      // Demais filtros (SELECT)
      if (turma !== "" && !texto.includes(turma)) {
        mostrar = false;
      }

      if (curso !== "" && !texto.includes(curso)) {
        mostrar = false;
      }

      if (cidade !== "" && !texto.includes(cidade)) {
        mostrar = false;
      }

      if (cronograma !== "" && !texto.includes(cronograma)) {
        mostrar = false;
      }

      if (horario !== "" && !texto.includes(horario)) {
        mostrar = false;
      }

      if (periodo !== "" && !texto.includes(periodo)) {
        mostrar = false;
      }

      if (edital !== "" && !texto.includes(edital)) {
        mostrar = false;
      }

      if (assistente !== "" && !texto.includes(assistente)) {
        mostrar = false;
      }

      if (pratica !== "" && !texto.includes(pratica)) {
        mostrar = false;
      }

      if (insumos !== "" && !texto.includes(insumos)) {
        mostrar = false;
      }

      if (material !== "" && !texto.includes(material)) {
        mostrar = false;
      }

      if (avaliacao !== "" && !texto.includes(avaliacao)) {
        mostrar = false;
      }

      if (feedback !== "" && !texto.includes(feedback)) {
        mostrar = false;
      }

      if (codigo !== "" && !texto.includes(codigo)) {
        mostrar = false;
      }

      linha.style.display = mostrar ? "" : "none";
    });
  });

  // Botão Limpar
  document.querySelector(".btn-limpar").addEventListener("click", function () {
    setTimeout(function () {
      document.querySelectorAll("tbody tr").forEach(function (linha) {
        linha.style.display = "";
      });
    }, 100);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const linhas = document.querySelectorAll("tbody tr");

  const botoesPagina = document.querySelectorAll(".pagina");

  const anterior = document.getElementById("anterior");

  const proximo = document.getElementById("proximo");

  const contador = document.getElementById("contador");

  const itensPagina = document.getElementById("itensPagina");

  let paginaAtual = 1;

  let quantidadePorPagina = 5;

  function mostrarPagina(pagina) {
    paginaAtual = pagina;

    const total = linhas.length;

    const totalPaginas = Math.ceil(total / quantidadePorPagina);

    const inicio = (pagina - 1) * quantidadePorPagina;

    const fim = inicio + quantidadePorPagina;

    // MOSTRAR AS LINHAS DA PÁGINA

    linhas.forEach(function (linha, index) {
      if (index >= inicio && index < fim) {
        linha.style.display = "";
      } else {
        linha.style.display = "none";
      }
    });

    // BOTÃO ATIVO

    botoesPagina.forEach(function (botao) {
      botao.classList.remove("ativa");

      if (Number(botao.dataset.pagina) === paginaAtual) {
        botao.classList.add("ativa");
      }
    });

    // CONTADOR

    const primeiro = inicio + 1;

    const ultimo = Math.min(fim, total);

    contador.textContent = `Mostrando de ${primeiro} a ${ultimo} de ${total}`;

    // SETA ESQUERDA

    if (paginaAtual === 1) {
      anterior.style.opacity = "0.3";
      anterior.style.pointerEvents = "none";
    } else {
      anterior.style.opacity = "1";
      anterior.style.pointerEvents = "auto";
    }

    // SETA DIREITA

    if (paginaAtual === totalPaginas) {
      proximo.style.opacity = "0.3";
      proximo.style.pointerEvents = "none";
    } else {
      proximo.style.opacity = "1";
      proximo.style.pointerEvents = "auto";
    }
  }

  // CLIQUE NAS PÁGINAS

  botoesPagina.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const pagina = Number(this.dataset.pagina);

      mostrarPagina(pagina);
    });
  });

  // ANTERIOR

  anterior.addEventListener("click", function () {
    if (paginaAtual > 1) {
      mostrarPagina(paginaAtual - 1);
    }
  });

  // PRÓXIMO

  proximo.addEventListener("click", function () {
    const totalPaginas = Math.ceil(linhas.length / quantidadePorPagina);

    if (paginaAtual < totalPaginas) {
      mostrarPagina(paginaAtual + 1);
    }
  });

  // ITENS POR PÁGINA

  if (itensPagina) {
    itensPagina.addEventListener("change", function () {
      quantidadePorPagina = Number(this.value);

      mostrarPagina(1);
    });
  }

  // COMEÇAR NA PÁGINA 1

  mostrarPagina(1);
});