import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  CalendarDays
} from 'lucide-react';

function NotesAndSchedule({ user, onLogout }) {
  const [appointments, setAppointments] = useState([]);
  
  // Estados para o formulário de compromissos
  const [appTitle, setAppTitle] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');

  useEffect(() => {
    const savedApps = JSON.parse(localStorage.getItem('personal_appointments') || '[]');
    setAppointments(savedApps);
  }, []);

  // --- LÓGICA DE COMPROMISSOS ---
  const addAppointment = (e) => {
    e.preventDefault();
    if (!appTitle || !appDate || !appTime) return;
    
    const newApp = { 
      id: Date.now(), 
      title: appTitle, 
      date: appDate, 
      time: appTime,
    };

    // Salva e ordena por data
    const updated = [newApp, ...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
    setAppointments(updated);
    localStorage.setItem('personal_appointments', JSON.stringify(updated));
    
    // Limpa o formulário
    setAppTitle(''); 
    setAppDate(''); 
    setAppTime('');
  };

  const deleteApp = (id) => {
    if (window.confirm('Excluir este compromisso?')) {
      const updated = appointments.filter(a => a.id !== id);
      setAppointments(updated);
      localStorage.setItem('personal_appointments', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
            Minha <span className="text-indigo-600">Agenda</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Compromissos e Agendamentos Jander Vidros</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          
          {/* SEÇÃO: CADASTRO DE COMPROMISSO */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-[12px] border-indigo-600">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="text-indigo-600" size={28} />
              <h2 className="text-2xl font-black uppercase italic">Novo Agendamento</h2>
            </div>

            <form onSubmit={addAppointment} className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">O que você tem para fazer?</label>
                <input 
                  type="text" 
                  placeholder="Ex: Reunião com fornecedor, entrega de vidro..." 
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                  value={appTitle} 
                  onChange={(e) => setAppTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Data</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={appDate} 
                    onChange={(e) => setAppDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Horário</label>
                  <input 
                    type="time" 
                    required
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={appTime} 
                    onChange={(e) => setAppTime(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2 active:scale-95"
              >
                <Plus size={20} /> Salvar na Agenda
              </button>
            </form>
          </section>

          {/* SEÇÃO: LISTAGEM DE COMPROMISSOS */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <CalendarDays className="text-gray-400" size={24} />
              <h2 className="text-xl font-black uppercase italic text-gray-700">Compromissos Marcados</h2>
            </div>

            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map(app => (
                  <div key={app.id} className="bg-gray-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 p-5 rounded-3xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 uppercase text-md leading-none mb-1">{app.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-indigo-500 uppercase">
                            {new Date(app.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs font-bold text-gray-400">às {app.time}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteApp(app.id)} 
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir compromisso"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 opacity-20">
                  <CalendarIcon size={64} className="mx-auto mb-4" />
                  <p className="text-xl font-black uppercase italic">Nenhum compromisso agendado</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default NotesAndSchedule;