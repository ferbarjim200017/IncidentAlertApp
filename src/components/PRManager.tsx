import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QATableExport } from './QATableExport';
import { MainTableExport } from './MainTableExport';
import './PRManager.css';

interface PR {
  id: string;
  link: string;
  description: string;
  createdAt: string;
}

interface PRManagerProps {
  incidentId: string;
  incidentName: string;
  prQA2List: PR[];
  prMainList: PR[];
  ownerName: string;
  onAddPR: (incidentId: string, type: 'qa2' | 'main', link: string, description: string) => void;
  onRemovePR: (incidentId: string, type: 'qa2' | 'main', prId: string) => void;
  onUpdatePR: (incidentId: string, type: 'qa2' | 'main', prId: string, link: string, description: string) => void;
}

export const PRManager: React.FC<PRManagerProps> = ({
  incidentId,
  incidentName,
  prQA2List,
  prMainList,
  ownerName,
  onAddPR,
  onRemovePR,
  onUpdatePR,
}) => {
  const [showModalQA2, setShowModalQA2] = useState(false);
  const [showModalMain, setShowModalMain] = useState(false);
  const [editingPR, setEditingPR] = useState<{ pr: PR; type: 'qa2' | 'main' } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmitQA2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const link = (formData.get('link') as string).trim();
    const description = (formData.get('description') as string).trim();

    if (link) {
      if (editingPR && editingPR.type === 'qa2') {
        onUpdatePR(incidentId, 'qa2', editingPR.pr.id, link, description);
        setEditingPR(null);
        setNotification({ type: 'success', message: '✓ PR QA2 actualizado correctamente' });
      } else {
        onAddPR(incidentId, 'qa2', link, description);
        setNotification({ type: 'success', message: '✓ PR QA2 agregado correctamente' });
      }
      setShowModalQA2(false);
      e.currentTarget.reset();
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSubmitMain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const link = (formData.get('link') as string).trim();
    const description = (formData.get('description') as string).trim();

    if (link) {
      if (editingPR && editingPR.type === 'main') {
        onUpdatePR(incidentId, 'main', editingPR.pr.id, link, description);
        setEditingPR(null);
        setNotification({ type: 'success', message: '✓ PR MAIN actualizado correctamente' });
      } else {
        onAddPR(incidentId, 'main', link, description);
        setNotification({ type: 'success', message: '✓ PR MAIN agregado correctamente' });
      }
      setShowModalMain(false);
      e.currentTarget.reset();
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEditPR = (pr: PR, type: 'qa2' | 'main') => {
    setEditingPR({ pr, type });
    if (type === 'qa2') {
      setShowModalQA2(true);
    } else {
      setShowModalMain(true);
    }
  };

  const handleCloseModal = (type: 'qa2' | 'main') => {
    setEditingPR(null);
    if (type === 'qa2') {
      setShowModalQA2(false);
    } else {
      setShowModalMain(false);
    }
  };

  const handleRemovePR = (e: React.MouseEvent, type: 'qa2' | 'main', prId: string) => {
    e.stopPropagation();
    onRemovePR(incidentId, type, prId);
    setNotification({ 
      type: 'error', 
      message: `✕ PR ${type === 'qa2' ? 'QA2' : 'MAIN'} eliminado` 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const getPRNumber = (link: string): string => {
    const parts = link.split('/');
    return parts[parts.length - 1] || link;
  };

  return (
    <>
      {notification && (
        <div className={`pr-notification pr-notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="pr-notification-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal PR QA2 */}
      {showModalQA2 && createPortal(
        <div className="pr-modal-overlay" onClick={() => handleCloseModal('qa2')}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPR && editingPR.type === 'qa2' ? '✏️ Editar PR QA2' : '🔀 Nuevo PR QA2'}</h2>
              <button className="btn-close-modal" onClick={() => handleCloseModal('qa2')}>✕</button>
            </div>
            <form className="pr-form-modal" onSubmit={handleSubmitQA2}>
              <div className="form-field">
                <label htmlFor="link-qa2">🔗 Enlace del PR</label>
                <input
                  id="link-qa2"
                  name="link"
                  type="url"
                  placeholder="https://github.com/..."
                  defaultValue={editingPR && editingPR.type === 'qa2' ? editingPR.pr.link : ''}
                  autoFocus
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="description-qa2">📝 Descripción</label>
                <textarea
                  id="description-qa2"
                  name="description"
                  rows={4}
                  placeholder="Describe los cambios del PR..."
                  defaultValue={editingPR && editingPR.type === 'qa2' ? editingPR.pr.description : ''}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-submit-pr" style={{ flex: 1 }}>
                  {editingPR && editingPR.type === 'qa2' ? '💾 Guardar Cambios' : '✅ Agregar PR QA2'}
                </button>
                {editingPR && editingPR.type === 'qa2' && (
                  <QATableExport 
                    incidentName={incidentName}
                    prQA2List={[editingPR.pr]}
                    ownerName={ownerName}
                  />
                )}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal PR MAIN */}
      {showModalMain && createPortal(
        <div className="pr-modal-overlay" onClick={() => handleCloseModal('main')}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPR && editingPR.type === 'main' ? '✏️ Editar PR MAIN' : '🔀 Nuevo PR MAIN'}</h2>
              <button className="btn-close-modal" onClick={() => handleCloseModal('main')}>✕</button>
            </div>
            <form className="pr-form-modal" onSubmit={handleSubmitMain}>
              <div className="form-field">
                <label htmlFor="link-main">🔗 Enlace del PR</label>
                <input
                  id="link-main"
                  name="link"
                  type="url"
                  placeholder="https://github.com/..."
                  defaultValue={editingPR && editingPR.type === 'main' ? editingPR.pr.link : ''}
                  autoFocus
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="description-main">📝 Descripción</label>
                <textarea
                  id="description-main"
                  name="description"
                  rows={4}
                  placeholder="Describe los cambios del PR..."
                  defaultValue={editingPR && editingPR.type === 'main' ? editingPR.pr.description : ''}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-submit-pr" style={{ flex: 1 }}>
                  {editingPR && editingPR.type === 'main' ? '💾 Guardar Cambios' : '✅ Agregar PR MAIN'}
                </button>
                {editingPR && editingPR.type === 'main' && (
                  <MainTableExport 
                    incidentName={incidentName}
                    prMainList={[editingPR.pr]}
                    contactPerson={ownerName}
                  />
                )}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Sección principal */}
      <div className="pr-manager">
        <div className="pr-section">
          <div className="pr-section-header">
            <h3>🔀 PRs QA2</h3>
            <button className="btn-add-pr" onClick={() => setShowModalQA2(true)}>
              + Agregar PR
            </button>
          </div>
          <div className="pr-list">
            {prQA2List.length === 0 ? (
              <p className="pr-empty">No hay PRs de QA2 registrados</p>
            ) : (
              prQA2List.map((pr) => (
                <div key={pr.id} className="pr-item" onClick={() => handleEditPR(pr, 'qa2')}>
                  <div className="pr-content">
                    <a 
                      href={pr.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pr-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗 PR {getPRNumber(pr.link)}
                    </a>
                    <span className="pr-date">
                      {new Date(pr.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    className="btn-remove-pr"
                    onClick={(e) => handleRemovePR(e, 'qa2', pr.id)}
                    title="Eliminar PR"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pr-section">
          <div className="pr-section-header">
            <h3>🔀 PRs MAIN</h3>
            <button className="btn-add-pr" onClick={() => setShowModalMain(true)}>
              + Agregar PR
            </button>
          </div>
          <div className="pr-list">
            {prMainList.length === 0 ? (
              <p className="pr-empty">No hay PRs de MAIN registrados</p>
            ) : (
              prMainList.map((pr) => (
                <div key={pr.id} className="pr-item" onClick={() => handleEditPR(pr, 'main')}>
                  <div className="pr-content">
                    <a 
                      href={pr.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pr-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗 PR {getPRNumber(pr.link)}
                    </a>
                    <span className="pr-date">
                      {new Date(pr.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    className="btn-remove-pr"
                    onClick={(e) => handleRemovePR(e, 'main', pr.id)}
                    title="Eliminar PR"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
