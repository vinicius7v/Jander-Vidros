import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Save, ShieldCheck, Key, RefreshCcw } from 'lucide-react';

function Settings({ user, onLogout }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateAuth = (e) => {
    e.preventDefault();

    // Validação básica
    if (newPassword.length < 3) {
      setMessage('⚠️ A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('⚠️ As senhas não coincidem!');
      return;
    }

    // Salva as novas credenciais
    const newAuth = { user: newUsername, pass: newPassword };
    localStorage.setItem('user_auth', JSON.stringify(newAuth));
    
    setMessage('✅ Login e Senha alterados! Deslogando em 2 segundos...');
    
    // Força o logout para testar a nova senha
    setTimeout(() => {
      onLogout();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Configurações</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Segurança de Acesso Jander Vidros</p>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border-b-[10px] border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic text-gray-800">Alterar Acesso</h2>
              <p className="text-xs text-gray-400 font-bold uppercase">Defina seu novo usuário e senha</p>
            </div>
          </div>

          <form onSubmit={handleUpdateAuth} className="space-y-6">
            {/* USUÁRIO */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Novo Nome de Usuário</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: jander_vidros"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all"
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                />
              </div>
            </div>

            {/* SENHAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Nova Senha</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} // CORRIGIDO AQUI
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Confirmar Senha</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* MENSAGEM DE STATUS */}
            {message && (
              <div className={`p-4 rounded-2xl font-black text-xs text-center uppercase italic border ${
                message.includes('✅') 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {message}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button 
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save size={20} /> Atualizar Credenciais
              </button>
              
              <button 
                type="button"
                onClick={() => {
                   if(window.confirm("Isso voltará o login para admin/123. Confirmar?")) {
                      localStorage.removeItem('user_auth');
                      window.location.reload();
                   }
                }}
                className="w-full py-3 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Resetar para Padrão de Fábrica
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;