import React, { useState } from 'react';
import { LogIn, Lock, User } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Busca se existe uma credencial personalizada salva
    const storedAuth = JSON.parse(localStorage.getItem('user_auth'));

    // 2. Define as credenciais válidas: 
    // Se existir algo salvo, usa o salvo. Se não, usa o padrão admin/123.
    const validUser = storedAuth ? storedAuth.user : 'admin';
    const validPass = storedAuth ? storedAuth.pass : '123';

    // 3. Validação
    if (username === validUser && password === validPass) {
      onLogin({ 
        name: username, 
        role: 'Administrador',
        lastLogin: new Date().toISOString()
      });
    } else {
      setError('Usuário ou senha incorretos!');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-b-[10px] border-indigo-800">
        
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 group hover:rotate-0 transition-all">
            <LogIn className="text-indigo-600" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-800 italic tracking-tighter uppercase">
            Jander <span className="text-indigo-600">Vidros</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Sistema de Gestão Interna
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-gray-400" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="USUÁRIO" 
              required
              className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all text-sm"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-gray-400" size={20} />
            </div>
            <input 
              type="password" 
              placeholder="SENHA" 
              required
              className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all text-sm"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-xs font-black uppercase italic border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Acessar Painel <LogIn size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-300 text-[9px] font-bold uppercase tracking-widest">
            © 2024 Jander Vidros - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;