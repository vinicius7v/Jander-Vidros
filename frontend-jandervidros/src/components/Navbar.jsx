import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Wrench, 
  Settings, 
  LogOut,
  StickyNote, // Adicionado ícone para Anotações
  User
} from 'lucide-react';

function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500 hover:text-white';
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-xl mb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          
          {/* LOGO E NOME */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1 rounded-xl group-hover:rotate-6 transition-transform flex items-center justify-center overflow-hidden w-14 h-14 shadow-inner">
                <img 
                  src="/logoJander.png" 
                  alt="Logo Jander Vidros" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    if (!e.target.src.includes('.jpg')) {
                      e.target.src = '/logoJander.jpg';
                    }
                  }}
                />
              </div>
              <span className="text-xl font-black italic tracking-tighter uppercase">
                Jander <span className="text-indigo-200">Vidros</span>
              </span>
            </Link>
          </div>

          {/* LINKS DE NAVEGAÇÃO PRINCIPAL */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${isActive('/')}`}>
              <LayoutDashboard size={18} /> Painel
            </Link>
            
            <Link to="/produtos" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${isActive('/produtos')}`}>
              <Package size={18} /> Estoque
            </Link>

            <Link to="/transacoes" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${isActive('/transacoes')}`}>
              <ArrowLeftRight size={18} /> Notas
            </Link>

            <Link to="/servicos" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${isActive('/servicos')}`}>
              <Wrench size={18} /> Serviços
            </Link>

            {/* NOVO LINK: AGENDA E ANOTAÇÕES */}
            <Link to="/anotacoes" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${isActive('/anotacoes')}`}>
              <StickyNote size={18} /> Agenda
            </Link>
          </div>

          {/* ÁREA DO USUÁRIO */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase text-indigo-300 leading-none">Logado como:</span>
              <span className="text-sm font-bold italic">{user?.name || 'Administrador'}</span>
            </div>

            <div className="h-8 w-[1px] bg-indigo-500 hidden md:block"></div>

            <Link 
              to="/settings" 
              className={`p-2.5 rounded-full transition-all ${isActive('/settings')}`}
              title="Configurações de Acesso"
            >
              <Settings size={22} />
            </Link>

            <button 
              onClick={onLogout}
              className="p-2.5 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg active:scale-90"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV ATUALIZADO */}
      <div className="md:hidden flex justify-around bg-indigo-700 p-2 text-[10px] font-bold uppercase italic overflow-x-auto">
          <Link to="/" className="flex flex-col items-center gap-1 min-w-[60px]"><LayoutDashboard size={16}/> Início</Link>
          <Link to="/produtos" className="flex flex-col items-center gap-1 min-w-[60px]"><Package size={16}/> Estoque</Link>
          <Link to="/transacoes" className="flex flex-col items-center gap-1 min-w-[60px]"><ArrowLeftRight size={16}/> Notas</Link>
          <Link to="/servicos" className="flex flex-col items-center gap-1 min-w-[60px]"><Wrench size={16}/> Serviços</Link>
          <Link to="/anotacoes" className="flex flex-col items-center gap-1 min-w-[60px]"><StickyNote size={16}/> Agenda</Link>
      </div>
    </nav>
  );
}

export default Navbar;