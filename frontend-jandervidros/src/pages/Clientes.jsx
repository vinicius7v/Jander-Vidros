import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { clienteService, pendenciaService } from '../services/api';
import {
  AlertCircle, UserPlus, Users, Plus, Trash2, CheckCircle, RotateCcw,
  Pencil, X, Save, MessageSquarePlus, ChevronDown, ChevronUp
} from 'lucide-react';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const today = () => new Date().toISOString().slice(0, 10);

const fmtData = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '';

function Clientes({ user, onLogout }) {
  const [tab, setTab] = useState('clientes');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');

  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '' });
  const [novaPend, setNovaPend] = useState({ clienteId: '', descricao: '', valor: '', data: today() });

  // Edição de pendência (descricao/valor/data)
  const [editandoPend, setEditandoPend] = useState(null);

  // Observações: qual pendência está com o painel aberto
  const [obsAberta, setObsAberta] = useState(null);
  // Nova observação a ser adicionada
  const [novaObs, setNovaObs] = useState({ texto: '', valor: '', data: today() });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const clis = await clienteService.getAll();
      setClientes(clis);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const totalPendente = clientes.reduce((s, c) =>
    s + (c.pendencias || []).filter(p => p.status === 'pendente').reduce((a, p) => a + Number(p.valor), 0), 0);
  const clientesComPendencia = clientes.filter(c => (c.pendencias || []).some(p => p.status === 'pendente'));

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

  const salvarEdicaoPend = async () => {
    if (!editandoPend.descricao || !editandoPend.valor) return;
    try {
      await pendenciaService.update(editandoPend.id, {
        descricao: editandoPend.descricao,
        valor: Number(editandoPend.valor),
        data: editandoPend.data
      });
      await loadAll();
      setEditandoPend(null);
    } catch (e) { alert('Erro ao salvar edição'); }
  };

  // ── Observações ──
  const addObservacao = async (pend) => {
    if (!novaObs.texto) return;
    const obs = Array.isArray(pend.observacoes) ? pend.observacoes : [];
    const novaLista = [
      ...obs,
      {
        id: Date.now(),
        texto: novaObs.texto,
        valor: novaObs.valor ? Number(novaObs.valor) : null,
        data: novaObs.data
      }
    ];
    try {
      await pendenciaService.update(pend.id, { observacoes: novaLista });
      await loadAll();
      setNovaObs({ texto: '', valor: '', data: today() });
    } catch (e) { alert('Erro ao adicionar observação'); }
  };

  const removeObservacao = async (pend, obsId) => {
    const obs = (pend.observacoes || []).filter(o => o.id !== obsId);
    try {
      await pendenciaService.update(pend.id, { observacoes: obs });
      await loadAll();
    } catch (e) { alert('Erro ao remover observação'); }
  };

  const clientesFiltrados = clientes.filter(c => filtroCliente ? c.id === Number(filtroCliente) : true);

  const inputClass = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-xs font-black text-gray-500 uppercase tracking-widest mb-1";
  const editInputClass = "border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

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
          <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Clientes</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Cadastro e Pendências •</p>
        </header>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-sky-500">
            <p className="text-xs font-black text-gray-400 uppercase">Total de Clientes</p>
            <p className="text-2xl font-black text-sky-600">{clientes.length} Cadastrados</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-orange-500">
            <p className="text-xs font-black text-gray-400 uppercase">Com Pendências</p>
            <p className="text-2xl font-black text-orange-500">{clientesComPendencia.length} Clientes</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-lg border-l-8 border-red-500">
            <p className="text-xs font-black text-gray-400 uppercase">Total a Receber</p>
            <p className="text-2xl font-black text-red-500">{fmt(totalPendente)}</p>
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
            { key: 'clientes', label: 'Clientes' },
            { key: 'pendencias', label: `Pendências${clientesComPendencia.length > 0 ? ` (${clientesComPendencia.length})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-black uppercase transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

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
                      {/* Cabeçalho do cliente */}
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

                      {pends.map(p => {
                        const isEditing = editandoPend?.id === p.id;
                        const isObsOpen = obsAberta === p.id;
                        const obs = Array.isArray(p.observacoes) ? p.observacoes : [];

                        return (
                          <div key={p.id} className={`border-t border-gray-100 ${isEditing ? 'bg-indigo-50' : ''}`}>

                            {isEditing ? (
                              /* ── MODO EDIÇÃO ── */
                              <div className="px-4 py-3 flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[160px]">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição</label>
                                  <input className={editInputClass + ' w-full'} value={editandoPend.descricao}
                                    onChange={e => setEditandoPend({ ...editandoPend, descricao: e.target.value })} />
                                </div>
                                <div className="w-28">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor (R$)</label>
                                  <input className={editInputClass + ' w-full'} type="number" value={editandoPend.valor}
                                    onChange={e => setEditandoPend({ ...editandoPend, valor: e.target.value })} />
                                </div>
                                <div className="w-36">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Data</label>
                                  <input className={editInputClass + ' w-full'} type="date" value={editandoPend.data}
                                    onChange={e => setEditandoPend({ ...editandoPend, data: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={salvarEdicaoPend}
                                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-black px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Save size={14} /> Salvar
                                  </button>
                                  <button onClick={() => setEditandoPend(null)}
                                    className="flex items-center gap-1 bg-gray-200 text-gray-600 text-xs font-black px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                                    <X size={14} /> Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ── MODO VISUALIZAÇÃO ── */
                              <div className="flex items-center justify-between px-4 py-3 gap-4">
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{p.descricao}</p>
                                  <p className="text-xs text-gray-400">{fmtData(p.data)}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className={`text-sm font-black ${p.status === 'pago' ? 'text-emerald-600' : 'text-orange-500'}`}>{fmt(p.valor)}</span>
                                  <span className={`text-xs font-black px-2 py-1 rounded-full ${p.status === 'pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {p.status === 'pago' ? 'Pago' : 'Pendente'}
                                  </span>
                                  {/* Botão observações */}
                                  <button
                                    onClick={() => { setObsAberta(isObsOpen ? null : p.id); setNovaObs({ texto: '', valor: '', data: today() }); }}
                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${isObsOpen ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`}
                                    title="Observações">
                                    <MessageSquarePlus size={15} />
                                    {obs.length > 0 && <span>{obs.length}</span>}
                                    {isObsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </button>
                                  <button
                                    onClick={() => setEditandoPend({ id: p.id, descricao: p.descricao, valor: p.valor, data: p.data || today() })}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Editar">
                                    <Pencil size={15} />
                                  </button>
                                  <button onClick={() => togglePendencia(p.id, p.status)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title={p.status === 'pendente' ? 'Marcar como pago' : 'Reabrir'}>
                                    {p.status === 'pendente' ? <CheckCircle size={17} /> : <RotateCcw size={17} />}
                                  </button>
                                  <button onClick={() => removePendencia(p.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1.5">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* ── PAINEL DE OBSERVAÇÕES ── */}
                            {isObsOpen && (
                              <div className="bg-violet-50 border-t border-violet-100 px-4 py-4">
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">Observações</p>

                                {/* Lista de observações */}
                                {obs.length === 0 && (
                                  <p className="text-xs text-gray-400 mb-3">Nenhuma observação ainda.</p>
                                )}
                                <div className="space-y-2 mb-4">
                                  {obs.map(o => (
                                    <div key={o.id} className="flex items-start justify-between bg-white rounded-xl px-3 py-2 gap-3 shadow-sm">
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-800">{o.texto}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {fmtData(o.data)}
                                          {o.valor ? <span className="ml-2 font-bold text-emerald-600">{fmt(o.valor)}</span> : ''}
                                        </p>
                                      </div>
                                      <button onClick={() => removeObservacao(p, o.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Formulário nova observação */}
                                <div className="flex flex-wrap gap-2 items-end">
                                  <div className="flex-1 min-w-[160px]">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Observação</label>
                                    <input
                                      className="w-full border border-violet-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                                      placeholder="Ex: Cliente pagou R$ 100..."
                                      value={novaObs.texto}
                                      onChange={e => setNovaObs({ ...novaObs, texto: e.target.value })}
                                    />
                                  </div>
                                  <div className="w-28">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor (R$)</label>
                                    <input
                                      className="w-full border border-violet-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                                      type="number" placeholder="0,00"
                                      value={novaObs.valor}
                                      onChange={e => setNovaObs({ ...novaObs, valor: e.target.value })}
                                    />
                                  </div>
                                  <div className="w-36">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Data</label>
                                    <input
                                      className="w-full border border-violet-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                                      type="date"
                                      value={novaObs.data}
                                      onChange={e => setNovaObs({ ...novaObs, data: e.target.value })}
                                    />
                                  </div>
                                  <button
                                    onClick={() => addObservacao(p)}
                                    className="flex items-center gap-1 bg-violet-600 text-white text-xs font-black px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                                    <Plus size={14} /> Adicionar
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
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

export default Clientes;