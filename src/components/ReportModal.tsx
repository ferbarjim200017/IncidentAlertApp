import { useState, useEffect } from 'react';
import { Report, ReportType } from '../types';
import './ReportModal.css';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (report: Omit<Report, 'id' | 'createdAt'>) => void;
  userName: string;
  userId: string;
}

export function ReportModal({ onClose, onSubmit, userName, userId }: ReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReportType>('error');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    onSubmit({
      userName,
      userId,
      title: title.trim(),
      description: description.trim(),
      type,
      status: 'abierto',
    });

    onClose();
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>📝 Crear Reporte</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="report-form-group">
            <label>Usuario</label>
            <input type="text" value={userName} disabled className="input-disabled" />
          </div>

          <div className="report-form-group">
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del reporte"
              required
            />
          </div>

          <div className="report-form-group">
            <label>Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el error o la mejora..."
              rows={6}
              required
            />
          </div>

          <div className="report-form-group">
            <label>Tipo *</label>
            <div className="report-type-selector">
              <button
                type="button"
                className={`type-option ${type === 'error' ? 'selected error' : ''}`}
                onClick={() => setType('error')}
              >
                🐛 Error
              </button>
              <button
                type="button"
                className={`type-option ${type === 'mejora' ? 'selected mejora' : ''}`}
                onClick={() => setType('mejora')}
              >
                💡 Mejora
              </button>
            </div>
          </div>

          <div className="report-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Crear Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
