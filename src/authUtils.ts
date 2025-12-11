import { User } from './types';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

export const authUtils = {
  // Obtener todos los usuarios
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Guardar usuarios
  saveUsers: (users: User[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Crear un nuevo usuario
  createUser: (username: string, password: string, name: string): User => {
    const users = authUtils.getUsers();
    
    // Verificar si el usuario ya existe
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('El usuario ya existe');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      password: password, // En producción, esto debería estar hasheado
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    authUtils.saveUsers(users);
    return newUser;
  },

  // Iniciar sesión
  login: (username: string, password: string): User | null => {
    const users = authUtils.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
    // NO eliminar credenciales guardadas (saved_username, saved_password)
  },

  // Obtener usuario actual
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Verificar si hay un usuario autenticado
  isAuthenticated: (): boolean => {
    return authUtils.getCurrentUser() !== null;
  },

  // Inicializar usuario admin por defecto (llamar al inicio)
  initializeDefaultUser: (): void => {
    const users = authUtils.getUsers();
    
    // Si no hay usuarios, crear el admin por defecto
    if (users.length === 0) {
      authUtils.createUser('admin', 'admin123', 'Administrador');
    }
  },

  // Actualizar un usuario existente
  updateUser: (userId: string, updates: { username?: string; password?: string; name?: string }): User => {
    const users = authUtils.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si el nuevo username ya existe (si se está cambiando)
    if (updates.username && updates.username !== users[userIndex].username) {
      if (users.find(u => u.username.toLowerCase() === updates.username!.toLowerCase())) {
        throw new Error('El nombre de usuario ya existe');
      }
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...(updates.username && { username: updates.username.trim() }),
      ...(updates.password && { password: updates.password }),
      ...(updates.name && { name: updates.name.trim() }),
    };

    users[userIndex] = updatedUser;
    authUtils.saveUsers(users);

    // Si es el usuario actual, actualizar también la sesión
    const currentUser = authUtils.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    return updatedUser;
  },

  // Eliminar un usuario
  deleteUser: (userId: string): void => {
    const users = authUtils.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (filteredUsers.length === users.length) {
      throw new Error('Usuario no encontrado');
    }

    authUtils.saveUsers(filteredUsers);
  }
};
