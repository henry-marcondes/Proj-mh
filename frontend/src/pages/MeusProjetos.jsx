import { useEffect, useState } from "react";
import axios from "axios";

export default function MeusProjetos() {
  const [simulacoes, setSimulacoes] = useState([]);

  const carregarSimulacoes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8000/simulacoes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSimulacoes(res.data);

    } catch (error) {
      console.error(error);
      alert("Erro ao carregar simulações");
    }
  };

  useEffect(() => {
    carregarSimulacoes();
  }, []);

  return (
    <div>
      <h2>📁 Meus Projetos</h2>

      {simulacoes.length === 0 && <p>Nenhuma simulação salva.</p>}

      {simulacoes.map((sim) => (
        <div key={sim.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{sim.nome}</h3>

          <button onClick={() => console.log(sim.dados)}>
            🔁 Carregar
          </button>
        </div>
      ))}
    </div>
  );
}
