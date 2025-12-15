import { useState } from 'react';
import { createPortal } from 'react-dom';
import './MainTableExport.css';

interface PR {
  id: string;
  link: string;
  description: string;
  createdAt: string;
}

interface MainTableExportProps {
  incidentName: string;
  prMainList: PR[];
  contactPerson: string;
}

export function MainTableExport({ incidentName, prMainList, contactPerson }: MainTableExportProps) {
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
      const table = document.querySelector('.main-table');
      if (!table) return;

      const tempDiv = document.createElement('div');
      
      // Texto antes
      const textBefore = document.createElement('p');
      textBefore.textContent = 'Buenas, os envío una PR para su subida a PRO:';
      textBefore.style.marginBottom = '1rem';
      tempDiv.appendChild(textBefore);

      // Clonar tabla con estilos
      const clonedTable = table.cloneNode(true) as HTMLElement;
      
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
          (theadTr as HTMLElement).style.background = '#10b981';
        }
        const ths = thead.querySelectorAll('th');
        ths.forEach(th => {
          (th as HTMLElement).style.padding = '0.75rem 0.5rem';
          (th as HTMLElement).style.border = '1px solid #e5e7eb';
          (th as HTMLElement).style.fontWeight = '700';
          (th as HTMLElement).style.color = '#fff';
          (th as HTMLElement).style.backgroundColor = '#10b981';
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

      // Copiar como HTML usando Clipboard API
      try {
        const htmlContent = tempDiv.innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([tempDiv.textContent || ''], { type: 'text/plain' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } catch (clipError) {
        // Fallback al método antiguo si Clipboard API falla
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
      }

      document.body.removeChild(tempDiv);

      // Abrir Outlook con el correo
      const subject = encodeURIComponent('[Repsol EyG] PR to PROD');
      const to = 'Repsol.EyG.Retail.Salesforce.ReleaseManagers@accenture.com';
      
      window.location.href = `mailto:${to}?subject=${subject}`;
      
      alert('✓ Tabla MAIN copiada con formato HTML. Pégala directamente en Outlook con Ctrl+V.');
    } catch (error) {
      console.error('Error al copiar:', error);
      alert('✗ Error al copiar la tabla');
    }
  };

  return (
    <>
      {showModal && createPortal(
        <div className="main-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="main-modal" onClick={(e) => e.stopPropagation()}>
            <div className="main-modal-header">
              <h2>📋 Vista Tabla MAIN</h2>
              <button className="btn-close-main-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="main-modal-body">
              <p className="main-modal-info">
                Buenas, os envío una PR para su subida a PRO:
              </p>
              <div className="main-table-container">
                <table className="main-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>KP/MOV</th>
                      <th>Date</th>
                      <th>PR</th>
                      <th>Persona de Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prMainList.map((pr) => (
                      <tr key={pr.id}>
                        <td></td>
                        <td>{incidentName}</td>
                        <td>{getTodayDate()}</td>
                        <td>{getPRNumber(pr.link)}</td>
                        <td>{contactPerson}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="main-modal-footer">
                Gracias, un saludo!
              </p>
            </div>
            <div className="main-modal-actions">
              <button className="btn-copy-main" onClick={copyTableToClipboard}>
                📋 Copiar Tabla
              </button>
              <button className="btn-close-main" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <button 
        type="button"
        className="btn-main-export"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        title="Ver tabla MAIN"
      >
        📋 Tabla MAIN
      </button>
    </>
  );
}
