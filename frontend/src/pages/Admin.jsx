import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Admin() {
  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      
      {/* MENU LATERAL */}
      <aside style={{
        width: '200px',
        backgroundColor: '#2c2c2c',
        color: 'white',
        padding: '20px'
      }}>
        <h3>Painel Admin</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="clientes" style={{ color: 'white' }}>👤 Clientes</Link>
          <Link to="fontes" style={{ color: 'white' }}>⚡ Fontes</Link>
          <Link to="equipamentos" style={{ color: 'white' }}>🔌 Equipamentos</Link>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>

    </div>
  );
}

export default Admin;
