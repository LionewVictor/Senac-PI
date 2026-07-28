document.addEventListener("DOMContentLoaded", () => {

  const passwordInput = document.getElementById("password");
  const togglePasswordIcon = document.querySelector(".toggle-password");

  if (passwordInput && togglePasswordIcon) {
    togglePasswordIcon.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      togglePasswordIcon.classList.toggle("fa-eye");
      togglePasswordIcon.classList.toggle("fa-eye-slash");
    });
  }

  const loginForm = document.querySelector("form");
  const emailInput = document.getElementById("email");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {

      event.preventDefault();

      const emailValue = emailInput.value.trim();
      const passwordValue = passwordInput.value;

      if (!emailValue.includes("@")) {
        alert("Por favor, insira um e-mail institucional válido.");
        emailInput.focus();
        return;
      }

      if (passwordValue.length < 4) {
        alert("A senha deve conter pelo menos 4 caracteres.");
        passwordInput.focus();
        return;
      }

      const submitBtn = loginForm.querySelector(".submit-btn");
      const originalBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

      console.log("Enviando credenciais:", {
        email: emailValue,
        lembrar: loginForm.querySelector('input[type="checkbox"]').checked,
      });

      setTimeout(() => {
        alert("Login processado com sucesso! (Simulação)");

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }, 1500);
    });
  }
});
