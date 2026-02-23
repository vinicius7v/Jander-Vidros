import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import { Plus, X } from 'lucide-react';
import { productService } from '../services/api';

function Products({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll();
      
      // Converter formato do backend para frontend
      const formattedProducts = data.map(p => ({
        id: p.id.toString(),
        name: p.nome,
        category: p.categoria,
        quantity: p.quantidade,
        price: parseFloat(p.preco),
        minStock: p.estoque_minimo,
        createdAt: p.data_criacao
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      setError('Erro ao carregar produtos. Verifique se o backend está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
      } else {
        await productService.create(productData);
      }
      
      await loadProducts();
      setIsAdding(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Erro ao salvar produto: ' + err.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAdding(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        await loadProducts();
      } catch (err) {
        alert('Erro ao excluir produto: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos do MySQL...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="text-red-600 font-semibold">❌ {error}</div>
            <button
              onClick={loadProducts}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Produtos</h1>
            <p className="text-gray-600">
              Conectado ao MySQL ✅
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Cancelar' : 'Novo Produto'}
          </button>
        </div>

        {isAdding && (
          <div className="mb-6">
            <ProductForm 
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={handleCancel}
            />
          </div>
        )}

        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>
    </div>
  );
}

export default Products;