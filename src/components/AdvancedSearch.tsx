import { useState, useEffect } from 'react';
import { Incident, IncidentStatus, IncidentPriority, IncidentType } from '../types';
import './AdvancedSearch.css';

interface AdvancedSearchProps {
  incidents: Incident[];
  onResults: (results: Incident[]) => void;
  allAvailableTags: string[];
  initialStatus?: IncidentStatus | null;
  onClearStatusFilter?: () => void;
}

export function AdvancedSearch({ incidents, onResults, allAvailableTags, initialStatus, onClearStatusFilter }: AdvancedSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>(initialStatus ? [initialStatus] : []);
  const [selectedPriorities, setSelectedPriorities] = useState<IncidentPriority[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Detectar cuando se selecciona un estado desde el gráfico
  useEffect(() => {
    if (initialStatus) {
      setSelectedStatuses([initialStatus]);
    }
  }, [initialStatus]);

  // Aplicar filtros automáticamente cuando cambian
  useEffect(() => {
    let filtered = [...incidents];

    // Filtro por texto (busca en nombre, contactUser, PRs, comentarios)
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(inc =>
        inc.name.toLowerCase().includes(search) ||
        inc.contactUser.toLowerCase().includes(search) ||
        inc.prQA2.toLowerCase().includes(search) ||
        inc.prMain.toLowerCase().includes(search) ||
        (inc.comments && inc.comments.some(c => 
          c.text.toLowerCase().includes(search) || 
          c.author.toLowerCase().includes(search)
        ))
      );
    }

    // Filtro por estados
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(inc => selectedStatuses.includes(inc.status));
    }

    // Filtro por prioridades
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(inc => selectedPriorities.includes(inc.priority));
    }

    // Filtro por tipos
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(inc => selectedTypes.includes(inc.type));
    }

    // Filtro por etiquetas
    if (selectedTags.length > 0) {
      filtered = filtered.filter(inc => 
        selectedTags.some(tag => inc.tags && inc.tags.includes(tag))
      );
    }

    // Filtro por rango de años
    if (yearFrom) {
      filtered = filtered.filter(inc => {
        const incidentYear = new Date(inc.creationDate).getFullYear();
        return incidentYear >= parseInt(yearFrom);
      });
    }
    if (yearTo) {
      filtered = filtered.filter(inc => {
        const incidentYear = new Date(inc.creationDate).getFullYear();
        return incidentYear <= parseInt(yearTo);
      });
    }

    onResults(filtered);
  }, [searchText, selectedStatuses, selectedPriorities, selectedTypes, selectedTags, yearFrom, yearTo, incidents, onResults]);

  const handleReset = () => {
    setSearchText('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
    setSelectedTags([]);
    setYearFrom('');
    setYearTo('');
    onResults(incidents);
    if (onClearStatusFilter) {
      onClearStatusFilter();
    }
  };

  const handleClearStatusFilter = () => {
    setSelectedStatuses([]);
    if (onClearStatusFilter) {
      onClearStatusFilter();
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'abierta': 'Abierta',
      'en-progreso': 'En Progreso',
      'puesto-en-test': 'Puesto en Test',
      'verificado-en-test': 'Verificado en Test',
      'resuelta': 'Resuelta',
      'cerrada': 'Cerrada',
    };
    return statusLabels[status] || status;
  };

  const toggleStatus = (status: IncidentStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: IncidentPriority) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const toggleType = (type: IncidentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const activeFiltersCount = 
    (searchText ? 1 : 0) +
    selectedStatuses.length +
    selectedPriorities.length +
    selectedTypes.length +
    selectedTags.length +
    (yearFrom ? 1 : 0) +
    (yearTo ? 1 : 0);

  return (
    <div className="advanced-search">
      {initialStatus && (
        <div className="status-filter-banner">
          <span>📊 Filtrando por estado: <strong>{getStatusLabel(initialStatus)}</strong></span>
          <button onClick={handleClearStatusFilter} className="btn-clear-status-filter">
            ✕ Limpiar filtro
          </button>
        </div>
      )}
      <div className="search-header">
        <h3>🔍 Búsqueda Avanzada</h3>
      </div>

      <div className="search-main">
        <input
          type="text"
          placeholder="Buscar por nombre, contacto, PRs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <button className="btn-reset" onClick={handleReset}>
          ✕ Limpiar Filtros
          {activeFiltersCount > 0 && (
            <span className="filters-badge-inline">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      <div className="filters-panel">
        <div className="filter-section">
          <h4>Estado</h4>
          <div className="filter-chips">
            {(['abierta', 'en-progreso', 'puesto-en-test', 'verificado-en-test', 'resuelta', 'cerrada'] as IncidentStatus[]).map(status => (
              <button
                key={status}
                className={`filter-chip ${selectedStatuses.includes(status) ? 'active' : ''}`}
                onClick={() => toggleStatus(status)}
                >
                  {status === 'abierta' && 'Abierta'}
                  {status === 'en-progreso' && 'En Progreso'}
                  {status === 'puesto-en-test' && 'Puesto en Test'}
                  {status === 'verificado-en-test' && 'Verificado en Test'}
                  {status === 'resuelta' && 'Resuelta'}
                  {status === 'cerrada' && 'Cerrada'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Prioridad</h4>
            <div className="filter-chips">
              {(['baja', 'media', 'alta', 'crítica'] as IncidentPriority[]).map(priority => (
                <button
                  key={priority}
                  className={`filter-chip priority-${priority} ${selectedPriorities.includes(priority) ? 'active' : ''}`}
                  onClick={() => togglePriority(priority)}
                >
                  {priority === 'baja' && '🟢 Baja'}
                  {priority === 'media' && '🟡 Media'}
                  {priority === 'alta' && '🟠 Alta'}
                  {priority === 'crítica' && '🔴 Crítica'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Tipo</h4>
            <div className="filter-chips">
              {(['correctivo', 'evolutivo', 'tarea'] as IncidentType[]).map(type => (
                <button
                  key={type}
                  className={`filter-chip ${selectedTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type === 'correctivo' && '🔧 Correctivo'}
                  {type === 'evolutivo' && '🚀 Evolutivo'}
                  {type === 'tarea' && '📋 Tarea'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Rango de Años</h4>
            <div className="date-filters">
              <div className="date-input-group">
                <label>Desde:</label>
                <select
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="date-input"
                >
                  <option value="">Seleccionar año</option>
                  {Array.from(new Set(incidents.map(inc => new Date(inc.creationDate).getFullYear())))
                    .sort((a, b) => a - b)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                </select>
              </div>
              <div className="date-input-group">
                <label>Hasta:</label>
                <select
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="date-input"
                >
                  <option value="">Seleccionar año</option>
                  {Array.from(new Set(incidents.map(inc => new Date(inc.creationDate).getFullYear())))
                    .sort((a, b) => a - b)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {allAvailableTags.length > 0 && (
            <div className="filter-section">
              <h4>🏷️ Etiquetas</h4>
              <div className="filter-chips">
                {allAvailableTags.map(tag => (
                  <button
                    key={tag}
                    className={`filter-chip tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
