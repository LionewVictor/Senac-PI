//ids dos botões
/* id="buscarProfessores"
id="buscarTurmas"
id="agendaGeral"
id="alocacoes"
id="configuracoes" */

const buscarProfessores = document.getElementById("buscarProfessores");
const buscarTurmas = document.getElementById("buscarTurmas");
const agendaGeral = document.getElementById("agendaGeral");
const alocacoes = document.getElementById("alocacoes");
const configuracoes = document.getElementById("configuracoes");

buscarProfessores.addEventListener("click",() => {
    window.location.href = "agendageral.html";
});

//A partir daqui quem pegar essa parte tem que repetir isso para todas as funções da barra lateral
