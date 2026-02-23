import React from 'react';
import { Edit2, Trash2, CheckCircle, Calendar, DollarSign, Phone, MapPin } from 'lucide-react';

function ServiceCard({ service, onEdit, onDelete, onFinish }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(service.deadline);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {service.clientName}
          </h3>
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
            {service.serviceType}
          </span>
        </div>
      </div>

      {/* Cliente Info */}
      <div className="space-y-2 mb-4 border-b pb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span className="text-sm">{service.clientPhone}</span>
        </div>
        {service.clientAddress && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{service.clientAddress}</span>
          </div>
        )}
      </div>

      {/* Descrição */}
      {service.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
      )}

      {/* Informações */}
      <div className="space-y-2 mb-4">
        {service.value && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Valor:
            </span>
            <span className="font-semibold text-green-600">
              R$ {parseFloat(service.value).toFixed(2)}
            </span>
          </div>
        )}
        {service.deadline && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Prazo:
            </span>
            <span className={`font-semibold ${
              daysRemaining < 0 ? 'text-red-600' :
              daysRemaining <= 3 ? 'text-orange-600' :
              'text-gray-800'
            }`}>
              {formatDate(service.deadline)}
              {daysRemaining !== null && (
                <span className="ml-1 text-xs">
                  ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d atrasado` :
                    daysRemaining === 0 ? 'Hoje' :
                    `${daysRemaining}d restantes`})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Observações */}
      {service.notes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Obs:</strong> {service.notes}
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={() => onFinish(service.id)}
          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          Concluir
        </button>
        <button
          onClick={() => onEdit(service)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(service.id)}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        Criado em {formatDate(service.createdAt)} por {service.createdBy}
      </div>
    </div>
  );
}

export default ServiceCard;