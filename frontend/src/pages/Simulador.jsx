import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [dados, setDados] = useState([]);
  const [clima, setClima] = useState('sol');
  const [cargaAnterior, setCargaAnterior] = useState(null);
  const [dia, setDia] = useState(1);

  // Lista de equipamentos fixa e estável
  const equipamentos = [
    { nome: "Geladeira", watts: 60, hora_inicio: 0, hora_fim: 23 },
    { nome: "Luzes", watts: 40, hora_inicio: 18, hora_fim: 22 }
  ];

  const buscarSimulacao = async (resetar = false) => {
    try {
      const payload = {
        potencia_painel: 300,
        bateria_ah: 100,
        clima: clima,
        equipamentos: equipamentos,
        carga_inicial_wh: resetar ? null : (cargaAnterior || null)
      };

      const response = await axios.post('http://localhost:8000/simulador/ciclo-24h', payload);
      
      if (response.data) {
        setDados(response.data);
        const ultimoPonto = response.data[response.data.length - 1];
        setCargaAnterior(ultimoPonto.bateria_wh_final);
        if (!resetar) setDia(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao conectar com o Python:", error);
      alert("Erro na simulação. Verifique se o backend está rodando.");
    }
  };

  const resetarSimulacao = () => {
    setDia(1);
    setCargaAnterior(null);
    setDados([]);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#95bed4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#333' }}>Simulador Solar Motorhome - Dia {dia}</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setClima('sol')} 
          style={{ padding: '10px', color: 'black', backgroundColor: clima === 'sol' ? '#f3d217da' : '#131212', cursor: 'pointer' }}
        >☀️ Sol</button>
        <button 
          onClick={() => setClima('nublado')} 
          style={{ padding: '10px', color: 'black', backgroundColor: clima === 'nublado' ? '#b5a0a0' : '#fff', cursor: 'pointer' }}
        >☁️ Nublado</button>
        <button 
          onClick={() => setClima('chuva')} 
          style={{ padding: '10px', color: 'black', backgroundColor: clima === 'chuva' ? '#4682b4' : '#fff', cursor: 'pointer' }}
        >🌧️ Chuva</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => buscarSimulacao(false)} 
          style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Simular Próximo Dia ➡️
        </button>
        <button 
          onClick={resetarSimulacao} 
          style={{ marginLeft: '10px', padding: '12px 24px', cursor: 'pointer' }}
        >
          Resetar
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', height: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Watts / %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="geracao" stroke="#ffc658" name="Geração (W)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="bateria_porcentagem" stroke="#28a745" name="Bateria (%)" strokeWidth={2} />
            <Line type="monotone" dataKey="consumo" stroke="#dc3545" name="Consumo (W)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;