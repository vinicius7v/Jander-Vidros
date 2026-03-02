import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Wrench, Plus, CheckCircle, Clock, Trash2, Calendar, History, FileText, Printer, X } from 'lucide-react';

// ─── Componente de Impressão ─────────────────────────────────────────
function OrcamentoPrint({ orc, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Toolbar (não imprime) */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b print:hidden">
          <span className="font-black uppercase italic text-gray-700">Pré-visualização do Orçamento</span>
          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-black uppercase text-xs hover:bg-indigo-700 transition-all">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Conteúdo imprimível */}
        <div id="print-area" className="overflow-y-auto p-8">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 32px; }
              .print\\:hidden { display: none !important; }
            }
          `}</style>

          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Jander Vidros</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Vidraçaria & Serviços</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase text-gray-400 tracking-widest">Orçamento Nº</div>
              <div className="text-2xl font-black text-indigo-600">#{String(orc.id).slice(-5)}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(orc.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Dados do cliente */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Dados do Cliente</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold">Nome</span>
                <p className="font-black text-gray-800">{orc.clientName}</p>
              </div>
              {orc.clientPhone && (
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">Telefone</span>
                  <p className="font-black text-gray-800">{orc.clientPhone}</p>
                </div>
              )}
              {orc.clientAddress && (
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 uppercase font-bold">Endereço</span>
                  <p className="font-black text-gray-800">{orc.clientAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itens do orçamento */}
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Itens do Orçamento</h2>
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-indigo-600 text-white text-xs uppercase">
                <th className="text-left p-3 rounded-tl-xl font-black">Descrição</th>
                <th className="text-center p-3 font-black">Qtd</th>
                <th className="text-right p-3 font-black">Unit.</th>
                <th className="text-right p-3 rounded-tr-xl font-black">Total</th>
              </tr>
            </thead>
            <tbody>
              {orc.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm font-medium text-gray-800">{item.desc}</td>
                  <td className="p-3 text-sm text-center text-gray-600">{item.qty}</td>
                  <td className="p-3 text-sm text-right text-gray-600">R$ {parseFloat(item.unit).toFixed(2)}</td>
                  <td className="p-3 text-sm text-right font-black text-indigo-600">
                    R$ {(item.qty * parseFloat(item.unit)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div className="bg-indigo-600 text-white rounded-2xl px-8 py-4 text-right">
              <div className="text-xs uppercase font-black tracking-widest opacity-75">Total do Orçamento</div>
              <div className="text-3xl font-black">
                R$ {orc.items.reduce((s, i) => s + i.qty * parseFloat(i.unit), 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Validade e obs */}
          <div className="grid grid-cols-2 gap-4">
            {orc.validity && (
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-xs font-black uppercase text-gray-400">Validade do Orçamento</span>
                <p className="font-black text-gray-800 mt-1">{new Date(orc.validity).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            {orc.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-xs font-black uppercase text-gray-400">Observações</span>
                <p className="text-sm text-gray-700 mt-1">{orc.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>Este orçamento foi gerado pelo sistema Jander Vidros.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Novo Orçamento ─────────────────────────────────────────
function ModalOrcamento({ onSave, onCancel }) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [validity, setValidity] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ desc: '', qty: 1, unit: '' }]);

  const addItem = () => setItems([...items, { desc: '', qty: 1, unit: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = field === 'qty' ? parseInt(val) || 1 : val;
    setItems(updated);
  };

  const total = items.reduce((s, i) => s + (i.qty * parseFloat(i.unit || 0)), 0);

  const handleSave = (e) => {
    e.preventDefault();
    if (!clientName || items.some(i => !i.desc || !i.unit)) return;
    onSave({ clientName, clientPhone, clientAddress, validity, notes, items,
      id: Date.now(), createdAt: new Date().toISOString(), status: 'Aberto' });
  };

  const inputClass = "w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold outline-none focus:border-indigo-600 text-sm";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-8 pt-8 pb-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase italic">📋 Novo Orçamento</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500"><X size={22} /></button>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto px-8 py-6 space-y-5">
          {/* Dados do cliente */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Dados do Cliente</p>
            <div className="grid grid-cols-2 gap-3">
              <input className={`${inputClass} col-span-2`} placeholder="Nome do Cliente *" value={clientName}
                onChange={e => setClientName(e.target.value)} required />
              <input className={inputClass} placeholder="Telefone" value={clientPhone}
                onChange={e => setClientPhone(e.target.value)} />
              <input className={inputClass} placeholder="Endereço" value={clientAddress}
                onChange={e => setClientAddress(e.target.value)} />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Itens do Orçamento</p>
              <button type="button" onClick={addItem}
                className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Plus size={14} /> Adicionar item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={`${inputClass} flex-[3]`} placeholder="Descrição do item *" value={item.desc}
                    onChange={e => updateItem(i, 'desc', e.target.value)} required />
                  <input className={`${inputClass} w-16 text-center`} type="number" min="1" placeholder="Qtd"
                    value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} required />
                  <input className={`${inputClass} w-28`} type="number" step="0.01" placeholder="R$ Unit. *"
                    value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} required />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-3">
              <span className="text-xs font-black uppercase text-gray-400">Total: </span>
              <span className="text-lg font-black text-indigo-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Validade e obs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Validade</p>
              <input className={inputClass} type="date" value={validity} onChange={e => setValidity(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Observações</p>
              <input className={inputClass} placeholder="Observações..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-4 font-black uppercase text-gray-400 hover:text-gray-600 transition-all">
              Cancelar
            </button>
            <button type="submit"
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">
              Gerar Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────
function Services({ user, onLogout }) {
  const [tab, setTab] = useState('servicos'); // 'servicos' | 'orcamentos'
  const [services, setServices] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [filter, setFilter] = useState('Pendente');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isOrcModalOpen, setIsOrcModalOpen] = useState(false);
  const [printOrc, setPrintOrc] = useState(null);

  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('services');
    if (saved) setServices(JSON.parse(saved));
    const savedOrc = localStorage.getItem('orcamentos');
    if (savedOrc) setOrcamentos(JSON.parse(savedOrc));
  }, []);

  const saveServices = (data) => { setServices(data); localStorage.setItem('services', JSON.stringify(data)); };
  const saveOrcamentos = (data) => { setOrcamentos(data); localStorage.setItem('orcamentos', JSON.stringify(data)); };

  const handleSaveService = (e) => {
    e.preventDefault();
    const newService = { id: Date.now().toString(), client, description, value: parseFloat(value), date, status: 'Pendente', createdAt: new Date().toISOString() };
    saveServices([newService, ...services]);
    setIsServiceModalOpen(false);
    setClient(''); setDescription(''); setValue(''); setDate(new Date().toISOString().split('T')[0]);
  };

  const toggleStatus = (id) => {
    saveServices(services.map(s => s.id === id ? { ...s, status: s.status === 'Concluído' ? 'Pendente' : 'Concluído' } : s));
  };

  const deleteService = (id) => {
    if (window.confirm('Excluir este serviço permanentemente?'))
      saveServices(services.filter(s => s.id !== id));
  };

  const handleSaveOrcamento = (orc) => {
    saveOrcamentos([orc, ...orcamentos]);
    setIsOrcModalOpen(false);
  };

  const deleteOrcamento = (id) => {
    if (window.confirm('Excluir este orçamento?'))
      saveOrcamentos(orcamentos.filter(o => o.id !== id));
  };

  const filteredServices = services.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Serviços & Orçamentos</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Jander Vidros | Gestão de Serviços</p>
          </div>
          <button
            onClick={() => tab === 'servicos' ? setIsServiceModalOpen(true) : setIsOrcModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> {tab === 'servicos' ? 'NOVO SERVIÇO' : 'NOVO ORÇAMENTO'}
          </button>
        </div>

        {/* Tabs principais */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow w-fit">
          <button onClick={() => setTab('servicos')}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase transition-all flex items-center gap-2 ${tab === 'servicos' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Wrench size={16} /> Serviços
          </button>
          <button onClick={() => setTab('orcamentos')}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase transition-all flex items-center gap-2 ${tab === 'orcamentos' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
            <FileText size={16} /> Orçamentos
            {orcamentos.length > 0 && <span className="bg-indigo-100 text-indigo-600 text-xs rounded-full px-2">{orcamentos.length}</span>}
          </button>
        </div>

        {/* ════ ABA SERVIÇOS ════ */}
        {tab === 'servicos' && (
          <>
            <div className="flex gap-4 mb-8">
              <button onClick={() => setFilter('Pendente')}
                className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 transition-all ${filter === 'Pendente' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                <Clock size={18} /> Serviços Pendentes
              </button>
              <button onClick={() => setFilter('Concluído')}
                className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 transition-all ${filter === 'Concluído' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                <History size={18} /> Histórico de Concluídos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.length > 0 ? filteredServices.map(service => (
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
                      <Calendar size={14} /> {new Date(service.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="font-black text-indigo-600 text-lg">R$ {service.value.toFixed(2)}</div>
                  </div>
                  <button onClick={() => toggleStatus(service.id)}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${service.status === 'Concluído' ? 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100'}`}>
                    {service.status === 'Concluído' ? <><Clock size={18} /> Reabrir Serviço</> : <><CheckCircle size={18} /> Finalizar Serviço</>}
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center opacity-20 flex flex-col items-center">
                  <Wrench size={60} className="mb-4" />
                  <p className="text-xl font-black uppercase italic">Nenhum serviço {filter.toLowerCase()}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════ ABA ORÇAMENTOS ════ */}
        {tab === 'orcamentos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orcamentos.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-20 flex flex-col items-center">
                <FileText size={60} className="mb-4" />
                <p className="text-xl font-black uppercase italic">Nenhum orçamento gerado</p>
              </div>
            ) : orcamentos.map(orc => {
              const total = orc.items.reduce((s, i) => s + i.qty * parseFloat(i.unit), 0);
              return (
                <div key={orc.id} className="bg-white rounded-[2rem] p-6 shadow-xl border-t-[12px] border-indigo-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-600">
                      #{String(orc.id).slice(-5)}
                    </span>
                    <button onClick={() => deleteOrcamento(orc.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none mb-1">{orc.clientName}</h3>
                  {orc.clientPhone && <p className="text-xs text-gray-400 font-bold mb-3">{orc.clientPhone}</p>}

                  <div className="space-y-1 mb-4">
                    {orc.items.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-sm text-gray-500 truncate">• {item.desc}</p>
                    ))}
                    {orc.items.length > 3 && <p className="text-xs text-gray-400">+{orc.items.length - 3} itens...</p>}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-50 mb-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                      <Calendar size={14} /> {new Date(orc.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="font-black text-indigo-600 text-lg">R$ {total.toFixed(2)}</div>
                  </div>

                  <button onClick={() => setPrintOrc(orc)}
                    className="w-full py-4 rounded-2xl font-black uppercase text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all flex items-center justify-center gap-2">
                    <Printer size={18} /> Ver / Imprimir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal novo serviço */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-6">🛠️ Agendar Serviço</h2>
            <form onSubmit={handleSaveService} className="space-y-4">
              <input type="text" placeholder="Nome do Cliente" required
                className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600"
                value={client} onChange={e => setClient(e.target.value)} />
              <textarea placeholder="Descrição do Trabalho" required
                className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold h-24 outline-none focus:border-indigo-600"
                value={description} onChange={e => setDescription(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Valor R$" required
                  className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600"
                  value={value} onChange={e => setValue(e.target.value)} />
                <input type="date" required
                  className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600"
                  value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 py-4 font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Cancelar</button>
                <button type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">Salvar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal novo orçamento */}
      {isOrcModalOpen && <ModalOrcamento onSave={handleSaveOrcamento} onCancel={() => setIsOrcModalOpen(false)} />}

      {/* Modal impressão */}
      {printOrc && <OrcamentoPrint orc={printOrc} onClose={() => setPrintOrc(null)} />}
    </div>
  );
}

export default Services;