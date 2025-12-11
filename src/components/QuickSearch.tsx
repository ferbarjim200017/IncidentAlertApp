import React, { useState, useEffect, useRef } from 'react';
import './QuickSearch.css';
import { Incident } from '../types';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ isOpen, onClose, incidents, onSelectIncident }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredIncidents = incidents.filter(incident => {
    const query = searchQuery.toLowerCase();
    return (
      incident.name.toLowerCase().includes(query) ||
      incident.description.toLowerCase().includes(query) ||
      incident.assignedTo?.toLowerCase().includes(query)
    );
  }).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredIncidents.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredIncidents.length) % filteredIncidents.length);
    } else if (e.key === 'Enter' && filteredIncidents[selectedIndex]) {
      e.preventDefault();
      handleSelectIncident(filteredIncidents[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectIncident = (incident: Incident) => {
    onSelectIncident(incident);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      alta: '#ef4444',
      media: '#f59e0b',
      baja: '#10b981'
    };
    return colors[priority.toLowerCase()] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      abierta: '#3b82f6',
      'en progreso': '#f59e0b',
      cerrada: '#10b981'
    };
    return colors[status.toLowerCase()] || '#6b7280';
  };

  if (!isOpen) return null;

  return (
    <div className="quick-search-overlay" onClick={onClose}>
      <div className="quick-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-search-header">
          <div className="quick-search-icon">🔍</div>
          <input
            ref={inputRef}
            type="text"
            className="quick-search-input"
            placeholder="Buscar incidencias por nombre, descripción, usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="quick-search-hint">
            <kbd>Esc</kbd> para cerrar
          </div>
        </div>

        <div className="quick-search-results" ref={resultsRef}>
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident, index) => (
              <div
                key={incident.id}
                className={`quick-search-result ${index === selectedIndex ? 'quick-search-result-selected' : ''}`}
                onClick={() => handleSelectIncident(incident)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="quick-search-result-header">
                  <span className="quick-search-result-name">{incident.name}</span>
                  <div className="quick-search-result-badges">
                    <span 
                      className="quick-search-badge"
                      style={{ background: getPriorityColor(incident.priority) }}
                    >
                      {incident.priority}
                    </span>
                    <span 
                      className="quick-search-badge"
                      style={{ background: getStatusColor(incident.status) }}
                    >
                      {incident.status}
                    </span>
                  </div>
                </div>
                <div className="quick-search-result-description">
                  {incident.description.substring(0, 80)}
                  {incident.description.length > 80 ? '...' : ''}
                </div>
                <div className="quick-search-result-footer">
                  <span className="quick-search-result-meta">
                    👤 {incident.assignedTo || 'Sin asignar'}
                  </span>
                  <span className="quick-search-result-meta">
                    📅 {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <div className="quick-search-empty">
              <div className="quick-search-empty-icon">🔍</div>
              <div className="quick-search-empty-text">
                No se encontraron incidencias
              </div>
              <div className="quick-search-empty-hint">
                Intenta con otros términos de búsqueda
              </div>
            </div>
          ) : (
            <div className="quick-search-empty">
              <div className="quick-search-empty-icon">⌨️</div>
              <div className="quick-search-empty-text">
                Comienza a escribir para buscar
              </div>
              <div className="quick-search-empty-hint">
                Busca por nombre, descripción o usuario
              </div>
            </div>
          )}
        </div>

        <div className="quick-search-footer">
          <div className="quick-search-navigation-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> para navegar
            <span className="quick-search-separator">•</span>
            <kbd>Enter</kbd> para seleccionar
            <span className="quick-search-separator">•</span>
            <kbd>Esc</kbd> para cerrar
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
