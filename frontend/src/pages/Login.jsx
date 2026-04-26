import { useState, useContext } from "react";
import { login } from "../services/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await login({ email, senha });

    // 🔐 salva usuário no localStorage
    localStorage.setItem("user", JSON.stringify(res.data));

    // 🔐 mantém seu contexto funcionando
    loginUser(res.data);

    navigate("/dashboard");
  } catch {
    alert("Erro no login");
  }
};
  return (
      
   <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
    <h2 style={{ textAlign: 'center' }}>👤 Login</h2>
    <div style={{ backgroundColor: 'var(--card)', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
     <form 
       onSubmit={handleLogin} 
       style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
         <label>Email</label>
         <input 
           placeholder="seu@email.com" 
           onChange={e => setEmail(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
         />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label>Senha</label>
        <input 
          type="password" 
          placeholder="Digite sua senha" 
          onChange={e => setSenha(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <button 
        type="submit" 
        style={{ 
          padding: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontWeight: 'bold' 
        }}
      >
        Entrar
      </button>
    </form>
  </div>  
</div> );
}
