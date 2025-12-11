import { useState, useEffect } from 'react';
import { Incident, AutomationRule, User } from './types';
import { storageUtils } from './storageUtils';
import { authUtils } from './authUtils';
import * as firebaseService from './firebaseService';
import { IncidentForm } from './components/IncidentForm';
import { IncidentList } from './components/IncidentList';
import { IncidentEdit } from './components/IncidentEdit';
import { IncidentChart } from './components/IncidentChart';
import { IncidentStats } from './components/IncidentStats';
import { QuickIncidentsList } from './components/QuickIncidentsList';
import { MetricsDashboard } from './components/MetricsDashboard';
import { YearlyChart } from './components/YearlyChart';
import { AlertsBanner } from './components/AlertsBanner';
import { Logo } from './components/Logo';
import { IncidentDetail } from './components/IncidentDetail';
import { Tabs } from './components/Tabs';
import { AllIncidentsTable } from './components/AllIncidentsTable';
import { AutomationRules } from './components/AutomationRules';
import { UserManagement } from './components/UserManagement';
import { AppearanceSettings } from './components/AppearanceSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { Login } from './components/Login';
import { themes } from './components/AppearanceSettings';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-incidents' | 'new-incident' | 'incident-detail' | 'settings'>('dashboard');
  const [settingsSection, setSettingsSection] = useState<'automation' | 'users' | 'appearance' | 'general'>('automation');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('app_theme') || 'purple-gradient';
  });
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; incidentId?: string } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  // Filtrar incidencias del usuario actual
  const incidents = currentUser ? allIncidents.filter(inc => inc.userId === currentUser.id) : [];

  const handleTabChange = (tab: 'dashboard' | 'all-incidents' | 'new-incident' | 'incident-detail' | 'settings') => {
    try {
      console.log('Changing tab to:', tab);
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
      }, 100);
    } catch (error) {
      console.error('Error changing tab:', error);
      setIsTransitioning(false);
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setIsTransitioning(true);
    setTimeout(() => {
      // Añadir a pestañas abiertas si no está
      if (!openIncidents.find(inc => inc.id === incident.id)) {
        setOpenIncidents([...openIncidents, incident]);
      }
      setSelectedIncident(incident);
      setActiveTab('incident-detail');
      setIsTransitioning(false);
    }, 100);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Inicializar datos por defecto en Firebase
        await firebaseService.initializeDefaultData();
        
        // Verificar si hay usuario autenticado
        const user = authUtils.getCurrentUser();
        setCurrentUser(user);
        
        // Cargar reglas de automatización
        const loadedRules = await firebaseService.getAutomationRules();
        setAutomationRules(loadedRules);

        // Verificar si hay un ID de incidencia en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const incidentId = urlParams.get('incident');
        if (incidentId) {
          const incident = await firebaseService.getIncidentById(incidentId);
          if (incident) {
            setSelectedIncident(incident);
            setActiveTab('incident-detail');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({ type: 'error', message: 'Error al cargar los datos. Verifica la conexión.' });
      }
    };
    
    loadData();
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = firebaseService.subscribeToIncidents((incidents) => {
      console.log('Incidencias actualizadas en tiempo real:', incidents);
      setAllIncidents(incidents);
      
      // Actualizar incidente seleccionado si está abierto
      if (selectedIncident) {
        const updated = incidents.find(inc => inc.id === selectedIncident.id);
        if (updated) {
          setSelectedIncident(updated);
        }
      }
    });
    
    return () => {
      // Cleanup: desuscribirse cuando el componente se desmonte
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddIncident = async (incident: Incident) => {
    try {
      // Asignar userId del usuario actual
      const incidentWithUser = { ...incident, userId: currentUser!.id };
      
      // Aplicar reglas de automatización al crear
      const processedIncident = storageUtils.applyAutomationRules(incidentWithUser, 'on-create');
      
      // Guardar en Firebase (el listener actualizará automáticamente)
      await firebaseService.addIncident(processedIncident);
      
      setNotification({
        type: 'success',
        message: `✓ Incidencia "${incident.name}" creada correctamente`,
        incidentId: incident.id,
      });
    } catch (error) {
      console.error('Error adding incident:', error);
      setNotification({
        type: 'error',
        message: 'Error al crear la incidencia. Intenta nuevamente.',
      });
    }
  };

  const handleUpdateIncident = async (incident: Incident) => {
    console.log('handleUpdateIncident llamado con:', incident);
    
    try {
      // Actualizar en Firebase (el listener actualizará automáticamente el estado)
      await firebaseService.updateIncident(incident.id, incident);
      
      setEditingIncident(null);
      
      // Mostrar notificación de éxito
      console.log('Mostrando notificación');
      setNotification({
        type: 'success',
        message: `✓ Incidencia "${incident.name}" actualizada correctamente`,
        incidentId: incident.id,
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      setNotification({
        type: 'error',
        message: 'Error al actualizar la incidencia.',
      });
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      // Eliminar de Firebase (el listener actualizará automáticamente)
      await firebaseService.deleteIncident(id);
      
      // Remover de pestañas abiertas si está
      setOpenIncidents(openIncidents.filter(inc => inc.id !== id));
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
        setActiveTab('all-incidents');
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
      setNotification({
        type: 'error',
        message: 'Error al eliminar la incidencia.',
      });
    }
  };

  const handleSelectIncidentTab = (incidentId: string) => {
    const incident = openIncidents.find(inc => inc.id === incidentId);
    if (incident) {
      setSelectedIncident(incident);
      setActiveTab('incident-detail');
    }
  };

  const handleCloseIncidentTab = (incidentId: string) => {
    setOpenIncidents(openIncidents.filter(inc => inc.id !== incidentId));
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(null);
      setActiveTab('all-incidents');
    }
  };

  const handleAddComment = async (incidentId: string, author: string, text: string) => {
    try {
      // Crear comentario
      const comment = {
        incidentId,
        author,
        text,
        timestamp: new Date().toISOString()
      };
      
      // Guardar en Firebase (el listener actualizará automáticamente)
      await firebaseService.addComment(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = (incidentId: string, commentId: string) => {
    const updated = storageUtils.deleteComment(incidentId, commentId);
    setAllIncidents(updated);
    
    // Actualizar el incidente seleccionado si está abierto
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const handleAddTag = (incidentId: string, tag: string) => {
    const updated = storageUtils.addTag(incidentId, tag);
    setAllIncidents(updated);
    
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const handleRemoveTag = (incidentId: string, tag: string) => {
    const updated = storageUtils.removeTag(incidentId, tag);
    setAllIncidents(updated);
    
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const getAllAvailableTags = () => {
    return storageUtils.getAllTags();
  };

  const handleDeleteTagGlobally = (tag: string) => {
    const updated = storageUtils.deleteTagFromAllIncidents(tag);
    setAllIncidents(updated);
    
    if (selectedIncident) {
      const updatedIncident = updated.find(inc => inc.id === selectedIncident.id);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
    
    setNotification({
      type: 'success',
      message: `✓ Etiqueta "${tag}" eliminada de todas las incidencias`,
    });
  };

  const handleAddPR = (incidentId: string, type: 'qa2' | 'main', link: string, description: string) => {
    const updated = storageUtils.addPR(incidentId, type, link, description);
    setAllIncidents(updated);
    
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const handleRemovePR = (incidentId: string, type: 'qa2' | 'main', prId: string) => {
    const updated = storageUtils.removePR(incidentId, type, prId);
    setAllIncidents(updated);
    
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const handleUpdatePR = (incidentId: string, type: 'qa2' | 'main', prId: string, link: string, description: string) => {
    const updated = storageUtils.updatePR(incidentId, type, prId, link, description);
    setAllIncidents(updated);
    
    if (selectedIncident && selectedIncident.id === incidentId) {
      const updatedIncident = updated.find(inc => inc.id === incidentId);
      if (updatedIncident) {
        setSelectedIncident(updatedIncident);
      }
    }
  };

  const handleAddAutomationRule = (rule: Omit<AutomationRule, 'id' | 'createdAt'>) => {
    const updated = storageUtils.addAutomationRule(rule);
    setAutomationRules(updated);
  };

  const handleUpdateAutomationRule = (ruleId: string, updates: Partial<AutomationRule>) => {
    const updated = storageUtils.updateAutomationRule(ruleId, updates);
    setAutomationRules(updated);
  };

  const handleDeleteAutomationRule = (ruleId: string) => {
    const updated = storageUtils.deleteAutomationRule(ruleId);
    setAutomationRules(updated);
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app_theme', themeId);
    
    // Aplicar el tema al documento
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--app-background', theme.gradient);
    }
  };

  // Aplicar tema al cargar
  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      document.documentElement.style.setProperty('--app-background', theme.gradient);
    }
  }, [currentTheme]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authUtils.logout();
    setCurrentUser(null);
    setSelectedIncident(null);
    setOpenIncidents([]);
    setActiveTab('dashboard');
  };

  // Si no hay usuario autenticado, mostrar login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <Logo />
        </div>
        <div className="app-header-actions">
          <div className="user-info">
            <span className="user-name">👤 {currentUser.name}</span>
            <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
              🚪 Salir
            </button>
          </div>
          <div className="app-header-badge" onClick={() => setShowAlerts(!showAlerts)}>
            <span className="badge-icon">🔔</span>
            <span className="badge-text">Alertas</span>
            {incidents.filter(inc => inc.priority === 'crítica' && inc.status !== 'resuelta' && inc.status !== 'cerrada').length > 0 && (
              <span className="alerts-count">{incidents.filter(inc => inc.priority === 'crítica' && inc.status !== 'resuelta' && inc.status !== 'cerrada').length}</span>
            )}
          </div>
          <div className="app-header-badge" onClick={() => handleTabChange('settings')}>
            <span className="badge-icon">⚙️</span>
            <span className="badge-text">Ajustes</span>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`notification-banner notification-${notification.type}`}>
          <span>{notification.message}</span>
          <div className="notification-actions">
            {notification.type === 'success' && notification.incidentId && (
              <button
                className="notification-view"
                onClick={() => {
                  const incident = incidents.find(inc => inc.id === notification.incidentId);
                  if (incident) {
                    setSelectedIncident(incident);
                    setActiveTab('incident-detail');
                  }
                  setNotification(null);
                }}
                aria-label="Ver incidencia"
              >
                👁 Ver
              </button>
            )}
            <button
              className="notification-close"
              onClick={() => setNotification(null)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Tabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        openIncidents={openIncidents.map(inc => ({ id: inc.id, name: inc.name }))}
        selectedIncidentId={selectedIncident?.id}
        onSelectIncident={handleSelectIncidentTab}
        onCloseIncident={handleCloseIncidentTab}
      />

      {showAlerts && (
        <div className="alerts-modal">
          <div className="alerts-modal-content">
            <div className="alerts-modal-header">
              <h3>🔔 Alertas</h3>
              <button className="alerts-modal-close" onClick={() => setShowAlerts(false)}>✕</button>
            </div>
            <AlertsBanner 
              incidents={incidents}
              onViewIncident={(incident) => {
                handleViewIncident(incident);
                setShowAlerts(false);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <main className="app-main dashboard-transition">
          <div className="app-content">
            <div className="form-section">
              <MetricsDashboard incidents={incidents} />
              <QuickIncidentsList 
                incidents={incidents}
                onViewDetail={handleViewIncident}
              />
            </div>

            <div className="list-section">
              <IncidentChart 
                incidents={incidents} 
                onStatusClick={setSelectedStatus}
                onNavigateToList={() => setActiveTab('all-incidents')}
              />
              <YearlyChart incidents={incidents} />
              <IncidentStats incidents={incidents} />
            </div>
          </div>
        </main>
      ) : activeTab === 'new-incident' ? (
        <main className="app-main page-transition-enter">
          <div className="new-incident-section">
            <div className="form-section-centered">
              <IncidentForm onAdd={handleAddIncident} />
            </div>
          </div>
        </main>
      ) : activeTab === 'incident-detail' && selectedIncident ? (
        <main className="incident-detail-main">
          <IncidentDetail
            incident={selectedIncident}
            onUpdate={handleUpdateIncident}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onDelete={handleDeleteIncident}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onDeleteTagGlobally={handleDeleteTagGlobally}
            allAvailableTags={getAllAvailableTags()}
            onAddPR={handleAddPR}
            onRemovePR={handleRemovePR}
            onUpdatePR={handleUpdatePR}
            onBack={() => {
              setSelectedIncident(null);
              setActiveTab('all-incidents');
            }}
          />
        </main>
      ) : activeTab === 'settings' ? (
        <main className="app-main page-transition-enter">
          <div className="settings-container">
            <div className="settings-sidebar">
              <h2>⚙️ Ajustes</h2>
              <div className="settings-menu">
                <button
                  className={`settings-menu-item ${settingsSection === 'automation' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('automation')}
                >
                  <span className="menu-icon">🤖</span>
                  <span>Automatización</span>
                </button>
                {currentUser && currentUser.username === 'admin' && (
                  <button
                    className={`settings-menu-item ${settingsSection === 'users' ? 'active' : ''}`}
                    onClick={() => setSettingsSection('users')}
                  >
                    <span className="menu-icon">👥</span>
                    <span>Usuarios</span>
                  </button>
                )}
                <button
                  className={`settings-menu-item ${settingsSection === 'appearance' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('appearance')}
                >
                  <span className="menu-icon">🎨</span>
                  <span>Apariencia</span>
                </button>
                <button
                  className={`settings-menu-item ${settingsSection === 'general' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('general')}
                >
                  <span className="menu-icon">🔧</span>
                  <span>General</span>
                </button>
              </div>
            </div>
            <div className="settings-content">
              {settingsSection === 'automation' ? (
                <AutomationRules
                  rules={automationRules}
                  onAddRule={handleAddAutomationRule}
                  onUpdateRule={handleUpdateAutomationRule}
                  onDeleteRule={handleDeleteAutomationRule}
                />
              ) : settingsSection === 'users' && currentUser && currentUser.username === 'admin' ? (
                <UserManagement currentUser={currentUser} />
              ) : settingsSection === 'appearance' ? (
                <AppearanceSettings 
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                />
              ) : settingsSection === 'general' ? (
                <GeneralSettings />
              ) : null}
            </div>
          </div>
        </main>
      ) : (
        <main className="app-main page-transition-enter">
          <div className="all-incidents-section">
            <AllIncidentsTable
              incidents={incidents}
              onEdit={setEditingIncident}
              onDelete={handleDeleteIncident}
              onViewDetail={handleViewIncident}
              onNewIncident={() => handleTabChange('new-incident')}
              selectedStatus={selectedStatus}
              onClearFilter={() => setSelectedStatus(null)}
            />
          </div>
        </main>
      )}

      {editingIncident && (
        <IncidentEdit
          incident={editingIncident}
          onSave={handleUpdateIncident}
          onCancel={() => setEditingIncident(null)}
        />
      )}
    </div>
  );
}

export default App;
