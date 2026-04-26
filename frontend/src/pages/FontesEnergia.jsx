import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api'; // ✅ usa api central
import { ThemeContext } from '../context/ThemeContext';

function FontesEnergia() {
  const { isDarkMode } = useContext(ThemeContext);
  const user = JSON.parse(localStorage.getItem("user"));
  // 🔧 estilos dinâmicos

const helpText = {
    fontSize: '11px',
    color: '#eee',
    fontStyle: 'italic',
    marginBottom: '10px'
};

const buttonSimularStyle = {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '12px',
    marginTop: '8px'
};

  const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: 'none',
    marginBottom: '5px',
    width: '100%',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text)'
  };

    const fieldsetStyle = {
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'}`,
        borderRadius: '5px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginBottom: '10px'
    };

  const cardStyle = {
    maxWidth: '600px',
    width: '100%',
    padding: '20px',
    backgroundColor: 'var(--card)',
    borderRadius: '8px',
    color: 'var(--text)'
  };


  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'sans-serif',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    minHeight: '100vh'
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
        painel_watts: Number(fontes.painel_watts) || 0,
        bateria_ah: Number(fontes.bateria_ah) || 0,
        tipo_controlador: String(fontes.tipo_controlador || "MPPT"),
        bateria_tipo: String(fontes.bateria_tipo || "Litio"),
        conversor_acdc_amperes: Number(fontes.conversor_acdc_amperes) || 0,
        dcdc_amperes: Number(fontes.dcdc_amperes) || 0,
        publico: Boolean(fontes.publico)
    };
      console.log("User:", user);
      console.log("📤 PAYLOAD FINAL:", payload);  
      await api.post("/fontes/", payload);

      await carregarFontes();

      setStatus("✅ Salvo com sucesso!");
    }  catch (error) {
            console.error("❌ Erro completo:", error);

            console.log("📩 Erro backend:", error.response?.data);

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
      
        <div style={containerStyle}>
            
            <div style={cardStyle}>
                <h2>⚡ Configuração do Sistema</h2>
                <p>👤 Usuário: {user?.nome}</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    <fieldset style={fieldsetStyle}>
                        <legend>🔋 Armazenamento</legend>
                        <label>Capacidade Bateria (Ah):</label>
                        <input type="number" style={inputStyle} value={fontes.bateria_ah} 
                            onChange={e => handleNumberChange('bateria_ah', e.target.value)} />
                        
                        <label>Tipo:</label>
                        <select style={inputStyle} value={fontes.bateria_tipo} onChange={e => setFontes({...fontes, bateria_tipo: e.target.value})}>
                            <option value="Litio">Lítio</option>
                            <option value="Estacionaria">Estacionária</option>
                        </select>
                    </fieldset>

                    <fieldset style={fieldsetStyle}>
                        <legend>☀️ Geração e Controle</legend>
                        <label>Painéis (Watts):</label>
                        <input type="number" style={inputStyle} value={fontes.painel_watts} 
                            onChange={e => handleNumberChange('painel_watts', e.target.value)} />
                        
                        <label>Controlador:</label>
                        <select style={inputStyle} value={fontes.tipo_controlador} onChange={e => setFontes({...fontes, tipo_controlador: e.target.value})}>
                            <option value="MPPT">MPPT</option>
                            <option value="PWM">PWM</option>
                        </select>
                    </fieldset>

                    <fieldset style={fieldsetStyle}>
                        <legend>🔌 Carregadores Extras</legend>
                        <label>Conversor AC-DC (Amperes):</label>
                        <input type="number" style={inputStyle} value={fontes.conversor_acdc_amperes} 
                            onChange={e => handleNumberChange('conversor_acdc_amperes', e.target.value)} />
                        <span style={helpText}>Tomada externa / Camping</span>

                        <label>DC-DC / Alternador (Amperes):</label>
                        <input type="number" style={inputStyle} value={fontes.dcdc_amperes} 
                            onChange={e => handleNumberChange('dcdc_amperes', e.target.value)} />
                        <span style={helpText}>Carga enquanto dirige</span>
                    </fieldset>

                    <fieldset style={fieldsetStyle}>
                        <legend>🌎 Visibilidade</legend>
                        <label>Tornar esta configuração pública?</label>
                        <select 
                            style={inputStyle} 
                            value={fontes.publico ? "true" : "false"}
                            onChange={e => setFontes({...fontes, publico: e.target.value === "true"})} >
                            <option value="true">Sim, compartilhar com a comunidade</option>
                            <option value="false">Não, manter privado</option>
                        </select>
                        <span style={helpText}>Configurações públicas podem ser usadas como base por outros usuários.</span>
                    </fieldset>

                    <button onClick={handleSalvar} style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '5px' }}>
                        SALVAR CONFIGURAÇÃO
                    </button>
                    {status && <p style={{ textAlign: 'center' }}>{status}</p>}
                </div>
            </div>
            
            <div style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}>
                <h3>📋 Sistemas Registrados</h3>
                {loading ? (
                    <p>Carregando...</p>
                ) : listaFontes.length === 0 ? (
                    <p style={{ color: '#999' }}>Nenhum sistema registrado ainda.</p>
                ) : (
                    listaFontes.map(f => (
                    <div 
                      key={f.id} 
                      style={{...sistemaItemStyle,color:'black',
                         borderLeftColor: sistemaAtivo?.id === f.id ? '#28a745' : 'mediumpurple',
                         backgroundColor: sistemaAtivo?.id === f.id ? 'var(--primary)' : 'var(--card)'
                            }}
                        >
                            <div>
                                <strong>Sistema #{f.id}</strong> - {f.painel_watts}W Solar | {f.bateria_ah}Ah {f.bateria_tipo}
                                {sistemaAtivo?.id === f.id && <p style={{ color: '#28a745', margin: '5px 0 0 0', fontSize: '12px' }}>✅ Selecionado</p>}
                            </div>
                            <button 
                                onClick={() => handleSelecionar(f)}
                                style={buttonSimularStyle}
                            >
                                Usar para Simulação
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
  );
}

export default FontesEnergia;
