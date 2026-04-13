import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:8000/equipamentos", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setEquipamentos(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar equipamentos", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (!user) {
    return <p style={{ padding: "20px" }}>⏳ Carregando...</p>;
  }

  // 🔢 métricas
  const totalEquipamentos = equipamentos.length;
  const consumoTotal = equipamentos.reduce((acc, e) => acc + (e.watts || 0), 0);

  return (
    <div style={{ padding: "20px", background: "#0f172a", minHeight: "100vh", color: "white" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
        <div>
          <h1>👋 Olá, {user.nome}</h1>
          <p style={{ color: "#94a3b8" }}>Bem-vindo ao seu painel</p>
        </div>
        <button onClick={logout} style={{ background: "#dc2626", color: "white", padding: "10px", border: "none", borderRadius: "5px" }}>
          Sair
        </button>
      </div>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        
        <div style={cardStyle}>
          <h3>⚡ Equipamentos</h3>
          <h2>{totalEquipamentos}</h2>
        </div>

        <div style={cardStyle}>
          <h3>🔋 Consumo Total</h3>
          <h2>{consumoTotal} W</h2>
        </div>

        <div style={cardStyle}>
          <h3>📊 Status</h3>
          <h2>Ativo</h2>
        </div>

      </div>

      {/* LISTA DE EQUIPAMENTOS */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px" }}>
        <h2>🔌 Seus Equipamentos</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : equipamentos.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Nenhum equipamento cadastrado.</p>
        ) : (
          <ul style={{ marginTop: "15px" }}>
            {equipamentos.map((e) => (
              <li key={e.id} style={{ marginBottom: "10px" }}>
                <strong>{e.nome}</strong> — {e.watts}W
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AÇÕES */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <Link to="/equipamentos" style={btnStyle}>➕ Adicionar Equipamento</Link>
        <Link to="/fontes" style={btnStyle}>⚡ Configurar Energia</Link>
        <Link to="/simulador" style={btnStyle}>📊 Simular</Link>
      </div>

    </div>
  );
}

// 🎨 estilos
const cardStyle = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "10px",
  minWidth: "200px",
  flex: "1"
};

const btnStyle = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  borderRadius: "5px",
  textDecoration: "none"
};
