import { Incident } from '../types';
import { useState, useEffect } from 'react';
import { AdvancedSearch } from './AdvancedSearch';
import { storageUtils } from '../storageUtils';
import './AllIncidentsTable.css';

interface AllIncidentsTableProps {
  incidents: Incident[];
  onEdit: (incident: Incident) => void;
  onDelete: (id: string) => void;
  onViewDetail: (incident: Incident) => void;
  onNewIncident?: () => void;
  selectedStatus?: string | null;
  onClearFilter?: () => void;
}

export const AllIncidentsTable: React.FC<AllIncidentsTableProps> = ({
  incidents = [],
  onEdit,
  onDelete,
  onViewDetail,
  onNewIncident,
  selectedStatus: initialSelectedStatus = null,
  onClearFilter,
}) => {
  const [searchResults, setSearchResults] = useState<Incident[]>(incidents || []);
  const [sortField, setSortField] = useState<keyof Incident | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; incident: Incident | null }>({ show: false, incident: null });

  // Actualizar resultados cuando cambian las incidencias
  useEffect(() => {
    setSearchResults(incidents || []);
  }, [incidents]);

  const handleSort = (field: keyof Incident) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...searchResults].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Manejar fechas
      if (field === 'creationDate' || field === 'createdAt' || field === 'updatedAt') {
        aValue = new Date(aValue as string).getTime() as any;
        bValue = new Date(bValue as string).getTime() as any;
      }

      // Manejar ordenación por nombre (comparación numérica si hay números)
      if (field === 'name' && typeof aValue === 'string' && typeof bValue === 'string') {
        // Extraer números del inicio del nombre
        const aMatch = aValue.match(/^\d+/);
        const bMatch = bValue.match(/^\d+/);
        
        if (aMatch && bMatch) {
          // Si ambos tienen números, comparar numéricamente
          const aNum = parseInt(aMatch[0], 10);
          const bNum = parseInt(bMatch[0], 10);
          
          if (aNum !== bNum) {
            return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
          }
          // Si los números son iguales, comparar el resto alfabéticamente
          return newDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      }

      // Manejar strings (otros campos)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Manejar números
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSearchResults(sorted);
  };

  const getSortIcon = (field: keyof Incident) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      crítica: 'Crítica',
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      correctivo: 'Correctivo',
      evolutivo: 'Evolutivo',
      consultivo: 'Consultivo',
      tarea: 'Tarea',
    };
    return labels[type] || type;
  };

  const getPRNumbers = (prList: any[] | undefined): string => {
    if (!prList || !Array.isArray(prList) || prList.length === 0) return '—';
    
    return prList
      .filter(pr => pr && pr.link)
      .map(pr => {
        const parts = pr.link.split('/');
        return parts[parts.length - 1] || '';
      })
      .filter(num => num)
      .join(', ') || '—';
  };

  const exportToExcel = () => {
    // Función para escapar campos CSV correctamente
    const escapeCSV = (value: string) => {
      if (value == null) return '';
      const stringValue = String(value);
      // Si contiene punto y coma, comillas, saltos de línea, envolver en comillas y escapar comillas internas
      if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Crear el contenido CSV con punto y coma como separador
    const headers = ['ID', 'Nombre', 'Estado', 'Prioridad', 'Tipo', 'Contacto', 'PR QA2', 'PR MAIN', 'Fecha Creación', 'Creado', 'Actualizado'];
    const csvContent = [
      headers.map(h => escapeCSV(h)).join(';'),
      ...searchResults.map(incident => [
        escapeCSV(incident.id),
        escapeCSV(incident.name),
        escapeCSV(getStatusLabel(incident.status)),
        escapeCSV(getPriorityLabel(incident.priority)),
        escapeCSV(getTypeLabel(incident.type)),
        escapeCSV(incident.contactUser || ''),
        escapeCSV(incident.prQA2 || ''),
        escapeCSV(incident.prMain || ''),
        escapeCSV(incident.creationDate),
        escapeCSV(formatDate(incident.createdAt)),
        escapeCSV(formatDate(incident.updatedAt)),
      ].join(';'))
    ].join('\n');

    // Crear el Blob y descargar
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `incidencias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (incidents.length === 0) {
    return (
      <div className="all-incidents-empty">
        <p>No hay incidencias para mostrar</p>
      </div>
    );
  }

  return (
    <div className="all-incidents-table-container">
      <div className="search-sidebar">
        <AdvancedSearch 
          incidents={incidents}
          onResults={setSearchResults}
          allAvailableTags={storageUtils.getAllTags()}
          initialStatus={initialSelectedStatus as any}
          onClearStatusFilter={onClearFilter}
        />
      </div>
      
      <div className="table-content">
        <div className="table-actions">
          <p className="filter-results">Mostrando {searchResults.length} de {incidents.length} incidencias</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {onNewIncident && (
              <button
                className="btn-new-incident"
                onClick={onNewIncident}
              >
                ➕ Nueva Incidencia
              </button>
            )}
            <button
              className="btn-export-excel"
              onClick={exportToExcel}
            >
              📊 Exportar a Excel
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="all-incidents-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable-header col-name">
                  Nombre {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable-header col-status">
                  Estado {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('priority')} className="sortable-header col-priority">
                  Prioridad {getSortIcon('priority')}
                </th>
                <th onClick={() => handleSort('type')} className="sortable-header col-type">
                  Tipo {getSortIcon('type')}
                </th>
                <th onClick={() => handleSort('contactUser')} className="sortable-header col-contact">
                  Contacto {getSortIcon('contactUser')}
                </th>
                <th onClick={() => handleSort('prQA2')} className="sortable-header col-pr">
                  PR QA2 {getSortIcon('prQA2')}
                </th>
                <th onClick={() => handleSort('prMain')} className="sortable-header col-pr">
                  PR MAIN {getSortIcon('prMain')}
                </th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((incident) => (
                <tr 
                  key={incident.id} 
                  className={`row-priority-${incident.priority} incident-row-clickable`}
                  onClick={() => onViewDetail(incident)}
                  onMouseDown={(e) => {
                    if (e.button === 1) { // Click con rueda del ratón
                      e.preventDefault();
                      const url = `${window.location.origin}${window.location.pathname}?incident=${incident.id}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  <td className="name-cell" title={incident.name}>{incident.name}</td>
                  <td title={getStatusLabel(incident.status)}>
                    <span className={`status-badge status-${incident.status}`}>
                      {getStatusLabel(incident.status)}
                    </span>
                  </td>
                  <td title={getPriorityLabel(incident.priority)}>
                    <span className={`priority-badge priority-${incident.priority}`}>
                      {getPriorityLabel(incident.priority)}
                    </span>
                  </td>
                  <td title={getTypeLabel(incident.type)}>
                    <span className={`type-badge type-${incident.type}`}>
                      {getTypeLabel(incident.type)}
                    </span>
                  </td>
                  <td className="contact-cell" title={incident.contactUser || '—'}>{incident.contactUser || '—'}</td>
                  <td className="pr-cell" title={getPRNumbers(incident.prQA2List)}>{getPRNumbers(incident.prQA2List)}</td>
                  <td className="pr-cell" title={getPRNumbers(incident.prMainList)}>{getPRNumbers(incident.prMainList)}</td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-table-delete"
                      onClick={() => setDeleteConfirm({ show: true, incident })}
                      title="Eliminar incidencia"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm.show && deleteConfirm.incident && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm({ show: false, incident: null })}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="delete-modal-body">
              <p>¿Estás seguro de que quieres eliminar la incidencia?</p>
              <p className="delete-modal-incident-name">{deleteConfirm.incident.name}</p>
              <p className="delete-modal-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="btn-cancel-delete"
                onClick={() => setDeleteConfirm({ show: false, incident: null })}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => {
                  onDelete(deleteConfirm.incident!.id);
                  setDeleteConfirm({ show: false, incident: null });
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
