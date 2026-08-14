document.addEventListener('DOMContentLoaded', () => {
   
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordInput = icon.parentElement.querySelector('input');
            if (passwordInput) {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    });

    const cpfInput = document.querySelector('input[placeholder="000.000.000-00"]');
    const telInput = document.querySelector('input[placeholder="(00) 00000-0000"]');

    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }

    const passwordField = document.querySelector('input[placeholder="Crie uma senha"]');
    const ruleItems = document.querySelectorAll('.rule-item');

    if (passwordField && ruleItems.length > 0) {
        

        const toggleVisualRule = (element, isValid) => {
            const icon = element.querySelector('i');
            if (isValid) {
                element.style.color = '#28a745';
                if (icon) {
                    icon.style.color = '#28a745'; 
                    icon.className = 'fa-solid fa-circle-check'; 
                }
            } else {
                element.style.color = '#666666'; 
                if (icon) {
                    icon.style.color = '#a0aec0'; 
                    icon.className = 'fa-regular fa-circle-check';
                }
            }
        };

        passwordField.addEventListener('input', (e) => {
            const value = e.target.value;

            ruleItems.forEach(item => {
                const text = item.textContent.toLowerCase();

                if (text.includes('mínimo') || text.includes('caracteres')) {
                    toggleVisualRule(item, value.length >= 8);
                } 
                else if (text.includes('minúscula')) {
                    toggleVisualRule(item, /[a-z]/.test(value));
                } 
                else if (text.includes('maiúscula')) {
                    toggleVisualRule(item, /[A-Z]/.test(value));
                } 
                else if (text.includes('número')) {
                    toggleVisualRule(item, /[0-9]/.test(value));
                } 
                else if (text.includes('especial')) {
                    toggleVisualRule(item, /[^A-Za-z0-9]/.test(value));
                }
            });
        });
    }

    const cadastroForm = document.querySelector('main form');

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nomeInput = cadastroForm.querySelector('input[placeholder*="nome"]');
            const emailInput = cadastroForm.querySelector('input[type="email"]');
            const selects = cadastroForm.querySelectorAll('select');
            const confirmField = document.querySelector('input[placeholder="Confirme sua senha"]');
            const termsCheckbox = document.getElementById('terms');

            if (nomeInput && nomeInput.value.trim() === '') {
                alert('Por favor, insira seu nome completo.');
                nomeInput.focus();
                return;
            }

            if (emailInput && !emailInput.value.includes('@')) {
                alert('Por favor, insira um e-mail institucional válido.');
                emailInput.focus();
                return;
            }

            let selectValido = true;
            selects.forEach(select => {
                if (select.value === "") {
                    alert('Por favor, selecione todas as opções de Unidade e Cargo.');
                    select.focus();
                    selectValido = false;
                }
            });
            if (!selectValido) return;

            const pwd = passwordField ? passwordField.value : '';
            const isPwdValid = pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

            if (!isPwdValid) {
                alert('A senha escolhida não atende a todos os requisitos de segurança exigidos.');
                if (passwordField) passwordField.focus();
                return;
            }

            if (passwordField && confirmField && passwordField.value !== confirmField.value) {
                alert('As senhas informadas não coincidem. Verifique e tente novamente.');
                confirmField.focus();
                return;
            }

            if (termsCheckbox && !termsCheckbox.checked) {
                alert('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
                termsCheckbox.focus();
                return;
            }

            const submitBtn = cadastroForm.querySelector('button[type="submit"]') || cadastroForm.querySelector('.submit-btn');
            if (submitBtn) {
                const originalBtnContent = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando conta...';

                setTimeout(() => {
                    alert('Cadastro realizado com sucesso! Redirecionando...');
                    window.location.href = 'login.html'; 
                }, 2000);
            } else {
                alert('Cadastro enviado com sucesso! (Simulação)');
            }
        });
    }
});
