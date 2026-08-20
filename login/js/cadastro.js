document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ELEMENTOS
  // ============================================================

  const form = document.querySelector("main form");

  const passwordField = document.querySelector(
    'input[placeholder="Crie uma senha"]',
  );

  const confirmField = document.querySelector(
    'input[placeholder="Confirme sua senha"]',
  );

  const termsCheckbox = document.getElementById("terms");

  const submitBtn = form?.querySelector('button[type="submit"]');

  // ============================================================
  // MOSTRAR / OCULTAR SENHA
  // ============================================================

  const togglePasswordIcons = document.querySelectorAll(".toggle-password");

  togglePasswordIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const passwordInput = icon.parentElement.querySelector("input");

      if (!passwordInput) {
        return;
      }

      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";

      icon.classList.toggle("fa-eye", !isPassword);

      icon.classList.toggle("fa-eye-slash", isPassword);
    });
  });

  // ============================================================
  // CPF
  // ============================================================

  const cpfInput = document.querySelector(
    'input[placeholder="000.000.000-00"]',
  );

  if (cpfInput) {
    cpfInput.addEventListener("input", (event) => {
      let value = event.target.value.replace(/\D/g, "");

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      value = value.replace(/(\d{3})(\d)/, "$1.$2");

      value = value.replace(/(\d{3})(\d)/, "$1.$2");

      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

      event.target.value = value;
    });
  }

  // ============================================================
  // TELEFONE
  // ============================================================

  const telefoneInput = document.querySelector(
    'input[placeholder="(00) 00000-0000"]',
  );

  if (telefoneInput) {
    telefoneInput.addEventListener("input", (event) => {
      let value = event.target.value.replace(/\D/g, "");

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      value = value.replace(/^(\d{2})(\d)/, "($1) $2");

      value = value.replace(/(\d{5})(\d)/, "$1-$2");

      event.target.value = value;
    });
  }

  // ============================================================
  // REGRAS DA SENHA
  // ============================================================

  const ruleItems = document.querySelectorAll(".rule-item");

  function verificarSenha(senha) {
    const regras = {
      tamanho: senha.length >= 8,

      minuscula: /[a-z]/.test(senha),

      maiuscula: /[A-Z]/.test(senha),

      numero: /[0-9]/.test(senha),

      especial: /[^A-Za-z0-9]/.test(senha),
    };

    return regras;
  }

  function atualizarRegraVisual(elemento, valida) {
    const icon = elemento.querySelector("i");

    if (valida) {
      elemento.style.color = "#28a745";

      if (icon) {
        icon.style.color = "#28a745";

        icon.className = "fa-solid fa-circle-check";
      }
    } else {
      elemento.style.color = "#666666";

      if (icon) {
        icon.style.color = "#a0aec0";

        icon.className = "fa-regular fa-circle-check";
      }
    }
  }

  function atualizarRegrasSenha(senha) {
    const regras = verificarSenha(senha);

    ruleItems.forEach((item) => {
      const texto = item.textContent.toLowerCase();

      if (texto.includes("mínimo") || texto.includes("caracteres")) {
        atualizarRegraVisual(item, regras.tamanho);
      } else if (texto.includes("minúscula")) {
        atualizarRegraVisual(item, regras.minuscula);
      } else if (texto.includes("maiúscula")) {
        atualizarRegraVisual(item, regras.maiuscula);
      } else if (texto.includes("número")) {
        atualizarRegraVisual(item, regras.numero);
      } else if (texto.includes("especial")) {
        atualizarRegraVisual(item, regras.especial);
      }
    });
  }

  if (passwordField) {
    passwordField.addEventListener("input", () => {
      atualizarRegrasSenha(passwordField.value);
    });
  }

  // ============================================================
  // FORMULÁRIO
  // ============================================================

  if (!form || !passwordField || !confirmField || !submitBtn) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // ====================================================
    // CAMPOS
    // ====================================================

    const inputs = form.querySelectorAll("input");

    const nomeInput = form.querySelector('input[placeholder*="nome completo"]');

    const emailInput = form.querySelector('input[type="email"]');

    const cpf = cpfInput?.value.trim() || "";

    const telefone = telefoneInput?.value.trim() || "";

    const selects = form.querySelectorAll("select");

    // ====================================================
    // VALIDAÇÃO NOME
    // ====================================================

    if (!nomeInput || !nomeInput.value.trim()) {
      alert("Por favor, insira seu nome completo.");

      nomeInput?.focus();

      return;
    }

    // ====================================================
    // VALIDAÇÃO E-MAIL
    // ====================================================

    if (!emailInput || !emailInput.value.trim()) {
      alert("Por favor, insira seu e-mail institucional.");

      emailInput?.focus();

      return;
    }

    if (!emailInput.value.includes("@")) {
      alert("Por favor, insira um e-mail institucional válido.");

      emailInput.focus();

      return;
    }

    // ====================================================
    // VALIDAR SELECTS
    // ====================================================

    for (const select of selects) {
      if (select.value === "") {
        alert("Por favor, selecione todas as opções de Unidade e Cargo.");

        select.focus();

        return;
      }
    }

    // ====================================================
    // SENHA
    // ====================================================

    const senha = passwordField.value;

    const confirmacao = confirmField.value;

    const regras = verificarSenha(senha);

    const senhaValida =
      regras.tamanho &&
      regras.minuscula &&
      regras.maiuscula &&
      regras.numero &&
      regras.especial;

    if (!senhaValida) {
      alert("A senha não atende a todos os requisitos de segurança.");

      passwordField.focus();

      return;
    }

    // ====================================================
    // CONFIRMAR SENHA
    // ====================================================

    if (senha !== confirmacao) {
      alert("As senhas não coincidem.");

      confirmField.focus();

      return;
    }

    // ====================================================
    // TERMOS
    // ====================================================

    if (termsCheckbox && !termsCheckbox.checked) {
      alert(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
      );

      termsCheckbox.focus();

      return;
    }

    // ====================================================
    // OBTER SELECTS
    // ====================================================

    const unidade = selects[0]?.value || "";

    const cargo = selects[1]?.value || "";

    // ====================================================
    // BOTÃO
    // ====================================================

    const textoOriginal = submitBtn.innerHTML;

    submitBtn.disabled = true;

    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Criando conta...';

    try {
      // ==================================================
      // ENVIA PARA O BACKEND
      // ==================================================

      const resposta = await fetch("http://localhost:3000/api/cadastro", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nome: nomeInput.value.trim(),

          email: emailInput.value.trim().toLowerCase(),

          senha,

          cpf,

          telefone,

          unidade,

          cargo,
        }),
      });

      const resultado = await resposta.json();

      // ==================================================
      // ERRO
      // ==================================================

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(
          resultado.mensagem || "Não foi possível realizar o cadastro.",
        );
      }

      // ==================================================
      // SUCESSO
      // ==================================================

      alert("Cadastro realizado com sucesso!");

      window.location.href = "login.html";
    } catch (erro) {
      console.error("Erro no cadastro:", erro);

      alert(erro.message || "Não foi possível conectar ao servidor.");

      submitBtn.disabled = false;

      submitBtn.innerHTML = textoOriginal;
    }
  });
});
