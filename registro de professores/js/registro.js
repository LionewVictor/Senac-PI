document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ELEMENTOS
  // ============================================================

  const form = document.getElementById("registroProfessorForm");

  const cpfInput = document.getElementById("cpf");

  const telefoneInput = document.getElementById("telefone");

  const dataCadastro = document.getElementById("data-cadastro");

  const fotoInput = document.getElementById("foto-professor");

  const photoPreview = document.getElementById("photo-preview");

  const areasBox = document.getElementById("areas-atuacao");

  const disciplinaSelect = document.getElementById("disciplinas");

  const btnCancelar = document.getElementById("btnCancelar");

  const btnSalvar = document.getElementById("btnSalvar");

  const API_URL = `http://${window.location.hostname}:3000`;

  // ============================================================
  // DATA DE CADASTRO
  // ============================================================

  function atualizarDataCadastro() {
    if (!dataCadastro) {
      return;
    }

    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");

    const hora = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    dataCadastro.textContent = `${data} - ${hora}`;
  }

  atualizarDataCadastro();

  // ============================================================
  // MÁSCARA CPF
  // ============================================================

  if (cpfInput) {
    cpfInput.addEventListener("input", (event) => {
      let valor = event.target.value.replace(/\D/g, "");

      valor = valor.slice(0, 11);

      if (valor.length > 9) {
        valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      } else if (valor.length > 6) {
        valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else if (valor.length > 3) {
        valor = valor.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      }

      event.target.value = valor;
    });
  }

  // ============================================================
  // MÁSCARA TELEFONE
  // ============================================================

  if (telefoneInput) {
    telefoneInput.addEventListener("input", (event) => {
      let valor = event.target.value.replace(/\D/g, "");

      valor = valor.slice(0, 11);

      if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (valor.length > 6) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
      } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d+)/, "($1) $2");
      }

      event.target.value = valor;
    });
  }

  // ============================================================
  // FOTO
  // ============================================================

  if (fotoInput) {
    fotoInput.addEventListener("change", () => {
      const arquivo = fotoInput.files[0];

      if (!arquivo) {
        photoPreview.innerHTML = "";

        photoPreview.classList.remove("visible");

        return;
      }

      // ------------------------------------------------
      // TIPO
      // ------------------------------------------------

      const tiposPermitidos = ["image/jpeg", "image/png"];

      if (!tiposPermitidos.includes(arquivo.type)) {
        alert("Selecione uma imagem JPG ou PNG.");

        fotoInput.value = "";

        return;
      }

      // ------------------------------------------------
      // TAMANHO
      // ------------------------------------------------

      const tamanhoMaximo = 5 * 1024 * 1024;

      if (arquivo.size > tamanhoMaximo) {
        alert("A foto deve ter no máximo 5MB.");

        fotoInput.value = "";

        return;
      }

      // ------------------------------------------------
      // PREVIEW
      // ------------------------------------------------

      const leitor = new FileReader();

      leitor.onload = (event) => {
        photoPreview.innerHTML = `
                            <img
                                src="${event.target.result}"
                                alt="Pré-visualização da foto do professor"
                            >
                        `;

        photoPreview.classList.add("visible");
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  // ============================================================
  // TAGS
  // ============================================================

  function configurarTags() {
    const botoesRemover = document.querySelectorAll(".tag__remove");

    botoesRemover.forEach((botao) => {
      botao.addEventListener("click", () => {
        const tag = botao.closest(".tag");

        if (tag) {
          tag.remove();
        }
      });
    });
  }

  configurarTags();

  // ============================================================
  // ADICIONAR DISCIPLINA COMO TAG
  // ============================================================

  if (disciplinaSelect) {
    disciplinaSelect.addEventListener("change", () => {
      const valor = disciplinaSelect.value;

      if (!valor) {
        return;
      }

      const texto =
        disciplinaSelect.options[disciplinaSelect.selectedIndex].text;

      const tagsExistentes = Array.from(areasBox.querySelectorAll(".tag"));

      const jaExiste = tagsExistentes.some((tag) => {
        const span = tag.querySelector("span");

        return (
          span &&
          span.textContent.trim().toLowerCase() === texto.trim().toLowerCase()
        );
      });

      if (jaExiste) {
        disciplinaSelect.value = "";

        return;
      }

      const tag = document.createElement("span");

      tag.className = "tag";

      tag.innerHTML = `
                    <span>${texto}</span>

                    <button
                        type="button"
                        class="tag__remove"
                        aria-label="Remover ${texto}"
                    >
                        ×
                    </button>
                `;

      const botao = tag.querySelector(".tag__remove");

      botao.addEventListener("click", () => {
        tag.remove();
      });

      areasBox.appendChild(tag);

      disciplinaSelect.value = "";
    });
  }

  // ============================================================
  // OBTER ÁREAS
  // ============================================================

  function obterAreas() {
    const tags = areasBox.querySelectorAll(".tag");

    return Array.from(tags).map((tag) => {
      const texto = tag.querySelector("span");

      return texto
        ? texto.textContent.trim()
        : tag.textContent.trim().replace("×", "").trim();
    });
  }

  // ============================================================
  // VALIDAR FORMULÁRIO
  // ============================================================

  function validarFormulario() {
    const camposObrigatorios = form.querySelectorAll("[required]");

    for (const campo of camposObrigatorios) {
      if (!campo.value || !campo.value.trim()) {
        alert("Preencha todos os campos obrigatórios.");

        campo.focus();

        return false;
      }
    }

    // --------------------------------------------------------
    // E-MAIL
    // --------------------------------------------------------

    const email = document.getElementById("email").value.trim();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      alert("Informe um e-mail válido.");

      document.getElementById("email").focus();

      return false;
    }

    // --------------------------------------------------------
    // CPF
    // --------------------------------------------------------

    const cpf = cpfInput.value.replace(/\D/g, "");

    if (cpf.length !== 11) {
      alert("Informe um CPF válido com 11 números.");

      cpfInput.focus();

      return false;
    }

    // --------------------------------------------------------
    // TELEFONE
    // --------------------------------------------------------

    const telefone = telefoneInput.value.replace(/\D/g, "");

    if (telefone.length !== 10 && telefone.length !== 11) {
      alert("Informe um telefone válido.");

      telefoneInput.focus();

      return false;
    }

    // --------------------------------------------------------
    // ÁREAS
    // --------------------------------------------------------

    const areas = obterAreas();

    if (areas.length === 0) {
      alert("Adicione pelo menos uma área de atuação.");

      areasBox.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return false;
    }

    return true;
  }

  // ============================================================
  // CANCELAR
  // ============================================================

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      const confirmou = confirm("Deseja cancelar o preenchimento do cadastro?");

      if (!confirmou) {
        return;
      }

      form.reset();

      photoPreview.innerHTML = "";

      photoPreview.classList.remove("visible");

      // Remove tags extras
      areasBox.querySelectorAll(".tag").forEach((tag, index) => {
        /*
         * Mantém a primeira tag
         * que já estava no protótipo.
         */

        if (index > 0) {
          tag.remove();
        }
      });

      atualizarDataCadastro();
    });
  }

  // ============================================================
  // SALVAR
  // ============================================================

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!validarFormulario()) {
        return;
      }

      // =================================================
      // CAMPOS
      // =================================================

      const nome = document.getElementById("nome-completo").value.trim();

      const nomeSocial = document.getElementById("nome-social").value.trim();

      const dataNascimento = document.getElementById("data-nascimento").value;

      const genero = document.getElementById("genero").value;

      const estadoCivil = document.getElementById("estado-civil").value;

      const statusSelecionado = document.getElementById("status").value;

      const unidade = document.getElementById("unidade-vinculo").value.trim();

      const tipoVinculo = document.getElementById("tipo-vinculo").value;

      const dataAdmissao = document.getElementById("data-admissao").value;

      const observacoes = document.getElementById("observacoes").value.trim();

      const email = document.getElementById("email").value.trim();

      const areas = obterAreas();

      // =================================================
      // CONVERTE STATUS PARA O FORMATO DO BANCO
      // =================================================

      const statusMap = {
        Disponível: "disponivel",

        Indisponível: "indisponivel",

        Férias: "ferias",

        Afastado: "afastado",
      };

      const status = statusMap[statusSelecionado] || "disponivel";

      // =================================================
      // FORMDATA
      // =================================================

      const dados = new FormData();

      dados.append("nome_completo", nome);

      dados.append("nome_social", nomeSocial);

      dados.append("data_nascimento", dataNascimento);

      dados.append("genero", genero);

      dados.append("cpf", cpfInput.value.trim());

      dados.append("email", email);

      dados.append("estado_civil", estadoCivil);

      dados.append("telefone", telefoneInput.value.trim());

      dados.append("status", status);

      dados.append("unidade_vinculo", unidade);

      dados.append("tipo_vinculo", tipoVinculo);

      dados.append("data_admissao", dataAdmissao);

      dados.append("observacoes", observacoes);

      dados.append("horas_contratadas", "40");

      // -------------------------------------------------
      // ÁREAS
      // -------------------------------------------------

      dados.append("areas_atuacao", JSON.stringify(areas));

      // -------------------------------------------------
      // FOTO
      // -------------------------------------------------

      if (fotoInput && fotoInput.files.length > 0) {
        dados.append("foto", fotoInput.files[0]);
      }

      // =================================================
      // BOTÃO
      // =================================================

      const textoOriginal = btnSalvar.innerHTML;

      btnSalvar.disabled = true;

      btnSalvar.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Salvando...
                    `;

      try {
        // =================================================
        // ENVIA PARA O BACKEND
        // =================================================

        const resposta = await fetch(`${API_URL}/api/professores`, {
          method: "POST",

          credentials: "include",

          body: dados,
        });

        const resultado = await resposta.json();

        // =================================================
        // ERRO
        // =================================================

        if (!resposta.ok || !resultado.sucesso) {
          throw new Error(
            resultado.mensagem || "Não foi possível cadastrar o professor.",
          );
        }

        // =================================================
        // SUCESSO
        // =================================================

        alert("Professor cadastrado com sucesso!");

        // Limpa o formulário
        form.reset();

        photoPreview.innerHTML = "";

        photoPreview.classList.remove("visible");

        atualizarDataCadastro();

        // Depois do cadastro,
        // deixamos o botão normal novamente

        btnSalvar.disabled = false;

        btnSalvar.innerHTML = textoOriginal;
      } catch (erro) {
        console.error("Erro ao cadastrar professor:", erro);

        alert(erro.message || "Não foi possível conectar ao servidor.");

        btnSalvar.disabled = false;

        btnSalvar.innerHTML = textoOriginal;
      }
    });
  }
});
