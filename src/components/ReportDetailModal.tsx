import { useEffect } from 'react';
import { Report } from '../types';
import './ReportDetailModal.css';

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

  const getTypeLabel = (type: string) => {
    return type === 'error' ? '🐛 Error' : '💡 Mejora';
  };

  const getStatusLabel = (status: string) => {
    return status === 'abierto' ? 'Abierto' : 'Completado';
  };

  return (
    <div className="report-detail-overlay" onClick={onClose}>
      <div className="report-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-detail-header">
          <h2>📋 Detalle del Reporte</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="report-detail-body">
          <div className="detail-section">
            <label>Usuario</label>
            <div className="detail-value disabled">{report.userName}</div>
          </div>

          <div className="detail-section">
            <label>Título</label>
            <div className="detail-value">{report.title}</div>
          </div>

          <div className="detail-section">
            <label>Descripción</label>
            <div className="detail-value description">{report.description}</div>
          </div>

          <div className="detail-row">
            <div className="detail-section">
              <label>Tipo</label>
              <div className={`detail-badge type-${report.type}`}>
                {getTypeLabel(report.type)}
              </div>
            </div>

            <div className="detail-section">
              <label>Estado</label>
              <div className={`detail-badge status-${report.status}`}>
                {getStatusLabel(report.status)}
              </div>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-section">
              <label>Fecha de Creación</label>
              <div className="detail-value">
                {new Date(report.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {report.updatedAt && report.status === 'completado' && (
              <div className="detail-section">
                <label>Fecha de Completado</label>
                <div className="detail-value">
                  {new Date(report.updatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="report-detail-footer">
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
