import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { History, Printer, ArrowUpCircle, ArrowDownCircle, X, Save, PlusCircle, Trash2, Edit, Eye } from 'lucide-react';

function Transactions({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('vendas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalType, setModalType] = useState('vendas');
  const [editingId, setEditingId] = useState(null);

  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ id: Date.now(), description: '', quantity: 1, unitValue: '' }]);

  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        setTransactions([]);
      }
    }
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setEditingId(null);
    setClient('');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: Date.now(), description: '', quantity: 1, unitValue: '' }]);
    setIsModalOpen(true);
  };

  const handleViewNote = (trans) => {
    setSelectedNote(trans);
    setViewModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir esta nota permanentemente?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions([...updated]);
      localStorage.setItem('transactions', JSON.stringify(updated));
    }
  };

  const addLine = () => {
    setItems([...items, { id: Date.now() + Math.random(), description: '', quantity: 1, unitValue: '' }]);
  };

  const removeLine = (id) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, val) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  // NOVA FUNÇÃO DE IMPRESSÃO PROFISSIONAL
  const handlePrint = (trans) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = trans.items?.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${Number(item.unitValue).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${Number(item.totalItem).toFixed(2)}</td>
      </tr>
    `).join('') || `<tr><td colspan="4">${trans.description} - R$ ${trans.value}</td></tr>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo Jander Vidros</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f4f4f4; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
            .total-box { text-align: right; font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; }
            .sig { margin-top: 40px; border-top: 1px solid #000; width: 250px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; letter-spacing:-1px;">JANDER VIDROS</h1>
            <p style="margin:0; font-size: 12px; font-weight: bold;">SERVIÇOS EM VIDROS E ALUMÍNIO</p>
          </div>
          <div class="info">
            <p><strong>CLIENTE/FORNECEDOR:</strong> ${trans.client.toUpperCase()}</p>
            <p><strong>DATA:</strong> ${new Date(trans.date).toLocaleDateString('pt-BR')}</p>
            <p><strong>TIPO:</strong> ${trans.type === 'vendas' ? 'RECIBO DE VENDA' : 'NOTA DE COMPRA'}</p>
          </div>
          <table>
            <thead>
              <tr><th>Qtd</th><th>Descrição</th><th style="text-align:right">Unitário</th><th style="text-align:right">Subtotal</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total-box">TOTAL: R$ ${Number(trans.total || trans.value).toFixed(2)}</div>
          <div class="footer">
            <div style="text-align: center;">
              <div class="sig"></div>
              <p>Assinatura Responsável</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validItems = items.filter(i => i.description && i.unitValue);
    const processedItems = validItems.map(i => ({
      description: i.description,
      quantity: parseFloat(i.quantity || 1),
      unitValue: parseFloat(i.unitValue),
      totalItem: parseFloat(i.quantity || 1) * parseFloat(i.unitValue)
    }));
    const totalValue = processedItems.reduce((acc, curr) => acc + curr.totalItem, 0);

    const noteData = {
      id: editingId || Date.now().toString(),
      type: modalType,
      client: client,
      date: date,
      items: processedItems,
      total: totalValue,
      createdAt: new Date().toISOString()
    };

    const updatedTransactions = editingId 
      ? transactions.map(t => t.id === editingId ? noteData : t)
      : [noteData, ...transactions];

    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Gerenciamento de Notas</h1>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Jander Vidros | Fluxo</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleOpenModal('compras')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95">
              <ArrowUpCircle /> ENTRADA
            </button>
            <button onClick={() => handleOpenModal('vendas')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95">
              <ArrowDownCircle /> SAÍDA
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mt-6">
            <div className="flex bg-gray-50 border-b">
                <button onClick={() => setActiveTab('vendas')} className={`flex-1 py-4 font-black uppercase italic ${activeTab === 'vendas' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Vendas</button>
                <button onClick={() => setActiveTab('compras')} className={`flex-1 py-4 font-black uppercase italic ${activeTab === 'compras' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Compras</button>
            </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-[10px] font-black uppercase text-gray-400">
                <th className="p-6">Data</th>
                <th className="p-6">Cliente / Fornecedor</th>
                <th className="p-6">Resumo</th>
                <th className="p-6 text-right">Valor Total</th>
                <th className="p-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.filter(t => t.type === activeTab).map(trans => (
                <tr key={trans.id} className="hover:bg-gray-50 transition-all">
                  <td className="p-6 font-bold text-gray-600">{new Date(trans.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-6 font-black text-gray-800 uppercase">{trans.client}</td>
                  <td className="p-6 text-sm">
                    {trans.items ? `${trans.items[0]?.quantity}x ${trans.items[0]?.description}` : trans.description}
                    {trans.items?.length > 1 && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 p-1 rounded font-black">+{trans.items.length - 1}</span>}
                  </td>
                  <td className={`p-6 text-right font-black ${trans.type === 'vendas' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {(trans.total || trans.value).toFixed(2)}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      {/* BOTÃO DE VISUALIZAR */}
                      <button onClick={() => handleViewNote(trans)} className="p-2 bg-gray-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Eye size={18} /></button>
                      {/* BOTÃO DE IMPRIMIR - ADICIONADO AQUI */}
                      <button onClick={() => handlePrint(trans)} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Printer size={18} /></button>
                      {/* BOTÃO DE EXCLUIR */}
                      <button onClick={() => handleDelete(trans.id)} className="p-2 bg-gray-100 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO (MANTIDO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black uppercase italic mb-6 border-b pb-4">📝 Lançar Itens na Nota</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Cliente / Empresa" required className="p-4 border-2 rounded-2xl outline-none focus:border-indigo-600 font-bold bg-gray-50 text-sm" value={client} onChange={(e) => setClient(e.target.value)} />
                <input type="date" required className="p-4 border-2 rounded-2xl outline-none focus:border-indigo-600 font-bold bg-gray-50 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-2xl border border-gray-200">
                    <input type="number" min="1" required className="col-span-1 bg-white p-2 rounded-lg outline-none font-black text-center text-sm border" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                    <input type="text" placeholder="Descrição do Produto" required className="col-span-6 bg-transparent p-2 outline-none font-bold text-sm" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                    <input type="number" step="0.01" placeholder="Valor" required className="col-span-2 bg-white p-2 rounded-lg outline-none font-black text-indigo-600 text-sm border" value={item.unitValue} onChange={(e) => updateItem(item.id, 'unitValue', e.target.value)} />
                    <div className="col-span-2 text-right font-black text-xs text-gray-500">
                      R$ {((parseFloat(item.quantity || 0)) * (parseFloat(item.unitValue || 0))).toFixed(2)}
                    </div>
                    {items.length > 1 && <button type="button" onClick={() => removeLine(item.id)} className="col-span-1 text-red-500 flex justify-center"><X size={18}/></button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLine} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl font-black text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-all uppercase text-[10px]">+ Adicionar Novo Item</button>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase bg-gray-100 rounded-2xl text-gray-400">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 font-black uppercase bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Salvar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO COM BOTÃO DE IMPRESSÃO INTERNO */}
      {viewModalOpen && selectedNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border-t-[12px] border-indigo-600">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Resumo da Nota</h3>
              <button onClick={() => setViewModalOpen(false)} className="p-2 hover:bg-red-50 text-red-500 rounded-full"><X /></button>
            </div>
            
            <div className="space-y-3 mb-8">
              {selectedNote.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="font-bold text-gray-700">{item.quantity}x {item.description}</span>
                  <span className="font-black text-indigo-600">R$ {item.totalItem?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-600 p-5 rounded-2xl text-white mb-4">
              <span className="font-black uppercase text-xs">Total</span>
              <span className="text-2xl font-black italic">R$ {selectedNote.total?.toFixed(2)}</span>
            </div>

            <button onClick={() => handlePrint(selectedNote)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-black transition-all">
              <Printer size={20} /> Imprimir Comprovante
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;