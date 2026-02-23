import React, { useState } from 'react';
import { Printer, Search, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import ServicePrint from './ServicePrint';

function ServiceHistory({ services, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [printService, setPrintService] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handlePrint = (service) => {
    setPrintService(service);
    // Aguarda o componente renderizar antes de imprimir
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredServices = services.filter(service =>
    service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.clientPhone.includes(searchTerm)
  );

  return (
    <>
      {/* Componente de impressão (oculto na tela) */}
      {printService && (
        <ServicePrint 
          service={printService} 
          onClose={() => setPrintService(null)} 
        />
      )}

      <div className="bg-white rounded-lg shadow-lg">
        {/* Busca */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, serviço ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Conclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço concluído ainda'}
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{service.clientName}</div>
                        <div className="text-sm text-gray-500">{service.clientPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {service.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {service.value ? (
                        <span className="font-semibold text-green-600">
                          R$ {parseFloat(service.value).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {formatDate(service.finishedAt)}
                        </div>
                        <div className="text-gray-500">
                          por {service.finishedBy}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrint(service)}
                          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                          Imprimir
                        </button>
                        <button
                          onClick={() => onEdit(service)}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(service.id)}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredServices.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600">
              Mostrando {filteredServices.length} de {services.length} serviço(s) concluído(s)
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default ServiceHistory;