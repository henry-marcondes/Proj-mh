import { useEffect, useState } from "react";
import axios from "axios";

export default function Perfil() {
  const [user, setUser] = useState({});
  const [nome, setNome] = useState("");

  const token = localStorage.getItem("token");

  const carregarUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);
      setNome(res.data.nome);

    } catch (error) {
      console.error(error);
      alert("Erro ao carregar usuário");
    }
  };

  const atualizar = async () => {
    try {
      await axios.put(
        "http://localhost:8000/user",
        null,
        {
          params: { nome },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Atualizado com sucesso!");

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  };

  useEffect(() => {
    carregarUser();
  }, []);

  return (
    <div>
      <h2>👤 Meu Perfil</h2>

      <p>Email: {user.email}</p>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br />

      <button onClick={atualizar}>
        💾 Salvar
      </button>
    </div>
  );
}
