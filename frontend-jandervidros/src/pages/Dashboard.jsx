import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Calendar, 
  Package, 
  Wrench, 
  ClipboardList, 
  ArrowRight
} from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProdutos: 0,
    servicosPendentes: 0,
    totalCompromissos: 0
  });

  useEffect(() => {
    const produtos = JSON.parse(localStorage.getItem('products') || '[]');
    const servicos = JSON.parse(localStorage.getItem('services') || '[]');
    const compromissos = JSON.parse(localStorage.getItem('personal_appointments') || '[]');

    const pendentes = servicos.filter(s => {
      const statusAtual = s.status ? s.status.trim().toLowerCase() : 'pendente';
      return statusAtual !== 'concluído' && statusAtual !== 'concluido';
    }).length;

    setStats({
      totalProdutos: produtos.length,
      servicosPendentes: pendentes,
      totalCompromissos: compromissos.length
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
            Bem-vindo, {user?.name || 'Jander'}!
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Painel de Controle Jander Vidros</p>
        </header>

        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* NOVO CARD: COMPROMISSOS (ATALHO) */}
          <button 
            onClick={() => navigate('/anotacoes')}
            className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-emerald-500 flex items-center justify-between group hover:bg-emerald-50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Compromissos</p>
                <h2 className="text-2xl font-black text-emerald-600">{stats.totalCompromissos} Agendados</h2>
              </div>
            </div>
            <ArrowRight className="text-emerald-300 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
          </button>

          <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-indigo-600 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase">Produtos no Catálogo</p>
              <h2 className="text-2xl font-black text-gray-800">{stats.totalProdutos} Itens</h2>
            </div>
          </div>

          <button 
            onClick={() => navigate('/servicos')}
            className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-orange-500 flex items-center justify-between group hover:bg-orange-50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                <Wrench size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Serviços Pendentes</p>
                <h2 className="text-2xl font-black text-orange-600">{stats.servicosPendentes} Em Aberto</h2>
              </div>
            </div>
            <ArrowRight className="text-orange-300 group-hover:text-orange-600 group-hover:translate-x-2 transition-all" />
          </button>
        </div>

        {/* SEÇÃO DE ATALHOS RÁPIDOS */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <ClipboardList className="font-black" />
            <h3 className="text-lg font-black uppercase italic">Ações Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/transacoes')} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm uppercase">Nova Venda</button>
            <button onClick={() => navigate('/produtos')} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm uppercase">Estoque</button>
            <button onClick={() => navigate('/servicos')} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm uppercase">Novo Serviço</button>
            <button onClick={() => navigate('/anotacoes')} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm uppercase">Ver Agenda</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;