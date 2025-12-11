import { useState } from 'react';
import './TagsManager.css';

interface TagsManagerProps {
  incidentId: string;
  tags: string[];
  allAvailableTags: string[];
  onAddTag: (incidentId: string, tag: string) => void;
  onRemoveTag: (incidentId: string, tag: string) => void;
  onDeleteTagGlobally?: (tag: string) => void;
}

export function TagsManager({ 
  incidentId, 
  tags, 
  allAvailableTags,
  onAddTag, 
  onRemoveTag,
  onDeleteTagGlobally
}: TagsManagerProps) {
  const [showInput, setShowInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; tag: string | null }>({ 
    show: false, 
    tag: null 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(incidentId, newTag.trim());
      setNewTag('');
      setShowInput(false);
      setShowSuggestions(false);
    }
  };

  const handleAddExistingTag = (tag: string) => {
    onAddTag(incidentId, tag);
    setShowSuggestions(false);
  };

  const handleDeleteGlobally = (tag: string) => {
    setDeleteConfirm({ show: true, tag });
  };

  const confirmDeleteGlobally = () => {
    if (deleteConfirm.tag && onDeleteTagGlobally) {
      onDeleteTagGlobally(deleteConfirm.tag);
      setDeleteConfirm({ show: false, tag: null });
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = showSuggestions 
    ? allAvailableTags.filter(tag => !tags.includes(tag))
    : [];

  // Mostrar todas las etiquetas del sistema para gestión
  const allSystemTags = allAvailableTags;

  return (
    <div className="tags-manager">
      <div className="tags-header">
        <h4>🏷️ Etiquetas</h4>
        <div className="tags-actions">
          {!showInput && (
            <>
              <button 
                className="btn-add-tag"
                onClick={() => setShowInput(true)}
              >
                + Nueva
              </button>
              {allSystemTags.length > 0 && (
                <button 
                  className="btn-suggest-tag"
                  onClick={() => {
                    console.log('Toggling suggestions. Current:', showSuggestions);
                    console.log('Available tags:', allSystemTags);
                    setShowSuggestions(!showSuggestions);
                  }}
                >
                  📋 Gestionar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showInput && (
        <form className="tag-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Escribe una etiqueta..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            autoFocus
            className="tag-input"
          />
          <button type="submit" className="btn-submit-tag">✓</button>
          <button 
            type="button" 
            className="btn-cancel-tag"
            onClick={() => {
              setShowInput(false);
              setNewTag('');
            }}
          >
            ✕
          </button>
        </form>
      )}

      {showSuggestions && allSystemTags.length > 0 && (
        <div className="tag-suggestions">
          <p className="suggestions-title">Todas las etiquetas del sistema:</p>
          <div className="suggestions-list">
            {allSystemTags.map(tag => (
              <div key={tag} className="suggestion-item">
                {!tags.includes(tag) && (
                  <button
                    className="suggestion-tag"
                    onClick={() => handleAddExistingTag(tag)}
                  >
                    + {tag}
                  </button>
                )}
                {tags.includes(tag) && (
                  <span className="tag-already-added">✓ {tag}</span>
                )}
                {onDeleteTagGlobally && (
                  <button
                    className="btn-delete-global-tag"
                    onClick={() => handleDeleteGlobally(tag)}
                    title="Eliminar etiqueta del sistema"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm({ show: false, tag: null })}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>⚠️ Eliminar Etiqueta</h3>
            </div>
            <div className="delete-modal-body">
              <p>¿Eliminar la etiqueta <strong>"{deleteConfirm.tag}"</strong> de todas las incidencias?</p>
              <p className="delete-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-cancel-delete"
                onClick={() => setDeleteConfirm({ show: false, tag: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDeleteGlobally}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tags-list">
        {tags.length === 0 ? (
          <p className="no-tags">No hay etiquetas. Añade una para organizar mejor esta incidencia.</p>
        ) : (
          <div className="tags-container">
            {tags.map(tag => (
              <div key={tag} className="tag-item">
                <span className="tag-name">{tag}</span>
                <button
                  className="btn-remove-tag"
                  onClick={() => onRemoveTag(incidentId, tag)}
                  title="Eliminar etiqueta"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
