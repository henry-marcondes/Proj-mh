import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    axios.get("http://localhost:8000/admin/equipamentos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      console.log("Equipamentos:", res.data);
      setEquipamentos(res.data);
    })
    .catch(err => {
      console.error("Erro ao carregar equipamentos:", err);
    });
  }, []);

  return (
    <div>
      <h2>🔌 Equipamentos</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Watts</th>
            <th>Início</th>
            <th>Fim</th>
          </tr>
        </thead>
        <tbody>
          {equipamentos.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.nome}</td>
              <td>{e.watts}</td>
              <td>{e.hora_inicio}h</td>
              <td>{e.hora_fim}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminEquipamentos;
