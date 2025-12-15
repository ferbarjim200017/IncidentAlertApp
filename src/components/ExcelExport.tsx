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
    console.log('ExcelExport: copyTableToClipboard ejecutándose...');
    
    try {
      // Construir HTML de la tabla con estilos inline
      const htmlContent = `
        <html>
        <body>
          <p style="margin-bottom: 1rem;">Buenas, os envío una PR para su subida a PRO</p>
          <table style="width: auto; border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 11pt; white-space: nowrap;">
            <thead>
              <tr style="background-color: #fbbf24;">
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">INCIDENCIA/S</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">Estado petición Incidencias</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">DIA DESPLIEGUE</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">PERSONA CONTACTO</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">DESCRIPCIÓN</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">DEPENDENCIAS</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">PR PRO</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">PR QA</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">Desplegado</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">PUESTO EXCEL QA</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">TIPO MOV</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700; color: #000; background-color: #fbbf24;">TICKET DEPENDENCIA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${incident.name}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">Verificado en Test</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${deploymentDate || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${currentUser}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${incident.title || 'Sin título'}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">NO</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${getPRNumbers(incident.prMainList)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${getPRNumbers(incident.prQA2List)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">NO</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;"></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">${getTypeText(incident.type)}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #333; font-weight: 500;">-</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 1rem;">Un saludo, Gracias!</p>
        </body>
        </html>
      `;

      console.log('ExcelExport: HTML construido, intentando copiar al portapapeles...');

      // Copiar al portapapeles con HTML
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([`Buenas, os envío una PR para su subida a PRO\n\n${incident.name}\nUn saludo, Gracias!`], { type: 'text/plain' })
        })
      ]);

      console.log('ExcelExport: Copiado exitoso, abriendo Outlook...');

      // Configurar mailto
      const subject = encodeURIComponent('[Repsol EyG] PR to PROD');
      const to = 'Repsol.EyG.Retail.Salesforce.ReleaseManagers@accenture.com';
      const mailtoUrl = `mailto:${to}?subject=${subject}`;

      console.log('ExcelExport: Mailto URL:', mailtoUrl);

      // Intentar abrir con Electron primero
      if (typeof window !== 'undefined' && (window as any).electronAPI?.openOutlook) {
        console.log('ExcelExport: Usando Electron API...');
        (window as any).electronAPI.openOutlook({
          to: to,
          subject: '[Repsol EyG] PR to PROD',
          body: htmlContent
        });
      } else {
        console.log('ExcelExport: Usando mailto fallback...');
        // Fallback a mailto
        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.click();
      }

      console.log('ExcelExport: Proceso completado exitosamente');
      alert('✓ Tabla copiada y Outlook abierto');
    } catch (error) {
      console.error('ExcelExport: Error en copyTableToClipboard:', error);
      alert('✗ Error al copiar la tabla o abrir Outlook');
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
