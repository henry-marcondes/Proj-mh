import React, { useState } from 'react';
import axios from 'axios';

function CadastroCliente() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    fone: ''
  });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/clientes/', formData);
      setMensagem({ tipo: 'sucesso', texto: `Cliente ${response.data.nome} cadastrado com ID: ${response.data.id}!` });
      // Limpa o formulário após sucesso
      setFormData({ nome: '', email: '', cpf: '', fone: '' });
    } catch (error) {
      const erroMsg = error.response?.data?.detail || "Erro ao conectar com o servidor";
      setMensagem({ tipo: 'erro', texto: erroMsg });
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', backgroundColor: 'var(--bg)', color: 'var(--text)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h1>👤 Cadastro de Cliente</h1>
      
      {mensagem.texto && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '4px', 
          backgroundColor: mensagem.tipo === 'sucesso' ? '#d4edda' : '#f8d7da',
          color: mensagem.tipo === 'sucesso' ? '#155724' : '#721c24'
        }}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          placeholder="Nome Completo" 
          value={formData.nome} 
          onChange={e => setFormData({...formData, nome: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="email" 
          placeholder="E-mail" 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          placeholder="CPF (apenas números)" 
          value={formData.cpf} 
          onChange={e => setFormData({...formData, cpf: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          placeholder="Telefone" 
          value={formData.fone} 
          onChange={e => setFormData({...formData, fone: e.target.value})} 
          style={{ padding: '10px' }}
        />
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            backgroundColor: 'var(--card)', 
            color: 'var(--text)', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Salvar Cliente
        </button>
      </form>
    </div>
  );
}

export default CadastroCliente;
