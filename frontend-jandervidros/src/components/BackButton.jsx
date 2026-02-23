import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)} // O -1 faz o navegador voltar exatamente para a página anterior
      className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm font-medium"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </button>
  );
}

export default BackButton;