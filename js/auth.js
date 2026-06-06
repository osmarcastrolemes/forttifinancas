const API_URL = 'https://sistema-financas-backend.onrender.com';

// --- CADASTRO ---
const cadastroForm = document.getElementById('cadastroForm');

if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch(`${API_URL}/api/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso! Faça o login.');
        window.location.href = 'index.html';
      } else {
        alert(data.erro || 'Erro ao cadastrar.');
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
    }
  });
}


// --- LOGIN ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = 'dashboard.html';
      } else {
        alert(data.erro || 'E-mail ou senha incorretos.');
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
    }
  });
}
