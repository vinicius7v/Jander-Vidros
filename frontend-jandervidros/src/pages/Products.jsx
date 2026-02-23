import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import { Plus, X } from 'lucide-react';

function Products({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const saveProducts = (updatedProducts) => {
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleSaveProduct = (productData) => {
    let updatedProducts;
    
    if (editingProduct) {
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      );
    } else {
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
        createdBy: user.username,
        createdAt: new Date().toISOString()
      };
      updatedProducts = [...products, newProduct];
    }

    saveProducts(updatedProducts);
    setIsAdding(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAdding(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Produtos</h1>
            <p className="text-gray-600">Gerenciar estoque de produtos</p>
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