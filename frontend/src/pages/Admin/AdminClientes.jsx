import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Buscar clientes do backend
  useEffect(() => {
    axios.get('http://localhost:8000/admin/clientes')
      .then(res => {
        console.log("Clientes:", res.data);
        setClientes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar clientes:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 Deletar cliente
  const deletarCliente = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este cliente?")) return;

    try {
      await axios.delete(`http://localhost:8000/admin/clientes/${id}`);
      
      // remove da tela sem recarregar
      setClientes(clientes.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  if (loading) return <p>Carregando clientes...</p>;

  return (
    <div>
      <h2>👤 Clientes</h2>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#444', color: 'white' }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Email</th>
            <th style={th}>CPF</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={td}>{cliente.id}</td>
              <td style={td}>{cliente.nome}</td>
              <td style={td}>{cliente.email}</td>
              <td style={td}>{cliente.cpf}</td>
              <td style={td}>
                <button 
                  onClick={() => deletarCliente(cliente.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  🗑️ Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// estilos simples
const th = { padding: '10px', textAlign: 'left' };
const td = { padding: '10px' };

export default AdminClientes;


