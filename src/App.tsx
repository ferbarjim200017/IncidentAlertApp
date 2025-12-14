import { useState, useEffect } from 'react';
import { Incident, AutomationRule, User, Report } from './types';
import { storageUtils } from './storageUtils';
import { authUtils } from './authUtils';
import * as firebaseService from './firebaseService';
import { IncidentForm } from './components/IncidentForm';
import { ReportModal } from './components/ReportModal';
import { ReportsManagement } from './components/ReportsManagement';
import { IncidentList } from './components/IncidentList';
import { IncidentEdit } from './components/IncidentEdit';
import { IncidentStats } from './components/IncidentStats';
import { QuickIncidentsList } from './components/QuickIncidentsList';
import { MetricsDashboard } from './components/MetricsDashboard';
import { IncidentChart } from './components/IncidentChart';
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
import { UserProfile } from './components/UserProfile';
import RoleManagement from './components/RoleManagement';
import MobileMenu from './components/MobileMenu';
import { SessionSettings } from './components/SessionSettings';
import QuickSearch from './components/QuickSearch';
import OnboardingTour from './components/OnboardingTour';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { themes } from './components/AppearanceSettings';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<any | null>(null);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all-incidents' | 'new-incident' | 'incident-detail' | 'settings'>('dashboard');
  const [settingsSection, setSettingsSection] = useState<'profile' | 'automation' | 'users' | 'roles' | 'appearance' | 'general' | 'reports' | 'session'>('profile');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('purple-gradient');
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; incidentId?: string } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [reports, setReports] = useState<Report[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

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
        
        // Verificar si hay usuario autenticado en localStorage
        const localUser = authUtils.getCurrentUser();
        
        if (localUser) {
          // Obtener usuario actualizado desde Firebase
          const updatedUser = await firebaseService.getUserByUsername(localUser.username);
          if (updatedUser) {
            // Actualizar usuario en localStorage con datos de Firebase
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            
            // Cargar tema del usuario desde Firebase
            const preferences = await firebaseService.getUserPreferences(updatedUser.id);
            if (preferences.theme) {
              setCurrentTheme(preferences.theme);
            }
          } else {
            // Usuario no existe en Firebase, cerrar sesión
            authUtils.logout();
            setCurrentUser(null);
          }
        }
        
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
      setSelectedIncident(prev => {
        if (prev) {
          const updated = incidents.find(inc => inc.id === prev.id);
          return updated || prev;
        }
        return prev;
      });
      
      // Actualizar incidentes abiertos en tabs
      setOpenIncidents(prev => 
        prev.map(openInc => {
          const updated = incidents.find(inc => inc.id === openInc.id);
          return updated || openInc;
        })
      );
    });
    
    return () => {
      // Cleanup: desuscribirse cuando el componente se desmonte
      unsubscribe();
    };
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: currentUser !== null,
    shortcuts: [
      {
        key: 'k',
        ctrl: true,
        callback: () => setShowQuickSearch(true),
        description: 'Búsqueda rápida'
      },
      {
        key: 'n',
        callback: () => {
          if (activeTab !== 'new-incident') {
            handleTabChange('new-incident');
          }
        },
        description: 'Nueva incidencia'
      },
      {
        key: 'e',
        callback: () => {
          if (selectedIncident && activeTab === 'incident-detail') {
            setEditingIncident(selectedIncident);
          }
        },
        description: 'Editar incidencia'
      },
      {
        key: 'Escape',
        callback: () => {
          if (showQuickSearch) setShowQuickSearch(false);
          if (editingIncident) setEditingIncident(null);
        },
        description: 'Cerrar modal'
      }
    ]
  });

  // Detector de tamaño de pantalla para responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verificar si es primera vez del usuario para onboarding
  useEffect(() => {
    if (currentUser) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${currentUser.id}`);
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    }
  }, [currentUser]);

  // Suscribirse a reportes en tiempo real
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firebaseService.subscribeToReports((updatedReports) => {
      setReports(updatedReports);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Cargar rol del usuario cuando cambie el currentUser
  useEffect(() => {
    const loadUserRole = async () => {
      if (currentUser?.roleId) {
        try {
          const role = await firebaseService.getRoleById(currentUser.roleId);
          setUserRole(role);
        } catch (error) {
          console.error('Error loading user role:', error);
        }
      } else {
        setUserRole(null);
      }
    };
    
    loadUserRole();
  }, [currentUser]);

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
      
      return processedIncident;
    } catch (error) {
      console.error('Error adding incident:', error);
      setNotification({
        type: 'error',
        message: 'Error al crear la incidencia. Intenta nuevamente.',
      });
      throw error;
    }
  };

  const handleNavigateToNewIncident = (incident: Incident) => {
    // Navegar al detalle de la incidencia recién creada
    handleViewIncident(incident);
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

  const handleUpdateComment = async (incidentId: string, commentId: string, author: string, text: string) => {
    try {
      await firebaseService.updateComment(incidentId, commentId, author, text);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (incidentId: string, commentId: string) => {
    try {
      await firebaseService.deleteComment(incidentId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddTag = async (incidentId: string, tag: string) => {
    try {
      const incident = await firebaseService.getIncidentById(incidentId);
      if (!incident) return;
      
      const currentTags = incident.tags || [];
      if (!currentTags.includes(tag)) {
        await firebaseService.updateIncident(incidentId, { 
          tags: [...currentTags, tag] 
        });
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (incidentId: string, tag: string) => {
    try {
      const incident = await firebaseService.getIncidentById(incidentId);
      if (!incident) return;
      
      const updatedTags = (incident.tags || []).filter(t => t !== tag);
      await firebaseService.updateIncident(incidentId, { tags: updatedTags });
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const handleOnboardingComplete = () => {
    if (currentUser) {
      localStorage.setItem(`onboarding_completed_${currentUser.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleSelectFromQuickSearch = (incident: Incident) => {
    handleViewIncident(incident);
  };

  const getAllAvailableTags = () => {
    const allTags = new Set<string>();
    allIncidents.forEach(incident => {
      incident.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  const handleDeleteTagGlobally = async (tag: string) => {
    try {
      const incidents = await firebaseService.getIncidents();
      for (const incident of incidents) {
        if (incident.tags?.includes(tag)) {
          const updatedTags = incident.tags.filter(t => t !== tag);
          await firebaseService.updateIncident(incident.id, { tags: updatedTags });
        }
      }
      setNotification({
        type: 'success',
        message: `✓ Etiqueta "${tag}" eliminada de todas las incidencias`,
      });
    } catch (error) {
      console.error('Error deleting tag globally:', error);
    }
  };

  const handleAddPR = async (incidentId: string, type: 'qa2' | 'main', link: string, description: string) => {
    try {
      const incident = await firebaseService.getIncidentById(incidentId);
      if (!incident) return;
      
      const newPR = {
        id: `pr_${Date.now()}`,
        link,
        description,
        createdAt: new Date().toISOString()
      };
      
      if (type === 'qa2') {
        const prQA2List = [...(incident.prQA2List || []), newPR];
        await firebaseService.updateIncident(incidentId, { prQA2List });
      } else {
        const prMainList = [...(incident.prMainList || []), newPR];
        await firebaseService.updateIncident(incidentId, { prMainList });
      }
    } catch (error) {
      console.error('Error adding PR:', error);
    }
  };

  const handleRemovePR = async (incidentId: string, type: 'qa2' | 'main', prId: string) => {
    try {
      const incident = await firebaseService.getIncidentById(incidentId);
      if (!incident) return;
      
      if (type === 'qa2') {
        const prQA2List = (incident.prQA2List || []).filter(pr => pr.id !== prId);
        await firebaseService.updateIncident(incidentId, { prQA2List });
      } else {
        const prMainList = (incident.prMainList || []).filter(pr => pr.id !== prId);
        await firebaseService.updateIncident(incidentId, { prMainList });
      }
    } catch (error) {
      console.error('Error removing PR:', error);
    }
  };

  const handleUpdatePR = async (incidentId: string, type: 'qa2' | 'main', prId: string, link: string, description: string) => {
    try {
      const incident = await firebaseService.getIncidentById(incidentId);
      if (!incident) return;
      
      if (type === 'qa2') {
        const prQA2List = (incident.prQA2List || []).map(pr => 
          pr.id === prId ? { ...pr, link, description } : pr
        );
        await firebaseService.updateIncident(incidentId, { prQA2List });
      } else {
        const prMainList = (incident.prMainList || []).map(pr => 
          pr.id === prId ? { ...pr, link, description } : pr
        );
        await firebaseService.updateIncident(incidentId, { prMainList });
      }
    } catch (error) {
      console.error('Error updating PR:', error);
    }
  };

  const handleAddAutomationRule = async (rule: Omit<AutomationRule, 'id' | 'createdAt'>) => {
    try {
      const ruleWithDate = {
        ...rule,
        createdAt: new Date().toISOString()
      };
      await firebaseService.addAutomationRule(ruleWithDate);
      const updated = await firebaseService.getAutomationRules();
      setAutomationRules(updated);
    } catch (error) {
      console.error('Error adding automation rule:', error);
    }
  };

  const handleUpdateAutomationRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    try {
      await firebaseService.updateAutomationRule(ruleId, updates);
      const updated = await firebaseService.getAutomationRules();
      setAutomationRules(updated);
    } catch (error) {
      console.error('Error updating automation rule:', error);
    }
  };

  const handleAddReport = async (report: Omit<Report, 'id' | 'createdAt'>) => {
    try {
      await firebaseService.addReport(report);
      setNotification({
        type: 'success',
        message: '✓ Reporte creado correctamente',
      });
    } catch (error) {
      console.error('Error adding report:', error);
      setNotification({
        type: 'error',
        message: 'Error al crear el reporte',
      });
    }
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<Report>) => {
    try {
      await firebaseService.updateReport(reportId, updates);
      setNotification({
        type: 'success',
        message: '✓ Reporte actualizado',
      });
    } catch (error) {
      console.error('Error updating report:', error);
      setNotification({
        type: 'error',
        message: 'Error al actualizar el reporte',
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await firebaseService.deleteReport(reportId);
      setNotification({
        type: 'success',
        message: '✓ Reporte eliminado',
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      setNotification({
        type: 'error',
        message: 'Error al eliminar el reporte',
      });
    }
  };

  const handleDeleteAutomationRule = async (ruleId: string) => {
    try {
      await firebaseService.deleteAutomationRule(ruleId);
      const updated = await firebaseService.getAutomationRules();
      setAutomationRules(updated);
    } catch (error) {
      console.error('Error deleting automation rule:', error);
    }
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

  const handleLogin = async (user: User) => {
    // Obtener usuario actualizado desde Firebase para asegurar datos correctos
    const updatedUser = await firebaseService.getUserByUsername(user.username);
    if (updatedUser) {
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    } else {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    authUtils.logout();
    setCurrentUser(null);
    setSelectedIncident(null);
    setOpenIncidents([]);
    setActiveTab('dashboard');
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setActiveTab('all-incidents');
  };

  // Si no hay usuario autenticado, mostrar login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          {isMobile && (
            <button 
              className="mobile-menu-trigger" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
          )}
          <Logo />
        </div>
        <div className="app-header-actions">
          <div className="user-info">
            <span className="user-name">👤 {currentUser.name}</span>
          </div>
          <button 
            className="app-header-badge icon-only" 
            onClick={() => setShowAlerts(!showAlerts)}
            title="Alertas"
          >
            <span className="badge-icon">🔔</span>
            {incidents.filter(inc => inc.priority === 'crítica' && inc.status !== 'resuelta' && inc.status !== 'cerrada').length > 0 && (
              <span className="alerts-count">{incidents.filter(inc => inc.priority === 'crítica' && inc.status !== 'resuelta' && inc.status !== 'cerrada').length}</span>
            )}
          </button>
          {!isMobile && (
            <button 
              className="app-header-badge icon-only" 
              onClick={() => handleTabChange('settings')}
              title="Ajustes"
            >
              <span className="badge-icon">⚙️</span>
            </button>
          )}
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
                onStatusClick={handleStatusClick}
                onNavigateToList={() => setActiveTab('all-incidents')}
              />
              <YearlyChart incidents={incidents} />
              <IncidentStats incidents={incidents} />
            </div>
          </div>
        </main>
      ) : activeTab === 'new-incident' ? (
        <main className="app-main page-transition-enter">
          <IncidentForm 
            onAdd={handleAddIncident}
            onNavigateToDetail={
              (() => {
                try {
                  const saved = localStorage.getItem('app_general_settings');
                  const settings = saved ? JSON.parse(saved) : {};
                  return settings.navigateToDetailAfterCreate ? handleNavigateToNewIncident : undefined;
                } catch {
                  return undefined;
                }
              })()
            }
          />
        </main>
      ) : activeTab === 'incident-detail' && selectedIncident ? (
        <main className="incident-detail-main">
          <IncidentDetail
            incident={selectedIncident}
            onUpdate={handleUpdateIncident}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onDelete={handleDeleteIncident}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onDeleteTagGlobally={handleDeleteTagGlobally}
            allAvailableTags={getAllAvailableTags()}
            onAddPR={handleAddPR}
            onRemovePR={handleRemovePR}
            onUpdatePR={handleUpdatePR}
            currentUserName={currentUser!.name}
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
                  className={`settings-menu-item ${settingsSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('profile')}
                >
                  <span className="menu-icon">👤</span>
                  <span>Mi Perfil</span>
                </button>
                <button
                  className={`settings-menu-item ${settingsSection === 'automation' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('automation')}
                >
                  <span className="menu-icon">🤖</span>
                  <span>Automatización</span>
                </button>
                {userRole?.permissions.users.viewAll && (
                  <button
                    className={`settings-menu-item ${settingsSection === 'users' ? 'active' : ''}`}
                    onClick={() => setSettingsSection('users')}
                  >
                    <span className="menu-icon">👥</span>
                    <span>Usuarios</span>
                  </button>
                )}
                {userRole?.permissions.roles.view && (
                  <button
                    className={`settings-menu-item ${settingsSection === 'roles' ? 'active' : ''}`}
                    onClick={() => setSettingsSection('roles')}
                  >
                    <span className="menu-icon">🔐</span>
                    <span>Roles</span>
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
                <button
                  className={`settings-menu-item ${settingsSection === 'reports' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('reports')}
                >
                  <span className="menu-icon">📋</span>
                  <span>📊 Informes</span>
                </button>
                <button
                  className={`settings-menu-item ${settingsSection === 'session' ? 'active' : ''}`}
                  onClick={() => setSettingsSection('session')}
                >
                  <span>🔐 Sesión</span>
                </button>
              </div>
            </div>
            <div className="settings-content">
              {settingsSection === 'profile' ? (
                <UserProfile 
                  currentUser={currentUser!} 
                  onUpdate={async () => {
                    // Recargar usuario desde Firebase
                    const users = await firebaseService.getUsers();
                    const updatedUser = users.find(u => u.id === currentUser!.id);
                    if (updatedUser) {
                      setCurrentUser(updatedUser);
                    }
                  }}
                />
              ) : settingsSection === 'automation' ? (
                <AutomationRules
                  rules={automationRules}
                  onAddRule={handleAddAutomationRule}
                  onUpdateRule={handleUpdateAutomationRule}
                  onDeleteRule={handleDeleteAutomationRule}
                />
              ) : settingsSection === 'users' && userRole?.permissions.users.viewAll ? (
                <UserManagement currentUser={currentUser} />
              ) : settingsSection === 'roles' && userRole?.permissions.roles.view ? (
                <RoleManagement currentUser={currentUser} />
              ) : settingsSection === 'appearance' ? (
                <AppearanceSettings 
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                  currentUser={currentUser!}
                />
              ) : settingsSection === 'general' ? (
                <GeneralSettings />
              ) : settingsSection === 'reports' ? (
                <ReportsManagement
                  currentUser={currentUser!}
                  reports={reports}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                />
              ) : settingsSection === 'session' ? (
                <SessionSettings
                  currentUser={currentUser!}
                  onLogout={handleLogout}
                  onChangeUser={handleLogout}
                />
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

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          userRole={userRole?.name}
          userName={currentUser.name}
        />
      )}

      {/* Quick Search (Ctrl+K) */}
      <QuickSearch
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
        incidents={incidents}
        onSelectIncident={handleSelectFromQuickSearch}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isActive={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />

      {/* Botón flotante para crear reporte */}
      <button 
        className="floating-report-button"
        onClick={() => setShowReportModal(true)}
        title="Crear reporte"
      >
        📝
      </button>

      {/* Modal de crear reporte */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleAddReport}
          userName={currentUser!.name}
          userId={currentUser!.id}
        />
      )}
    </div>
  );
}

export default App;
