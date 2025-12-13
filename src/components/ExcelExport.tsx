import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Incident } from '../types';
import './ExcelExport.css';

interface ExcelExportProps {
  incident: Incident;
  currentUser: string;
}

export function ExcelExport({ incident, currentUser }: ExcelExportProps) {
  const [showModal, setShowModal] = useState(false);
  const [deploymentDate, setDeploymentDate] = useState('');

  useEffect(() => {
    if (!showModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const getPRNumbers = (prList: any[] | undefined): string => {
    if (!prList || prList.length === 0) return '-';
    return prList.map(pr => {
      const parts = pr.link.split('/');
      return parts[parts.length - 1] || pr.link;
    }).join(', ');
  };

  const getTypeText = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'correctivo': 'Correctivo',
      'evolutivo': 'Evolutivo',
      'tarea': 'Tarea',
    };
    return typeMap[type] || type;
  };

  const copyTableToClipboard = async () => {
    try {
      const table = document.querySelector('.excel-table');
      if (!table) return;

      // Crear contenedor con texto antes, tabla y texto después
      const tempDiv = document.createElement('div');
      
      // Texto antes
      const textBefore = document.createElement('p');
      textBefore.textContent = 'Buenas, os envío una PR para su subida a PRO';
      textBefore.style.marginBottom = '1rem';
      tempDiv.appendChild(textBefore);

      // Crear una tabla temporal con los datos actuales y estilos
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
          (theadTr as HTMLElement).style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
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
      
      // Reemplazar el input de fecha con su valor
      const dateInput = clonedTable.querySelector('input[type="date"]');
      if (dateInput) {
        const td = dateInput.parentElement;
        if (td) {
          td.textContent = deploymentDate || '-';
          (td as HTMLElement).style.color = '#333';
        }
      }

      // Reemplazar el textarea de descripción con su valor
      const descTextarea = clonedTable.querySelector('textarea');
      if (descTextarea) {
        const td = descTextarea.parentElement;
        if (td) {
          td.textContent = incident.description || '-';
          (td as HTMLElement).style.color = '#333';
        }
      }

      tempDiv.appendChild(clonedTable);

      // Texto después
      const textAfter = document.createElement('p');
      textAfter.textContent = 'Un saludo, Gracias!';
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
      
      alert('✓ Tabla copiada al portapapeles con formato');
    } catch (error) {
      console.error('Error al copiar:', error);
      alert('✗ Error al copiar la tabla');
    }
  };

  return (
    <>
      {showModal && createPortal(
        <div className="excel-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="excel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="excel-modal-header">
              <h2>📊 Vista Previa Excel</h2>
              <button className="btn-close-excel-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="excel-modal-body">
              <p className="excel-modal-info">
                Buenas, os envío una PR para su subida a PRO
              </p>
              <div className="excel-table-container">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th>INCIDENCIA/S</th>
                      <th>Estado petición Incidencias</th>
                      <th>DIA DESPLIEGUE</th>
                      <th>PERSONA CONTACTO</th>
                      <th>DESCRIPCIÓN</th>
                      <th>DEPENDENCIAS</th>
                      <th>PR PRO</th>
                      <th>PR QA</th>
                      <th>Desplegado</th>
                      <th>PUESTO EXCEL QA</th>
                      <th>TIPO MOV</th>
                      <th>TICKET DEPENDENCIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{incident.name}</td>
                      <td>Verificado en Test</td>
                      <td>
                        <input 
                          type="date" 
                          value={deploymentDate}
                          onChange={(e) => setDeploymentDate(e.target.value)}
                          className="excel-date-input"
                        />
                      </td>
                      <td>{currentUser}</td>
                      <td>
                        <div className="excel-description-display">
                          {incident.title || 'Sin título'}
                        </div>
                      </td>
                      <td>NO</td>
                      <td>{getPRNumbers(incident.prMainList)}</td>
                      <td>{getPRNumbers(incident.prQA2List)}</td>
                      <td>NO</td>
                      <td></td>
                      <td>{getTypeText(incident.type)}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="excel-modal-footer">
                Un saludo, Gracias!
              </p>
            </div>
            <div className="excel-modal-actions">
              <button className="btn-copy-excel" onClick={copyTableToClipboard}>
                📋 Copiar Tabla
              </button>
              <button className="btn-close-excel" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <button 
        className="btn-excel-export"
        onClick={() => setShowModal(true)}
        title="Envío a PRO"
      >
        🚀 Envío a PRO
      </button>
    </>
  );
}
