import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    minStock: '',
    purchasePrice: '',
    salePrice: '',
    supplier: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity.toString(),
        price: product.price.toString(),
        minStock: product.minStock.toString(),
        purchasePrice: product.purchasePrice != null ? product.purchasePrice.toString() : '',
        salePrice: product.salePrice != null ? product.salePrice.toString() : '',
        supplier: product.supplier || ''
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category || 'Sem categoria',
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock) || 0,
      purchasePrice: formData.purchasePrice !== '' ? parseFloat(formData.purchasePrice) : null,
      salePrice: formData.salePrice !== '' ? parseFloat(formData.salePrice) : null,
      supplier: formData.supplier || null,
      lastUpdated: new Date().toISOString()
    };

    onSave(productData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {product ? 'Editar Produto' : 'Novo Produto'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ex: Vidro Temperado 8mm"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ex: Vidros"
            />
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Estoque Mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estoque Mínimo
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Preço de Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço de Compra (R$)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Preço de Venda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço de Venda (R$)
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Fornecedor — largura total */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fornecedor
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ex: Vidros Brasil Ltda"
            />
          </div>

        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Save className="w-5 h-5" />
            {product ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;