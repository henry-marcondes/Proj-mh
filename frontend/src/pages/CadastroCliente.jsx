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
      <input placeholder="Nome" onChange={e => setFormData({...formData, nome: e.target.value})} />
      <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
      <input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} />
      <input placeholder="Fone" onChange={e => setFormData({...formData, fone: e.target.value})} />
      <input type="password" placeholder="Senha" onChange={e => setFormData({...formData, senha: e.target.value})} />
      <button type="submit">Cadastrar</button>
    </form>
  );
}

export default CadastroCliente;
