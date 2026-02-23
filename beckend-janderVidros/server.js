const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ========== CONFIGURAÇÃO DO BANCO DE DADOS ==========
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'estoque_db'
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('✅ Conectado ao banco de dados MySQL');
  createTables();
});

// Criar todas as tabelas
function createTables() {
  // Tabela de Produtos
  const produtosTable = `
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      quantidade INT NOT NULL DEFAULT 0,
      preco DECIMAL(10, 2) DEFAULT 0,
      estoque_minimo INT DEFAULT 0,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Tabela de Serviços
  const servicosTable = `
    CREATE TABLE IF NOT EXISTS servicos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente VARCHAR(255) NOT NULL,
      descricao TEXT,
      valor DECIMAL(10, 2) DEFAULT 0,
      data_servico DATE,
      status VARCHAR(20) DEFAULT 'Pendente',
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Tabela de Compromissos
  const compromissosTable = `
    CREATE TABLE IF NOT EXISTS compromissos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      data DATE NOT NULL,
      hora TIME NOT NULL,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Tabela de Transações
  const transacoesTable = `
    CREATE TABLE IF NOT EXISTS transacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo VARCHAR(20) NOT NULL,
      cliente VARCHAR(255) NOT NULL,
      data DATE NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Tabela de Itens de Transação
  const itensTransacaoTable = `
    CREATE TABLE IF NOT EXISTS itens_transacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transacao_id INT NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      quantidade DECIMAL(10, 2) NOT NULL,
      valor_unitario DECIMAL(10, 2) NOT NULL,
      total_item DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (transacao_id) REFERENCES transacoes(id) ON DELETE CASCADE
    )
  `;

  // Criar tabelas
  db.query(produtosTable, (err) => {
    if (err) console.error('❌ Erro ao criar tabela produtos:', err);
    else console.log('✅ Tabela "produtos" verificada/criada');
  });

  db.query(servicosTable, (err) => {
    if (err) console.error('❌ Erro ao criar tabela servicos:', err);
    else console.log('✅ Tabela "servicos" verificada/criada');
  });

  db.query(compromissosTable, (err) => {
    if (err) console.error('❌ Erro ao criar tabela compromissos:', err);
    else console.log('✅ Tabela "compromissos" verificada/criada');
  });

  db.query(transacoesTable, (err) => {
    if (err) console.error('❌ Erro ao criar tabela transacoes:', err);
    else console.log('✅ Tabela "transacoes" verificada/criada');
  });

  db.query(itensTransacaoTable, (err) => {
    if (err) console.error('❌ Erro ao criar tabela itens_transacao:', err);
    else console.log('✅ Tabela "itens_transacao" verificada/criada');
  });
}

// ========== ROTAS DA API ==========

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API do Sistema de Estoque funcionando!',
    version: '2.0.0'
  });
});

// ========== ROTAS DE PRODUTOS ==========

app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, count: results.length, data: results });
  });
});

app.post('/api/produtos', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  if (!nome || quantidade === undefined) {
    return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });
  }
  const sql = 'INSERT INTO produtos (nome, categoria, quantidade, preco, estoque_minimo) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nome, categoria || 'Sem categoria', quantidade, preco || 0, estoque_minimo || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, message: 'Produto criado', id: result.insertId });
  });
});

app.put('/api/produtos/:id', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  const sql = 'UPDATE produtos SET nome=?, categoria=?, quantidade=?, preco=?, estoque_minimo=? WHERE id=?';
  db.query(sql, [nome, categoria, quantidade, preco || 0, estoque_minimo, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Produto atualizado' });
  });
});

app.delete('/api/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Produto deletado' });
  });
});

// ========== ROTAS DE SERVIÇOS ==========

app.get('/api/servicos', (req, res) => {
  db.query('SELECT * FROM servicos ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

app.post('/api/servicos', (req, res) => {
  const { cliente, descricao, valor, data_servico, status } = req.body;
  const sql = 'INSERT INTO servicos (cliente, descricao, valor, data_servico, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [cliente, descricao, valor || 0, data_servico, status || 'Pendente'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.put('/api/servicos/:id', (req, res) => {
  const { cliente, descricao, valor, data_servico, status } = req.body;
  const sql = 'UPDATE servicos SET cliente=?, descricao=?, valor=?, data_servico=?, status=? WHERE id=?';
  db.query(sql, [cliente, descricao, valor, data_servico, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Serviço atualizado' });
  });
});

app.delete('/api/servicos/:id', (req, res) => {
  db.query('DELETE FROM servicos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ========== ROTAS DE COMPROMISSOS ==========

app.get('/api/compromissos', (req, res) => {
  db.query('SELECT * FROM compromissos ORDER BY data, hora', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

app.post('/api/compromissos', (req, res) => {
  const { titulo, data, hora } = req.body;
  const sql = 'INSERT INTO compromissos (titulo, data, hora) VALUES (?, ?, ?)';
  db.query(sql, [titulo, data, hora], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.delete('/api/compromissos/:id', (req, res) => {
  db.query('DELETE FROM compromissos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ========== ROTAS DE TRANSAÇÕES ==========

app.get('/api/transacoes', (req, res) => {
  const sql = `
    SELECT t.*, 
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'description', i.descricao,
               'quantity', i.quantidade,
               'unitValue', i.valor_unitario,
               'totalItem', i.total_item
             )
           ) as items
    FROM transacoes t
    LEFT JOIN itens_transacao i ON t.id = i.transacao_id
    GROUP BY t.id
    ORDER BY t.id DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

app.post('/api/transacoes', (req, res) => {
  const { tipo, cliente, data, items, total } = req.body;
  
  const sqlTransacao = 'INSERT INTO transacoes (tipo, cliente, data, total) VALUES (?, ?, ?, ?)';
  
  db.query(sqlTransacao, [tipo, cliente, data, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const transacaoId = result.insertId;
    
    if (items && items.length > 0) {
      const sqlItens = 'INSERT INTO itens_transacao (transacao_id, descricao, quantidade, valor_unitario, total_item) VALUES ?';
      const values = items.map(item => [
        transacaoId,
        item.description,
        item.quantity,
        item.unitValue,
        item.totalItem
      ]);
      
      db.query(sqlItens, [values], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, id: transacaoId });
      });
    } else {
      res.status(201).json({ success: true, id: transacaoId });
    }
  });
});

app.delete('/api/transacoes/:id', (req, res) => {
  db.query('DELETE FROM transacoes WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
});