import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Buscar equipamentos do backend
  useEffect(() => {
    carregarEquipamentos();
  }, []);

  const carregarEquipamentos = async () => {
    try {
      const response = await axios.get("http://localhost:8000/admin/equipamentos");
      setEquipamentos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
      setLoading(false);
    }
  };

  // ❌ Deletar equipamento
  const deletarEquipamento = async (id) => {
    if (!window.confirm("Deseja deletar este equipamento?")) return;

    try {
      await axios.delete(`http://localhost:8000/equipamentos/${id}`);
      carregarEquipamentos(); // 🔄 Atualiza lista
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar equipamento");
    }
  };

  if (loading) return <p>Carregando equipamentos...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚙️ Administração de Equipamentos</h2>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px"
      }}>
        <thead>
          <tr style={{ backgroundColor: "#333", color: "#fff" }}>
            <th style={th}>ID</th>
            <th style={th}>Cliente</th>
            <th style={th}>Nome</th>
            <th style={th}>Watts</th>
            <th style={th}>Início</th>
            <th style={th}>Fim</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {equipamentos.map((eq) => (
            <tr key={eq.id}>
              <td style={td}>{eq.id}</td>
              <td style={td}>{eq.cliente_id}</td>
              <td style={td}>{eq.nome}</td>
              <td style={td}>{eq.watts} W</td>
              <td style={td}>{eq.hora_inicio}h</td>
              <td style={td}>{eq.hora_fim}h</td>
              <td style={td}>
                <button
                  onClick={() => deletarEquipamento(eq.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🎨 estilos simples
const th = {
  padding: "10px",
  border: "1px solid #ccc"
};

const td = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "center"
};

export default AdminEquipamentos;
