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
  createTable();
});

// Criar tabela se não existir
function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      quantidade INT NOT NULL DEFAULT 0,
      preco DECIMAL(10, 2) NOT NULL,
      estoque_minimo INT DEFAULT 0,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  db.query(sql, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela:', err);
    } else {
      console.log('✅ Tabela "produtos" verificada/criada com sucesso');
    }
  });
}

// ========== ROTAS DA API ==========

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API do Sistema de Estoque funcionando!',
    version: '1.0.0'
  });
});

// 1. LISTAR TODOS OS PRODUTOS
app.get('/api/produtos', (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY id DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar produtos',
        details: err.message 
      });
    }
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// 2. BUSCAR PRODUTO POR ID
app.get('/api/produtos/:id', (req, res) => {
  const sql = 'SELECT * FROM produtos WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar produto',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Produto não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// 3. CRIAR NOVO PRODUTO
app.post('/api/produtos', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  
  // Validação
  if (!nome || quantidade === undefined || !preco) {
    return res.status(400).json({ 
      error: 'Nome, quantidade e preço são obrigatórios' 
    });
  }
  
  const sql = `
    INSERT INTO produtos (nome, categoria, quantidade, preco, estoque_minimo) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(
    sql, 
    [nome, categoria || 'Sem categoria', quantidade, preco, estoque_minimo || 0],
    (err, result) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erro ao criar produto',
          details: err.message 
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        id: result.insertId
      });
    }
  );
});

// 4. ATUALIZAR PRODUTO
app.put('/api/produtos/:id', (req, res) => {
  const { nome, categoria, quantidade, preco, estoque_minimo } = req.body;
  
  const sql = `
    UPDATE produtos 
    SET nome = ?, categoria = ?, quantidade = ?, preco = ?, estoque_minimo = ?
    WHERE id = ?
  `;
  
  db.query(
    sql,
    [nome, categoria, quantidade, preco, estoque_minimo, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erro ao atualizar produto',
          details: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Produto não encontrado' 
        });
      }
      
      res.json({
        success: true,
        message: 'Produto atualizado com sucesso'
      });
    }
  );
});

// 5. DELETAR PRODUTO
app.delete('/api/produtos/:id', (req, res) => {
  const sql = 'DELETE FROM produtos WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao deletar produto',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Produto não encontrado' 
      });
    }
    
    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  });
});

// 6. BUSCAR PRODUTOS POR CATEGORIA
app.get('/api/produtos/categoria/:categoria', (req, res) => {
  const sql = 'SELECT * FROM produtos WHERE categoria = ?';
  
  db.query(sql, [req.params.categoria], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar produtos',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// 7. PRODUTOS COM ESTOQUE BAIXO
app.get('/api/produtos/estoque/baixo', (req, res) => {
  const sql = `
    SELECT * FROM produtos 
    WHERE quantidade <= estoque_minimo OR quantidade <= 1
    ORDER BY quantidade ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar produtos com estoque baixo',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// 8. BUSCAR PRODUTOS (com filtro de nome)
app.get('/api/produtos/buscar/:termo', (req, res) => {
  const sql = 'SELECT * FROM produtos WHERE nome LIKE ?';
  const termo = `%${req.params.termo}%`;
  
  db.query(sql, [termo], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar produtos',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// 9. ESTATÍSTICAS
app.get('/api/estatisticas', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_produtos,
      SUM(quantidade * preco) as valor_total_estoque,
      (SELECT COUNT(*) FROM produtos WHERE quantidade <= estoque_minimo OR quantidade <= 1) as produtos_baixo_estoque
    FROM produtos
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
  console.log(`📝 Teste a API em: http://localhost:${PORT}/api/produtos`);
});

// ========== ARQUIVO: .env ==========
// Crie um arquivo .env na raiz do projeto com:
/*
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=estoque_db
*/