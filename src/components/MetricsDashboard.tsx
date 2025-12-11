import { Incident } from '../types';
import './MetricsDashboard.css';

interface MetricsDashboardProps {
  incidents: Incident[];
}

export function MetricsDashboard({ incidents }: MetricsDashboardProps) {
  // Calcular tiempo promedio de resolución (de creación a cierre)
  const calculateAverageResolutionTime = () => {
    const closedIncidents = incidents.filter(inc => inc.status === 'cerrada');
    if (closedIncidents.length === 0) return 0;

    const totalDays = closedIncidents.reduce((sum, inc) => {
      const created = new Date(inc.creationDate);
      const updated = new Date(inc.updatedAt);
      const diffTime = Math.abs(updated.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / closedIncidents.length);
  };

  // Contar incidencias por tipo
  const getIncidentsByType = () => {
    return {
      correctivo: incidents.filter(inc => inc.type === 'correctivo').length,
      evolutivo: incidents.filter(inc => inc.type === 'evolutivo').length,
      tarea: incidents.filter(inc => inc.type === 'tarea').length,
    };
  };

  // Incidencias del mes actual
  const getThisMonthIncidents = () => {
    const now = new Date();
    return incidents.filter(inc => {
      const created = new Date(inc.creationDate);
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;
  };

  // Tasa de resolución (cerradas vs totales)
  const getResolutionRate = () => {
    if (incidents.length === 0) return 0;
    const closed = incidents.filter(inc => inc.status === 'cerrada').length;
    return Math.round((closed / incidents.length) * 100);
  };

  // Incidencias críticas/altas pendientes
  const getCriticalPending = () => {
    return incidents.filter(inc => 
      (inc.priority === 'crítica' || inc.priority === 'alta') && 
      inc.status !== 'cerrada'
    ).length;
  };

  const avgResolutionTime = calculateAverageResolutionTime();
  const typeStats = getIncidentsByType();
  const thisMonthCount = getThisMonthIncidents();
  const resolutionRate = getResolutionRate();
  const criticalPending = getCriticalPending();

  return (
    <div className="metrics-dashboard">
      <h2 className="metrics-title">📊 Métricas del Sistema</h2>
      
      <div className="metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">{avgResolutionTime}</div>
            <div className="metric-label">Días promedio de resolución</div>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{resolutionRate}%</div>
            <div className="metric-label">Tasa de resolución</div>
          </div>
        </div>

        <div className="metric-card metric-info">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <div className="metric-value">{thisMonthCount}</div>
            <div className="metric-label">Incidencias este mes</div>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{criticalPending}</div>
            <div className="metric-label">Críticas/Altas pendientes</div>
          </div>
        </div>
      </div>

      <div className="metrics-detail">
        <h3>Distribución por Tipo</h3>
        <div className="type-stats">
          <div className="type-stat-item">
            <span className="type-stat-label">🔧 Correctivo</span>
            <span className="type-stat-value">{typeStats.correctivo}</span>
          </div>
          <div className="type-stat-item">
            <span className="type-stat-label">🚀 Evolutivo</span>
            <span className="type-stat-value">{typeStats.evolutivo}</span>
          </div>
          <div className="type-stat-item">
            <span className="type-stat-label">📋 Tarea</span>
            <span className="type-stat-value">{typeStats.tarea}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
