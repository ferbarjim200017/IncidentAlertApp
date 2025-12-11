import { Incident } from '../types';
import './QuickIncidentsList.css';

interface QuickIncidentsListProps {
  incidents: Incident[];
  onViewDetail?: (incident: Incident) => void;
}

export function QuickIncidentsList({ incidents, onViewDetail }: QuickIncidentsListProps) {
  // Filtrar solo incidencias que no están cerradas
  const openIncidents = incidents.filter(inc => inc.status !== 'cerrada');

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      abierta: 'Abierta',
      'en-progreso': 'En Progreso',
      'puesto-en-test': 'Puesto en Test',
      'verificado-en-test': 'Verificado en Test',
      resuelta: 'Resuelta',
      cerrada: 'Cerrada',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      abierta: '#1976d2',
      'en-progreso': '#f57c00',
      'puesto-en-test': '#8b5cf6',
      'verificado-en-test': '#06b6d4',
      resuelta: '#689f38',
      cerrada: '#7b1fa2',
    };
    return colors[status] || '#999';
  };

  if (openIncidents.length === 0) {
    return (
      <div className="quick-incidents-container">
        <h3>Incidencias Pendientes</h3>
        <div className="quick-incidents-empty">
          <p>✓ No hay incidencias pendientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-incidents-container">
      <h3>Incidencias Pendientes ({openIncidents.length})</h3>
      <div className="quick-incidents-list">
        {openIncidents.map((incident) => (
          <div
            key={incident.id}
            className="quick-incident-item"
            onClick={() => onViewDetail?.(incident)}
            onMouseDown={(e) => {
              if (e.button === 1) { // Click con rueda del ratón
                e.preventDefault();
                const url = `${window.location.origin}${window.location.pathname}?incident=${incident.id}`;
                window.open(url, '_blank');
              }
            }}
          >
            <div className="quick-incident-name">{incident.name}</div>
            <div
              className="quick-incident-status"
              style={{ backgroundColor: getStatusColor(incident.status) }}
            >
              {getStatusLabel(incident.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
