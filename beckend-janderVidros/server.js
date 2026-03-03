const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ========== BANCO DE DADOS ==========
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'estoque_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) { console.error('❌ Erro ao conectar:', err); return; }
  console.log('✅ Conectado ao MySQL');
  connection.release();
  createTables();
});

function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      quantidade INT NOT NULL DEFAULT 0,
      preco DECIMAL(10,2) DEFAULT 0,
      estoque_minimo INT DEFAULT 0,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS servicos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client VARCHAR(255) NOT NULL,
      description TEXT,
      value DECIMAL(10,2) DEFAULT 0,
      date DATE,
      status VARCHAR(50) DEFAULT 'Pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      telefone VARCHAR(50),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pendencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      descricao TEXT NOT NULL,
      valor DECIMAL(10,2) DEFAULT 0,
      data DATE,
      status VARCHAR(20) DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS caixa_movimentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo VARCHAR(20) NOT NULL,
      descricao TEXT NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      categoria VARCHAR(100),
      data DATE,
      cliente_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS orcamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(50),
      client_address VARCHAR(255),
      validity DATE,
      notes TEXT,
      items JSON NOT NULL,
      status VARCHAR(50) DEFAULT 'Aberto',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  tables.forEach((sql, i) => {
    db.query(sql, (err) => {
      if (err) console.error(`❌ Erro tabela ${i + 1}:`, err.message);
      else console.log(`✅ Tabela ${i + 1} ok`);
    });
  });
}

// ========== PRODUTOS ==========
app.get('/', (req, res) => res.json({ message: '🚀 API Jander Vidros funcionando!' }));

app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos ORDER BY id DESC', (err, r) =>
    err ? res.status(500).json({ error: err.message }) : res.json({ success: true, count: r.length, data: r }));
});

app.post('/api/produtos', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });
  db.query('INSERT INTO produtos (nome, categoria, quantidade, preco, estoque_minimo) VALUES (?,?,?,?,?)',
    [nome, categoria || 'Sem categoria', quantidade, preco || 0, estoque_minimo || 0],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.put('/api/produtos/:id', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  db.query('UPDATE produtos SET nome=?, categoria=?, quantidade=?, preco=?, estoque_minimo=? WHERE id=?',
    [nome, categoria, quantidade, preco || 0, estoque_minimo, req.params.id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ success: true });
    });
});

app.delete('/api/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id=?', [req.params.id], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ success: true });
  });
});

app.get('/api/produtos/estoque/baixo', (req, res) => {
  db.query('SELECT * FROM produtos WHERE quantidade <= estoque_minimo OR quantidade <= 1 ORDER BY quantidade ASC',
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true, data: r }));
});

app.get('/api/estatisticas', (req, res) => {
  db.query(`SELECT COUNT(*) as total_produtos,
    (SELECT COUNT(*) FROM produtos WHERE quantidade <= estoque_minimo OR quantidade <= 1) as produtos_baixo_estoque
    FROM produtos`,
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true, data: r[0] }));
});

// ========== SERVIÇOS ==========
app.get('/api/servicos', (req, res) => {
  db.query('SELECT * FROM servicos ORDER BY id DESC', (err, r) =>
    err ? res.status(500).json({ error: err.message }) : res.json({ success: true, data: r }));
});

app.post('/api/servicos', (req, res) => {
  const { client, description, value, date, status } = req.body;
  db.query('INSERT INTO servicos (client, description, value, date, status) VALUES (?,?,?,?,?)',
    [client, description, value || 0, date, status || 'Pendente'],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.put('/api/servicos/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE servicos SET status=? WHERE id=?', [status, req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

app.delete('/api/servicos/:id', (req, res) => {
  db.query('DELETE FROM servicos WHERE id=?', [req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ========== CLIENTES ==========
app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM clientes ORDER BY nome ASC', (err, clientes) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM pendencias', (err2, pendencias) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const data = clientes.map(c => ({
        ...c,
        pendencias: pendencias.filter(p => p.cliente_id === c.id)
      }));
      res.json({ success: true, data });
    });
  });
});

app.post('/api/clientes', (req, res) => {
  const { nome, telefone, email } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
  db.query('INSERT INTO clientes (nome, telefone, email) VALUES (?,?,?)',
    [nome, telefone || '', email || ''],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.delete('/api/clientes/:id', (req, res) => {
  db.query('DELETE FROM clientes WHERE id=?', [req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ========== PENDÊNCIAS ==========
app.post('/api/pendencias', (req, res) => {
  const { cliente_id, descricao, valor, data } = req.body;
  db.query('INSERT INTO pendencias (cliente_id, descricao, valor, data) VALUES (?,?,?,?)',
    [cliente_id, descricao, valor || 0, data],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.put('/api/pendencias/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE pendencias SET status=? WHERE id=?', [status, req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

app.delete('/api/pendencias/:id', (req, res) => {
  db.query('DELETE FROM pendencias WHERE id=?', [req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ========== CAIXA ==========
app.get('/api/caixa', (req, res) => {
  db.query('SELECT * FROM caixa_movimentos ORDER BY created_at DESC', (err, r) =>
    err ? res.status(500).json({ error: err.message }) : res.json({ success: true, data: r }));
});

app.post('/api/caixa', (req, res) => {
  const { tipo, descricao, valor, categoria, data, cliente_id } = req.body;
  db.query('INSERT INTO caixa_movimentos (tipo, descricao, valor, categoria, data, cliente_id) VALUES (?,?,?,?,?,?)',
    [tipo, descricao, valor, categoria || '', data, cliente_id || null],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.delete('/api/caixa/:id', (req, res) => {
  db.query('DELETE FROM caixa_movimentos WHERE id=?', [req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ========== ORÇAMENTOS ==========
app.get('/api/orcamentos', (req, res) => {
  db.query('SELECT * FROM orcamentos ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items }));
    res.json({ success: true, data });
  });
});

app.post('/api/orcamentos', (req, res) => {
  const { client_name, client_phone, client_address, validity, notes, items } = req.body;
  db.query('INSERT INTO orcamentos (client_name, client_phone, client_address, validity, notes, items) VALUES (?,?,?,?,?,?)',
    [client_name, client_phone || '', client_address || '', validity || null, notes || '', JSON.stringify(items)],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});

app.delete('/api/orcamentos/:id', (req, res) => {
  db.query('DELETE FROM orcamentos WHERE id=?', [req.params.id],
    (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// ========== START ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});