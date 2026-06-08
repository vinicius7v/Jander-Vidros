const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
const PORT = process.env.PORT || 3000;

// ========== ACELERAÇÃO DE REDE (KEEP-ALIVE HTTP) ==========
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30');
  next();
});
 
// ========== CORS ==========
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// ========== CONFIGURAÇÃO DO BANCO DE DADOS ==========
let poolConfig;

if (process.env.MYSQL_URL || process.env.MYSQLURL) {
  poolConfig = {
    uri: process.env.MYSQL_URL || process.env.MYSQLURL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'estoque_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000
  };
}

const db = mysql.createPool(poolConfig);
 
db.getConnection((err, connection) => {
  if (err) { 
    console.error('❌ Erro crítico ao conectar no MySQL:', err.message); 
    console.error('👉 Verifique as variáveis de ambiente no painel do Railway.');
    return;
  }
  console.log('✅ Conectado ao MySQL com Pool de Conexões com sucesso!');
  connection.release();
  createTables();
});
 
function createTables() {
  const tServicos = `CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2) DEFAULT 0,
    date DATE,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  const tProdutos = `CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    quantidade INT NOT NULL DEFAULT 0,
    preco DECIMAL(10,2) DEFAULT 0,
    estoque_minimo INT DEFAULT 0,
    preco_compra DECIMAL(10,2) DEFAULT NULL,
    preco_venda DECIMAL(10,2) DEFAULT NULL,
    fornecedor VARCHAR(255) DEFAULT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;

  const tClientes = `CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  const tPendencias = `CREATE TABLE IF NOT EXISTS pendencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0,
    data DATE,
    status VARCHAR(20) DEFAULT 'pendente',
    observacoes JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  )`;

  const tCaixa = `CREATE TABLE IF NOT EXISTS caixa_movimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    data DATE,
    cliente_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  const tOrcamentos = `CREATE TABLE IF NOT EXISTS orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_address VARCHAR(255),
    validity DATE,
    notes TEXT,
    items JSON NOT NULL,
    status VARCHAR(50) DEFAULT 'Aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  const tables = [tServicos, tProdutos, tClientes, tPendencias, tCaixa, tOrcamentos];
 
  tables.forEach((sql, i) => {
    db.query(sql, (err) => {
      if (err) console.error(`❌ Erro estrutural na tabela ${i + 1}:`, err.message);
    });
  });
 
  db.query(`
    SELECT COUNT(*) AS existe 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'pendencias' 
      AND COLUMN_NAME = 'observacoes'
  `, (err, rows) => {
    if (err) {
      console.error('⚠️ Erro ao verificar existência da coluna observacoes:', err.message);
      return;
    }
    if (rows && rows[0] && rows[0].existe === 0) {
      db.query(`ALTER TABLE pendencias ADD COLUMN observacoes JSON DEFAULT NULL`, (errAlter) => {
        if (errAlter) console.error('❌ Erro ao adicionar coluna observacoes:', errAlter.message);
        else console.log('✅ Coluna "observacoes" adicionada na tabela pendencias com sucesso!');
      });
    }
  });
}
 
// ========== ROTAS DE SAÚDE / DIAGNÓSTICO ==========
app.get('/health', (req, res) => res.json({ status: 'ok', database: 'Pool inicializado' }));
app.get('/', (req, res) => res.json({ message: '🚀 API Jander Vidros operando em produção!' }));

// 🔍 ROTA DE DIAGNÓSTICO — mede o tempo real de conexão com o banco
// Acesse: https://sua-api.railway.app/test-db
app.get('/test-db', (req, res) => {
  const start = Date.now();
  db.query('SELECT 1', (err) => {
    const tempo = Date.now() - start;
    res.json({
      status: err ? '❌ Erro na conexão' : '✅ Conexão OK',
      tempo_ms: tempo,
      aviso: tempo > 300 ? '⚠️ Lento — verifique a região do Railway' : '🚀 Conexão rápida',
      erro: err?.message || null
    });
  });
});
 
// ========== PRODUTOS ==========
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos ORDER BY id DESC', (err, r) =>
    err ? res.status(500).json({ error: err.message }) : res.json({ success: true, count: r.length, data: r }));
});
 
app.post('/api/produtos', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo, preco_compra, preco_venda, fornecedor } = req.body;
  if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });
  db.query(
    'INSERT INTO produtos (nome, categoria, quantidade, preco, estoque_minimo, preco_compra, preco_venda, fornecedor) VALUES (?,?,?,?,?,?,?,?)',
    [nome, categoria || 'Sem categoria', quantidade, preco || 0, estoque_minimo || 0, preco_compra ?? null, preco_venda ?? null, fornecedor ?? null],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId })
  );
});
 
app.put('/api/produtos/:id', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo, preco_compra, preco_venda, fornecedor } = req.body;
  db.query(
    'UPDATE produtos SET nome=?, categoria=?, quantidade=?, preco=?, estoque_minimo=?, preco_compra=?, preco_venda=?, fornecedor=? WHERE id=?',
    [nome, categoria, quantidade, preco || 0, estoque_minimo, preco_compra ?? null, preco_venda ?? null, fornecedor ?? null, req.params.id],
    (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ success: true });
    }
  );
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
// ✅ CORRIGIDO: era 2 queries separadas (lento), agora usa 1 JOIN (rápido)
app.get('/api/clientes', (req, res) => {
  const sql = `
    SELECT 
      c.id, c.nome, c.telefone, c.email, c.created_at,
      p.id AS pend_id, p.descricao, p.valor, p.data,
      p.status AS pend_status, p.observacoes
    FROM clientes c
    LEFT JOIN pendencias p ON p.cliente_id = c.id
    ORDER BY c.nome ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const clientesMap = {};
    rows.forEach(row => {
      if (!clientesMap[row.id]) {
        clientesMap[row.id] = {
          id: row.id,
          nome: row.nome,
          telefone: row.telefone,
          email: row.email,
          created_at: row.created_at,
          pendencias: []
        };
      }
      if (row.pend_id) {
        clientesMap[row.id].pendencias.push({
          id: row.pend_id,
          descricao: row.descricao,
          valor: row.valor,
          data: row.data,
          status: row.pend_status,
          observacoes: typeof row.observacoes === 'string'
            ? JSON.parse(row.observacoes || '[]')
            : (row.observacoes || [])
        });
      }
    });

    res.json({ success: true, data: Object.values(clientesMap) });
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
  db.query('INSERT INTO pendencias (cliente_id, descricao, valor, data, observacoes) VALUES (?,?,?,?,?)',
    [cliente_id, descricao, valor || 0, data, JSON.stringify([])],
    (err, r) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true, id: r.insertId }));
});
 
app.put('/api/pendencias/:id', (req, res) => {
  const { status, descricao, valor, data, observacoes } = req.body;
 
  const fields = [];
  const values = [];
 
  if (status !== undefined)      { fields.push('status=?');      values.push(status); }
  if (descricao !== undefined)   { fields.push('descricao=?');   values.push(descricao); }
  if (valor !== undefined)       { fields.push('valor=?');       values.push(valor); }
  if (data !== undefined)        { fields.push('data=?');        values.push(data); }
  if (observacoes !== undefined) { fields.push('observacoes=?'); values.push(JSON.stringify(observacoes)); }
 
  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
 
  values.push(req.params.id);
  db.query(`UPDATE pendencias SET ${fields.join(', ')} WHERE id=?`, values,
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
 
// ========== INICIALIZAÇÃO DO SERVIDOR ==========
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor Express rodando com sucesso total em http://${HOST}:${PORT}`);
});

server.keepAliveTimeout = 30000;
server.headersTimeout = 35000;
