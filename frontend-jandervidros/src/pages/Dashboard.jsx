import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Calendar, 
  Package, 
  Wrench, 
  ClipboardList, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { productService } from '../services/api';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProdutos: 0,
    servicosPendentes: 0,
    totalCompromissos: 0,
    produtosEstoqueBaixo: 0
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Buscar produtos do MySQL
      const produtos = await productService.getAll();
      
      // Buscar serviços e compromissos do localStorage (por enquanto)
      const servicos = JSON.parse(localStorage.getItem('services') || '[]');
      const compromissos = JSON.parse(localStorage.getItem('personal_appointments') || '[]');

      const pendentes = servicos.filter(s => {
        const statusAtual = s.status ? s.status.trim().toLowerCase() : 'pendente';
        return statusAtual !== 'concluído' && statusAtual !== 'concluido';
      }).length;

      // Produtos com estoque baixo
      const baixoEstoque = produtos.filter(p => 
        p.quantidade <= p.estoque_minimo || p.quantidade <= 1
      );

      setStats({
        totalProdutos: produtos.length,
        servicosPendentes: pendentes,
        totalCompromissos: compromissos.length,
        produtosEstoqueBaixo: baixoEstoque.length
      });

      setLowStockProducts(baixoEstoque.slice(0, 5)); // Primeiros 5

    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      // Fallback para localStorage se backend não estiver disponível
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
        totalCompromissos: compromissos.length,
        produtosEstoqueBaixo: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
            Bem-vindo, {user?.name || 'Jander'}!
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
            Painel de Controle Jander Vidros •
          </p>
        </header>

        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* COMPROMISSOS */}
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

          {/* PRODUTOS */}
          <button
            onClick={() => navigate('/produtos')}
            className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-indigo-600 flex items-center justify-between group hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Produtos no Catálogo</p>
                <h2 className="text-2xl font-black text-gray-800">{stats.totalProdutos} Itens</h2>
                {stats.produtosEstoqueBaixo > 0 && (
                  <p className="text-xs text-orange-600 font-bold">
                    ⚠️ {stats.produtosEstoqueBaixo} com estoque baixo
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="text-indigo-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
          </button>

          {/* SERVIÇOS */}
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

        {/* ALERTA DE ESTOQUE BAIXO */}
        {lowStockProducts.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">
                ⚠️ {stats.produtosEstoqueBaixo} produto(s) com estoque baixo
              </h3>
            </div>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="bg-white p-3 rounded flex justify-between items-center">
                  <span className="font-medium text-gray-800">{product.nome}</span>
                  <span className="text-orange-600 font-semibold">
                    Quantidade: {product.quantidade}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/produtos')}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Ver todos os produtos
            </button>
          </div>
        )}

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