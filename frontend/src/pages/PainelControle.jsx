import React, { useEffect, useState } from 'react';

const PainelControle = ({ clienteId }) => {
  const [cliente, setCliente] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (clienteId) {
      // Buscamos Cliente e Fontes ao mesmo tempo
      Promise.all([
        fetch(`http://localhost:8000/clientes/${clienteId}`).then(res => res.json()),
        fetch(`http://localhost:8000/clientes/${clienteId}/fontes`).then(res => res.json())
      ])
      .then(([dadosCliente, dadosFontes]) => {
        setCliente(dadosCliente);
        setEquipamentos(dadosFontes);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao carregar painel:", err);
        setCarregando(false);
      });
    }
  }, [clienteId]);

  if (carregando) return <div style={msgStyle}>Iniciando sistemas Motorhome... 🚐💨</div>;
  if (!cliente) return <div style={msgStyle}>⚠️ Cliente não localizado.</div>;

  return (
    <div style={containerStyle}>
      {/* CABEÇALHO DO CLIENTE */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>{cliente.nome}</h1>
          <p style={{ opacity: 0.8 }}>ID: {cliente.id} | CPF: {cliente.cpf}</p>
        </div>
        <div style={contatoStyle}>
          <span>📞 {cliente.fone || 'Sem telefone'}</span>
          <span>📧 {cliente.email}</span>
        </div>
      </header>

      {/* GRADE DE EQUIPAMENTOS */}
      <main style={{ marginTop: '30px' }}>
        <div style={tituloSecao}>
          <h2>🔌 Equipamentos de Energia</h2>
          <button style={btnNovo}>+ Adicionar Equipamento</button>
        </div>

        <div style={gridStyle}>
          {equipamentos.length > 0 ? (
            equipamentos.map(eq => (
              <div key={eq.id} style={cardStyle}>
                <div style={badgePublico(eq.publico)}>
                  {eq.publico ? "PÚBLICO" : "PRIVADO"}
                </div>
                <h3>Sistema #{eq.id}</h3>
                <hr />
                <p>☀️ <strong>Painel:</strong> {eq.painel_watts}W ({eq.tipo_controlador})</p>
                <p>🔋 <strong>Bateria:</strong> {eq.bateria_ah}Ah ({eq.bateria_tipo})</p>
                <p>⚡ <strong>AC-DC:</strong> {eq.conversor_acdc_amperes}A</p>
                <p>🏎️ <strong>DC-DC:</strong> {eq.dcdc_amperes}A</p>
                
                <div style={acoesStyle}>
                  <button style={btnAcao}>✏️ Editar</button>
                  <button style={{ ...btnAcao, color: '#e74c3c' }}>🗑️ Excluir</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%' }}>Nenhum equipamento vinculado a este cliente.</p>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Estilos Básicos (CSS-in-JS para agilizar) ---
const containerStyle = { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' };
const headerStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const contatoStyle = { display: 'flex', flexDirection: 'column', textAlign: 'right', gap: '5px' };
const tituloSecao = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' };
const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' };
const cardStyle = { backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '12px', padding: '20px', width: '280px', position: 'relative' };
const badgePublico = (isPublic) => ({ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', padding: '4px 8px', borderRadius: '20px', backgroundColor: isPublic ? '#2ecc71' : '#95a5a6', color: 'white', fontWeight: 'bold' });
const acoesStyle = { display: 'flex', gap: '10px', marginTop: '20px' };
const btnAcao = { flex: 1, padding: '8px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white' };
const btnNovo = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const msgStyle = { textAlign: 'center', marginTop: '50px', fontSize: '18px' };

export default PainelControle;
