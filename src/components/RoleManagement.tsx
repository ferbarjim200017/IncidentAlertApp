import React, { useState, useEffect } from 'react';
import { Role, RolePermissions } from '../types';
import * as firebaseService from '../firebaseService';
import './RoleManagement.css';

interface RoleManagementProps {
  currentUser: any;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ currentUser }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: {
      incidents: { create: false, read: true, update: false, delete: false, viewAll: false },
      users: { viewOwn: true, editOwn: true, viewAll: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, edit: false },
      automation: { view: false, create: false, edit: false, delete: false }
    } as RolePermissions
  });

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToRoles((updatedRoles) => {
      setRoles(updatedRoles);
    });

    return () => unsubscribe();
  }, []);

  // Cargar rol del usuario actual
  useEffect(() => {
    const loadUserRole = async () => {
      if (currentUser?.roleId) {
        const role = await firebaseService.getRoleById(currentUser.roleId);
        setUserRole(role);
      }
    };
    loadUserRole();
  }, [currentUser]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenModal = (role?: Role) => {
    // Verificar permisos
    if (!userRole?.permissions.roles.edit && role) {
      showNotification('error', 'No tienes permisos para editar roles');
      return;
    }
    if (!userRole?.permissions.roles.create && !role) {
      showNotification('error', 'No tienes permisos para crear roles');
      return;
    }

    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        permissions: { ...role.permissions }
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        permissions: {
          incidents: { create: false, read: true, update: false, delete: false, viewAll: false },
          users: { viewOwn: true, editOwn: true, viewAll: false, create: false, edit: false, delete: false },
          roles: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, edit: false },
          automation: { view: false, create: false, edit: false, delete: false }
        }
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (category: keyof RolePermissions, permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [permission]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification('error', 'El nombre del rol es obligatorio');
      return;
    }

    try {
      if (editingRole) {
        await firebaseService.updateRole(editingRole.id, {
          name: formData.name,
          permissions: formData.permissions
        });
        showNotification('success', 'Rol actualizado correctamente');
      } else {
        await firebaseService.addRole({
          name: formData.name,
          permissions: formData.permissions,
          isSystem: false,
          createdAt: new Date().toISOString()
        });
        showNotification('success', 'Rol creado correctamente');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      showNotification('error', 'Error al guardar el rol');
    }
  };

  const handleDelete = async (role: Role) => {
    // Verificar permisos
    if (!userRole?.permissions.roles.delete) {
      showNotification('error', 'No tienes permisos para eliminar roles');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) {
      return;
    }

    try {
      await firebaseService.deleteRole(role.id);
      showNotification('success', 'Rol eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      showNotification('error', 'Error al eliminar el rol');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionsSummary = (permissions: RolePermissions): string => {
    const summary: string[] = [];
    
    if (permissions.incidents.create && permissions.incidents.update && permissions.incidents.delete) {
      summary.push('Incidencias: Completo');
    } else if (permissions.incidents.read) {
      summary.push('Incidencias: Lectura');
    }

    if (permissions.users.viewAll && permissions.users.create && permissions.users.edit && permissions.users.delete) {
      summary.push('Usuarios: Completo');
    } else if (permissions.users.viewOwn) {
      summary.push('Usuarios: Propio');
    }

    if (permissions.roles.create && permissions.roles.edit && permissions.roles.delete) {
      summary.push('Roles: Completo');
    }

    if (permissions.settings.edit) {
      summary.push('Configuración: Edición');
    } else if (permissions.settings.view) {
      summary.push('Configuración: Vista');
    }

    if (permissions.automation.create && permissions.automation.edit && permissions.automation.delete) {
      summary.push('Automatización: Completo');
    }

    return summary.join(' • ') || 'Sin permisos especiales';
  };

  return (
    <div className="role-management">
      <div className="role-header">
        <div>
          <h2>Gestión de Roles</h2>
          <p className="role-description">Crea y administra roles con permisos personalizados</p>
        </div>
        <button className="btn-create-role" onClick={() => handleOpenModal()}>
          + Crear Rol
        </button>
      </div>

      {notification && (
        <div className={`role-notification role-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="role-search">
        <input
          type="text"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="roles-grid">
        {filteredRoles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-card-header">
              <h3>{role.name}</h3>
              {role.isSystem && <span className="system-badge">Sistema</span>}
            </div>
            <p className="role-summary">{getPermissionsSummary(role.permissions)}</p>
            <div className="role-card-actions">
              <button
                className="btn-edit"
                onClick={() => handleOpenModal(role)}
              >
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(role)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRole ? 'Editar Rol' : 'Crear Rol'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Rol *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Editor, Supervisor, etc."
                  required
                />
              </div>

              <div className="permissions-section">
                <h3>Permisos</h3>

                {/* Incidencias */}
                <div className="permission-group">
                  <h4>📋 Incidencias</h4>
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.incidents.create}
                        onChange={(e) => handlePermissionChange('incidents', 'create', e.target.checked)}
                      />
                      Crear
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.incidents.read}
                        onChange={(e) => handlePermissionChange('incidents', 'read', e.target.checked)}
                      />
                      Leer
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.incidents.update}
                        onChange={(e) => handlePermissionChange('incidents', 'update', e.target.checked)}
                      />
                      Actualizar
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.incidents.delete}
                        onChange={(e) => handlePermissionChange('incidents', 'delete', e.target.checked)}
                      />
                      Eliminar
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.incidents.viewAll}
                        onChange={(e) => handlePermissionChange('incidents', 'viewAll', e.target.checked)}
                      />
                      Ver Todas
                    </label>
                  </div>
                </div>

                {/* Usuarios */}
                <div className="permission-group">
                  <h4>👤 Usuarios</h4>
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.viewOwn}
                        onChange={(e) => handlePermissionChange('users', 'viewOwn', e.target.checked)}
                      />
                      Ver Propio
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.editOwn}
                        onChange={(e) => handlePermissionChange('users', 'editOwn', e.target.checked)}
                      />
                      Editar Propio
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.viewAll}
                        onChange={(e) => handlePermissionChange('users', 'viewAll', e.target.checked)}
                      />
                      Ver Todos
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.create}
                        onChange={(e) => handlePermissionChange('users', 'create', e.target.checked)}
                      />
                      Crear
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.edit}
                        onChange={(e) => handlePermissionChange('users', 'edit', e.target.checked)}
                      />
                      Editar
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.users.delete}
                        onChange={(e) => handlePermissionChange('users', 'delete', e.target.checked)}
                      />
                      Eliminar
                    </label>
                  </div>
                </div>

                {/* Roles */}
                <div className="permission-group">
                  <h4>🔐 Roles</h4>
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.roles.view}
                        onChange={(e) => handlePermissionChange('roles', 'view', e.target.checked)}
                      />
                      Ver
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.roles.create}
                        onChange={(e) => handlePermissionChange('roles', 'create', e.target.checked)}
                      />
                      Crear
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.roles.edit}
                        onChange={(e) => handlePermissionChange('roles', 'edit', e.target.checked)}
                      />
                      Editar
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.roles.delete}
                        onChange={(e) => handlePermissionChange('roles', 'delete', e.target.checked)}
                      />
                      Eliminar
                    </label>
                  </div>
                </div>

                {/* Configuración */}
                <div className="permission-group">
                  <h4>⚙️ Configuración</h4>
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.settings.view}
                        onChange={(e) => handlePermissionChange('settings', 'view', e.target.checked)}
                      />
                      Ver
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.settings.edit}
                        onChange={(e) => handlePermissionChange('settings', 'edit', e.target.checked)}
                      />
                      Editar
                    </label>
                  </div>
                </div>

                {/* Automatización */}
                <div className="permission-group">
                  <h4>🤖 Automatización</h4>
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.automation.view}
                        onChange={(e) => handlePermissionChange('automation', 'view', e.target.checked)}
                      />
                      Ver
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.automation.create}
                        onChange={(e) => handlePermissionChange('automation', 'create', e.target.checked)}
                      />
                      Crear
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.automation.edit}
                        onChange={(e) => handlePermissionChange('automation', 'edit', e.target.checked)}
                      />
                      Editar
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permissions.automation.delete}
                        onChange={(e) => handlePermissionChange('automation', 'delete', e.target.checked)}
                      />
                      Eliminar
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
