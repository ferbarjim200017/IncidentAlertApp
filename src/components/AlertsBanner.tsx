import { Incident, IncidentStatus } from '../types';
import './AlertsBanner.css';

interface AlertsBannerProps {
  incidents: Incident[];
  onViewIncident: (incident: Incident) => void;
}

export function AlertsBanner({ incidents, onViewIncident }: AlertsBannerProps) {
  // Detectar incidencias estancadas (más de 7 días sin cambios)
  const getStaleIncidents = (): Incident[] => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return incidents.filter(incident => {
      if (incident.status === 'cerrada') return false;
      
      const createdDate = new Date(incident.creationDate);
      const isOld = createdDate < sevenDaysAgo;
      
      // Considerar estancada si está abierta por más de 7 días o en progreso por más de 7 días
      return isOld && (incident.status === 'abierta' || incident.status === 'en-progreso');
    });
  };

  // Detectar incidencias de alta prioridad sin resolver
  const getCriticalIncidents = (): Incident[] => {
    return incidents.filter(incident => 
      incident.priority === 'crítica' &&
      incident.status !== 'cerrada' &&
      incident.status !== 'resuelta'
    );
  };

  // Detectar incidencias en test por más de 3 días
  const getLongTestIncidents = (): Incident[] => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    return incidents.filter(incident => {
      if (incident.status !== 'puesto-en-test' && incident.status !== 'verificado-en-test') {
        return false;
      }
      
      const createdDate = new Date(incident.creationDate);
      return createdDate < threeDaysAgo;
    });
  };

  const staleIncidents = getStaleIncidents();
  const criticalIncidents = getCriticalIncidents();
  const longTestIncidents = getLongTestIncidents();

  const totalAlerts = staleIncidents.length + criticalIncidents.length + longTestIncidents.length;

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className="alerts-banner">
      <div className="alerts-header">
        <span className="alerts-icon">⚠️</span>
        <h3 className="alerts-title">Alertas Activas ({totalAlerts})</h3>
      </div>

      {staleIncidents.length > 0 && (
        <div className="alert-section alert-stale">
          <div className="alert-section-header">
            <span className="alert-badge">{staleIncidents.length}</span>
            <h4>Incidencias Estancadas (más de 7 días sin avance)</h4>
          </div>
          <div className="alert-items">
            {staleIncidents.slice(0, 3).map(incident => (
              <div 
                key={incident.id} 
                className="alert-item"
                onClick={() => onViewIncident(incident)}
              >
                <span className="alert-item-name">{incident.name}</span>
                <span className="alert-item-date">
                  Creada: {new Date(incident.creationDate).toLocaleDateString('es-ES')}
                </span>
                <button className="alert-item-btn">Ver →</button>
              </div>
            ))}
            {staleIncidents.length > 3 && (
              <span className="alert-more">+ {staleIncidents.length - 3} más</span>
            )}
          </div>
        </div>
      )}

      {criticalIncidents.length > 0 && (
        <div className="alert-section alert-critical">
          <div className="alert-section-header">
            <span className="alert-badge">{criticalIncidents.length}</span>
            <h4>Incidencias Críticas Pendientes</h4>
          </div>
          <div className="alert-items">
            {criticalIncidents.slice(0, 3).map(incident => (
              <div 
                key={incident.id} 
                className="alert-item"
                onClick={() => onViewIncident(incident)}
              >
                <span className="alert-item-name">{incident.name}</span>
                <span className={`alert-item-priority priority-${incident.priority}`}>
                  {incident.priority === 'crítica' ? '🔴 Crítica' : '🟠 Alta'}
                </span>
                <button className="alert-item-btn">Ver →</button>
              </div>
            ))}
            {criticalIncidents.length > 3 && (
              <span className="alert-more">+ {criticalIncidents.length - 3} más</span>
            )}
          </div>
        </div>
      )}

      {longTestIncidents.length > 0 && (
        <div className="alert-section alert-test">
          <div className="alert-section-header">
            <span className="alert-badge">{longTestIncidents.length}</span>
            <h4>En Test por más de 3 días</h4>
          </div>
          <div className="alert-items">
            {longTestIncidents.slice(0, 3).map(incident => (
              <div 
                key={incident.id} 
                className="alert-item"
                onClick={() => onViewIncident(incident)}
              >
                <span className="alert-item-name">{incident.name}</span>
                <span className="alert-item-status">
                  {incident.status === 'puesto-en-test' ? '🔵 Puesto en Test' : '🔷 Verificado en Test'}
                </span>
                <button className="alert-item-btn">Ver →</button>
              </div>
            ))}
            {longTestIncidents.length > 3 && (
              <span className="alert-more">+ {longTestIncidents.length - 3} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
