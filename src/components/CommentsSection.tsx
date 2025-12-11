import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Comment } from '../types';
import './CommentsSection.css';

interface CommentsSectionProps {
  incidentId: string;
  comments: Comment[];
  onAddComment: (incidentId: string, author: string, text: string) => void;
  onDeleteComment: (incidentId: string, commentId: string) => void;
  onUpdateComment?: (incidentId: string, commentId: string, author: string, text: string) => void;
}

export function CommentsSection({ incidentId, comments, onAddComment, onDeleteComment, onUpdateComment }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const handleDelete = (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation(); // Evitar que se abra el modal al eliminar
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      onDeleteComment(incidentId, commentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && author.trim()) {
      if (editingComment && onUpdateComment) {
        onUpdateComment(incidentId, editingComment.id, author.trim(), newComment.trim());
      } else {
        onAddComment(incidentId, author.trim(), newComment.trim());
      }
      setNewComment('');
      setAuthor('');
      setShowModal(false);
      setEditingComment(null);
    }
  };

  const handleOpenModal = (comment?: Comment) => {
    if (comment) {
      setEditingComment(comment);
      setAuthor(comment.author);
      setNewComment(comment.text);
    } else {
      setEditingComment(null);
      setAuthor('');
      setNewComment('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComment(null);
    setAuthor('');
    setNewComment('');
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      {showModal && createPortal(
        <div className="comment-modal-overlay" onClick={handleCloseModal}>
          <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingComment ? '✏️ Editar Comentario' : '✍️ Nuevo Comentario'}</h2>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form className="comment-form-modal" onSubmit={handleSubmit}>
              <div className="form-group-modal">
                <label htmlFor="author">Autor</label>
                <input
                  id="author"
                  type="text"
                  placeholder="Escribe tu nombre"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="comment-author-input-modal"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group-modal">
                <label htmlFor="comment">Comentario</label>
                <textarea
                  id="comment"
                  placeholder="Escribe tu comentario aquí..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-textarea-modal"
                  rows={8}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={handleCloseModal}>
                  Cancelar
                </button>
                {editingComment && (
                  <button 
                    type="button" 
                    className="btn-delete-modal" 
                    onClick={(e) => {
                      handleDelete(e, editingComment.id);
                      handleCloseModal();
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                )}
                <button type="submit" className="btn-submit-modal">
                  {editingComment ? '💾 Guardar' : '📝 Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="comments-section">
        <div className="comments-header">
          <h3>💬 Comentarios ({comments.length})</h3>
          <button 
            className="btn-add-comment"
            onClick={() => handleOpenModal()}
            title="Añadir Comentario"
          >
            +
          </button>
        </div>

        <div className="comments-list">
        {sortedComments.length === 0 ? (
          <div className="no-comments">
            <span className="no-comments-icon">💭</span>
            <p>No hay comentarios aún. Sé el primero en comentar.</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div 
              key={comment.id} 
              className="comment-item"
              onClick={() => handleOpenModal(comment)}
            >
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-icon">👤</span>
                  <strong>{comment.author}</strong>
                </div>
                <div className="comment-header-right">
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <button
                    className="btn-delete-comment"
                    onClick={(e) => handleDelete(e, comment.id)}
                    title="Eliminar comentario"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </>
  );
}
