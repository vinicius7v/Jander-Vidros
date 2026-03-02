import { useState, useEffect } from "react";

const API_URL = "https://jander-vidros-production.up.railway.app";

// ─── Paleta e estilo ────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .caixa-root {
    font-family: 'Syne', sans-serif;
    background: #0f0f0f;
    color: #f0ece4;
    min-height: 100vh;
    padding: 0;
  }

  .caixa-header {
    background: #0f0f0f;
    border-bottom: 1px solid #222;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .caixa-header h1 {
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f0ece4;
  }

  .caixa-header span {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #555;
  }

  .tabs {
    display: flex;
    gap: 4px;
    padding: 24px 32px 0;
    border-bottom: 1px solid #1c1c1c;
  }

  .tab-btn {
    background: none;
    border: none;
    color: #555;
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tab-btn:hover { color: #f0ece4; }
  .tab-btn.active { color: #d4ff5c; border-bottom-color: #d4ff5c; }

  .content { padding: 32px; max-width: 1100px; margin: 0 auto; }

  /* ─── Cards de resumo ─── */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .summary-card {
    background: #161616;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 20px 24px;
    transition: border-color 0.2s;
  }

  .summary-card:hover { border-color: #333; }

  .summary-card .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin-bottom: 8px;
    font-family: 'DM Mono', monospace;
  }

  .summary-card .value {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .summary-card.green .value { color: #d4ff5c; }
  .summary-card.red .value { color: #ff5c5c; }
  .summary-card.blue .value { color: #5cb8ff; }
  .summary-card.orange .value { color: #ffb85c; }

  /* ─── Formulários ─── */
  .section-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #555;
    font-family: 'DM Mono', monospace;
    margin-bottom: 16px;
  }

  .form-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    align-items: flex-end;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 140px;
  }

  .form-group label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #666;
    font-family: 'DM Mono', monospace;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    background: #161616;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #f0ece4;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus { border-color: #d4ff5c; }

  .form-group select option { background: #1a1a1a; }

  .btn {
    background: #d4ff5c;
    color: #0f0f0f;
    border: none;
    border-radius: 8px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 10px 24px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .btn:hover { background: #c0f040; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }

  .btn-ghost {
    background: transparent;
    color: #f0ece4;
    border: 1px solid #2a2a2a;
  }

  .btn-ghost:hover { background: #1c1c1c; border-color: #444; transform: none; }

  .btn-danger {
    background: transparent;
    color: #ff5c5c;
    border: 1px solid #3a1a1a;
  }

  .btn-danger:hover { background: #2a1010; border-color: #ff5c5c; transform: none; }

  .btn-sm { padding: 6px 14px; font-size: 0.78rem; }

  /* ─── Tabelas ─── */
  .table-wrap {
    background: #161616;
    border: 1px solid #222;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  table { width: 100%; border-collapse: collapse; }

  thead th {
    background: #111;
    padding: 12px 16px;
    text-align: left;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
  }

  tbody td {
    padding: 13px 16px;
    font-size: 0.88rem;
    border-top: 1px solid #1c1c1c;
    vertical-align: middle;
  }

  tbody tr:hover { background: #1a1a1a; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    font-family: 'DM Mono', monospace;
  }

  .badge-entrada { background: #1a2a0a; color: #d4ff5c; }
  .badge-saida   { background: #2a0a0a; color: #ff5c5c; }
  .badge-pendente { background: #2a1a00; color: #ffb85c; }
  .badge-pago    { background: #0a2a0a; color: #5cff8a; }

  .mono { font-family: 'DM Mono', monospace; }

  .divider { height: 1px; background: #1c1c1c; margin: 28px 0; }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #444;
    font-size: 0.85rem;
    font-family: 'DM Mono', monospace;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.83rem;
    margin-bottom: 16px;
  }

  .alert-warning { background: #1e1500; border: 1px solid #3a2a00; color: #ffb85c; }
  .alert-success { background: #0a1e00; border: 1px solid #1a3a00; color: #d4ff5c; }

  .cliente-card {
    background: #161616;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }

  .cliente-card:hover { border-color: #333; }

  .cliente-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .cliente-nome {
    font-weight: 700;
    font-size: 1rem;
  }

  .cliente-info {
    font-size: 0.78rem;
    color: #666;
    font-family: 'DM Mono', monospace;
    margin-top: 2px;
  }

  .pendencia-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-top: 1px solid #1c1c1c;
    gap: 12px;
  }

  .tag-actions { display: flex; gap: 8px; align-items: center; }

  .total-pendente {
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    color: #ffb85c;
  }

  @media (max-width: 600px) {
    .content { padding: 16px; }
    .tabs { padding: 16px 16px 0; overflow-x: auto; }
    .summary-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const today = () => new Date().toISOString().slice(0, 10);

// ─── Componente principal ────────────────────────────────────────────
export default function Caixa() {
  const [tab, setTab] = useState("caixa");

  // Movimentações de caixa
  const [movimentos, setMovimentos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("caixa_movimentos") || "[]"); } catch { return []; }
  });

  // Clientes
  const [clientes, setClientes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("caixa_clientes") || "[]"); } catch { return []; }
  });

  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // ── Estado caixa ──
  const [novoMov, setNovoMov] = useState({
    tipo: "entrada", descricao: "", valor: "", categoria: "", data: today(), clienteId: "",
  });

  // ── Estado clientes ──
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", email: "" });

  // ── Estado pendências ──
  const [novaPend, setNovaPend] = useState({ clienteId: "", descricao: "", valor: "", data: today() });
  const [filtroCliente, setFiltroCliente] = useState("");

  // ── Resumo caixa ──
  const entradas = movimentos.filter(m => m.tipo === "entrada").reduce((s, m) => s + Number(m.valor), 0);
  const saidas   = movimentos.filter(m => m.tipo === "saida").reduce((s, m) => s + Number(m.valor), 0);
  const saldo    = entradas - saidas;

  const totalPendente = clientes.reduce((s, c) => {
    return s + (c.pendencias || []).filter(p => p.status === "pendente").reduce((a, p) => a + Number(p.valor), 0);
  }, 0);

  // ── Ações caixa ──
  const addMovimento = () => {
    if (!novoMov.descricao || !novoMov.valor) return;
    const m = { ...novoMov, id: Date.now(), valor: Number(novoMov.valor) };
    const updated = [m, ...movimentos];
    setMovimentos(updated);
    save("caixa_movimentos", updated);
    setNovoMov({ tipo: "entrada", descricao: "", valor: "", categoria: "", data: today(), clienteId: "" });
  };

  const removeMovimento = (id) => {
    const updated = movimentos.filter(m => m.id !== id);
    setMovimentos(updated);
    save("caixa_movimentos", updated);
  };

  // ── Ações clientes ──
  const addCliente = () => {
    if (!novoCliente.nome) return;
    const c = { ...novoCliente, id: Date.now(), pendencias: [] };
    const updated = [...clientes, c];
    setClientes(updated);
    save("caixa_clientes", updated);
    setNovoCliente({ nome: "", telefone: "", email: "" });
  };

  const removeCliente = (id) => {
    const updated = clientes.filter(c => c.id !== id);
    setClientes(updated);
    save("caixa_clientes", updated);
  };

  // ── Ações pendências ──
  const addPendencia = () => {
    if (!novaPend.clienteId || !novaPend.descricao || !novaPend.valor) return;
    const updated = clientes.map(c => {
      if (c.id !== Number(novaPend.clienteId)) return c;
      return {
        ...c,
        pendencias: [...(c.pendencias || []), {
          id: Date.now(),
          descricao: novaPend.descricao,
          valor: Number(novaPend.valor),
          data: novaPend.data,
          status: "pendente",
        }],
      };
    });
    setClientes(updated);
    save("caixa_clientes", updated);
    setNovaPend({ clienteId: "", descricao: "", valor: "", data: today() });
  };

  const togglePendencia = (clienteId, pendId) => {
    const updated = clientes.map(c => {
      if (c.id !== clienteId) return c;
      return {
        ...c,
        pendencias: c.pendencias.map(p =>
          p.id === pendId ? { ...p, status: p.status === "pendente" ? "pago" : "pendente" } : p
        ),
      };
    });
    setClientes(updated);
    save("caixa_clientes", updated);
  };

  const removePendencia = (clienteId, pendId) => {
    const updated = clientes.map(c => {
      if (c.id !== clienteId) return c;
      return { ...c, pendencias: c.pendencias.filter(p => p.id !== pendId) };
    });
    setClientes(updated);
    save("caixa_clientes", updated);
  };

  const clientesFiltrados = clientes.filter(c =>
    filtroCliente ? c.id === Number(filtroCliente) : true
  );

  const clientesComPendencia = clientes.filter(c =>
    (c.pendencias || []).some(p => p.status === "pendente")
  );

  return (
    <div className="caixa-root">
      <style>{style}</style>

      {/* Header */}
      <div className="caixa-header">
        <h1>💵 Controle de Caixa</h1>
        <span className="mono">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: "caixa", label: "Caixa" },
          { key: "clientes", label: "Clientes" },
          { key: "pendencias", label: `Pendências ${clientesComPendencia.length > 0 ? `(${clientesComPendencia.length})` : ""}` },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">

        {/* ═══════════════ ABA CAIXA ═══════════════ */}
        {tab === "caixa" && (
          <>
            {/* Resumo */}
            <div className="summary-grid">
              <div className="summary-card green">
                <div className="label">Entradas</div>
                <div className="value">{fmt(entradas)}</div>
              </div>
              <div className="summary-card red">
                <div className="label">Saídas</div>
                <div className="value">{fmt(saidas)}</div>
              </div>
              <div className="summary-card blue">
                <div className="label">Saldo</div>
                <div className="value" style={{ color: saldo >= 0 ? "#5cb8ff" : "#ff5c5c" }}>{fmt(saldo)}</div>
              </div>
              <div className="summary-card orange">
                <div className="label">A Receber</div>
                <div className="value">{fmt(totalPendente)}</div>
              </div>
            </div>

            {/* Clientes com pendência no caixa */}
            {clientesComPendencia.length > 0 && (
              <div className="alert alert-warning">
                ⚠️ <strong>{clientesComPendencia.length} cliente(s)</strong> com pendências em aberto:{" "}
                {clientesComPendencia.map(c => c.nome).join(", ")}
              </div>
            )}

            {/* Formulário */}
            <div className="section-title">Nova Movimentação</div>
            <div className="form-row">
              <div className="form-group" style={{ maxWidth: 120 }}>
                <label>Tipo</label>
                <select value={novoMov.tipo} onChange={e => setNovoMov({ ...novoMov, tipo: e.target.value })}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input placeholder="Ex: Venda de vidro..." value={novoMov.descricao}
                  onChange={e => setNovoMov({ ...novoMov, descricao: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 140 }}>
                <label>Valor (R$)</label>
                <input type="number" placeholder="0,00" value={novoMov.valor}
                  onChange={e => setNovoMov({ ...novoMov, valor: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 150 }}>
                <label>Categoria</label>
                <input placeholder="Vendas, Despesas..." value={novoMov.categoria}
                  onChange={e => setNovoMov({ ...novoMov, categoria: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 150 }}>
                <label>Cliente (opcional)</label>
                <select value={novoMov.clienteId} onChange={e => setNovoMov({ ...novoMov, clienteId: e.target.value })}>
                  <option value="">— nenhum —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ maxWidth: 150 }}>
                <label>Data</label>
                <input type="date" value={novoMov.data} onChange={e => setNovoMov({ ...novoMov, data: e.target.value })} />
              </div>
              <button className="btn" onClick={addMovimento}>+ Adicionar</button>
            </div>

            {/* Tabela */}
            <div className="section-title" style={{ marginTop: 24 }}>Extrato</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.length === 0 && (
                    <tr><td colSpan={7}><div className="empty-state">Nenhuma movimentação ainda.</div></td></tr>
                  )}
                  {movimentos.map(m => {
                    const cli = clientes.find(c => c.id === Number(m.clienteId));
                    return (
                      <tr key={m.id}>
                        <td className="mono" style={{ color: "#666", fontSize: "0.78rem" }}>{m.data}</td>
                        <td>{m.descricao}</td>
                        <td style={{ color: "#666", fontSize: "0.8rem" }}>{m.categoria || "—"}</td>
                        <td style={{ color: "#666", fontSize: "0.8rem" }}>{cli ? cli.nome : "—"}</td>
                        <td><span className={`badge ${m.tipo === "entrada" ? "badge-entrada" : "badge-saida"}`}>{m.tipo}</span></td>
                        <td className="mono" style={{ color: m.tipo === "entrada" ? "#d4ff5c" : "#ff5c5c", fontWeight: 600 }}>
                          {m.tipo === "entrada" ? "+" : "-"}{fmt(m.valor)}
                        </td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => removeMovimento(m.id)}>✕</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══════════════ ABA CLIENTES ═══════════════ */}
        {tab === "clientes" && (
          <>
            <div className="section-title">Cadastrar Cliente</div>
            <div className="form-row">
              <div className="form-group">
                <label>Nome</label>
                <input placeholder="Nome completo" value={novoCliente.nome}
                  onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 180 }}>
                <label>Telefone</label>
                <input placeholder="(88) 99999-9999" value={novoCliente.telefone}
                  onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 220 }}>
                <label>E-mail</label>
                <input placeholder="email@exemplo.com" value={novoCliente.email}
                  onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })} />
              </div>
              <button className="btn" onClick={addCliente}>+ Cadastrar</button>
            </div>

            <div className="divider" />
            <div className="section-title">Clientes Cadastrados ({clientes.length})</div>

            {clientes.length === 0 && <div className="empty-state">Nenhum cliente cadastrado ainda.</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Pendências</th>
                    <th>Total Devido</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(c => {
                    const pends = (c.pendencias || []).filter(p => p.status === "pendente");
                    const total = pends.reduce((s, p) => s + Number(p.valor), 0);
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700 }}>{c.nome}</td>
                        <td className="mono" style={{ color: "#666", fontSize: "0.8rem" }}>{c.telefone || "—"}</td>
                        <td style={{ color: "#666", fontSize: "0.8rem" }}>{c.email || "—"}</td>
                        <td>
                          {pends.length > 0
                            ? <span className="badge badge-pendente">{pends.length} pendente(s)</span>
                            : <span style={{ color: "#444", fontSize: "0.78rem" }}>—</span>}
                        </td>
                        <td className="mono" style={{ color: total > 0 ? "#ffb85c" : "#444", fontWeight: 600 }}>
                          {total > 0 ? fmt(total) : "—"}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => removeCliente(c.id)}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══════════════ ABA PENDÊNCIAS ═══════════════ */}
        {tab === "pendencias" && (
          <>
            <div className="section-title">Registrar Pendência</div>
            <div className="form-row">
              <div className="form-group" style={{ maxWidth: 220 }}>
                <label>Cliente</label>
                <select value={novaPend.clienteId} onChange={e => setNovaPend({ ...novaPend, clienteId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input placeholder="Ex: Vidro temperado 60x90..." value={novaPend.descricao}
                  onChange={e => setNovaPend({ ...novaPend, descricao: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 140 }}>
                <label>Valor (R$)</label>
                <input type="number" placeholder="0,00" value={novaPend.valor}
                  onChange={e => setNovaPend({ ...novaPend, valor: e.target.value })} />
              </div>
              <div className="form-group" style={{ maxWidth: 150 }}>
                <label>Data</label>
                <input type="date" value={novaPend.data} onChange={e => setNovaPend({ ...novaPend, data: e.target.value })} />
              </div>
              <button className="btn" onClick={addPendencia}>+ Registrar</button>
            </div>

            <div className="divider" />

            {/* Filtro */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0 }}>Pendências por Cliente</div>
              <select style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, color: "#f0ece4", fontFamily: "Syne", fontSize: "0.85rem", padding: "6px 12px", outline: "none" }}
                value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
                <option value="">Todos os clientes</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {/* Resumo total */}
            {totalPendente > 0 && (
              <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                💰 Total pendente em aberto: <strong>{fmt(totalPendente)}</strong>
              </div>
            )}

            {clientesFiltrados.length === 0 && (
              <div className="empty-state">Nenhum cliente encontrado.</div>
            )}

            {clientesFiltrados.map(c => {
              const pends = c.pendencias || [];
              if (pends.length === 0 && filtroCliente === "") return null;
              const totalC = pends.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.valor), 0);

              return (
                <div className="cliente-card" key={c.id}>
                  <div className="cliente-card-header">
                    <div>
                      <div className="cliente-nome">{c.nome}</div>
                      <div className="cliente-info">{c.telefone || ""}{c.telefone && c.email ? " · " : ""}{c.email || ""}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {totalC > 0
                        ? <div className="total-pendente">⚠ {fmt(totalC)} pendente</div>
                        : <div style={{ color: "#3a8a3a", fontSize: "0.78rem", fontFamily: "DM Mono" }}>✓ sem pendências</div>}
                    </div>
                  </div>

                  {pends.length === 0 && (
                    <div style={{ color: "#444", fontSize: "0.8rem", fontFamily: "DM Mono", padding: "8px 0" }}>
                      Nenhuma pendência registrada.
                    </div>
                  )}

                  {pends.map(p => (
                    <div className="pendencia-row" key={p.id}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{p.descricao}</div>
                        <div style={{ fontSize: "0.72rem", color: "#555", fontFamily: "DM Mono", marginTop: 2 }}>{p.data}</div>
                      </div>
                      <div className="mono" style={{ fontWeight: 700, color: p.status === "pago" ? "#5cff8a" : "#ffb85c", minWidth: 90, textAlign: "right" }}>
                        {fmt(p.valor)}
                      </div>
                      <div className="tag-actions">
                        <span className={`badge ${p.status === "pago" ? "badge-pago" : "badge-pendente"}`}>
                          {p.status}
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => togglePendencia(c.id, p.id)}>
                          {p.status === "pendente" ? "✓ Pago" : "↩ Reabrir"}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => removePendencia(c.id, p.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

      </div>
    </div>
  );
}


