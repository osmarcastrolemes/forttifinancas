const API_URL = 'https://onrender.com';
const token = localStorage.getItem('token');

// Se não estiver logado, redireciona
if (!token && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('cadastro.html')) {
  window.location.href = 'index.html';
}

// --- LOGOUT ---
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


// --- DASHBOARD (ATUALIZADO: ORDENAÇÃO E ALINHAMENTO) ---
const carregarDashboardGeral = async () => {
  const totalBalance = document.getElementById('totalBalance');
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  try {
    const response = await fetch(`${API_URL}/api/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const transacoes = await response.json();

    if (response.ok) {
      let saldoTotal = 0;
      historyList.innerHTML = '';

      if (transacoes.length === 0) {
        historyList.innerHTML = '<li class="history-item">Nenhum lançamento encontrado.</li>';
        totalBalance.innerText = "R$ 0,00";
        return;
      }

      // 1. PASSO IMPORTANTE: Calcula o saldo total baseado na lista completa original
      transacoes.forEach(t => {
        const valorNum = parseFloat(t.valor);
        if (t.tipo === 'receita') saldoTotal += valorNum;
        else saldoTotal -= valorNum;
      });

      // 2. ORDENAÇÃO: Cria uma cópia e põe as receitas no topo da lista visual
      const transacoesOrdenadas = [...transacoes].sort((a, b) => {
        if (a.tipo === 'receita' && b.tipo === 'despesa') return -1;
        if (a.tipo === 'despesa' && b.tipo === 'receita') return 1;
        return 0;
      });

      // 3. RENDERIZAÇÃO: Monta os itens ordenados na tela com as novas classes limpas
      transacoesOrdenadas.forEach(t => {
        const valorNum = parseFloat(t.valor);
        const dataFormatada = new Date(t.data_transacao)
          .toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const li = document.createElement('li');
        li.className = 'history-item'; // Garante o flexbox no CSS

        li.innerHTML = `
          <div class="info-esquerda">
            <strong>${t.categoria_nome}</strong>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div class="info-direita">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <button class="btn-deletar-dash" onclick="excluirTransacao(${t.id}, 'dashboard')">
              🗑️
            </button>
          </div>
        `;
        historyList.appendChild(li);
      });

      // Atualiza o valor do card e a cor de fundo baseado no saldo total acumulado
      totalBalance.innerText = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;

      const balanceCard = document.querySelector('.balance-card');
      if (balanceCard) {
        balanceCard.style.background = saldoTotal >= 0
          ? 'linear-gradient(135deg, #388e3c, #2e7d32)'
          : 'linear-gradient(135deg, #e53935, #c62828)';
      }
    }
  } catch (error) {
    console.error(error);
  }
};


// --- RELATÓRIO MENSAL (ATUALIZADO) ---
const carregarRelatorioMensal = async () => {
  const lista = document.getElementById('listaRelatorioMes');
  const filtro = document.getElementById('filtroMesRelatorio');
  if (!lista || !filtro) return;

  try {
    const response = await fetch(`${API_URL}/api/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const transacoes = await response.json();

    if (response.ok) {
      // 1. POPULAR OS MESES DINAMICAMENTE
      if (filtro.options.length <= 0 && transacoes.length > 0) {
        const mesesDisponiveis = [...new Set(transacoes.map(t => t.data_transacao.substring(0, 7)))];
        
        mesesDisponiveis.sort((a, b) => b.localeCompare(a));
        filtro.innerHTML = ''; 

        mesesDisponiveis.forEach(anoMes => {
          const [ano, mes] = anoMes.split('-');
          const dataObjeto = new Date(ano, parseInt(mes) - 1, 1);
          const nomeMes = dataObjeto.toLocaleDateString('pt-BR', { month: 'long' });
          const nomeMesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

          const option = document.createElement('option');
          option.value = anoMes;
          option.innerText = `${nomeMesCapitalizado} de ${ano}`;
          filtro.appendChild(option);
        });

        filtro.onchange = () => carregarRelatorioMensal();
      }

      if (filtro.options.length === 0) {
        const mesAtualStr = new Date().toISOString().substring(0, 7);
        const option = document.createElement('option');
        option.value = mesAtualStr;
        option.innerText = "Nenhum histórico ativo";
        filtro.appendChild(option);
      }

      // 2. FILTRAGEM E RENDERIZAÇÃO
      const mesSelecionado = filtro.value;
      let entradas = 0;
      let saidas = 0;
      lista.innerHTML = '';

      const filtradas = transacoes.filter(t =>
        t.data_transacao.substring(0, 7) === mesSelecionado
      );

      if (filtradas.length === 0) {
        lista.innerHTML = '<li class="history-item">Nenhum lançamento neste período.</li>';
        document.getElementById('resumoReceitas').innerText = 'R$ 0,00';
        document.getElementById('resumoDespesas').innerText = 'R$ 0,00';
        document.getElementById('saldoMensal').innerText = 'R$ 0,00';
        return;
      }

      filtradas.forEach(t => {
        const valor = parseFloat(t.valor);
        if (t.tipo === 'receita') entradas += valor;
        else saidas += valor;
      });

      const filtradasEOrdenadas = [...filtradas].sort((a, b) => {
        if (a.tipo === 'receita' && b.tipo === 'despesa') return -1;
        if (a.tipo === 'despesa' && b.tipo === 'receita') return 1;
        return 0;
      });

      filtradasEOrdenadas.forEach(t => {
        const valorNum = parseFloat(t.valor);
        const dataFormatada = new Date(t.data_transacao)
          .toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        const li = document.createElement('li');
        li.className = 'history-item';

        li.innerHTML = `
          <div class="info-esquerda">
            <strong>${t.categoria_nome}</strong>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div class="info-direita">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <button class="btn-deletar-dash" onclick="excluirTransacao(${t.id}, 'relatorio')">
              🗑️
            </button>
          </div>
        `;
        lista.appendChild(li);
      });

      document.getElementById('resumoReceitas').innerText = `R$ ${entradas.toFixed(2).replace('.', ',')}`;
      document.getElementById('resumoDespesas').innerText = `R$ ${saidas.toFixed(2).replace('.', ',')}`;
      
      const saldoMensalTotal = entradas - saidas;
      document.getElementById('saldoMensal').innerText = `R$ ${saldoMensalTotal.toFixed(2).replace('.', ',')}`;
    }
  } catch (err) {
    console.error(err);
  }
};


// --- EXCLUIR ---
window.excluirTransacao = async (id, origem) => {
  if (!confirm('Deseja excluir?')) return;

  await fetch(`${API_URL}/api/transacoes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (origem === 'dashboard') carregarDashboardGeral();
  if (origem === 'relatorio') carregarRelatorioMensal();
};


// --- CATEGORIAS ---
const carregarCategoriasForm = async () => {
  const select = document.getElementById('categoria');
  if (!select) return;

  const res = await fetch(`${API_URL}/api/categorias`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const categorias = await res.json();

  select.innerHTML = categorias
    .map(c => `<option value="${c.id}">${c.nome}</option>`)
    .join('');
};


// --- FORM LANÇAMENTO ---
const form = document.getElementById('lancamentoForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      tipo: document.getElementById('tipo').value,
      valor: document.getElementById('valor').value,
      categoria_id: document.getElementById('categoria').value,
      data_transacao: document.getElementById('data').value,
      descricao: document.getElementById('descricao').value
    };

    const res = await fetch(`${API_URL}/api/transacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert('Salvo!');
      window.location.href = 'dashboard.html';
    } else {
      const data = await res.json();
      alert(data.erro);
    }
  });
}


// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboardGeral();
  carregarRelatorioMensal();
  carregarCategoriasForm();

  const input = document.getElementById('data');
  if (input) input.value = new Date().toISOString().split('T')[0];
});
