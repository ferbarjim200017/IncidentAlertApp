import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
  onSnapshot,
  deleteField
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Incident, User, Comment, TimeEntry, AutomationRule, Tag, Role } from './types';

// ============ INCIDENTS ============
export const getIncidents = async (): Promise<Incident[]> => {
  const querySnapshot = await getDocs(collection(db, 'incidents'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
};

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const docRef = doc(db, 'incidents', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Incident : null;
};

export const addIncident = async (incident: Omit<Incident, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'incidents'), {
    ...incident,
    createdAt: incident.createdAt || new Date().toISOString()
  });
  return docRef.id;
};

export const updateIncident = async (id: string, incident: Partial<Incident>): Promise<void> => {
  const docRef = doc(db, 'incidents', id);
  await updateDoc(docRef, { ...incident });
};

export const deleteIncident = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'incidents', id));
};

// ============ USERS ============
export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { ...doc.data(), id: doc.id } as User;
};

export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users'), user);
  return docRef.id;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, { ...user });
};

export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', id));
};

export const updateUserPreferences = async (userId: string, preferences: any): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { preferences });
};

export const getUserPreferences = async (userId: string): Promise<any> => {
  const user = await getUsers();
  const foundUser = user.find(u => u.id === userId);
  return foundUser?.preferences || {};
};

// ============ COMMENTS ============
export const getCommentsByIncident = async (incidentId: string): Promise<Comment[]> => {
  const incident = await getIncidentById(incidentId);
  return incident?.comments || [];
};

