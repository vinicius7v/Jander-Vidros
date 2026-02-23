import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Wrench, Plus, CheckCircle, Clock, Trash2, Calendar, DollarSign, ListFilter, History } from 'lucide-react';

function Services({ user, onLogout }) {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('Pendente'); // 'Pendente' ou 'Concluído'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('services');
    if (saved) setServices(JSON.parse(saved));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const newService = {
      id: Date.now().toString(),
      client,
      description,
      value: parseFloat(value),
      date,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    const updated = [newService, ...services];
    saveData(updated);
    setIsModalOpen(false);
    resetForm();
  };

  const toggleStatus = (id) => {
    const updated = services.map(s => {
      if (s.id === id) {
        // CORREÇÃO: Usa exatamente "Concluído" para o Dashboard entender
        return { ...s, status: s.status === 'Concluído' ? 'Pendente' : 'Concluído' };
      }
      return s;
    });
    saveData(updated);
  };

  const deleteService = (id) => {
    if (window.confirm('Excluir este serviço permanentemente?')) {
      const updated = services.filter(s => s.id !== id);
      saveData(updated);
    }
  };

  const saveData = (data) => {
    setServices(data);
    localStorage.setItem('services', JSON.stringify(data));
  };

  const resetForm = () => {
    setClient('');
    setDescription('');
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Filtra os serviços baseados no botão clicado
  const filteredServices = services.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Gerenciar Serviços</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Jander Vidros | Ordem de Serviço</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> NOVO SERVIÇO
          </button>
        </div>

        {/* BOTÕES DE FILTRO (PENDENTES E HISTÓRICO) */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setFilter('Pendente')}
            className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 transition-all ${filter === 'Pendente' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <Clock size={18} /> Serviços Pendentes
          </button>
          <button 
            onClick={() => setFilter('Concluído')}
            className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 transition-all ${filter === 'Concluído' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <History size={18} /> Histórico de Concluídos
          </button>
        </div>

        {/* LISTAGEM DOS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div key={service.id} className={`bg-white rounded-[2rem] p-6 shadow-xl border-t-[12px] transition-all ${service.status === 'Concluído' ? 'border-green-500' : 'border-orange-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${service.status === 'Concluído' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {service.status}
                  </span>
                  <button onClick={() => deleteService(service.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none">{service.client}</h3>
                  <p className="text-gray-500 text-sm mt-3 font-medium line-clamp-2">{service.description}</p>
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-50">
                  <div className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                    <Calendar size={14}/> {new Date(service.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="font-black text-indigo-600 text-lg">R$ {service.value.toFixed(2)}</div>
                </div>

                <button 
                  onClick={() => toggleStatus(service.id)}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${
                    service.status === 'Concluído' 
                    ? 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100'
                  }`}
                >
                  {service.status === 'Concluído' ? (
                    <><Clock size={18}/> Reabrir Serviço</>
                  ) : (
                    <><CheckCircle size={18}/> Finalizar Serviço</>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-20 flex flex-col items-center">
              <Wrench size={60} className="mb-4" />
              <p className="text-xl font-black uppercase italic">Nenhum serviço {filter.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO (IGUAL AO ANTERIOR) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-6">🛠️ Agendar Serviço</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Nome do Cliente" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600" value={client} onChange={e => setClient(e.target.value)} />
              <textarea placeholder="Descrição do Trabalho" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold h-24 outline-none focus:border-indigo-600" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Valor R$" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600" value={value} onChange={e => setValue(e.target.value)} />
                <input type="date" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">Salvar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;