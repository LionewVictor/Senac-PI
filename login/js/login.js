document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ENDEREÇO DA API
  // Usa o mesmo host em que o frontend está aberto.
  // Exemplo:
  // 127.0.0.1:5501 -> 127.0.0.1:3000
  // localhost:5501  -> localhost:3000
  // ============================================================

  const API_URL = `http://${window.location.hostname}:3000`;

  // ============================================================
  // ELEMENTOS
  // ============================================================

  const passwordInput = document.getElementById("password");

  const emailInput = document.getElementById("email");

  const togglePasswordIcon = document.querySelector(".toggle-password");

  const loginForm = document.querySelector("form");

  const lembrarCheckbox = loginForm?.querySelector('input[type="checkbox"]');

  const submitBtn = loginForm?.querySelector(".submit-btn");

  // ============================================================
  // MOSTRAR / OCULTAR SENHA
  // ============================================================

  if (passwordInput && togglePasswordIcon) {
    togglePasswordIcon.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";

      togglePasswordIcon.classList.toggle("fa-eye", !isPassword);

      togglePasswordIcon.classList.toggle("fa-eye-slash", isPassword);
    });
  }

  // ============================================================
  // CARREGAR E-MAIL SALVO
  // ============================================================

  if (emailInput && lembrarCheckbox) {
    const emailSalvo = localStorage.getItem("senac_email");

    if (emailSalvo) {
      emailInput.value = emailSalvo;

      lembrarCheckbox.checked = true;
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================

  if (loginForm && emailInput && passwordInput && submitBtn) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim().toLowerCase();

      const senha = passwordInput.value;

      // ------------------------------------------------
      // VALIDAÇÕES
      // ------------------------------------------------

      if (!email) {
        alert("Digite seu e-mail institucional.");

        emailInput.focus();

        return;
      }

      if (!email.includes("@")) {
        alert("Digite um e-mail institucional válido.");

        emailInput.focus();

        return;
      }

      if (!senha) {
        alert("Digite sua senha.");

        passwordInput.focus();

        return;
      }

      // ------------------------------------------------
      // BOTÃO
      // ------------------------------------------------

      const textoOriginal = submitBtn.innerHTML;

      submitBtn.disabled = true;

      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

      try {
        // ============================================
        // LOGIN
        // ============================================

        const resposta = await fetch(`${API_URL}/api/login`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            senha,
          }),
        });

        const resultado = await resposta.json();

        console.log("Resposta do login:", resultado);

        if (!resposta.ok || !resultado.sucesso) {
          throw new Error(resultado.mensagem || "E-mail ou senha inválidos.");
        }

        // ============================================
        // LEMBRAR E-MAIL
        // ============================================

        if (lembrarCheckbox && lembrarCheckbox.checked) {
          localStorage.setItem("senac_email", email);
        } else {
          localStorage.removeItem("senac_email");
        }

        // ============================================
        // SALVAR USUÁRIO NO SESSION STORAGE
        // ============================================

        if (resultado.dados) {
          sessionStorage.setItem(
            "senac_usuario",
            JSON.stringify(resultado.dados),
          );
        }

        // ============================================
        // TESTAR A SESSÃO ANTES DE REDIRECIONAR
        // ============================================

        const sessao = await fetch(`${API_URL}/api/sessao`, {
          method: "GET",

          credentials: "include",
        });

        const dadosSessao = await sessao.json();

        console.log("Sessão após login:", dadosSessao);

        if (!dadosSessao.dados) {
          throw new Error(
            "O login foi aceito, mas a sessão não foi criada. Verifique o servidor.",
          );
        }

        // ============================================
        // REDIRECIONAMENTO
        // ============================================

        window.location.href = "../Página Dashboard Senac/dashboard.html";
      } catch (erro) {
        console.error("Erro no login:", erro);

        alert(erro.message || "Não foi possível conectar ao servidor.");

        submitBtn.disabled = false;

        submitBtn.innerHTML = textoOriginal;
      }
    });
  }
});
