import './Tabs.css';

interface OpenIncident {
  id: string;
  name: string;
}

interface TabsProps {
  activeTab: 'dashboard' | 'all-incidents' | 'new-incident' | 'incident-detail' | 'settings';
  onTabChange: (tab: 'dashboard' | 'all-incidents' | 'new-incident' | 'incident-detail' | 'settings') => void;
  openIncidents?: OpenIncident[];
  selectedIncidentId?: string;
  onSelectIncident?: (incidentId: string) => void;
  onCloseIncident?: (incidentId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ 
  activeTab, 
  onTabChange, 
  openIncidents = [], 
  selectedIncidentId,
  onSelectIncident,
  onCloseIncident 
}) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        📊 Dashboard
      </button>
      <button
        className={`tab-button ${activeTab === 'all-incidents' ? 'active' : ''}`}
        onClick={() => onTabChange('all-incidents')}
      >
        📋 Todas las Incidencias
      </button>
      <button
        className={`tab-button ${activeTab === 'new-incident' ? 'active' : ''}`}
        onClick={() => onTabChange('new-incident')}
      >
        ➕ Nueva Incidencia
      </button>
      <button
        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        ⚙️ Ajustes
      </button>
      
      {openIncidents.map((incident) => (
        <div
          key={incident.id}
          className={`tab-incident ${selectedIncidentId === incident.id ? 'active' : ''}`}
          onClick={() => onSelectIncident?.(incident.id)}
        >
          <span className="tab-incident-name">📄 {incident.name}</span>
          <button
            className="tab-incident-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseIncident?.(incident.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
