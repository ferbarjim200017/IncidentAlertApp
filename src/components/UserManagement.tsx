import { useState, useEffect } from 'react';
import { User } from '../types';
import { authUtils } from '../authUtils';
import * as firebaseService from '../firebaseService';
import './UserManagement.css';

interface UserManagementProps {
  currentUser: User;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Suscribirse a cambios en usuarios en tiempo real
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToUsers((updatedUsers) => {
      console.log('Usuarios actualizados en tiempo real:', updatedUsers);
      setUsers(updatedUsers);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '' });
    setShowCreateForm(false);
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      showNotification('error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await firebaseService.getUserByUsername(formData.username.toLowerCase());
      if (existingUser) {
        showNotification('error', 'Ya existe un usuario con ese nombre');
        return;
      }

      // Crear usuario en Firebase
      await firebaseService.addUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        createdAt: new Date().toISOString()
      });
      
      showNotification('success', `Usuario "${formData.username}" creado correctamente`);
      resetForm();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      showNotification('error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      // Actualizar usuario en Firebase
      await firebaseService.updateUser(editingUser.id, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
      });
      
      showNotification('success', `Usuario "${formData.username}" actualizado correctamente`);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al actualizar usuario');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
    });
    setShowCreateForm(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser.id) {
      showNotification('error', 'No puedes eliminar tu propio usuario');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.username}"?`)) {
      return;
    }

    try {
      // Eliminar usuario de Firebase
      await firebaseService.deleteUser(user.id);
      showNotification('success', `Usuario "${user.username}" eliminado correctamente`);
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', error instanceof Error ? error.message : 'Error al eliminar usuario');
    }
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3>👥 Gestión de Usuarios</h3>
        {!showCreateForm && (
          <button 
            className="btn-create-user"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Crear Usuario
          </button>
        )}
      </div>

      {notification && (
        <div className={`user-notification user-notification-${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠️'} {notification.message}
        </div>
      )}

      {showCreateForm && (
        <div className="user-form-container">
          <form className="user-form" onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
            <h4>{editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h4>
            
            <div className="user-form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nombre de usuario"
                disabled={!!editingUser}
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo del usuario"
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Nueva contraseña" : "Contraseña"}
                />
                <label className="show-password-toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <span>Mostrar contraseña</span>
                </label>
              </div>
            </div>

            <div className="user-form-actions">
              <button type="submit" className="btn-submit" style={{ flex: '1 1 0', minWidth: 0, width: 'auto' }}>
                {editingUser ? '💾 Guardar Cambios' : '➕ Crear Usuario'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm} style={{ flex: '1 1 0', minWidth: 0, width: 'auto' }}>
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-list">
        <h4>📋 Usuarios Registrados ({users.length})</h4>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.id === currentUser.id ? 'current-user' : ''}>
                  <td>
                    <span className="user-username">
                      {user.username}
                      {user.id === currentUser.id && <span className="badge-current"> (Tú)</span>}
                    </span>
                  </td>
                  <td>{user.name}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.id === currentUser.id}
                        title={user.id === currentUser.id ? "No puedes eliminar tu propio usuario" : "Eliminar usuario"}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
