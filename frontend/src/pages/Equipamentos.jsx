import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ✅ usa o api central

function Equipamentos() {

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

  // ✅ CARREGAR EQUIPAMENTOS
  const carregarEquipamentos = async () => {
    try {
      const res = await api.get('/equipamentos');
      setEquipamentos(res.data);
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

      {/* FORM */}
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Nome"
          value={novoEquip.nome}
          onChange={e => setNovoEquip({ ...novoEquip, nome: e.target.value })}
        />

        <input
          type="number"
          placeholder="Watts"
          value={novoEquip.watts}
          onChange={e => setNovoEquip({ ...novoEquip, watts: e.target.value })}
        />

        <button onClick={adicionarEquipamento}>
          + Adicionar
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        equipamentos.map(e => (
          <div key={e.id} style={{ marginBottom: '10px' }}>
            {editandoId === e.id ? (
              <>
                <input
                  value={e.nome}
                  onChange={ev => atualizarEquipamento(e.id, 'nome', ev.target.value)}
                />

                <input
                  type="number"
                  value={e.watts}
                  onChange={ev => atualizarEquipamento(e.id, 'watts', ev.target.value)}
                />

                <button onClick={() => salvarEdicao(e.id)}>Salvar</button>
                <button onClick={() => setEditandoId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {e.nome} - {e.watts}W

                <button onClick={() => setEditandoId(e.id)}>Editar</button>
                <button onClick={() => removerEquipamento(e.id)}>Excluir</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Equipamentos;
