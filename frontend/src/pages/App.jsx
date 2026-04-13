import React, { useState, useEffect, useRef, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ToggleTheme from '../context/ToggleTheme.jsx';
import axios from 'axios';

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
import MeusProjetos from "./MeusProjetos";
import Perfil from "./Perfil";
import Cadastro from "./Cadastro";

import { AuthProvider, AuthContext } from "../context/AuthContext";
import PrivateRoute from "../routes/PrivateRoute";
import Dashboard from './Dashboard.jsx';

function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  // ✅ CORRETO: useContext aqui em cima
  const { user, logout } = useContext(AuthContext);

  const loginAdmin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/admin/login", {
        usuario: "admin",
        senha: "1234"
      });

      localStorage.setItem("adminToken", response.data.access_token);
      alert("Login admin OK");
    } catch (error) {
      console.error("ERRO LOGIN:", error);
      alert("Erro no login admin");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
      <Router>
        <ToggleTheme />

        {/* MENU */}
        <div style={{ padding: '10px', background: '#2c3e50', color: 'white' }}>
          <button onClick={() => setMenuAberto(!menuAberto)}>
            ☰ Menu
          </button>

          {menuAberto && (
            <div
              ref={menuRef}
              style={{
                position: 'absolute',
                top: '50px',
                left: '10px',
                background: 'var(--bg)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000
              }}
            >

              {/* USUÁRIO */}
              {user ? (
                <>
                  <p style={{ color: '#1abc9c' }}>✅ Olá, {user.nome}</p>
                  <button onClick={logout}>Sair</button>
                </>
              ) : (
                <Link to="/login">🔑 Login</Link>
              )}

              <Link to="/meus-projetos">📁 Meus Projetos</Link>
              <Link to="/perfil">👤 Perfil</Link>
              <Link to="/">📊 Simulador</Link>
              <Link to="/cadastro">👤 Cadastro</Link>
              <Link to="/fontes">⚡ Fontes</Link>
              <Link to="/equipamentos">🔌 Equipamentos</Link>
              <Link to="/painelcontrole">📄 Painel Controle</Link>
              <Link to="/admin">🔐 Admin</Link>
            </div>
          )}
        </div>

        {/* CONTEÚDO */}
        <main style={{ padding: '20px', backgroundColor: '#767bd1', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Simulador />} />

            <Route path="/simulador" element={
              <PrivateRoute><Simulador /></PrivateRoute>
            } />
           
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />

            <Route path="/cadastro" element={<Cadastro />} />

            <Route path="/fontes" element={
              <PrivateRoute><FontesEnergia /></PrivateRoute>
            } />

            <Route path="/equipamentos" element={
              <PrivateRoute><Equipamentos /></PrivateRoute>
            } />

            <Route path="/login" element={<Login />} />
            <Route path="/painelcontrole" element={<PainelControle />} />
            <Route path="/meus-projetos" element={<MeusProjetos />} />

            <Route path="/perfil" element={
              <PrivateRoute><Perfil /></PrivateRoute>
            } />

            <Route path="/admin" element={<Admin />}>
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="fontes" element={<AdminFontes />} />
              <Route path="equipamentos" element={<AdminEquipamentos />} />
            </Route>
          </Routes>
        </main>
      </Router>
  );
}

export default App;
