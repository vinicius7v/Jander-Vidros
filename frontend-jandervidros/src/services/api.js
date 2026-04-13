const API_URL = 'https://jander-vidros-production.up.railway.app';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ========== PRODUTOS ==========
export const productService = {
  getAll: async (signal) => {
    const response = await fetch(`${API_URL}/api/produtos`, { signal });
    const data = await handleResponse(response);
    return data.data || [];
  },
  create: async (productData) => {
    const response = await fetch(`${API_URL}/api/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: productData.name,
        categoria: productData.category,
        quantidade: productData.quantity,
        preco: productData.price || 0,
        estoque_minimo: productData.minStock || 0,
        preco_compra: productData.purchasePrice ?? null,
        preco_venda: productData.salePrice ?? null,
        fornecedor: productData.supplier ?? null,
      }),
    });
    return handleResponse(response);
  },
  update: async (id, productData) => {
    const response = await fetch(`${API_URL}/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: productData.name,
        categoria: productData.category,
        quantidade: productData.quantity,
        preco: productData.price || 0,
        estoque_minimo: productData.minStock || 0,
        preco_compra: productData.purchasePrice ?? null,
        preco_venda: productData.salePrice ?? null,
        fornecedor: productData.supplier ?? null,
      }),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/produtos/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};

// ========== SERVIÇOS ==========
export const serviceService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/servicos`);
    const data = await handleResponse(response);
    return data.data || [];
  },
  create: async (s) => {
    const response = await fetch(`${API_URL}/api/servicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/api/servicos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/servicos/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};

// ========== CLIENTES ==========
export const clienteService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/clientes`);
    const data = await handleResponse(response);
    return data.data || [];
  },
  create: async (c) => {
    const response = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/clientes/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};

// ========== PENDÊNCIAS ==========
export const pendenciaService = {
  create: async (p) => {
    const response = await fetch(`${API_URL}/api/pendencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/api/pendencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/pendencias/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};

// ========== CAIXA ==========
export const caixaService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/caixa`);
    const data = await handleResponse(response);
    return data.data || [];
  },
  create: async (m) => {
    const response = await fetch(`${API_URL}/api/caixa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/caixa/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};

// ========== ORÇAMENTOS ==========
export const orcamentoService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/orcamentos`);
    const data = await handleResponse(response);
    return data.data || [];
  },
  create: async (o) => {
    const response = await fetch(`${API_URL}/api/orcamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(o),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/orcamentos/${id}`, { method: 'DELETE' });
    return handleResponse(response);
  },
};