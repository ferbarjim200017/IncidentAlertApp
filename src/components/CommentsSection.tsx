import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Comment } from '../types';
import './CommentsSection.css';

interface CommentsSectionProps {
  incidentId: string;
  comments: Comment[];
  onAddComment: (incidentId: string, author: string, text: string) => void;
  onDeleteComment: (incidentId: string, commentId: string) => void;
}

export function CommentsSection({ incidentId, comments, onAddComment, onDeleteComment }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleDelete = (commentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      onDeleteComment(incidentId, commentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && author.trim()) {
      onAddComment(incidentId, author.trim(), newComment.trim());
      setNewComment('');
      setAuthor('');
      setShowModal(false);
    }
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      {showModal && createPortal(
        <div className="comment-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✍️ Nuevo Comentario</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form className="comment-form-modal" onSubmit={handleSubmit}>
              <div className="form-group-modal">
                <label htmlFor="author">Tu nombre</label>
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
                <button type="button" className="btn-cancel-modal" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  📝 Publicar Comentario
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
            onClick={() => setShowModal(true)}
          >
            + Añadir Comentario
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
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-icon">👤</span>
                  <strong>{comment.author}</strong>
                </div>
                <div className="comment-header-right">
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    className="btn-delete-comment"
                    onClick={() => handleDelete(comment.id)}
                    title="Eliminar comentario"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="comment-text">
                {comment.text}
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </>
  );
}
