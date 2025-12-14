import { useEffect } from 'react';
import { Report } from '../types';
import './ReportModal.css';

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>📋 Detalle del Reporte</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '2rem' }}>
          <div className="report-form-group">
            <label>Usuario</label>
            <input type="text" value={report.userName} disabled className="input-disabled" />
          </div>

          <div className="report-form-group">
            <label>Título</label>
            <input
              type="text"
              value={report.title}
              disabled
              className="input-disabled"
            />
          </div>

          <div className="report-form-group">
            <label>Descripción</label>
            <textarea
              value={report.description}
              disabled
              className="input-disabled"
              rows={6}
            />
          </div>

          <div className="report-form-group">
            <label>Tipo</label>
            <div className="report-type-selector">
              <button
                type="button"
                className={`type-option ${report.type === 'error' ? 'selected error' : ''}`}
                disabled
                style={{ cursor: 'not-allowed', opacity: '0.7' }}
              >
                🐛 Error
              </button>
              <button
                type="button"
                className={`type-option ${report.type === 'mejora' ? 'selected mejora' : ''}`}
                disabled
                style={{ cursor: 'not-allowed', opacity: '0.7' }}
              >
                💡 Mejora
              </button>
            </div>
          </div>

          <div className="report-form-group">
            <label>Estado</label>
            <input
              type="text"
              value={report.status === 'abierto' ? 'Abierto' : 'Completado'}
              disabled
              className="input-disabled"
            />
          </div>

          <div className="report-form-group">
            <label>Fecha de Creación</label>
            <input
              type="text"
              value={new Date(report.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              disabled
              className="input-disabled"
            />
          </div>

          {report.updatedAt && report.status === 'completado' && (
            <div className="report-form-group">
              <label>Fecha de Completado</label>
              <input
                type="text"
                value={new Date(report.updatedAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                disabled
                className="input-disabled"
              />
            </div>
          )}

          <div className="report-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
