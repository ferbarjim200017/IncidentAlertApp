import { Incident, IncidentStatus, IncidentPriority } from '../types';
import './IncidentItem.css';

interface IncidentItemProps {
  incident: Incident;
  onEdit: (incident: Incident) => void;
  onDelete: (id: string) => void;
}

export const IncidentItem: React.FC<IncidentItemProps> = ({ incident, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`incident-item incident-priority-${incident.priority}`}>
      <div className="incident-header">
        <h3>{incident.name}</h3>
        <span className={`status-badge status-${incident.status}`}>
          {incident.status.toUpperCase()}
        </span>
      </div>

      <div className="incident-details">
        {incident.contactUser && (
          <p><strong>Contacto:</strong> {incident.contactUser}</p>
        )}
        {incident.prQA2 && (
          <p><strong>PR QA2:</strong> <code>{incident.prQA2}</code></p>
        )}
        {incident.prMain && (
          <p><strong>PR MAIN:</strong> <code>{incident.prMain}</code></p>
        )}
      </div>

      <div className="incident-meta">
        <span className={`priority-badge priority-${incident.priority}`}>
          Prioridad: {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
        </span>
        <span className={`type-badge type-${incident.type}`}>
          Tipo: {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
        </span>
        <span className="created-date">Creado: {formatDate(incident.createdAt)}</span>
      </div>

      <div className="incident-actions">
        <button
          className="btn-edit"
          onClick={() => onEdit(incident)}
        >
          Editar
        </button>
        <button
          className="btn-delete"
          onClick={() => {
            if (window.confirm('¿Eliminar esta incidencia?')) {
              onDelete(incident.id);
            }
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};
