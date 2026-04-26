import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Equipamentos() {

  // ✅ ESTADOS
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [novoEquip, setNovoEquip] = useState({
    nome: '',
    watts: '',
    hora_inicio: 0,
    hora_fim: 23,
    publico: true
  });

  // ✅ CARREGAR EQUIPAMENTOS
  const carregarEquipamentos = async () => {
    try {
      const res = await api.get('/equipamentos/');
      setEquipamentos(res.data);
      console.log("📦 Resposta API:", res.data);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EXECUTA UMA VEZ
  useEffect(() => {
    carregarEquipamentos();
  }, []);

  // ✅ VALIDAÇÃO
  const validarEquipamento = (equip) => {
    if (!equip.nome || equip.nome.trim() === '') {
      alert("❌ Nome obrigatório");
      return false;
    }
    if (!equip.watts || equip.watts <= 0) {
      alert("❌ Watts inválido");
      return false;
    }
    if (equip.hora_inicio >= equip.hora_fim) {
      alert("❌ Horário inválido");
      return false;
    }
    return true;
  };

  // ✅ ADICIONAR
  const adicionarEquipamento = async () => {
    if (!validarEquipamento(novoEquip)) return;

    try {
      const payload = {
        nome: novoEquip.nome,
        watts: parseFloat(novoEquip.watts),
        hora_inicio: parseInt(novoEquip.hora_inicio),
        hora_fim: parseInt(novoEquip.hora_fim),
        publico: novoEquip.publico
      };

      await api.post('/equipamentos/', payload);

      await carregarEquipamentos();

      setNovoEquip({
        nome: '',
        watts: '',
        hora_inicio: 0,
        hora_fim: 23,
        publico: true
      });

      alert("✅ Equipamento adicionado");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar");
    }
  };

  // ✅ DELETAR
  const removerEquipamento = async (id) => {
    if (!window.confirm("Deseja deletar?")) return;

    try {
      await api.delete(`/equipamentos/${id}`);

      setEquipamentos(prev => prev.filter(e => e.id !== id));

      alert("✅ Deletado");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar");
    }
  };

  // ✅ EDITAR
  const salvarEdicao = async (id) => {
    const equip = equipamentos.find(e => e.id === id);

    if (!validarEquipamento(equip)) return;

    try {
      await api.put(`/equipamentos/${id}`, {
        nome: equip.nome,
        watts: parseFloat(equip.watts),
        hora_inicio: parseInt(equip.hora_inicio),
        hora_fim: parseInt(equip.hora_fim),
        publico: equip.publico
      });

      setEditandoId(null);
      alert("✅ Atualizado");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  };

  // ✅ ATUALIZA CAMPOS EM EDIÇÃO
  const atualizarEquipamento = (id, campo, valor) => {
    setEquipamentos(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              [campo]:
                campo === 'watts'
                  ? parseFloat(valor)
                  : campo === 'hora_inicio' || campo === 'hora_fim'
                  ? parseInt(valor)
                  : campo === 'publico'
                  ? valor === "true"
                  : valor
            }
          : e
      )
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>🔌 Equipamentos</h2>
      <p>👤 Usuário: {user?.nome}</p>
      {/* FORM */}
       <div style={{ backgroundColor: 'var(--card)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
    <div>
       <label style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '5px', display: 'inline-block' }}>
            Nome:
          </label><br/>
        <input
          placeholder="Nome"
          value={novoEquip.nome}
          onChange={e => setNovoEquip({ ...novoEquip, nome: e.target.value })}
        /> 
      </div>
      <div>
          <label style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '5px', display: 'inline-block' }}>
            Watts:
          </label><br/>
        <input
          type="number"
          placeholder="Watts"
          value={novoEquip.watts}
          onChange={e => setNovoEquip({ ...novoEquip, watts: e.target.value })}
        />
      </div>
      <div>
          <label style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '5px', display: 'inline-block' }}>
            Inicio:
          </label><br/>
        <input 
          type="number"
          min="0"
          max="23"
          value={novoEquip.hora_inicio}
          onChange={e => setNovoEquip({...novoEquip, hora_inicio: e.target.value})}
        />
      </div>
      <div>
          <label style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '5px', display: 'inline-block' }}>
            Fim:
          </label><br/> 
         <input 
          type="number"
          min="0"
          max="23"
          value={novoEquip.hora_fim}
          onChange={e => setNovoEquip({...novoEquip, hora_fim: e.target.value})}
         />
      </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            checked={novoEquip.publico} 
            onChange={e => setNovoEquip({...novoEquip, publico: e.target.checked})} 
            id="publico"
          />
          <label htmlFor="publico" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>
            Compartilhar?
          </label>
        </div>


        <button onClick={adicionarEquipamento}
            style={{ backgroundColor: 'var(--primary)', color: 'card(--text)', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          + Adicionar
        </button>
      </div>

      {/* LISTA */}
     {loading ? (
  <p style={{ textAlign: 'center', color: 'var(--text)' }}>
    Carregando equipamentos...
  </p>
) : equipamentos.length === 0 ? (
  <p style={{ textAlign: 'center', color: 'var(--text)', padding: '20px' }}>
    Nenhum equipamento registrado ainda.
  </p>
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
                  style={{ width: '100%', padding: '5px' }}
                />
              </td>

              <td style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  value={e.watts}
                  onChange={evt => atualizarEquipamento(e.id, 'watts', evt.target.value)}
                  style={{ width: '70px' }}
                />
              </td>

              <td style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  value={e.hora_inicio}
                  onChange={evt => atualizarEquipamento(e.id, 'hora_inicio', evt.target.value)}
                  style={{ width: '50px' }}
                />
                <span> a </span>
                <input
                  type="number"
                  value={e.hora_fim}
                  onChange={evt => atualizarEquipamento(e.id, 'hora_fim', evt.target.value)}
                  style={{ width: '50px' }}
                />
              </td>

              <td style={{ textAlign: 'center' }}>
                <button onClick={() => salvarEdicao(e.id)}>✅</button>
                <button onClick={() => setEditandoId(null)}>❌</button>
              </td>
            </>
          ) : (
            <>
              <td style={{ color: 'var(--text)', padding: '10px' }}>
                {e.nome}
              </td>

              <td style={{ color: 'var(--text)', textAlign: 'center' }}>
                {e.watts}W
              </td>

              <td style={{ color: 'var(--text)', textAlign: 'center' }}>
                {e.hora_inicio}h às {e.hora_fim}h
              </td>

              <td style={{ textAlign: 'center' }}>
                <button onClick={() => setEditandoId(e.id)}>✏️</button>
                <button onClick={() => removerEquipamento(e.id)}>🗑️</button>
              </td>
            </>
          )}

        </tr>
      ))}
    </tbody>
  </table>
)} 
    </div>
  );
}

export default Equipamentos;
