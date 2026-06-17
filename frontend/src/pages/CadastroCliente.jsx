import React, { useState, useContext } from 'react';
import { AuthContext } from "../context/AuthContext";
import { register } from "../services/auth";
import { useNavigate } from "react-router-dom";

function CadastroCliente() {
  const { loginUser } = useContext(AuthContext); // ✅ dentro do componente
  const navigate = useNavigate(); // ✅ dentro do componente

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    fone: '',
    senha: ''
  });

  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await register(formData);

      // login automático
      loginUser(response.data);

      // redireciona
      navigate("/simulador");

    } catch (error) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: 'Erro no cadastro' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <h2 style={{ textAlign: 'center' }}>👤 Cadastro </h2>
      <input placeholder="Nome" onChange={e => setFormData({...formData, nome: e.target.value})}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
      <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
      <input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
      <input placeholder="Fone" onChange={e => setFormData({...formData, fone: e.target.value})} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
      <input type="password" placeholder="Senha" onChange={e => setFormData({...formData, senha: e.target.value})} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
      <button type="submit" 
              style={{ 
                padding: '10px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold' 
              }}
                >Cadastrar</button>
    </form>
  );
}

export default CadastroCliente;
