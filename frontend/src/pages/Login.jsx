import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [identificador, setIdentificador] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', { identificador });
      
      // Salva os dados na sessão do navegador
      localStorage.setItem('clienteId', response.data.id);
      localStorage.setItem('clienteNome', response.data.nome);
      
      navigate('/'); // Vai para o simulador
      window.location.reload(); // Atualiza para o menu ler o novo estado
    } catch (err) {
      setErro("Usuário não encontrado. Verifique o CPF ou E-mail.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', backgroundColor: 'var(--bg)', color: 'card(--text)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>🚐 Solar MH Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          placeholder="E-mail ou CPF" 
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--card)', color: 'var(--text)', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ENTRAR
        </button>
        {erro && <p style={{ color: 'red', fontSize: '14px' }}>{erro}</p>}
        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          Não tem conta? <a href="/clientes">Cadastre-se</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
