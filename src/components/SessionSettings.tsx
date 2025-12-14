import { User } from '../types';
import './SessionSettings.css';

interface SessionSettingsProps {
  currentUser: User;
  onLogout: () => void;
  onChangeUser: () => void;
}

export function SessionSettings({ currentUser, onLogout, onChangeUser }: SessionSettingsProps) {
  return (
    <div className="session-settings">
      <div className="settings-header">
        <h2>🔐 Sesión</h2>
      </div>

      <div className="session-content">
        <div className="session-info-card">
          <div className="session-info-header">
            <div className="user-avatar-large">{currentUser.avatar || '👤'}</div>
            <div className="user-details">
              <h3>{currentUser.name}</h3>
              <p className="user-username">@{currentUser.username}</p>
            </div>
          </div>
          
          <div className="session-info-body">
            <div className="info-row">
              <span className="info-label">👤 Usuario:</span>
              <span className="info-value">{currentUser.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🏷️ Nombre:</span>
              <span className="info-value">{currentUser.name}</span>
            </div>
            {currentUser.createdAt && (
              <div className="info-row">
                <span className="info-label">📅 Cuenta creada:</span>
                <span className="info-value">
                  {new Date(currentUser.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="session-actions-card">
          <h3>Acciones de Sesión</h3>
          
          <button 
            className="session-action-btn change-user"
            onClick={onChangeUser}
          >
            <span className="btn-icon">🔄</span>
            <div className="btn-content">
              <span className="btn-title">Cambiar de Usuario</span>
              <span className="btn-description">Cerrar esta sesión e iniciar con otra cuenta</span>
            </div>
          </button>

          <button 
            className="session-action-btn logout"
            onClick={onLogout}
          >
            <span className="btn-icon">🚪</span>
            <div className="btn-content">
              <span className="btn-title">Cerrar Sesión</span>
              <span className="btn-description">Salir de la aplicación</span>
            </div>
          </button>
        </div>

        <div className="session-warning">
          <p>⚠️ Al cambiar de usuario o cerrar sesión, se perderán los datos no guardados.</p>
        </div>
      </div>
    </div>
  );
}
