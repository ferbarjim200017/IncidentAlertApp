import { useState } from 'react';
import { createPortal } from 'react-dom';
import './QATableExport.css';

interface PR {
  id: string;
  link: string;
  description: string;
  createdAt: string;
}

interface QATableExportProps {
  incidentName: string;
  prQA2List: PR[];
  ownerName: string;
}

export function QATableExport({ incidentName, prQA2List, ownerName }: QATableExportProps) {
  const [showModal, setShowModal] = useState(false);

  const getPRNumber = (link: string): string => {
    const parts = link.split('/');
    return parts[parts.length - 1] || link;
  };

  const getTodayDate = (): string => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const copyTableToClipboard = async () => {
    try {
      const table = document.querySelector('.qa-table');
      if (!table) return;

      // Crear contenedor con texto antes, tabla y texto después
      const tempDiv = document.createElement('div');
      
      // Texto antes
      const textBefore = document.createElement('p');
      textBefore.textContent = 'Buenas, os envío una PR para su subida a QA:';
      textBefore.style.marginBottom = '1rem';
      tempDiv.appendChild(textBefore);

      // Clonar tabla con estilos
      const clonedTable = table.cloneNode(true) as HTMLElement;
      
      // Aplicar estilos inline a la tabla
      clonedTable.style.width = '100%';
      clonedTable.style.borderCollapse = 'collapse';
      clonedTable.style.fontSize = '0.85rem';
      clonedTable.style.background = 'white';
      clonedTable.style.marginBottom = '1rem';
      
      // Aplicar estilos a thead
      const thead = clonedTable.querySelector('thead');
      if (thead) {
        const theadTr = thead.querySelector('tr');
        if (theadTr) {
          (theadTr as HTMLElement).style.background = '#fbbf24';
        }
        const ths = thead.querySelectorAll('th');
        ths.forEach(th => {
          (th as HTMLElement).style.padding = '0.75rem 0.5rem';
          (th as HTMLElement).style.border = '1px solid #e5e7eb';
          (th as HTMLElement).style.fontWeight = '700';
          (th as HTMLElement).style.color = '#000';
          (th as HTMLElement).style.backgroundColor = '#fbbf24';
        });
      }

      // Aplicar estilos a tbody
      const tbody = clonedTable.querySelector('tbody');
      if (tbody) {
        const tds = tbody.querySelectorAll('td');
        tds.forEach(td => {
          (td as HTMLElement).style.padding = '0.75rem 0.5rem';
          (td as HTMLElement).style.border = '1px solid #e5e7eb';
          (td as HTMLElement).style.color = '#333';
          (td as HTMLElement).style.fontWeight = '500';
          (td as HTMLElement).style.backgroundColor = 'white';
        });
      }

      tempDiv.appendChild(clonedTable);

      // Texto después
      const textAfter = document.createElement('p');
      textAfter.textContent = 'Gracias, un saludo!';
      tempDiv.appendChild(textAfter);

      document.body.appendChild(tempDiv);

      // Seleccionar y copiar
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
      }

      document.body.removeChild(tempDiv);

      // Abrir Outlook con el correo
      const subject = encodeURIComponent('[Repsol EyG] PR to QA');
      const to = 'Repsol.EyG.Retail.Salesforce.ReleaseManagers@accenture.com';
      const body = encodeURIComponent('Buenas, os envío una PR para su subida a QA:\n\n(Pega aquí la tabla copiada)\n\nGracias, un saludo!');
      
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      
      alert('✓ Tabla QA copiada al portapapeles. Outlook se abrirá automáticamente.');
    } catch (error) {
      console.error('Error al copiar:', error);
      alert('✗ Error al copiar la tabla');
    }
  };

  return (
    <>
      {showModal && createPortal(
        <div className="qa-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="qa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qa-modal-header">
              <h2>📋 Vista Tabla QA</h2>
              <button className="btn-close-qa-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="qa-modal-body">
              <p className="qa-modal-info">
                Buenas, os envío una PR para su subida a QA:
              </p>
              <div className="qa-table-container">
                <table className="qa-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>KP/MOV</th>
                      <th>Date</th>
                      <th>PR</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prQA2List.map((pr) => (
                      <tr key={pr.id}>
                        <td></td>
                        <td>{incidentName}</td>
                        <td>{getTodayDate()}</td>
                        <td>{getPRNumber(pr.link)}</td>
                        <td>{ownerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="qa-modal-footer">
                Gracias, un saludo!
              </p>
            </div>
            <div className="qa-modal-actions">
              <button className="btn-copy-qa" onClick={copyTableToClipboard}>
                📋 Copiar Tabla
              </button>
              <button className="btn-close-qa" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <button 
        type="button"
        className="btn-qa-export"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        title="Ver tabla QA"
      >
        📋 Tabla QA
      </button>
    </>
  );
}
