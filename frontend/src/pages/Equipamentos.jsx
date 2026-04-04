import React, { useState, useEffect } from 'react';
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

  // ✅ ESTADOS
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [novoEquip, setNovoEquip] = useState({
    nome: '',
    watts: '',
    hora_inicio: 0,
    hora_fim: 23,
    publico: true
  });

  // ✅ NOVO: Carregar equipamentos do banco ao montar
  useEffect(() => {
    carregarEquipamentos();
  }, [clienteId]);

  const carregarEquipamentos = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/clientes/${clienteId}/equipamentos/`);
      setEquipamentos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
      setLoading(false);
    }
  };

  // ✅ NOVO: Validação antes de adicionar
  const validarEquipamento = (equip) => {
    if (!equip.nome || equip.nome.trim() === '') {
      alert("❌ Nome do equipamento é obrigatório");
      return false;
    }
    if (!equip.watts || equip.watts <= 0) {
      alert("❌ Watts deve ser maior que 0");
      return false;
    }
    if (equip.hora_inicio >= equip.hora_fim) {
      alert("❌ Hora de início deve ser menor que hora de fim");
      return false;
    }
    return true;
  };

  const adicionarEquipamento = async () => {
    if (!validarEquipamento(novoEquip)) return;

    try {
      const payload = {
        cliente_id: parseInt(clienteId),
        lista_equipamentos: [...equipamentos, {
          nome: novoEquip.nome,
          watts: parseFloat(novoEquip.watts),
          hora_inicio: parseInt(novoEquip.hora_inicio),
          hora_fim: parseInt(novoEquip.hora_fim),
          publico: novoEquip.publico
        }]
      };

      await axios.post('http://localhost:8000/equipamentos/', payload);
      
      // ✅ Recarregar lista do banco
      await carregarEquipamentos();
      
      // Limpar formulário
      setNovoEquip({ nome: '', watts: '', hora_inicio: 0, hora_fim: 23, publico: true });
      alert("✅ Equipamento adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar equipamento:", error);
      alert("❌ Erro ao adicionar equipamento");
    }
  };

  // ✅ NOVO: Deletar equipamento do banco
  const removerEquipamento = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este equipamento?")) return;

    try {
      await axios.delete(`http://localhost:8000/equipamentos/${id}`);
      
      // Remover da lista local
      setEquipamentos(equipamentos.filter(e => e.id !== id));
      alert("✅ Equipamento deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar equipamento:", error);
      alert("❌ Erro ao deletar equipamento");
    }
  };

  // ✅ NOVO: Atualizar equipamento
  const salvarEdicao = async (id) => {
    const equipEditar = equipamentos.find(e => e.id === id);
    
    if (!validarEquipamento(equipEditar)) return;

    try {
      await axios.put(`http://localhost:8000/equipamentos/${id}`, {
        nome: equipEditar.nome,
        watts: parseFloat(equipEditar.watts),
        hora_inicio: parseInt(equipEditar.hora_inicio),
        hora_fim: parseInt(equipEditar.hora_fim),
        publico: equipEditar.publico
      });

      setEditandoId(null);
      alert("✅ Equipamento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar equipamento:", error);
      alert("❌ Erro ao atualizar equipamento");
    }
  };

  // ✅ NOVO: Função auxiliar para atualizar estado de edição
  const atualizarEquipamento = (id, campo, valor) => {
    setEquipamentos(
      equipamentos.map(e => 
        e.id === id 
          ? { ...e, [campo]: campo === 'watts' ? parseFloat(valor) : 
                     campo === 'hora_inicio' || campo === 'hora_fim' ? parseInt(valor) :
                     campo === 'publico' ? valor :
                     valor }
          : e
      )
    );
  };

  return (
      <div style={{
        maxWidth: '900px',
        padding: '20px',
        margin: '0 auto',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)'
    }}>
      <h2>🔌 Inventário de Equipamentos (Cargas)</h2>
      {clienteId && <p style={{ color: '#61075a' }}>ID do Cliente Ativo: <strong>{clienteId}</strong></p>}

      {/* ✅ FORMULÁRIO DE ADIÇÃO */}
      <div style={{ backgroundColor: 'var(--card)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Nome:
          </label><br/>
          <input 
            value={novoEquip.nome} 
            onChange={e => setNovoEquip({...novoEquip, nome: e.target.value})} 
            placeholder="Ex: Geladeira"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)',backgroundColor: 'var(--input-bg)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Watts:
          </label><br/>
          <input 
            type="number" 
            value={novoEquip.watts} 
            onChange={e => setNovoEquip({...novoEquip, watts: e.target.value})} 
            placeholder="60"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)',backgroundColor: 'var(--input-bg)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Início (h):
          </label><br/>
          <input 
            type="number" 
            min="0" 
            max="23" 
            value={novoEquip.hora_inicio} 
            onChange={e => setNovoEquip({...novoEquip, hora_inicio: parseInt(e.target.value)})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)',backgroundColor: 'var(--input-bg)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'inline-block' }}>
            Fim (h):
          </label><br/>
          <input 
            type="number" 
            min="0" 
            max="23" 
            value={novoEquip.hora_fim} 
            onChange={e => setNovoEquip({...novoEquip, hora_fim: parseInt(e.target.value)})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)',backgroundColor: 'var(--input-bg)', color: 'var(--text)'  }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            checked={novoEquip.publico} 
            onChange={e => setNovoEquip({...novoEquip, publico: e.target.checked})} 
            id="publico"
          />
          <label htmlFor="publico" style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
            Compartilhar?
          </label>
        </div>
        <button 
          onClick={adicionarEquipamento} 
          style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Adicionar
        </button>
      </div>

      {/* ✅ TABELA DE EQUIPAMENTOS */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text)' }}>Carregando equipamentos...</p>
      ) : equipamentos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Nenhum equipamento registrado ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--card)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ color: 'var(--text)', textAlign: 'left', padding: '10px' }}>Equipamento</th>
              <th style={{ color: 'var(--text)', textAlign: 'center', padding: '10px' }}>Watts</th>
              <th style={{ color: 'var(--text)', textAlign: 'center', padding: '10px' }}>Uso</th>
              <th style={{ color: 'var(--text)', textAlign: 'center', padding: '10px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #ddd' }}>
                {editandoId === e.id ? (
                  <>
                    <td style={{ padding: '10px' }}>
                      <input 
                        value={e.nome} 
                        onChange={evt => atualizarEquipamento(e.id, 'nome', evt.target.value)}
                        style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid var(--text)' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="number" 
                        value={e.watts} 
                        onChange={evt => atualizarEquipamento(e.id, 'watts', evt.target.value)}
                        style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid var(--text)' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="number" 
                        min="0" 
                        max="23" 
                        value={e.hora_inicio} 
                        onChange={evt => atualizarEquipamento(e.id, 'hora_inicio', evt.target.value)}
                        style={{ width: '50px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <span> a </span>
                      <input 
                        type="number" 
                        min="0" 
                        max="23" 
                        value={e.hora_fim} 
                        onChange={evt => atualizarEquipamento(e.id, 'hora_fim', evt.target.value)}
                        style={{ width: '50px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <button 
                        onClick={() => salvarEdicao(e.id)}
                        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}
                      >
                        ✅ Salvar
                      </button>
                      <button 
                        onClick={() => setEditandoId(null)}
                        style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ❌ Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ color: 'var(--text)', padding: '10px' }}>{e.nome}</td>
                    <td style={{ color: 'var(--text)', textAlign: 'center' }}>{e.watts}W</td>
                    <td style={{ color: 'var(--text)', textAlign: 'center' }}>{e.hora_inicio}h às {e.hora_fim}h</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <button 
                        onClick={() => setEditandoId(e.id)}
                        style={{ backgroundColor: '#ffc107', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => removerEquipamento(e.id)}
                        style={{ backgroundColor: '#dc3545', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        🗑️ Deletar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {equipamentos.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--card)', borderRadius: '5px', textAlign: 'center',color:'var(--text)' }}>
          <strong>📊 Total: {equipamentos.length} equipamento(s) registrado(s)</strong>
        </div>
      )}
    </div>
  );
}

export default Equipamentos;
