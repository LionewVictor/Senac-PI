document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ELEMENTOS DA NAVBAR
  // ============================================================

  const dashboard = document.getElementById("dashboard");

  const registroProfessores = document.getElementById("registroProfessores");

  const agendaGeral = document.getElementById("agendaGeral");

  const alocacoes = document.getElementById("alocacoes");

  const configuracoes = document.getElementById("configuracoes");

  // ============================================================
  // DASHBOARD
  // ============================================================

  if (dashboard) {
    dashboard.addEventListener("click", (event) => {
      event.preventDefault();

      window.location.href = "../Página Dashboard Senac/dashboard.html";
    });
  }

  // ============================================================
  // REGISTRO DE PROFESSORES
  // ============================================================

  if (registroProfessores) {
    registroProfessores.addEventListener("click", (event) => {
      event.preventDefault();

      window.location.href = "../registro de professores/registro.html";
    });
  }

  // ============================================================
  // AGENDA GERAL
  // ============================================================

  if (agendaGeral) {
    agendaGeral.addEventListener("click", (event) => {
      event.preventDefault();

      window.location.href = "../Agenda Geral/agenda-geral.html";
    });
  }

  // ============================================================
  // ALOCAÇÕES
  // ============================================================

  if (alocacoes) {
    alocacoes.addEventListener("click", (event) => {
      event.preventDefault();

      window.location.href = "../Alocações de Professores/alocacoes.html";
    });
  }

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================

  if (configuracoes) {
    configuracoes.addEventListener("click", (event) => {
      event.preventDefault();

      window.location.href = "../Configurações/configuracoes.html";
    });
  }

  // ============================================================
  // IDENTIFICAR PÁGINA ATUAL
  // ============================================================

  const caminhoAtual = window.location.pathname.toLowerCase();

  const nomeArquivo = caminhoAtual.split("/").pop();

  // ============================================================
  // REMOVER ACTIVE
  // ============================================================

  const itens = document.querySelectorAll(".nav-item");

  itens.forEach((item) => {
    item.classList.remove("active");
  });

  // ============================================================
  // MARCAR PÁGINA ATIVA
  // ============================================================

  if (nomeArquivo === "dashboard.html") {
    dashboard?.classList.add("active");
  }

  if (nomeArquivo === "registro.html") {
    registroProfessores?.classList.add("active");
  }

  if (nomeArquivo === "agenda-geral.html") {
    agendaGeral?.classList.add("active");
  }

  if (nomeArquivo === "alocacoes.html") {
    alocacoes?.classList.add("active");
  }

  if (nomeArquivo === "configuracoes.html") {
    configuracoes?.classList.add("active");
  }
});
