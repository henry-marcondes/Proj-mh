import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

// --- 1. ESTILOS ---
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

const cardStyle = {
  maxWidth: '600px',
  width: '100%',
  padding: '20px',
  backgroundColor: 'var(--card)',
  borderRadius: '8px',
  color: 'var(--text)'
};


function FontesEnergia() {
    const {isDarkMode } = useContext(ThemeContext);

    const inputStyle = {
        padding: '8px',
        borderRadius: '4px',
        border: 'none',
        marginBottom: '5px',
        width: '100%',
        boxSizing: 'border-box',
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
        alignItems: 'center',
        color: isDarkMode ? '#ffffff' : '#000000'
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

    // --- 2. ESTADOS ---
    const [fontes, setFontes] = useState({
        painel_watts: 330,
        bateria_ah: 100,
        tipo_controlador: 'MPPT',
        bateria_tipo: 'Litio',
        conversor_acdc_amperes: 30,
        dcdc_amperes: 20,
        publico: true
    });
    const [status, setStatus] = useState("");
    const [listaFontes, setListaFontes] = useState([]);
    const [loading, setLoading] = useState(true);
    // ✅ NOVO: Estado para armazenar sistema selecionado
    const [sistemaAtivo, setSistemaAtivo] = useState(null);

    // --- 3. FUNÇÃO PARA EVITAR O ERRO "NaN" ---
    const handleNumberChange = (campo, valorString) => {
        const valorNum = parseFloat(valorString);
        setFontes({
            ...fontes,
            [campo]: isNaN(valorNum) ? 0 : valorNum
        });
    };
    // --- 4. BUSCAR DADOS DO BACKEND ---
  useEffect(() => {
    const carregarFontes = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await axios.get("http://localhost:8000/fontes", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setListaFontes(res.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    carregarFontes();
}, []);

    // --- 5. SALVAR DADOS ---
   const handleSalvar = async () => {
    try {
        const token = localStorage.getItem("token");

        const dadosParaEnviar = {
            painel_watts: Number(fontes.painel_watts),
            bateria_ah: Number(fontes.bateria_ah),
            tipo_controlador: fontes.tipo_controlador,
            bateria_tipo: fontes.bateria_tipo,
            conversor_acdc_amperes: Number(fontes.conversor_acdc_amperes),
            dcdc_amperes: Number(fontes.dcdc_amperes),
            publico: Boolean(fontes.publico)
        };

        console.log("📤 Enviando:", dadosParaEnviar);

        const response = await axios.post(
            "http://localhost:8000/fontes",
            dadosParaEnviar,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const res = await axios.get("http://localhost:8000/fontes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        setListaFontes(res.data);

        console.log("✅ Salvo:", response.data);

        setStatus("✅ Configuração salva com sucesso!");

    } catch (error) {
        console.error("❌ ERRO COMPLETO:", error);
        console.error("❌ RESPONSE:", error.response);

        setStatus("Erro ao salvar");
    } 
};

    // ✅ NOVO: Função para selecionar sistema para simulação
    const handleSelecionarParaSimulacao = (fonte) => {
        setSistemaAtivo(fonte);
        // ✅ Armazenar no localStorage para usar em outras páginas
        localStorage.setItem('sistemaSimulacao', JSON.stringify(fonte));
        setStatus(`✅ Sistema #${fonte.id} selecionado para simulação!`);
        console.log("Sistema selecionado:", fonte);
    };

    return (
        <div style={containerStyle}>
            
            <div style={cardStyle}>
                <h2>⚡ Configuração do Sistema</h2>
                
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
                                onClick={() => handleSelecionarParaSimulacao(f)}
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
