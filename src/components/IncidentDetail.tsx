import { Incident, IncidentStatus, IncidentPriority, IncidentType } from '../types';
import { useState, useEffect } from 'react';
import { CommentsSection } from './CommentsSection';
import { TagsManager } from './TagsManager';
import { PRManager } from './PRManager';
import { ExcelExport } from './ExcelExport';
import { authUtils } from '../authUtils';
import './IncidentDetail.css';

interface IncidentDetailProps {
  incident: Incident;
  onUpdate: (incident: Incident) => void;
  onBack: () => void;
  onAddComment: (incidentId: string, author: string, text: string) => void;
  onUpdateComment: (incidentId: string, commentId: string, author: string, text: string) => void;
  onDeleteComment: (incidentId: string, commentId: string) => void;
  onDelete: (id: string) => void;
  onAddTag: (incidentId: string, tag: string) => void;
  onRemoveTag: (incidentId: string, tag: string) => void;
  onDeleteTagGlobally?: (tag: string) => void;
  allAvailableTags: string[];
  onAddPR: (incidentId: string, type: 'qa2' | 'main', link: string, description: string) => void;
  onRemovePR: (incidentId: string, type: 'qa2' | 'main', prId: string) => void;
  onUpdatePR: (incidentId: string, type: 'qa2' | 'main', prId: string, link: string, description: string) => void;
  currentUserName: string;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident: incidentProp,
  onUpdate,
  onBack,
  currentUserName,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onDelete,
  onAddTag,
  onRemoveTag,
  onDeleteTagGlobally,
  allAvailableTags,
  onAddPR,
  onRemovePR,
  onUpdatePR,
}) => {
  const [incident, setIncident] = useState<Incident>(incidentProp);
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [priority, setPriority] = useState<IncidentPriority>(incident.priority);
  const [type, setType] = useState<IncidentType>(incident.type);

  // Actualizar estado local cuando cambia el prop
  useEffect(() => {
    setIncident(incidentProp);
    setStatus(incidentProp.status);
    setPriority(incidentProp.priority);
    setType(incidentProp.type);
  }, [incidentProp]);

  // Obtener el nombre del usuario que creó la incidencia
  const getIncidentOwnerName = (): string => {
    const users = authUtils.getUsers();
    const owner = users.find(u => u.id === incident.userId);
    return owner ? owner.name : incident.contactUser || 'Usuario';
  };

  const incidentOwnerName = getIncidentOwnerName();

  const getPRNumbers = (prList: any[] | undefined): string => {
    if (!prList || prList.length === 0) return '';
    
    return prList.map(pr => {
      const parts = pr.link.split('/');
      return parts[parts.length - 1] || pr.link;
    }).join(', ');
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la incidencia "${incident.name}"? Esta acción no se puede deshacer.`)) {
      onDelete(incident.id);
      onBack();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedIncident: Incident = {
      ...incident,
      name: (formData.get('name') as string || '').trim(),
      title: (formData.get('title') as string || '').trim(),
      description: (formData.get('description') as string || '').trim(),
      contactUser: (formData.get('contactUser') as string || '').trim(),
      prQA2: (formData.get('prQA2') as string || '').trim(),
      prMain: (formData.get('prMain') as string || '').trim(),
      creationDate: formData.get('creationDate') as string || incident.creationDate,
      relevante: (formData.get('relevante') as string || '').trim(),
      realizado: (formData.get('realizado') as string || '').trim(),
      clasesModificadas: (formData.get('clasesModificadas') as string || '').trim(),
      priority: priority,
      status: status,
      type: type,
      updatedAt: new Date().toISOString(),
    };

    console.log('Guardando incidencia:', updatedIncident);
    onUpdate(updatedIncident);
  };

  return (
    <div className="incident-detail-container">
      <div className="incident-detail-layout">
        <div className="detail-main-content">
          <div className="incident-detail-card">
            <div className="incident-header-visual">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn-back-inline" onClick={onBack}>
                    ←
                  </button>
                  <h1>{incident.name}</h1>
                </div>
                <ExcelExport incident={incident} currentUser={currentUserName} />
              </div>
              <div className="incident-badges">
                <span className={`badge-status status-${incident.status}`}>
                  {incident.status === 'abierta' && '🔵'}
                  {incident.status === 'en-progreso' && '🟡'}
                  {incident.status === 'puesto-en-test' && '🟠'}
                  {incident.status === 'verificado-en-test' && '🟣'}
                  {incident.status === 'resuelta' && '🟢'}
                  {incident.status === 'cerrada' && '⚫'}
                  {' '}{incident.status.replace('-', ' ')}
                </span>
                <span className={`badge-priority priority-${incident.priority}`}>
                  {incident.priority === 'baja' && '🟢'}
                  {incident.priority === 'media' && '🟡'}
                  {incident.priority === 'alta' && '🟠'}
                  {incident.priority === 'crítica' && '🔴'}
                  {' '}{incident.priority}
                </span>
                <span className={`badge-type type-${incident.type}`}>
                  {incident.type === 'correctivo' && '🔧'}
                  {incident.type === 'evolutivo' && '🚀'}
                  {incident.type === 'tarea' && '📋'}
                  {' '}{incident.type}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="detail-form">
              <div className="detail-section">
                <h2>✏️ Editar Información</h2>
                
                <div className="visual-field-group">
                  <div className="visual-field">
                    <label htmlFor="name">Nombre de la Incidencia</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      defaultValue={incident.name}
                      placeholder="MOV-XXXX"
                      required
                    />
                  </div>

                  <div className="visual-field">
                    <label htmlFor="contactUser">👤 Usuario de Contacto</label>
                    <input
                      id="contactUser"
                      name="contactUser"
                      type="text"
                      defaultValue={incident.contactUser || ''}
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div className="visual-field">
                    <label htmlFor="creationDate">📅 Fecha de Creación</label>
                    <input
                      id="creationDate"
                      name="creationDate"
                      type="date"
                      defaultValue={incident.creationDate}
                    />
                  </div>
                </div>

                <div className="visual-field-group">
                  <div className="visual-field visual-field-full">
                    <label htmlFor="title">📌 Título</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      defaultValue={incident.title || ''}
                      placeholder="Título para envío a PRO"
                    />
                  </div>
                </div>

                <div className="visual-field-group">
                  <div className="visual-field visual-field-full">
                    <label htmlFor="description">📝 Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      defaultValue={incident.description || ''}
                      placeholder="Descripción detallada de la incidencia..."
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="visual-field-group">
                  <div className="visual-field visual-field-full">
                    <label htmlFor="relevante">🔑 Relevante</label>
                    <textarea
                      id="relevante"
                      name="relevante"
                      defaultValue={incident.relevante || ''}
                      placeholder="Información relevante..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="visual-field-group">
                  <div className="visual-field visual-field-full">
                    <label htmlFor="realizado">✅ Realizado</label>
                    <textarea
                      id="realizado"
                      name="realizado"
                      defaultValue={incident.realizado || ''}
                      placeholder="Qué se ha realizado..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="visual-field-group">
                  <div className="visual-field visual-field-full">
                    <label htmlFor="clasesModificadas">💻 Clases Modificadas</label>
                    <textarea
                      id="clasesModificadas"
                      name="clasesModificadas"
                      defaultValue={incident.clasesModificadas || ''}
                      placeholder="Clases o archivos modificados..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h2>🎯 Estado y Clasificación</h2>
                
                <div className="chip-selector-container">
                  <div className="chip-field">
                    <label>Estado</label>
                    <div className="chip-options">
                      <button type="button" className={`chip-option status-chip ${status === 'abierta' ? 'selected' : ''}`} onClick={() => setStatus('abierta')}>
                        🔵 Abierta
                      </button>
                      <button type="button" className={`chip-option status-chip ${status === 'en-progreso' ? 'selected' : ''}`} onClick={() => setStatus('en-progreso')}>
                        🟡 En Progreso
                      </button>
                      <button type="button" className={`chip-option status-chip ${status === 'puesto-en-test' ? 'selected' : ''}`} onClick={() => setStatus('puesto-en-test')}>
                        🟠 En Test
                      </button>
                      <button type="button" className={`chip-option status-chip ${status === 'verificado-en-test' ? 'selected' : ''}`} onClick={() => setStatus('verificado-en-test')}>
                        🟣 Verificado
                      </button>
                      <button type="button" className={`chip-option status-chip ${status === 'resuelta' ? 'selected' : ''}`} onClick={() => setStatus('resuelta')}>
                        🟢 Resuelta
                      </button>
                      <button type="button" className={`chip-option status-chip ${status === 'cerrada' ? 'selected' : ''}`} onClick={() => setStatus('cerrada')}>
                        ⚫ Cerrada
                      </button>
                    </div>
                  </div>

                  <div className="chip-field">
                    <label>Prioridad</label>
                    <div className="chip-options">
                      <button type="button" className={`chip-option priority-chip priority-baja ${priority === 'baja' ? 'selected' : ''}`} onClick={() => setPriority('baja')}>
                        🟢 Baja
                      </button>
                      <button type="button" className={`chip-option priority-chip priority-media ${priority === 'media' ? 'selected' : ''}`} onClick={() => setPriority('media')}>
                        🟡 Media
                      </button>
                      <button type="button" className={`chip-option priority-chip priority-alta ${priority === 'alta' ? 'selected' : ''}`} onClick={() => setPriority('alta')}>
                        🟠 Alta
                      </button>
                      <button type="button" className={`chip-option priority-chip priority-crítica ${priority === 'crítica' ? 'selected' : ''}`} onClick={() => setPriority('crítica')}>
                        🔴 Crítica
                      </button>
                    </div>
                  </div>

                  <div className="chip-field">
                    <label>Tipo</label>
                    <div className="chip-options">
                      <button type="button" className={`chip-option type-chip ${type === 'correctivo' ? 'selected' : ''}`} onClick={() => setType('correctivo')}>
                        🔧 Correctivo
                      </button>
                      <button type="button" className={`chip-option type-chip ${type === 'evolutivo' ? 'selected' : ''}`} onClick={() => setType('evolutivo')}>
                        🚀 Evolutivo
                      </button>
                      <button type="button" className={`chip-option type-chip ${type === 'tarea' ? 'selected' : ''}`} onClick={() => setType('tarea')}>
                        📋 Tarea
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  💾 Guardar Cambios
                </button>
                <button type="button" className="btn-cancel" onClick={onBack}>
                  Cancelar
                </button>
                <button type="button" className="btn-delete-incident" onClick={handleDelete}>
                  🗑️ Eliminar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="incident-detail-card">
            <PRManager
              incidentId={incident.id}
              incidentName={incident.name}
              prQA2List={incident.prQA2List || []}
              prMainList={incident.prMainList || []}
              ownerName={currentUserName}
              onAddPR={onAddPR}
              onRemovePR={onRemovePR}
              onUpdatePR={onUpdatePR}
            />
          </div>

          <div className="incident-detail-card">
            <TagsManager
              incidentId={incident.id}
              tags={incident.tags || []}
              allAvailableTags={allAvailableTags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onDeleteTagGlobally={onDeleteTagGlobally}
            />
          </div>

          <div className="incident-detail-card">
            <CommentsSection
              incidentId={incident.id}
              comments={incident.comments || []}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
