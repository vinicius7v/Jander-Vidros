import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Services from './pages/Services';
import Settings from './pages/Settings';
import NotesAndSchedule from './pages/NotesAndSchedule'; // 1. IMPORTAÇÃO DA NOVA PÁGINA

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('logged_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('logged_user');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold italic uppercase">Carregando Jander Vidros...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/produtos" 
          element={user ? <Products user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/transacoes" 
          element={user ? <Transactions user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/servicos" 
          element={user ? <Services user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* 2. NOVA ROTA: AGENDA E ANOTAÇÕES */}
        <Route 
          path="/anotacoes" 
          element={user ? <NotesAndSchedule user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/settings" 
          element={user ? <Settings user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;