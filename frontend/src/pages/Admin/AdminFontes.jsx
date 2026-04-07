import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminFontes() {
  const [fontes, setFontes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Buscar fontes
  useEffect(() => {
    axios.get('http://localhost:8000/admin/fontes')
      .then(res => {
        console.log("Fontes:", res.data);
        setFontes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar fontes:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 Deletar fonte
  const deletarFonte = async (id) => {
    if (!window.confirm("Deseja deletar este sistema?")) return;

    try {
      await axios.delete(`http://localhost:8000/admin/fontes/${id}`);
      setFontes(fontes.filter(f => f.id !== id));
    } catch (error) {
      console.error("Erro ao deletar fonte:", error);
    }
  };

  if (loading) return <p>Carregando sistemas...</p>;

  return (
    <div>
      <h2>⚡ Sistemas de Energia</h2>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#444', color: 'white' }}>
            <th style={th}>ID</th>
            <th style={th}>Cliente</th>
            <th style={th}>Painel (W)</th>
            <th style={th}>Bateria</th>
            <th style={th}>AC-DC</th>
            <th style={th}>DC-DC</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {fontes.map(fonte => (
            <tr key={fonte.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={td}>{fonte.id}</td>
              <td style={td}>{fonte.cliente_id}</td>
              <td style={td}>{fonte.painel_watts} W</td>
              <td style={td}>
                {fonte.bateria_ah}Ah ({fonte.bateria_tipo})
              </td>
              <td style={td}>{fonte.conversor_acdc_amperes} A</td>
              <td style={td}>{fonte.dcdc_amperes} A</td>
              <td style={td}>
                <button 
                  onClick={() => deletarFonte(fonte.id)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text)',
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

const th = { padding: '10px', textAlign: 'left' };
const td = { padding: '10px' };

export default AdminFontes;
