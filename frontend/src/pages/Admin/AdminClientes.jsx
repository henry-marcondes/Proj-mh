import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminClientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    axios.get("http://localhost:8000/admin/clientes", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      console.log("Clientes:", res.data);
      setClientes(res.data);
    })
    .catch(err => {
      console.error("Erro ao carregar clientes:", err);
    });
  }, []);

  return (
    <div>
      <h2>👥 Clientes</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>CPF</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
              <td>{c.email}</td>
              <td>{c.cpf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminClientes;
