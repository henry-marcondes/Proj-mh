import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from "react-router-dom";

function Simulador() {
  const [dados, setDados] = useState([]);
  const [clima, setClima] = useState('sol');
  const [cargaAnterior, setCargaAnterior] = useState(null);
  const [dia, setDia] = useState(0);
  const [fontesControle, setFontesControle] = useState([]);
  
  // Sistema selecionado
  const [sistemaAtivo, setSistemaAtivo] = useState(null);
  const [carregandoSistema, setCarregandoSistema] = useState(true);
  
  // ✅ NOVO: Equipamentos dinâmicos
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(false);

    const carregarEquipamentos = async () => {
    const token = localStorage.getItem("token");

    setCarregandoEquipamentos(true);

    try {
        const response = await axios.get(
        'http://localhost:8000/equipamentos',
      {
            headers: {
            Authorization: `Bearer ${token}`
            }
        }
        );

        setEquipamentos(response.data || []);
        console.log("✅ Equipamentos carregados:", response.data);

    } catch (error) {
        console.error("❌ Erro ao carregar equipamentos:", error);
    } finally {
        setCarregandoEquipamentos(false);
    }
  };

  // ✅ NOVO: Carregar sistema selecionado do localStorage
  useEffect(() => {
    const sistemaArmazenado = localStorage.getItem('sistemaSimulacao');
    
    if (sistemaArmazenado) {
      try {
        const sistema = JSON.parse(sistemaArmazenado);
        setSistemaAtivo(sistema);
        setCarregandoSistema(false);
        console.log("✅ Sistema carregado:", sistema);
        
        // ✅ NOVO: Depois que carrega o sistema, carrega os equipamentos
        carregarEquipamentos();
      } catch (erro) {
        console.error("�� Erro ao carregar sistema:", erro);
        setCarregandoSistema(false);
      }
    } else {
      console.warn("⚠️ Nenhum sistema selecionado");
      setCarregandoSistema(false);
    }
  }, []);

useEffect(() => {
    console.log("Dados Atualizados: ", dados)
  if (sistemaAtivo) {
    setFontesControle([
      {
        tipo: 'AC-DC',
        amperes: sistemaAtivo.conversor_acdc_amperes,
        ligado: false,
        hora_inicio: 18,
        hora_fim: 22
      },
      {
        tipo: 'DC-DC',
        amperes: sistemaAtivo.dcdc_amperes,
        ligado: false,
        hora_inicio: 9,
        hora_fim: 12
      }
    ]);
  }
}, [sistemaAtivo]);

  const buscarSimulacao = async (resetar = false) => {
    if (!sistemaAtivo) {
      alert("❌ Nenhum sistema selecionado! Por favor, acesse 'Fontes de Energia' e selecione um sistema.");
      return;
    }

    // ✅ NOVO: Verificar se há equipamentos
    if (equipamentos.length === 0) {
      alert("⚠️ Nenhum equipamento cadastrado! Por favor, adicione equipamentos em 'Inventário'.");
      return;
    }

    try {
      const fontesAtivas = fontesControle
        .filter(f => f.ligado)
        .map(f => ({
        tipo: f.tipo,
        amperes: f.amperes,
        hora_inicio: f.hora_inicio,
        hora_fim: f.hora_fim
    }));
      // ✅ NOVO: Usar equipamentos dinâmicos
      const payload = {
        potencia_painel: sistemaAtivo.painel_watts,
        bateria_ah: sistemaAtivo.bateria_ah,
        clima: clima,
        equipamentos: equipamentos,
        fontes_geracao: fontesAtivas, // 🔥 NOVO
        carga_inicial_wh: resetar ? null : (cargaAnterior || null)
      };
      console.log("📤 Enviando simulação com equipamentos:", payload);
      console.log("🔥 FONTES ATIVAS:", fontesAtivas);

      const response = await axios.post(
        'http://localhost:8000/simulador/ciclo-24h',
            payload,
        {
            headers: {
             Authorization: `Bearer ${localStorage.getItem("token")}`
            }
         }
    );

      if (response.data) {
        setDados(response.data);
        const ultimoPonto = response.data[response.data.length - 1];
        setCargaAnterior(ultimoPonto.bateria_wh_final);
        if (!resetar) setDia(prev => prev + 1);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com o Python:", error);
      alert("Erro na simulação. Verifique se o backend está rodando.");
    }
  };

  const resetarSimulacao = () => {
    setDia(1);
    setCargaAnterior(null);
    setDados([]);
  };

  const limparSistema = () => {
    localStorage.removeItem('sistemaSimulacao');
    setSistemaAtivo(null);
    resetarSimulacao();
  };

  // ✅ NOVO: Carregando estado
  if (carregandoSistema || carregandoEquipamentos) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>;
  }

    //console.log("📤 Enviando simulação:", payload);

  // Sistema não selecionado
  if (!sistemaAtivo) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'var(--bg)', 
        color: 'var(--text)',
        minHeight: '100vh', 
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          backgroundColor: 'var(--card)',
          color:'var(--text)',
          padding: '30px', 
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#721c24', marginBottom: '15px' }}>⚠️ Nenhum Sistema Selecionado</h2>
          <p style={{ color: '#721c24', marginBottom: '20px' }}>
            Para usar o simulador, você precisa selecionar um sistema de energia em "Fontes de Energia".
          </p>
          <Link 
            to="/fontes" 
            style={{ 
              display: 'inline-block',
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Ir para Fontes de Energia →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#95bed4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: 'var(--text)' }}>Solar MH Pro - Dia {dia}</h2>
      
      {/* ✅ Card do Sistema Selecionado */}
      <div style={{ 
        backgroundColor: 'var(--card)',
        color: 'var(--text)',
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        borderLeft: '5px solid #007bff'
      }}>
        <strong>📍 Sistema Selecionado:</strong> 
        <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
          ☀️ {sistemaAtivo.painel_watts}W | 🔋 {sistemaAtivo.bateria_ah}Ah {sistemaAtivo.bateria_tipo} | 
          {sistemaAtivo.tipo_controlador}
        </p>
        <button 
          onClick={limparSistema}
          style={{ 
            marginTop: '10px',
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Trocar Sistema
        </button>
      </div>

      {/* ✅ NOVO: Card de Equipamentos */}
      <div style={{ 
        backgroundColor: 'var(--card)', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        borderLeft: '5px solid #ffc107'
      }}>
        <strong>🔌 Equipamentos Carregados:</strong> 
        {equipamentos.length > 0 ? (
          <ul style={{ margin: '10px 0 0 20px', color: 'var(--text)' }}>
            {equipamentos.map(e => (
              <li key={e.id}>
                <strong>{e.nome}</strong>: {e.watts}W ({e.hora_inicio}h às {e.hora_fim}h)
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: '5px 0 0 0', color: '#999' }}>
            ℹ️ Nenhum equipamento. <Link to="/equipamentos" style={{ color: '#007bff', textDecoration: 'none' }}>Adicione agora →</Link>
          </p>
        )}
      </div>

      <div style={{
  backgroundColor: 'var(--card)',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px'
}}>
  <h3>🎛️ Controle de Fontes</h3>

  {fontesControle.map((f, index) => (
    <div key={index} style={{
      marginBottom: '10px',
      padding: '10px',
      borderRadius: '6px',
      backgroundColor: f.ligado ? '#28a74533' : 'var(--bg)'
    }}>

      <strong>{f.tipo}</strong> ({f.amperes}A)

      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
        
        {/* BOTÃO LIGAR */}
        <button onClick={() => {
          const novaLista = [...fontesControle];
          novaLista[index].ligado = !novaLista[index].ligado;
          setFontesControle(novaLista);
        }}>
          {f.ligado ? '🔴 Desligar' : '🟢 Ligar'}
        </button>

        {/* HORA INICIO */}
        <input
          type="number"
          value={f.hora_inicio}
          onChange={(e) => {
            const novaLista = [...fontesControle];
            novaLista[index].hora_inicio = Number(e.target.value);
            setFontesControle(novaLista);
          }}
          style={{ width: '60px' }}
        />

        {/* HORA FIM */}
        <input
          type="number"
          value={f.hora_fim}
          onChange={(e) => {
            const novaLista = [...fontesControle];
            novaLista[index].hora_fim = Number(e.target.value);
            setFontesControle(novaLista);
          }}
          style={{ width: '60px' }}
        />

      </div>
    </div>
  ))}
</div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setClima('sol')} 
          style={{ padding: '10px', backgroundColor: clima === 'sol' ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', borderRadius: '5px', border: 'none', fontWeight: 'bold',color:'var(--text)' }}
        >☀️ Sol</button>
        <button 
          onClick={() => setClima('nublado')} 
          style={{ padding: '10px', backgroundColor: clima === 'nublado' ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', borderRadius: '5px', border: 'none', fontWeight: 'bold',color:'var(--text)' }}
        >☁️ Nublado</button>
        <button 
          onClick={() => setClima('chuva')} 
          style={{ padding: '10px', backgroundColor: clima === 'chuva' ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', borderRadius: '5px', border: 'none', fontWeight: 'bold', color: 'var(--text)' }}
        >🌧️ Chuva</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => buscarSimulacao(false)} 
          style={{ padding: '12px 24px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Simular Próximo Dia ➡️
        </button>
        <button 
          onClick={resetarSimulacao} 
          style={{ marginLeft: '10px', padding: '12px 24px', backgroundColor: 'var(--border)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Resetar
        </button>
      </div>

      {dados.length > 0 && (
        <div style={{ backgroundColor: 'var(--card)', padding: '20px', borderRadius: '10px', height: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Watts / %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="geracao_solar" stroke="#23349c" name="Solar (W)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="geracao_extra" stroke="#00cfff" name="AC/DC (W)" strokeWidth={3} dot={false}/>
              <Line type="monotone" dataKey="bateria_porcentagem" stroke="#28a745" name="Bateria (%)" strokeWidth={2} />
              <Line type="monotone" dataKey="consumo" stroke="#dc3545" name="Consumo (W)" strokeWidth={2} dot={false} />
              <Line dataKey="desperdicio" stroke="#8884d8" name="Desperdício (W)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {dados.length === 0 && (
        <div style={{ backgroundColor: 'var(--card)', padding: '40px', borderRadius: '10px', textAlign: 'center', color: 'var(--text)' }}>
          <p>Clique em "Simular Próximo Dia" para começar a simulação</p>
        </div>
      )}
    </div>
  );
}
export default Simulador;
