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
  setDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Incident, User, Comment, TimeEntry, AutomationRule, Tag } from './types';

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

// ============ COMMENTS ============
export const getCommentsByIncident = async (incidentId: string): Promise<Comment[]> => {
  const q = query(collection(db, 'comments'), where('incidentId', '==', incidentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Comment));
};

export const addComment = async (comment: Omit<Comment, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...comment,
    timestamp: comment.timestamp || new Date().toISOString()
  });
  return docRef.id;
};

export const deleteComment = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'comments', id));
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

// ============ INITIALIZE DEFAULT DATA ============
export const initializeDefaultData = async () => {
  // Verificar si ya hay usuarios
  const users = await getUsers();
  if (users.length === 0) {
    // Crear usuario admin por defecto
    await addUser({
      username: 'admin',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin',
      avatar: '👤',
      email: 'admin@incidentalert.com'
    });
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
};
