import React, { useState, useEffect } from 'react'; // Importe os hooks
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ToggleTheme from '../context/ToggleTheme.jsx';

// Seus imports de páginas...
import CadastroCliente from './CadastroCliente';
import Equipamentos from './Equipamentos.jsx';
import FontesEnergia from './FontesEnergia';
import Simulador from './Simulador';
import Login from './Login';
import PainelControle from './PainelControle';
import Admin from './Admin';
import AdminClientes from './Admin/AdminClientes';
import AdminFontes from './Admin/AdminFontes';
import AdminEquipamentos from './Admin/AdminEquipamentos';

function App() {
  // 1. Crie um estado para o nome do cliente
  const [usuario, setUsuario] = useState(null);

  // 2. Use o useEffect para ler o localStorage assim que o App carregar
  useEffect(() => {
    const nome = localStorage.getItem('clienteNome');
    setUsuario(nome);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsuario(null); // Limpa o estado para o botão sumir na hora
    window.location.href = '/login';
  };

  return (
    <Router>
      < ToggleTheme />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Menu Lateral */}
        <nav style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
          <h2>Solar MH</h2>
          
          {/* 3. Verifique o estado 'usuario' em vez da variável externa */}
          {usuario ? (
            <>
              <p style={{ fontSize: '14px', color: '#1abc9c' }}>✅ Olá, {usuario}!</p>
              <button 
                onClick={handleLogout} 
                style={{ marginBottom: '20px', background: 'none', color: 'orange', border: '1px solid orange', cursor: 'pointer', padding: '5px' }}
              >
                Sair
              </button>
            </>
          ) : (
            <li style={{ listStyle: 'none', margin: '15px 0' }}>
              <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>🔑 Entrar / Login</Link>
            </li>
          )}

          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '15px 0' }}><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>📊 Simulador</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/clientes" style={{ color: 'white', textDecoration: 'none' }}>👤 Cadastro Clientes</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/fontes" style={{ color: 'white', textDecoration: 'none' }}>⚡ Fontes de Energia</Link></li>
            <li style={{ margin: '15px 0' }}><Link to="/equipamentos" style={{ color: 'white', textDecoration: 'none' }}>🔌 Equipamentos</Link></li>
	    <li style={{ margin: '15px 0'}}><Link to="/painelcontrole" style={{ color: 'white', textDecoration: 'none'}}> 📄 Painel Controle</Link></li>
          </ul>
        </nav>

        {/* Área de Conteúdo */}
        <main style={{ flex: 1, padding: '20px', backgroundColor: '#767bd1' }}>
          <Routes>
            <Route path="/" element={<Simulador />} />
            <Route path="/clientes" element={<CadastroCliente />} />
            <Route path="/fontes" element={<FontesEnergia />} />
            <Route path="/equipamentos" element={<Equipamentos />} />
            <Route path="/login" element={<Login />} />
	        <Route path="/painelcontrole" element={<PainelControle />} />
            <Route path="/admin" element={<Admin />}>
                <Route path="clientes" element={<AdminClientes />} />
                <Route path="fontes" element={<AdminFontes />} />
                <Route path="equipamentos" element={<AdminEquipamentos />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
