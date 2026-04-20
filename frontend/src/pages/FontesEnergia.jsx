import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api'; // ✅ usa api central
import { ThemeContext } from '../context/ThemeContext';

function FontesEnergia() {
  const { isDarkMode } = useContext(ThemeContext);

  // 🔧 estilos dinâmicos
  const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: 'none',
    marginBottom: '5px',
    width: '100%',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text)'
  };

  const sistemaItemStyle = {
    background: isDarkMode ? '#2a2a2a' : '#f4f4f4',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
    borderLeft: '5px solid mediumpurple',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  // 🧠 ESTADOS
  const [fontes, setFontes] = useState({
    painel_watts: 330,
    bateria_ah: 100,
    tipo_controlador: 'MPPT',
    bateria_tipo: 'Litio',
    conversor_acdc_amperes: 30,
    dcdc_amperes: 20,
    publico: true
  });

  const [listaFontes, setListaFontes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [sistemaAtivo, setSistemaAtivo] = useState(null);

  // 🔢 conversão segura
  const handleNumberChange = (campo, valor) => {
    const num = parseFloat(valor);
    setFontes({
      ...fontes,
      [campo]: isNaN(num) ? 0 : num
    });
  };

  // 🔄 carregar fontes
  const carregarFontes = async () => {
    try {
      const res = await api.get("/fontes");
      setListaFontes(res.data);
    } catch (error) {
      console.error("Erro ao carregar fontes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFontes();
  }, []);

  // 💾 salvar
  const handleSalvar = async () => {
    try {
      const payload = {
        painel_watts: Number(fontes.painel_watts),
        bateria_ah: Number(fontes.bateria_ah),
        tipo_controlador: fontes.tipo_controlador,
        bateria_tipo: fontes.bateria_tipo,
        conversor_acdc_amperes: Number(fontes.conversor_acdc_amperes),
        dcdc_amperes: Number(fontes.dcdc_amperes),
        publico: Boolean(fontes.publico)
      };

      await api.post("/fontes", payload);

      await carregarFontes();

      setStatus("✅ Salvo com sucesso!");
    } catch (error) {
      console.error(error);
      setStatus("❌ Erro ao salvar");
    }
  };

  // 🎯 selecionar sistema
  const handleSelecionar = (fonte) => {
    setSistemaAtivo(fonte);
    localStorage.setItem("sistemaSimulacao", JSON.stringify(fonte));
    setStatus(`Sistema #${fonte.id} selecionado`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Fontes de Energia</h2>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input
          style={inputStyle}
          type="number"
          value={fontes.bateria_ah}
          onChange={e => handleNumberChange("bateria_ah", e.target.value)}
          placeholder="Bateria Ah"
        />

        <input
          style={inputStyle}
          type="number"
          value={fontes.painel_watts}
          onChange={e => handleNumberChange("painel_watts", e.target.value)}
          placeholder="Painel Watts"
        />

        <button onClick={handleSalvar}>
          Salvar
        </button>

        {status && <p>{status}</p>}
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Carregando...</p>
      ) : listaFontes.length === 0 ? (
        <p>Nenhuma fonte cadastrada</p>
      ) : (
        listaFontes.map(f => (
          <div
            key={f.id}
            style={{
              ...sistemaItemStyle,
              borderLeftColor:
                sistemaAtivo?.id === f.id ? "#28a745" : "mediumpurple"
            }}
          >
            <div>
              <strong>#{f.id}</strong> - {f.painel_watts}W | {f.bateria_ah}Ah
            </div>

            <button onClick={() => handleSelecionar(f)}>
              Usar
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FontesEnergia;
