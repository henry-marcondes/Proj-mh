import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminFontes() {
  const [fontes, setFontes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    axios.get("http://localhost:8000/admin/fontes", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      console.log("Fontes:", res.data);
      setFontes(res.data);
    })
    .catch(err => {
      console.error("Erro ao carregar fontes:", err);
    });
  }, []);

  return (
    <div>
      <h2>⚡ Fontes de Energia</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Painel</th>
            <th>Bateria</th>
            <th>AC-DC</th>
            <th>DC-DC</th>
          </tr>
        </thead>
        <tbody>
          {fontes.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.painel_watts}W</td>
              <td>{f.bateria_ah}Ah</td>
              <td>{f.conversor_acdc_amperes}A</td>
              <td>{f.dcdc_amperes}A</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFontes;
