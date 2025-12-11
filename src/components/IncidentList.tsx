import { useState, useEffect } from 'react';
import { Incident } from '../types';
import { IncidentItem } from './IncidentItem';
import './IncidentList.css';

interface IncidentListProps {
  incidents: Incident[];
  onUpdate: (incident: Incident) => void;
  onDelete: (id: string) => void;
  onEdit: (incident: Incident) => void;
  selectedStatus?: string | null;
  onClearFilter?: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onUpdate,
  onDelete,
  onEdit,
  selectedStatus,
  onClearFilter,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>(selectedStatus || 'todas');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  useEffect(() => {
    if (selectedStatus) {
      setFilterStatus(selectedStatus);
    }
  }, [selectedStatus]);

  const filteredIncidents = incidents.filter((incident) => {
    const statusMatch = filterStatus === 'todas' || incident.status === filterStatus;
    const priorityMatch = filterPriority === 'todas' || incident.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { crítica: 0, alta: 1, media: 2, baja: 3 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] -
             priorityOrder[b.priority as keyof typeof priorityOrder];
    }
    return 0;
  });

  return (
    <div className="incident-list-container">
      {selectedStatus && (
        <div className="active-filter-banner">
          <span>Filtrado por estado: <strong>{filterStatus.toUpperCase()}</strong></span>
          <button className="btn-clear-filter" onClick={() => {
            setFilterStatus('todas');
            onClearFilter?.();
          }}>
            ✕ Limpiar filtro
          </button>
        </div>
      )}
      <div className="incident-filters">
        <div className="filter-group">
          <label htmlFor="filter-status">Estado:</label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="abierta">Abierta</option>
            <option value="en-progreso">En Progreso</option>
            <option value="resuelta">Resuelta</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-priority">Prioridad:</label>
          <select
            id="filter-priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Ordenar por:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Más recientes primero</option>
            <option value="priority">Mayor prioridad primero</option>
          </select>
        </div>
      </div>

      {sortedIncidents.length === 0 ? (
        <div className="no-incidents">
          <p>No hay incidencias que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="incidents-grid">
          {sortedIncidents.map((incident) => (
            <IncidentItem
              key={incident.id}
              incident={incident}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className="incident-stats">
        <span>Total: {incidents.length}</span>
        <span>Abiertas: {incidents.filter(i => i.status === 'abierta').length}</span>
        <span>En progreso: {incidents.filter(i => i.status === 'en-progreso').length}</span>
        <span>Resueltas: {incidents.filter(i => i.status === 'resuelta').length}</span>
      </div>
    </div>
  );
};