export const addComment = async (comment: Omit<Comment, 'id'>): Promise<string> => {
  const incident = await getIncidentById(comment.incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const newComment = {
    ...comment,
    id: `comment_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  const updatedComments = [...(incident.comments || []), newComment];
  await updateIncident(comment.incidentId, { comments: updatedComments });
  
  return newComment.id;
};

export const deleteComment = async (incidentId: string, commentId: string): Promise<void> => {
  const incident = await getIncidentById(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const updatedComments = incident.comments?.filter(c => c.id !== commentId);
  await updateIncident(incidentId, { comments: updatedComments });
};

// ============ TIME ENTRIES ============
export const getTimeEntriesByIncident = async (incidentId: string): Promise<TimeEntry[]> => {
  const incident = await getIncidentById(incidentId);
  return incident?.timeTracking || [];
};

export const addTimeEntry = async (incidentId: string, entry: TimeEntry): Promise<void> => {
  const incident = await getIncidentById(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const updatedTimeTracking = [...(incident.timeTracking || []), entry];
  await updateIncident(incidentId, { timeTracking: updatedTimeTracking });
};

export const updateTimeEntry = async (incidentId: string, entryId: string, updatedEntry: Partial<TimeEntry>): Promise<void> => {
  const incident = await getIncidentById(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const updatedTimeTracking = incident.timeTracking?.map(entry => 
    entry.id === entryId ? { ...entry, ...updatedEntry } : entry
  );
  await updateIncident(incidentId, { timeTracking: updatedTimeTracking });
};

export const deleteTimeEntry = async (incidentId: string, entryId: string): Promise<void> => {
  const incident = await getIncidentById(incidentId);
  if (!incident) throw new Error('Incident not found');
  
  const updatedTimeTracking = incident.timeTracking?.filter(entry => entry.id !== entryId);
  await updateIncident(incidentId, { timeTracking: updatedTimeTracking });
};

// ============ AUTOMATION RULES ============
export const getAutomationRules = async (): Promise<AutomationRule[]> => {
  const querySnapshot = await getDocs(collection(db, 'automationRules'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AutomationRule));
};

export const addAutomationRule = async (rule: Omit<AutomationRule, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'automationRules'), rule);
  return docRef.id;
};

export const updateAutomationRule = async (id: string, rule: Partial<AutomationRule>): Promise<void> => {
  const docRef = doc(db, 'automationRules', id);
  await updateDoc(docRef, { ...rule });
};

export const deleteAutomationRule = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'automationRules', id));
};

// ============ TAGS ============
export const getTags = async (): Promise<Tag[]> => {
  const querySnapshot = await getDocs(collection(db, 'tags'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Tag));
};

export const addTag = async (tag: Omit<Tag, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'tags'), tag);
  return docRef.id;
};

export const updateTag = async (id: string, tag: Partial<Tag>): Promise<void> => {
  const docRef = doc(db, 'tags', id);
  await updateDoc(docRef, { ...tag });
};

export const deleteTag = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'tags', id));
};

// ============ SETTINGS ============
export const getSettings = async (): Promise<any> => {
  const docRef = doc(db, 'settings', 'app');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateSettings = async (settings: any): Promise<void> => {
  const docRef = doc(db, 'settings', 'app');
  await setDoc(docRef, settings, { merge: true });
};

// ============ REAL-TIME LISTENERS ============
export const subscribeToIncidents = (callback: (incidents: Incident[]) => void) => {
  return onSnapshot(collection(db, 'incidents'), (snapshot) => {
    const incidents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
    callback(incidents);
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
    callback(users);
  });
};

// ============ ROLES ============
export const getRoles = async (): Promise<Role[]> => {
  const querySnapshot = await getDocs(collection(db, 'roles'));
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Role));
};

export const getRoleById = async (id: string): Promise<Role | null> => {
  const docRef = doc(db, 'roles', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Role : null;
};

export const addRole = async (role: Omit<Role, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'roles'), {
    ...role,
    createdAt: role.createdAt || new Date().toISOString()
  });
  return docRef.id;
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<void> => {
  const docRef = doc(db, 'roles', id);
  await updateDoc(docRef, { ...role });
};

export const deleteRole = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'roles', id));
};

export const subscribeToRoles = (callback: (roles: Role[]) => void) => {
  return onSnapshot(collection(db, 'roles'), (snapshot) => {
    const roles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Role));
    callback(roles);
  });
};

// ============ INITIALIZE DEFAULT DATA ============
export const initializeDefaultData = async () => {
  // Inicializar roles por defecto
  const roles = await getRoles();
  if (roles.length === 0) {
    // Crear rol de Administrador
    const adminRoleId = await addRole({
      name: 'Administrador',
      isSystem: true,
      permissions: {
        incidents: { create: true, read: true, update: true, delete: true, viewAll: true },
        users: { viewOwn: true, editOwn: true, viewAll: true, create: true, edit: true, delete: true },
        roles: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        automation: { view: true, create: true, edit: true, delete: true }
      }
    });

    // Crear rol de Usuario estándar
    await addRole({
      name: 'Usuario',
      isSystem: true,
      permissions: {
        incidents: { create: true, read: true, update: true, delete: false, viewAll: false },
        users: { viewOwn: true, editOwn: true, viewAll: false, create: false, edit: false, delete: false },
        roles: { view: false, create: false, edit: false, delete: false },
        settings: { view: true, edit: false },
        automation: { view: false, create: false, edit: false, delete: false }
      }
    });

    // Crear rol de Solo lectura
    await addRole({
      name: 'Solo Lectura',
      isSystem: true,
      permissions: {
        incidents: { create: false, read: true, update: false, delete: false, viewAll: false },
        users: { viewOwn: true, editOwn: false, viewAll: false, create: false, edit: false, delete: false },
        roles: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, edit: false },
        automation: { view: false, create: false, edit: false, delete: false }
      }
    });

    // Verificar si ya hay usuarios
    const users = await getUsers();
    if (users.length === 0) {
      // Crear usuario admin por defecto con rol de administrador
      await addUser({
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        roleId: adminRoleId,
        avatar: '👤',
        email: 'admin@incidentalert.com'
      });
    }
  } else {
    // Si ya hay roles pero no hay usuarios
    const users = await getUsers();
    if (users.length === 0) {
      const adminRole = roles.find(r => r.name === 'Administrador');
      await addUser({
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        roleId: adminRole?.id || roles[0].id,
        avatar: '👤',
        email: 'admin@incidentalert.com'
      });
    }
  }

  // Inicializar configuración por defecto
  const settings = await getSettings();
  if (!settings) {
    await updateSettings({
      theme: 'light',
      notifications: true,
      autoAssign: false,
      language: 'es'
    });
  }

  // Migrar usuarios antiguos que tienen 'role' string a 'roleId'
  await migrateUsersToRoleId();
};

// Función para migrar usuarios del campo 'role' antiguo al nuevo 'roleId'
export const migrateUsersToRoleId = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const roles = await getRoles();
    
    // Mapear nombres de roles antiguos a IDs de roles nuevos
    const adminRole = roles.find(r => r.name === 'Administrador');
    const userRole = roles.find(r => r.name === 'Usuario');
    
    if (!adminRole || !userRole) {
      console.log('❌ Roles no encontrados para migración');
      return;
    }

    const updates: Promise<void>[] = [];
    let migratedCount = 0;
    
    snapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      
      // Si el usuario tiene el campo 'role' antiguo pero no 'roleId'
      if (userData.role && !userData.roleId) {
        migratedCount++;
        console.log(`🔄 Migrando usuario "${userData.username}" de role: "${userData.role}" a roleId`);
        
        let newRoleId = userRole.id; // Por defecto rol de usuario
        
        // Mapear roles antiguos
        if (userData.role === 'admin' || userData.username === 'admin') {
          newRoleId = adminRole.id;
          console.log(`   ➜ Asignando rol "Administrador" (${newRoleId})`);
        } else {
          console.log(`   ➜ Asignando rol "Usuario" (${newRoleId})`);
        }
        
        // Actualizar el documento sin el campo 'role' antiguo
        const userDocRef = doc(db, 'users', docSnapshot.id);
        updates.push(
          updateDoc(userDocRef, {
            roleId: newRoleId,
            role: deleteField() // Eliminar campo antiguo
          })
        );
      } else if (!userData.roleId && !userData.role) {
        // Usuario sin ningún rol, asignar rol de Usuario por defecto
        migratedCount++;
        console.log(`🔄 Usuario "${userData.username}" sin rol, asignando rol "Usuario"`);
        const userDocRef = doc(db, 'users', docSnapshot.id);
        updates.push(
          updateDoc(userDocRef, {
            roleId: userRole.id
          })
        );
      }
    });

    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`✅ Migración completada: ${migratedCount} usuarios actualizados al nuevo sistema de roles`);
    } else {
      console.log('✅ Todos los usuarios ya tienen roleId asignado');
    }
  } catch (error) {
    console.error('❌ Error en migración de usuarios:', error);
  }
};
