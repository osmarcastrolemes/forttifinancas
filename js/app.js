const API_URL = 'https://sistema-financas-backend.onrender.com';
const token = localStorage.getItem('token');

// Se o usuário não tiver token (não estiver logado), manda de volta para o login
if (!token && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('cadastro.html')) {
  window.location.href = 'index.html';
}

// --- FUNÇÃO PARA DESLOGAR ---
const configurarLogout = (idBotao) => {
  const btn = document.getElementById(idBotao);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }
};
configurarLogout('logoutBtn');
configurarLogout('logoutBtn2');
configurarLogout('logoutBtn3');

// --- TELA 1: DASHBOARD GERAL (HISTÓRICO COMPLETO E SALDO ATUAL) ---
const carregarDashboardGeral = async () => {
  const totalBalance = document.getElementById('totalBalance');
  const historyList = document.getElementById('historyList');
  if (!historyList) return; // Só executa se estiver na tela de Dashboard

  try {
    const response = await fetch(`${API_URL}/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const transacoes = await response.json();

    if (response.ok) {
      let saldoTotal = 0;
      historyList.innerHTML = '';

      if (transacoes.length === 0) {
        historyList.innerHTML = '<li class="history-item">Nenhum lançamento encontrado.</li>';
      }

      transacoes.forEach(t => {
        const valorNum = parseFloat(t.valor);
        if (t.tipo === 'receita') {
          saldoTotal += valorNum;
        } else {
          saldoTotal -= valorNum;
        }

        const dataFormatada = new Date(t.data_transacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <div style="flex-grow: 1; text-align: left;">
            <strong>${t.categoria_nome}</strong><br>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <button onclick="excluirTransacao(${t.id}, 'dashboard')" style="background: none; color: #d32f2f; border: none; padding: 4px 8px; font-size: 16px; cursor: pointer; width: auto; margin: 0;">
              🗑️
            </button>
          </div>
        `;
        historyList.appendChild(li);
      });

      totalBalance.innerText = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;
      const balanceCard = document.querySelector('.balance-card');
      if (balanceCard) {
        balanceCard.style.background = saldoTotal >= 0 ? 'linear-gradient(135deg, #388e3c, #2e7d32)' : 'linear-gradient(135deg, #e53935, #c62828)';
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// --- TELA 2: ACOMPANHAMENTO MÊS A MÊS ---
const inicializarSeletorRelatorio = () => {
  const filtroMes = document.getElementById('filtroMesRelatorio');
  if (!filtroMes || filtroMes.options.length > 0) return;

  const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = dataAtual.getMonth();

  for (let ano = anoAtual; ano >= anoAtual - 1; ano--) {
    for (let mes = 11; mes >= 0; mes--) {
      const opcao = document.createElement('option');
      opcao.value = `${ano}-${String(mes + 1).padStart(2, '0')}`;
      opcao.text = `${mesesNome[mes]} de ${ano}`;
      if (ano === anoAtual && mes === mesAtual) opcao.selected = true;
      filtroMes.appendChild(opcao);
    }
  }
  filtroMes.addEventListener('change', () => carregarRelatorioMensal());
};

const carregarRelatorioMensal = async () => {
  const listaRelatorioMes = document.getElementById('listaRelatorioMes');
  const filtroMes = document.getElementById('filtroMesRelatorio');
  if (!listaRelatorioMes) return; // Só roda se estiver na tela relatorios.html

  inicializarSeletorRelatorio();
  const mesSelecionado = filtroMes.value; // Ex: "2026-06"

  const resumoReceitas = document.getElementById('resumoReceitas');
  const resumoDespesas = document.getElementById('resumoDespesas');
  const saldoMensal = document.getElementById('saldoMensal');
  const cardSaldoMensal = document.getElementById('cardSaldoMensal');

  try {
    const response = await fetch(`${API_URL}/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const transacoes = await response.json();

    if (response.ok) {
      let totalEntradas = 0;
      let totalSaidas = 0;
      listaRelatorioMes.innerHTML = '';

      const transacoesFiltradas = transacoes.filter(t => t.data_transacao.substring(0, 7) === mesSelecionado);

      if (transacoesFiltradas.length === 0) {
        listaRelatorioMes.innerHTML = '<li class="history-item" style="text-align:center; color:#777;">Sem movimentações neste mês.</li>';
      }

      transacoesFiltradas.forEach(t => {
        const valorNum = parseFloat(t.valor);
        if (t.tipo === 'receita') {
          totalEntradas += valorNum;
        } else {
          totalSaidas += valorNum;
        }

        const dataFormatada = new Date(t.data_transacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <div style="flex-grow: 1; text-align: left;">
            <strong>${t.categoria_nome}</strong><br>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <button onclick="excluirTransacao(${t.id}, 'relatorio')" style="background: none; color: #d32f2f; border: none; padding: 4px 8px; font-size: 16px; cursor: pointer; width: auto; margin: 0;">
              🗑️
            </button>
          </div>
        `;
        listaRelatorioMes.appendChild(li);
      });

      const saldoFinalMes = totalEntradas - totalSaidas;

      resumoReceitas.innerText = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
      resumoDespesas.innerText = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
      saldoMensal.innerText = `R$ ${saldoFinalMes.toFixed(2).replace('.', ',')}`;

      if (cardSaldoMensal) {
        cardSaldoMensal.style.background = saldoFinalMes >= 0 ? 'linear-gradient(135deg, #388e3c, #2e7d32)' : 'linear-gradient(135deg, #e53935, #c62828)';
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// --- FUNÇÃO GLOBAL PARA EXCLUIR LANÇAMENTO ---
window.excluirTransacao = async (id, origem) => {
  if (!confirm('Tem certeza que deseja apagar este lançamento?')) return;

  try {
    const response = await fetch(`${API_URL}/transacoes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      if (origem === 'dashboard') carregarDashboardGeral();
      if (origem === 'relatorio') carregarRelatorioMensal();
    } else {
      const data = await response.json();
      alert(data.erro || 'Erro ao excluir.');
    }
  } catch (error) {
    console.error(error);
  }
};

// --- TELA: NOVO LANÇAMENTO (CARREGAR CATEGORIAS E SALVAR) ---
const carregarCategoriasForm = async () => {
  const selectCategoria = document.getElementById('categoria');
  if (!selectCategoria) return;

  try {
    const response = await fetch(`${API_URL}/categorias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categorias = await response.json();

    if (response.ok) {
      selectCategoria.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nome} (${c.tipo})</option>`).join('');
    }
  } catch (error) {
    console.error(error);
  }
};

const lancamentoForm = document.getElementById('lancamentoForm');
if (lancamentoForm) {
  lancamentoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipo').value;
    const valor = document.getElementById('valor').value;
    const categoria_id = document.getElementById('categoria').value;
    const data_transacao = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;

    try {
      const response = await fetch(`${API_URL}/transacoes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ tipo, valor, categoria_id, data_transacao, descricao })
      });

      if (response.ok) {
        alert('Lançamento salvo com sucesso!');
        window.location.href = 'dashboard.html';
      } else {
        const data = await response.json();
        alert(data.erro || 'Erro ao salvar lançamento.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
    }
  });
}

// Executa funções ao carregar a página dependendo de qual arquivo HTML está aberto
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboardGeral();
  carregarRelatorioMensal();
  carregarCategoriasForm();
  
  const inputData = document.getElementById('data');
  if (inputData) {
    inputData.value = new Date().toISOString().split('T')[0];
  }
});
