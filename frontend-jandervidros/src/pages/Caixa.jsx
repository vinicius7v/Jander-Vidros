import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { caixaService, clienteService, pendenciaService } from '../services/api';
import {
  TrendingUp, TrendingDown, AlertCircle,
  UserPlus, Users, Plus, Trash2, CheckCircle, RotateCcw
} from 'lucide-react';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const today = () => new Date().toISOString().slice(0, 10);

function Caixa({ user, onLogout }) {
  const [tab, setTab] = useState('caixa');
  const [movimentos, setMovimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');

  const [novoMov, setNovoMov] = useState({ tipo: 'entrada', descricao: '', valor: '', categoria: '', data: today(), clienteId: '' });
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '' });
  const [novaPend, setNovaPend] = useState({ clienteId: '', descricao: '', valor: '', data: today() });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [movs, clis] = await Promise.all([caixaService.getAll(), clienteService.getAll()]);
      setMovimentos(movs);
      setClientes(clis);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ── Resumos ──
  const entradas = movimentos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + Number(m.valor), 0);
  const saidas   = movimentos.filter(m => m.tipo === 'saida').reduce((s, m) => s + Number(m.valor), 0);
  const saldo    = entradas - saidas;
  const totalPendente = clientes.reduce((s, c) =>
    s + (c.pendencias || []).filter(p => p.status === 'pendente').reduce((a, p) => a + Number(p.valor), 0), 0);
  const clientesComPendencia = clientes.filter(c => (c.pendencias || []).some(p => p.status === 'pendente'));

  // ── Caixa ──
  const addMovimento = async () => {
    if (!novoMov.descricao || !novoMov.valor) return;
    try {
      const res = await caixaService.create({
        tipo: novoMov.tipo, descricao: novoMov.descricao, valor: Number(novoMov.valor),
        categoria: novoMov.categoria, data: novoMov.data, cliente_id: novoMov.clienteId || null
      });
      await loadAll();
      setNovoMov({ tipo: 'entrada', descricao: '', valor: '', categoria: '', data: today(), clienteId: '' });
    } catch (e) { alert('Erro ao salvar movimentação'); }
  };

  const removeMovimento = async (id) => {
    try { await caixaService.delete(id); await loadAll(); } catch (e) { alert('Erro ao excluir'); }
  };

  // ── Clientes ──
  const addCliente = async () => {
    if (!novoCliente.nome) return;
    try {
      await clienteService.create(novoCliente);
      await loadAll();
      setNovoCliente({ nome: '', telefone: '', email: '' });
    } catch (e) { alert('Erro ao cadastrar cliente'); }
  };

  const removeCliente = async (id) => {
    if (!window.confirm('Excluir cliente e todas as pendências?')) return;
    try { await clienteService.delete(id); await loadAll(); } catch (e) { alert('Erro ao excluir'); }
  };

  // ── Pendências ──
  const addPendencia = async () => {
    if (!novaPend.clienteId || !novaPend.descricao || !novaPend.valor) return;
    try {
      await pendenciaService.create({
        cliente_id: Number(novaPend.clienteId), descricao: novaPend.descricao,
        valor: Number(novaPend.valor), data: novaPend.data
      });
      await loadAll();
      setNovaPend({ clienteId: '', descricao: '', valor: '', data: today() });
    } catch (e) { alert('Erro ao registrar pendência'); }
  };

  const togglePendencia = async (pendId, currentStatus) => {
    const newStatus = currentStatus === 'pendente' ? 'pago' : 'pendente';
    try { await pendenciaService.updateStatus(pendId, newStatus); await loadAll(); } catch (e) { alert('Erro'); }
  };

  const removePendencia = async (id) => {
    try { await pendenciaService.delete(id); await loadAll(); } catch (e) { alert('Erro'); }
  };

  const clientesFiltrados = clientes.filter(c => filtroCliente ? c.id === Number(filtroCliente) : true);

  const inputClass = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-xs font-black text-gray-500 uppercase tracking-widest mb-1";

  if (loading) return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Controle de Caixa</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Movimentações, Clientes e Pendências •</p>
        </header>

        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-emerald-500">
            <p className="text-xs font-black text-gray-400 uppercase">Entradas</p>
            <p className="text-2xl font-black text-emerald-600">{fmt(entradas)}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-red-500">
            <p className="text-xs font-black text-gray-400 uppercase">Saídas</p>
            <p className="text-2xl font-black text-red-500">{fmt(saidas)}</p>
          </div>
          <div className={`bg-white p-5 rounded-3xl shadow-lg border-l-8 ${saldo >= 0 ? 'border-indigo-600' : 'border-red-600'}`}>
            <p className="text-xs font-black text-gray-400 uppercase">Saldo</p>
            <p className={`text-2xl font-black ${saldo >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{fmt(saldo)}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-orange-500">
            <p className="text-xs font-black text-gray-400 uppercase">A Receber</p>
            <p className="text-2xl font-black text-orange-500">{fmt(totalPendente)}</p>
          </div>
        </div>

        {clientesComPendencia.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="text-orange-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-orange-800">
              {clientesComPendencia.length} cliente(s) com pendências:{' '}
              <span className="font-normal">{clientesComPendencia.map(c => c.nome).join(', ')}</span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow w-fit">
          {[
            { key: 'caixa', label: 'Caixa' },
            { key: 'clientes', label: 'Clientes' },
            { key: 'pendencias', label: `Pendências${clientesComPendencia.length > 0 ? ` (${clientesComPendencia.length})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-black uppercase transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════ ABA CAIXA ════ */}
        {tab === 'caixa' && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black uppercase italic text-indigo-600 mb-4">Nova Movimentação</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <select className={inputClass} value={novoMov.tipo} onChange={e => setNovoMov({ ...novoMov, tipo: e.target.value })}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descrição</label>
                <input className={inputClass} placeholder="Ex: Venda de vidro temperado..." value={novoMov.descricao}
                  onChange={e => setNovoMov({ ...novoMov, descricao: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input className={inputClass} type="number" placeholder="0,00" value={novoMov.valor}
                  onChange={e => setNovoMov({ ...novoMov, valor: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Categoria</label>
                <input className={inputClass} placeholder="Vendas, Despesas..." value={novoMov.categoria}
                  onChange={e => setNovoMov({ ...novoMov, categoria: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Cliente (opcional)</label>
                <select className={inputClass} value={novoMov.clienteId} onChange={e => setNovoMov({ ...novoMov, clienteId: e.target.value })}>
                  <option value="">— nenhum —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Data</label>
                <input className={inputClass} type="date" value={novoMov.data}
                  onChange={e => setNovoMov({ ...novoMov, data: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button onClick={addMovimento}
                  className="w-full bg-indigo-600 text-white font-black uppercase text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Extrato</h4>
              {movimentos.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Nenhuma movimentação ainda.</p>}
              <div className="space-y-2">
                {movimentos.map(m => {
                  const cli = clientes.find(c => c.id === m.cliente_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                          {m.tipo === 'entrada' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{m.descricao}</p>
                          <p className="text-xs text-gray-400">
                            {m.data ? new Date(m.data).toLocaleDateString('pt-BR') : ''}
                            {m.categoria ? ` · ${m.categoria}` : ''}
                            {cli ? ` · ${cli.nome}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {m.tipo === 'entrada' ? '+' : '-'}{fmt(m.valor)}
                        </span>
                        <button onClick={() => removeMovimento(m.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ ABA CLIENTES ════ */}
        {tab === 'clientes' && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black uppercase italic text-indigo-600 mb-4">Cadastrar Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome</label>
                <input className={inputClass} placeholder="Nome completo" value={novoCliente.nome}
                  onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input className={inputClass} placeholder="(88) 99999-9999" value={novoCliente.telefone}
                  onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input className={inputClass} placeholder="email@exemplo.com" value={novoCliente.email}
                  onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button onClick={addCliente}
                  className="w-full bg-indigo-600 text-white font-black uppercase text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <UserPlus size={16} /> Cadastrar
                </button>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Clientes ({clientes.length})</h4>
              {clientes.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Nenhum cliente cadastrado.</p>}
              <div className="space-y-3">
                {clientes.map(c => {
                  const pends = (c.pendencias || []).filter(p => p.status === 'pendente');
                  const total = pends.reduce((s, p) => s + Number(p.valor), 0);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><Users size={18} /></div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{c.nome}</p>
                          <p className="text-xs text-gray-400">{c.telefone}{c.telefone && c.email ? ' · ' : ''}{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {pends.length > 0
                          ? <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">⚠ {pends.length} pendência(s) · {fmt(total)}</span>
                          : <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">✓ Em dia</span>}
                        <button onClick={() => removeCliente(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ ABA PENDÊNCIAS ════ */}
        {tab === 'pendencias' && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black uppercase italic text-indigo-600 mb-4">Registrar Pendência</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={labelClass}>Cliente</label>
                <select className={inputClass} value={novaPend.clienteId} onChange={e => setNovaPend({ ...novaPend, clienteId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descrição</label>
                <input className={inputClass} placeholder="Ex: Vidro temperado 60x90..." value={novaPend.descricao}
                  onChange={e => setNovaPend({ ...novaPend, descricao: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input className={inputClass} type="number" placeholder="0,00" value={novaPend.valor}
                  onChange={e => setNovaPend({ ...novaPend, valor: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Data</label>
                <input className={inputClass} type="date" value={novaPend.data}
                  onChange={e => setNovaPend({ ...novaPend, data: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button onClick={addPendencia}
                  className="w-full bg-orange-500 text-white font-black uppercase text-sm px-4 py-2 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Registrar
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pendências por Cliente</h4>
                <div className="flex items-center gap-2">
                  {totalPendente > 0 && (
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Total: {fmt(totalPendente)}</span>
                  )}
                  <select className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
                    <option value="">Todos os clientes</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {clientesFiltrados.map(c => {
                  const pends = c.pendencias || [];
                  if (pends.length === 0 && !filtroCliente) return null;
                  const totalC = pends.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.valor), 0);
                  return (
                    <div key={c.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <p className="text-sm font-black text-gray-800">{c.nome}</p>
                          <p className="text-xs text-gray-400">{c.telefone}{c.telefone && c.email ? ' · ' : ''}{c.email}</p>
                        </div>
                        {totalC > 0
                          ? <span className="text-sm font-black text-orange-600">⚠ {fmt(totalC)} pendente</span>
                          : <span className="text-xs font-bold text-emerald-600">✓ Sem pendências</span>}
                      </div>
                      {pends.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhuma pendência.</p>}
                      {pends.map(p => (
                        <div key={p.id} className="flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{p.descricao}</p>
                            <p className="text-xs text-gray-400">{p.data ? new Date(p.data).toLocaleDateString('pt-BR') : ''}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-sm font-black ${p.status === 'pago' ? 'text-emerald-600' : 'text-orange-500'}`}>{fmt(p.valor)}</span>
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${p.status === 'pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {p.status === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                            <button onClick={() => togglePendencia(p.id, p.status)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              {p.status === 'pendente' ? <CheckCircle size={17} /> : <RotateCcw size={17} />}
                            </button>
                            <button onClick={() => removePendencia(p.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1.5">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Caixa;