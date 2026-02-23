import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: '',
    value: '',
    deadline: '',
    clientPhone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (service) {
      setFormData({
        clientName: service.clientName || '',
        serviceType: service.serviceType || '',
        value: service.value || '',
        deadline: service.deadline || '',
        clientPhone: service.clientPhone || '',
        address: service.address || '',
        notes: service.notes || ''
      });
    }
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: parseFloat(formData.value) || 0
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{service ? 'Editar Serviço' : 'Novo Serviço'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="clientName" placeholder="Nome do Cliente" value={formData.clientName} onChange={handleChange} className="border p-2 rounded" required />
        <input name="serviceType" placeholder="Tipo de Serviço (Ex: Vidro 8mm)" value={formData.serviceType} onChange={handleChange} className="border p-2 rounded" required />
        <input name="value" type="number" placeholder="Valor (R$)" value={formData.value} onChange={handleChange} className="border p-2 rounded" required />
        <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="border p-2 rounded" required />
        <input name="clientPhone" placeholder="Telefone" value={formData.clientPhone} onChange={handleChange} className="border p-2 rounded" />
        <input name="address" placeholder="Endereço" value={formData.address} onChange={handleChange} className="border p-2 rounded" />
        <textarea name="notes" placeholder="Observações" value={formData.notes} onChange={handleChange} className="col-span-full border p-2 rounded" />
        
        <div className="col-span-full flex gap-2">
          <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">Salvar</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded font-bold">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default ServiceForm;