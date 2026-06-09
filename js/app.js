const API_URL = 'https://sistema-financas-backend.onrender.com';
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


// --- FUNÇÃO AUXILIAR: TRATAMENTO SEGURO DE DATA ---
const formatarDataSegura = (dataStr) => {
  if (!dataStr) return 'S/D';
  try {
    const dataObjeto = new Date(dataStr);
    if (!isNaN(dataObjeto.getTime())) {
      return dataObjeto.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }
    const parteData = dataStr.substring(0, 10);
    const [ano, mes, dia] = parteData.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return 'S/D';
  }
};


// --- DASHBOARD (ATUALIZADO) ---
const carregarDashboardGeral = async () => {
  const totalBalance = document.getElementById('totalBalance');
  const historyList = document.getElementById('historyList');
  if (!historyList) return; // Aborta silenciosamente se não estiver na página index/dashboard

  try {
    const response = await fetch(`${API_URL}/api/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const transacoes = await response.json();

    if (response.ok) {
      let saldoTotal = 0;
      historyList.innerHTML = '';

      if (!Array.isArray(transacoes) || transacoes.length === 0) {
        historyList.innerHTML = '<li class="history-item">Nenhum lançamento encontrado.</li>';
        if (totalBalance) totalBalance.innerText = "R$ 0,00";
        return;
      }

      transacoes.forEach(t => {
        const valorNum = parseFloat(t.valor);
        if (t.tipo === 'receita') saldoTotal += valorNum;
        else saldoTotal -= valorNum;
      });

      const transacoesOrdenadas = [...transacoes].sort((a, b) => {
        if (a.tipo === 'receita' && b.tipo === 'despesa') return -1;
        if (a.tipo === 'despesa' && b.tipo === 'receita') return 1;
        return 0;
      });

      transacoesOrdenadas.forEach(t => {
        const valorNum = parseFloat(t.valor);
        const dataFormatada = formatarDataSegura(t.data_transacao);

        const li = document.createElement('li');
        li.className = 'history-item';

        li.innerHTML = `
          <div class="info-esquerda">
            <strong>${t.categoria_nome || 'Outros'}</strong>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div class="info-direita">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <div class="acoes-botoes" style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-editar-dash" style="background: none; border: none; cursor: pointer; font-size: 16px;" onclick="editarTransacaoPrompt(${t.id}, '${t.descricao || ''}', ${valorNum}, 'dashboard')">
                📝
              </button>
              <button class="btn-deletar-dash" style="background: none; border: none; cursor: pointer; font-size: 16px;" onclick="excluirTransacao(${t.id}, 'dashboard')">
                🗑️
              </button>
            </div>
          </div>
        `;
        historyList.appendChild(li);
      });

      if (totalBalance) {
        totalBalance.innerText = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;
      }

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
  if (!lista || !filtro) return; // Aborta silenciosamente se não estiver na página de relatórios

  try {
    const response = await fetch(`${API_URL}/api/transacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const transacoes = await response.json();

    if (response.ok) {
      if (!Array.isArray(transacoes) || transacoes.length === 0) return;

      if (filtro.options.length <= 0 && transacoes.length > 0) {
        const mesesDisponiveis = [...new Set(transacoes.map(t => t.data_transacao ? t.data_transacao.substring(0, 7) : ''))].filter(Boolean);
        
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

      const mesSelecionado = filtro.value;
      let entradas = 0;
      let saidas = 0;
      lista.innerHTML = '';

      const filtradas = transacoes.filter(t =>
        t.data_transacao && t.data_transacao.substring(0, 7) === mesSelecionado
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
        const dataFormatada = formatarDataSegura(t.data_transacao);

        const li = document.createElement('li');
        li.className = 'history-item';

        li.innerHTML = `
          <div class="info-esquerda">
            <strong>${t.categoria_nome || 'Outros'}</strong>
            <small>${t.descricao || ''} (${dataFormatada})</small>
          </div>
          <div class="info-direita">
            <span class="item-amount ${t.tipo}">
              ${t.tipo === 'receita' ? '+' : '-'} R$ ${valorNum.toFixed(2).replace('.', ',')}
            </span>
            <div class="acoes-botoes" style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-editar-dash" style="background: none; border: none; cursor: pointer; font-size: 16px;" onclick="editarTransacaoPrompt(${t.id}, '${t.descricao || ''}', ${valorNum}, 'relatorio')">
                📝
              </button>
              <button class="btn-deletar-dash" style="background: none; border: none; cursor: pointer; font-size: 16px;" onclick="excluirTransacao(${t.id}, 'relatorio')">
                🗑️
              </button>
            </div>
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


// --- REQUISIÇÃO DE EDIÇÃO INTERATIVA ---
window.editarTransacaoPrompt = async (id, descricaoAtual, valorAtual, origem) => {
  const novaDescricao = prompt("Digite a nova descrição:", descricaoAtual);
  if (novaDescricao === null) return; 

  const novoValorStr = prompt("Digite o novo valor (use ponto para centavos):", valorAtual);
  if (novoValorStr === null) return;

  const novoValor = parseFloat(novoValorStr.replace(',', '.'));
  if (isNaN(novoValor)) {
    alert("Valor inválido.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/transacoes/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        descricao: novaDescricao,
        valor: novoValor
      })
    });

    if (response.ok) {
      alert("Lançamento atualizado com sucesso!");
      if (origem === 'dashboard') carregarDashboardGeral();
      if (origem === 'relatorio') carregarRelatorioMensal();
    } else {
      const data = await response.json();
      alert(data.erro || "Erro ao atualizar registro.");
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
};


// --- EXCLUIR ---
window.excluirTransacao = async (id, origem) => {
  if (!confirm('Deseja excluir?')) return;

  try {
    await fetch(`${API_URL}/api/transacoes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

