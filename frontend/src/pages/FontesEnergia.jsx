import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function FontesEnergia() {
   const clienteId = localStorage.getItem('clienteId');
  if (!clienteId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚠️ Acesso Negado</h2>
        <p>Por favor, faça <a href="/login">login</a> para acessar esta página.</p>
      </div>
    )
  }
  
  const location = useLocation();
  //const clienteId = location.state?.clienteId || null;

  const [fontes, setFontes] = useState({
    cliente_id: clienteId,
    painel_watts: 330,
    bateria_ah: 100,
    tipo_controlador: 'MPPT',
    conversor_acdc_amperes: 30, // O conversor AC-DC que você mencionou
    dcdc_amperes: 20
  });

  const [status, setStatus] = useState("");

  const handleSalvar = async () => {
    try {
      // Aqui enviaremos para uma rota que criaremos no FastAPI
      await axios.post('http://localhost:8000/fontes-energia/', fontes);
      setStatus("Configuração salva com sucesso!");
    } catch (error) {
      setStatus("Erro ao salvar configurações.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', padding: '20px', backgroundColor: 'magenta', borderRadius: '8px' }}>
      <h2>⚡ Configuração do Sistema de Energia</h2>
      {clienteId ? (
        <p style={{ color: 'green' }}>Configurando para o Cliente ID: {clienteId}</p>
      ) : (
        <p style={{ color: 'red' }}>⚠️ Nenhum cliente selecionado!</p>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        <fieldset>
          <legend>🔋 Armazenamento</legend>
          <label>Capacidade da Bateria (Ah): </label>
          <input type="number" value={fontes.bateria_ah} 
            onChange={e => setFontes({...fontes, bateria_ah: parseFloat(e.target.value)})} />
        </fieldset>

        <fieldset>
          <legend>☀️ Geração Solar</legend>
          <label>Potência dos Painéis (Watts): </label>
          <input type="number" value={fontes.painel_watts} 
            onChange={e => setFontes({...fontes, painel_watts: parseFloat(e.target.value)})} />
          <br /><br />
          <label>Controlador de Carga: </label>
          <select value={fontes.tipo_controlador} onChange={e => setFontes({...fontes, tipo_controlador: e.target.value})}>
            <option value="MPPT">MPPT</option>
            <option value="PWM">PWM</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>🔌 Outras Fontes de Carga</legend>
          <label>Conversor AC-DC (Amperes): </label>
          <input type="number" value={fontes.conversor_acdc_amperes} 
            onChange={e => setFontes({...fontes, conversor_acdc_amperes: parseFloat(e.target.value)})} />
          <small style={{ display: 'block' }}>Transforma 110/220V em carga para a bateria.</small>
          
          <br />
          <label>Alternador / DC-DC (Amperes): </label>
          <input type="number" value={fontes.dcdc_amperes} 
            onChange={e => setFontes({...fontes, dcdc_amperes: parseFloat(e.target.value)})} />
        </fieldset>

        <button onClick={handleSalvar} style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          SALVAR CONFIGURAÇÃO DO SISTEMA
        </button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

export default FontesEnergia;