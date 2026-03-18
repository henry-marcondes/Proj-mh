import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Equipamentos() {
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

  const [equipamentos, setEquipamentos] = useState([]);
  const [novoEquip, setNovoEquip] = useState({
    nome: '',
    watts: '',
    hora_inicio: 0,
    hora_fim: 23,
    publico: true
  });

  const adicionarEquipamento = () => {
    if (!novoEquip.nome || !novoEquip.watts) return;
    setEquipamentos([...equipamentos, { ...novoEquip, id: Date.now() }]);
    setNovoEquip({ nome: '', watts: '', hora_inicio: 0, hora_fim: 23, publico: true });
  };

  const removerEquipamento = (id) => {
    setEquipamentos(equipamentos.filter(e => e.id !== id));
  };

  const salvarNoBanco = async () => {
    try {
      const payload = {
        cliente_id: clienteId,
        lista_equipamentos: equipamentos
      };
      await axios.post('http://localhost:8000/equipamentos/', payload);
      alert("Lista de equipamentos salva com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar no banco de dados.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', padding: '20px' }}>
      <h2>🔌 Inventário de Equipamentos (Cargas)</h2>
      {clienteId && <p style={{ color: '#61075a' }}>ID do Cliente Ativo: <strong>{clienteId}</strong></p>}

      <div style={{ backgroundColor: '#f7da1a', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
              Nome:
          </label><br/>
          <input value={novoEquip.nome} onChange={e => setNovoEquip({...novoEquip, nome: e.target.value})} placeholder="Ex: Geladeira" />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Watts:
          </label><br/>
          <input type="number" value={novoEquip.watts} onChange={e => setNovoEquip({...novoEquip, watts: parseFloat(e.target.value)})} placeholder="60" />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Início (h):
          </label><br/>
          <input type="number" min="0" max="23" value={novoEquip.hora_inicio} onChange={e => setNovoEquip({...novoEquip, hora_inicio: parseInt(e.target.value)})} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Fim (h):
          </label><br/>
          <input type="number" min="0" max="23" value={novoEquip.hora_fim} onChange={e => setNovoEquip({...novoEquip, hora_fim: parseInt(e.target.value)})} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            checked={novoEquip.publico} 
            onChange={e => setNovoEquip({...novoEquip, publico: e.target.checked})} 
            id="publico"
          />
          <label htmlFor="publico" style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
            Compartilhar com a comunidade?
          </label>
        </div>
        <button onClick={adicionarEquipamento} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          + Adicionar
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#70ef54' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ color: '#333', textAlign: 'left', padding: '10px' }}>Equipamento</th>
            <th style={{ color: '#333', textAlign: 'center', padding: '10px' }}>Watts</th>
            <th style={{ color: '#333', textAlign: 'center', padding: '10px' }}>Uso</th>
            <th style={{ color: '#333', textAlign: 'center', padding: '10px' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {equipamentos.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ color: '#333', padding: '10px' }}>{e.nome}</td>
              <td style={{ color: '#333', textAlign: 'center' }}>{e.watts}W</td>
              <td style={{ color: '#333', textAlign: 'center' }}>{e.hora_inicio}h às {e.hora_fim}h</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => removerEquipamento(e.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {equipamentos.length > 0 && (
        <button 
          onClick={salvarNoBanco}
          style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💾 SALVAR INVENTÁRIO COMPLETO
        </button>
      )}
    </div>
  );
}

export default Equipamentos;