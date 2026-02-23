const API_URL = 'http://localhost:3000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const productService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      const data = await handleResponse(response);
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: productData.name,
          categoria: productData.category,
          quantidade: productData.quantity,
          preco: productData.price || 0,
          estoque_minimo: productData.minStock || 0
        }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: productData.name,
          categoria: productData.category,
          quantidade: productData.quantity,
          preco: productData.price || 0,
          estoque_minimo: productData.minStock || 0
        }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },
};