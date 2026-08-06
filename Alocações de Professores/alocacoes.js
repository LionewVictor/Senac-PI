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
