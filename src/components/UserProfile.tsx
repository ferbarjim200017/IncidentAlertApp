import { useState, useEffect } from 'react';
import { User, Role } from '../types';
import * as firebaseService from '../firebaseService';
import './UserProfile.css';

interface UserProfileProps {
  currentUser: User;
  onUpdate: () => void;
}

export function UserProfile({ currentUser, onUpdate }: UserProfileProps) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email || '',
    password: '',
    confirmPassword: '',
    avatar: currentUser.avatar || '👤'
  });
  const [role, setRole] = useState<Role | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      if (currentUser.roleId) {
        const userRole = await firebaseService.getRoleById(currentUser.roleId);
        setRole(userRole);
      }
    };
    loadRole();
  }, [currentUser.roleId]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification('error', 'El nombre es obligatorio');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      showNotification('error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      const updates: Partial<User> = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      };

      if (formData.password) {
        updates.password = formData.password;
      }

      await firebaseService.updateUser(currentUser.id, updates);
      showNotification('success', 'Perfil actualizado correctamente');
      onUpdate();
      
      // Limpiar campos de contraseña
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Error al actualizar el perfil');
    }
  };

  const avatarOptions = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️'];

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>👤 Mi Perfil</h2>
        <p className="profile-description">Administra tu información personal</p>
      </div>

      {notification && (
        <div className={`profile-notification profile-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-info-card">
          <h3>Información de la cuenta</h3>
          <div className="info-row">
            <span className="info-label">Usuario:</span>
            <span className="info-value">{currentUser.username}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rol:</span>
            <span className="info-value">{role?.name || 'Sin rol'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Fecha de creación:</span>
            <span className="info-value">
              {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <h3>Editar información</h3>

          <div className="form-group">
            <label htmlFor="avatar">Avatar</label>
            <div className="avatar-selector">
              {avatarOptions.map(av => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-option ${formData.avatar === av ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, avatar: av })}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre completo *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-divider">
            <h4>Cambiar contraseña (opcional)</h4>
          </div>

          <div className="form-group">
            <label htmlFor="password">Nueva contraseña</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirmar nueva contraseña"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              💾 Guardar cambios
            </button>
          </div>
        </form>

        {role && (
          <div className="profile-permissions-card">
            <h3>🔐 Permisos de tu rol</h3>
            <div className="permissions-grid">
              <div className="permission-category">
                <h4>📝 Incidencias</h4>
                <ul>
                  <li className={role.permissions.incidents.create ? 'allowed' : 'denied'}>
                    {role.permissions.incidents.create ? '✓' : '✗'} Crear
                  </li>
                  <li className={role.permissions.incidents.update ? 'allowed' : 'denied'}>
                    {role.permissions.incidents.update ? '✓' : '✗'} Editar
                  </li>
                  <li className={role.permissions.incidents.delete ? 'allowed' : 'denied'}>
                    {role.permissions.incidents.delete ? '✓' : '✗'} Eliminar
                  </li>
                  <li className={role.permissions.incidents.viewAll ? 'allowed' : 'denied'}>
                    {role.permissions.incidents.viewAll ? '✓' : '✗'} Ver todas
                  </li>
                </ul>
              </div>
              <div className="permission-category">
                <h4>👥 Usuarios</h4>
                <ul>
                  <li className={role.permissions.users.viewOwn ? 'allowed' : 'denied'}>
                    {role.permissions.users.viewOwn ? '✓' : '✗'} Ver propio
                  </li>
                  <li className={role.permissions.users.editOwn ? 'allowed' : 'denied'}>
                    {role.permissions.users.editOwn ? '✓' : '✗'} Editar propio
                  </li>
                  <li className={role.permissions.users.viewAll ? 'allowed' : 'denied'}>
                    {role.permissions.users.viewAll ? '✓' : '✗'} Ver todos
                  </li>
                  <li className={role.permissions.users.edit ? 'allowed' : 'denied'}>
                    {role.permissions.users.edit ? '✓' : '✗'} Editar otros
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
