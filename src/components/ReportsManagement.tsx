import { useState, useEffect } from 'react';
import { Report, User, Role } from '../types';
import * as firebaseService from '../firebaseService';
import './ReportsManagement.css';

interface ReportsManagementProps {
  currentUser: User;
  reports: Report[];
  onUpdateReport: (reportId: string, updates: Partial<Report>) => void;
  onDeleteReport: (reportId: string) => void;
}

export function ReportsManagement({ currentUser, reports, onUpdateReport, onDeleteReport }: ReportsManagementProps) {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'error' | 'mejora'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'abierto' | 'completado'>('all');

  useEffect(() => {
    const loadRole = async () => {
      if (currentUser.roleId) {
        const role = await firebaseService.getRoleById(currentUser.roleId);
        setUserRole(role);
      }
    };
    loadRole();
  }, [currentUser]);

  useEffect(() => {
    let filtered = reports;

    // Si no es admin, solo ver sus reportes
    if (!userRole?.permissions.users.viewAll) {
      filtered = filtered.filter(r => r.userId === currentUser.id);
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    setFilteredReports(filtered);
  }, [reports, userRole, currentUser, filterType, filterStatus]);

  const handleStatusChange = (reportId: string, newStatus: 'abierto' | 'completado') => {
    if (!userRole?.permissions.users.viewAll) {
      alert('Solo los administradores pueden cambiar el estado de los reportes');
      return;
    }
    onUpdateReport(reportId, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const handleDelete = (reportId: string) => {
    if (!confirm('¿Eliminar este reporte?')) return;
    onDeleteReport(reportId);
  };

  const isAdmin = userRole?.permissions.users.viewAll || false;

  const getTypeIcon = (type: string) => {
    return type === 'error' ? '🐛' : '💡';
  };

  const getStatusBadge = (status: string) => {
    return status === 'abierto' 
      ? <span className="status-badge open">Abierto</span>
      : <span className="status-badge completed">Completado</span>;
  };

  return (
    <div className="reports-management">
      <div className="settings-header">
        <h2>📋 Reportes</h2>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Tipo:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn error ${filterType === 'error' ? 'active' : ''}`}
              onClick={() => setFilterType('error')}
            >
              🐛 Errores
            </button>
            <button
              className={`filter-btn mejora ${filterType === 'mejora' ? 'active' : ''}`}
              onClick={() => setFilterType('mejora')}
            >
              💡 Mejoras
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filterStatus === 'abierto' ? 'active' : ''}`}
              onClick={() => setFilterStatus('abierto')}
            >
              Abiertos
            </button>
            <button
              className={`filter-btn ${filterStatus === 'completado' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completado')}
            >
              Completados
            </button>
          </div>
        </div>

        <div className="reports-count">
          {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="reports-empty">
          <p>📭 No hay reportes que mostrar</p>
        </div>
      ) : (
        <div className="reports-list">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-title-section">
                  <span className="report-type-icon">{getTypeIcon(report.type)}</span>
                  <h3>{report.title}</h3>
                </div>
                <div className="report-actions">
                  {getStatusBadge(report.status)}
                  {isAdmin && (
                    <>
                      {report.status === 'abierto' ? (
                        <button
                          className="btn-complete"
                          onClick={() => handleStatusChange(report.id, 'completado')}
                          title="Marcar como completado"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          className="btn-reopen"
                          onClick={() => handleStatusChange(report.id, 'abierto')}
                          title="Reabrir"
                        >
                          ↻
                        </button>
                      )}
                      <button
                        className="btn-delete-report"
                        onClick={() => handleDelete(report.id)}
                        title="Eliminar reporte"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="report-body">
                <p className="report-description">{report.description}</p>
              </div>

              <div className="report-footer">
                <div className="report-meta">
                  <span className="report-user">👤 {report.userName}</span>
                  <span className="report-date">
                    📅 {new Date(report.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {report.updatedAt && report.status === 'completado' && (
                  <span className="report-updated">
                    Completado: {new Date(report.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
