:root {
  --primary: #2e7d32;
  --expense: #d32f2f;
  --revenue: #2e7d32;
  --background: #f5f5f5;
  --surface: #ffffff;
  --text: #333333;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: var(--background);
  color: var(--text);
  overflow-x: hidden;
}

/* --- AJUSTE DA TELA DE LOGIN (Sem rolagem no mobile) --- */
.page-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Força o rodapé para o fim e o card para o centro */
  align-items: center;
  min-height: 100vh;
  min-height: 100dvh; /* Altura dinâmica moderna para navegadores mobile */
  padding: 16px;
}

/* Container adaptado para formato mobile e web */
.app-container {
  width: 100%;
  max-width: 412px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  padding: 24px 24px 84px 24px; /* AJUSTADO: Espaço extra no fundo para a barra de menu não cobrir o conteúdo */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px auto; /* AJUSTADO: Centraliza na horizontal e remove o esmagamento vertical */
  position: relative; /* AJUSTADO: Mantém o menu preso estritamente ao rodapé deste container */
  min-height: calc(100vh - 40px); /* AJUSTADO: Ocupa quase a tela inteira de forma harmônica */
}

.app-header p {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: -16px;
  margin-bottom: 24px;
}

h2 {
  margin-bottom: 24px;
  color: var(--primary);
  text-align: center;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
}

.input-group input, .input-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fcfcfc;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
}

/* Seus botões (.btn-submit ou button genérico) */
button, .btn-submit {
  width: 100%;
  padding: 14px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s;
}

button:hover, .btn-submit:hover {
  background-color: #215d25;
}

.link-alt {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.link-alt a {
  color: var(--primary);
  text-decoration: none;
  font-weight: bold;
}

.link-alt a:hover {
  text-decoration: underline;
}

/* Rodapé Ajustado para Mobile */
.app-footer {
  width: 100%;
  max-width: 412px;
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  color: #666;
}

/* --- MANUTENÇÃO DOS SEUS ESTILOS DO DASHBOARD (Preservados intactos) --- */
.balance-card {
  background: linear-gradient(135deg, #388e3c, #2e7d32);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
}

.history-list {
  list-style: none;
  overflow-y: auto;
  flex-grow: 1;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #eee;
}

.info-esquerda {
  display: flex;
  flex-direction: column;
  text-align: left;
  max-width: 60%;
}

.info-esquerda strong {
  font-size: 16px;
  color: #333;
}

.info-esquerda small {
  font-size: 13px;
  color: #777;
  margin-top: 2px;
}

.info-direita {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  white-space: nowrap;
}

.item-amount {
  font-weight: bold;
  font-size: 16px;
}

.item-amount.despesa { 
  color: var(--expense); 
}

.item-amount.receita { 
  color: var(--revenue); 
}

.btn-deletar-dash {
  background: none;
  color: var(--expense);
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-bottom {
  position: absolute; /* AJUSTADO: Fixa no rodapé absoluto do container pai */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: white;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 12px; /* AJUSTADO: Mantém o visual arredondado do card */
  border-bottom-right-radius: 12px; /* AJUSTADO: Mantém o visual arredondado do card */
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 10; /* AJUSTADO: Garante que fique acima de qualquer rolagem da lista */
}

.nav-bottom a {
  text-decoration: none;
  color: #777;
  font-size: 14px;
  text-align: center;
}
