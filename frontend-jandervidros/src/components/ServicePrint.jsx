import React from 'react';

function ServicePrint({ service, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="print-only" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div style={{ 
        padding: '40px', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho */}
        <div style={{ 
          textAlign: 'center', 
          borderBottom: '3px solid #4f46e5',
          paddingBottom: '20px',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            margin: '0 0 10px 0',
            color: '#4f46e5'
          }}>
            Jander Vidros
          </h1>
          <p style={{ 
            margin: '5px 0',
            color: '#666',
            fontSize: '14px'
          }}>
            Sistema de Gerenciamento de Serviços
          </p>
          <p style={{ 
            margin: '5px 0',
            color: '#666',
            fontSize: '14px'
          }}>
            Telefone: (85) 9999-9999 | Email: contato@jandervidros.com
          </p>
        </div>

        {/* Título */}
        <h2 style={{ 
          fontSize: '24px',
          marginBottom: '20px',
          color: '#333',
          borderLeft: '4px solid #4f46e5',
          paddingLeft: '10px'
        }}>
          Ordem de Serviço #{service.id}
        </h2>

        {/* Dados do Cliente */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            marginBottom: '15px',
            color: '#4f46e5',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            Dados do Cliente
          </h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', width: '150px' }}>
                  Nome:
                </td>
                <td style={{ padding: '8px 0' }}>{service.clientName}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Telefone:</td>
                <td style={{ padding: '8px 0' }}>{service.clientPhone}</td>
              </tr>
              {service.clientAddress && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Endereço:</td>
                  <td style={{ padding: '8px 0' }}>{service.clientAddress}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dados do Serviço */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            marginBottom: '15px',
            color: '#4f46e5',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            Informações do Serviço
          </h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', width: '150px' }}>
                  Tipo de Serviço:
                </td>
                <td style={{ padding: '8px 0' }}>{service.serviceType}</td>
              </tr>
              {service.description && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', verticalAlign: 'top' }}>
                    Descrição:
                  </td>
                  <td style={{ padding: '8px 0' }}>{service.description}</td>
                </tr>
              )}
              {service.value && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Valor:</td>
                  <td style={{ padding: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>
                    R$ {parseFloat(service.value).toFixed(2)}
                  </td>
                </tr>
              )}
              {service.deadline && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Prazo:</td>
                  <td style={{ padding: '8px 0' }}>{formatDate(service.deadline)}</td>
                </tr>
              )}
              {service.notes && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', verticalAlign: 'top' }}>
                    Observações:
                  </td>
                  <td style={{ padding: '8px 0' }}>{service.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Datas */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', width: '150px' }}>
                  Data de Criação:
                </td>
                <td style={{ padding: '8px 0' }}>{formatDate(service.createdAt)}</td>
              </tr>
              {service.finishedAt && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>
                    Data de Conclusão:
                  </td>
                  <td style={{ padding: '8px 0' }}>{formatDate(service.finishedAt)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Status:</td>
                <td style={{ padding: '8px 0' }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: service.status === 'concluido' ? '#d1fae5' : '#fed7aa',
                    color: service.status === 'concluido' ? '#065f46' : '#9a3412',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {service.status === 'concluido' ? 'CONCLUÍDO' : 'EM ABERTO'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Assinatura */}
        <div style={{ 
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '40px'
          }}>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ 
                borderTop: '2px solid #333',
                paddingTop: '10px',
                marginTop: '60px'
              }}>
                Assinatura do Cliente
              </div>
            </div>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ 
                borderTop: '2px solid #333',
                paddingTop: '10px',
                marginTop: '60px'
              }}>
                Assinatura do Responsável
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
          <p style={{ marginTop: '5px' }}>
            © {new Date().getFullYear()} Jander Vidros - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

export default ServicePrint;