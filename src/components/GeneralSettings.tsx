import { useState } from 'react';
import * as firebaseService from '../firebaseService';
import './GeneralSettings.css';

interface GeneralSettingsProps {
  onSettingsChange?: () => void;
}

interface AppSettings {
  notificationDuration: number;
  autoSaveInterval: number;
  incidentsPerPage: number;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  defaultIncidentType: 'correctivo' | 'evolutivo' | 'consultivo';
  showWelcomeMessage: boolean;
  compactView: boolean;
  enableSounds: boolean;
  defaultPriority: 'baja' | 'media' | 'alta' | 'crítica';
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  autoRefreshInterval: number;
  navigateToDetailAfterCreate: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationDuration: 4000,
  autoSaveInterval: 30000,
  incidentsPerPage: 10,
  dateFormat: 'dd/mm/yyyy',
  defaultIncidentType: 'correctivo',
  showWelcomeMessage: true,
  compactView: false,
  enableSounds: false,
  defaultPriority: 'media',
  confirmBeforeDelete: true,
  autoRefresh: false,
  autoRefreshInterval: 60000,
  navigateToDetailAfterCreate: false,
};

const SETTINGS_KEY = 'app_general_settings';

export function GeneralSettings({ onSettingsChange }: GeneralSettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    setNotification('✓ Configuración guardada');
    setTimeout(() => setNotification(null), 2000);
    
    if (onSettingsChange) {
      onSettingsChange();
    }
  };

  const handleResetSettings = () => {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      
      setNotification('✓ Configuración restaurada');
      setTimeout(() => setNotification(null), 2000);
      
      if (onSettingsChange) {
        onSettingsChange();
      }
    }
  };

  const handleExportData = async () => {
    try {
      const incidents = await firebaseService.getIncidents();
      const users = await firebaseService.getUsers();
      const automationRules = await firebaseService.getAutomationRules();
      const appSettings = await firebaseService.getSettings();
      
      const data = {
        incidents,
        users,
        automationRules,
        settings: appSettings || settings,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-incidencias-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setNotification('✓ Datos exportados correctamente');
      setTimeout(() => setNotification(null), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setNotification('✗ Error al exportar datos');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (confirm('¿Importar datos? Esto sobrescribirá la información actual.')) {
          // Si es un array directamente, asumimos que son incidencias
          if (Array.isArray(data)) {
            // Validar que cada incidencia tenga los campos requeridos
            const validIncidents = data.every(inc => 
              inc.id && inc.name && inc.title && inc.status && inc.priority && inc.type
            );
            
            if (!validIncidents) {
              setNotification('✗ Error: El archivo contiene incidencias con campos faltantes');
              setTimeout(() => setNotification(null), 3000);
              return;
            }
            
            // Importar a Firebase
            for (const incident of data) {
              await firebaseService.addIncident(incident);
            }
          } else {
            // Si es un objeto, importar cada propiedad a Firebase
            if (data.incidents) {
              for (const incident of data.incidents) {
                await firebaseService.addIncident(incident);
              }
            }
            if (data.users) {
              for (const user of data.users) {
                await firebaseService.addUser(user);
              }
            }
            if (data.automationRules) {
              for (const rule of data.automationRules) {
                await firebaseService.addAutomationRule(rule);
              }
            }
            if (data.settings) {
              await firebaseService.updateSettings(data.settings);
              setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            }
          }

          setNotification('✓ Datos importados. Recargando...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error) {
        console.error('Import error:', error);
        setNotification('✗ Error al importar: archivo inválido');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ ¿ELIMINAR TODOS LOS DATOS? Esta acción no se puede deshacer.')) {
      if (confirm('¿Estás completamente seguro? Se perderán todas las incidencias, usuarios y configuraciones.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="general-settings">
      {notification && (
        <div className="settings-notification">{notification}</div>
      )}

      <div className="settings-header">
        <h2>⚙️ General</h2>
      </div>

      <div className="settings-sections">
        {/* Interfaz */}
        <section className="settings-section">
          <h3>🖥️ Interfaz</h3>
          
          <div className="setting-item">
            <div>
              <div className="setting-label">Duración de notificaciones</div>
              <div className="setting-description">Tiempo en segundos que se muestran las notificaciones</div>
            </div>
            <select 
              value={settings.notificationDuration}
              onChange={(e) => handleSettingChange('notificationDuration', parseInt(e.target.value))}
            >
              <option value="2000">2 segundos</option>
              <option value="3000">3 segundos</option>
              <option value="4000">4 segundos</option>
              <option value="5000">5 segundos</option>
              <option value="7000">7 segundos</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Incidencias por página</div>
              <div className="setting-description">Número de incidencias a mostrar en las tablas</div>
            </div>
            <select 
              value={settings.incidentsPerPage}
              onChange={(e) => handleSettingChange('incidentsPerPage', parseInt(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Vista compacta</div>
              <div className="setting-description">Reduce el espaciado entre elementos</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.compactView}
                onChange={(e) => handleSettingChange('compactView', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Mostrar mensaje de bienvenida</span>
              <span className="setting-description">Muestra un saludo al iniciar sesión</span>
            </label>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.showWelcomeMessage}
                onChange={(e) => handleSettingChange('showWelcomeMessage', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Habilitar sonidos</div>
              <div className="setting-description">Reproduce sonidos para notificaciones</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.enableSounds}
                onChange={(e) => handleSettingChange('enableSounds', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* Formato y valores por defecto */}
        <section className="settings-section">
          <h3>📋 Valores por Defecto</h3>
          
          <div className="setting-item">
            <div>
              <div className="setting-label">Formato de fecha</div>
              <div className="setting-description">Formato para mostrar fechas</div>
            </div>
            <select 
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Tipo de incidencia predeterminado</div>
              <div className="setting-description">Tipo seleccionado al crear nuevas incidencias</div>
            </div>
            <select 
              value={settings.defaultIncidentType}
              onChange={(e) => handleSettingChange('defaultIncidentType', e.target.value)}
            >
              <option value="correctivo">Correctivo</option>
              <option value="evolutivo">Evolutivo</option>
              <option value="consultivo">Consultivo</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Prioridad predeterminada</div>
              <div className="setting-description">Prioridad inicial para nuevas incidencias</div>
            </div>
            <select 
              value={settings.defaultPriority}
              onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="crítica">Crítica</option>
            </select>
          </div>
        </section>

        {/* Comportamiento */}
        <section className="settings-section">
          <h3>⚡ Comportamiento</h3>
          
          <div className="setting-item">
            <div>
              <div className="setting-label">Navegar al detalle tras crear incidencia</div>
              <div className="setting-description">Abrir automáticamente la vista de detalle al crear una nueva incidencia</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.navigateToDetailAfterCreate}
                onChange={(e) => handleSettingChange('navigateToDetailAfterCreate', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div>
              <div className="setting-label">Autoguardado</div>
              <div className="setting-description">Intervalo de autoguardado en segundos</div>
            </div>
            <select 
              value={settings.autoSaveInterval}
              onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
            >
              <option value="15000">15 segundos</option>
              <option value="30000">30 segundos</option>
              <option value="60000">1 minuto</option>
              <option value="120000">2 minutos</option>
              <option value="0">Desactivado</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Confirmar antes de eliminar</div>
              <div className="setting-description">Pide confirmación al eliminar incidencias</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.confirmBeforeDelete}
                onChange={(e) => handleSettingChange('confirmBeforeDelete', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Auto-actualización</div>
              <div className="setting-description">Actualiza datos automáticamente</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.autoRefresh && (
            <div className="setting-item">
              <div>
                <div className="setting-label">Intervalo de actualización</div>
                <div className="setting-description">Frecuencia de actualización automática</div>
              </div>
              <select 
                value={settings.autoRefreshInterval}
                onChange={(e) => handleSettingChange('autoRefreshInterval', parseInt(e.target.value))}
              >
                <option value="30000">30 segundos</option>
                <option value="60000">1 minuto</option>
                <option value="120000">2 minutos</option>
                <option value="300000">5 minutos</option>
              </select>
            </div>
          )}
        </section>

        {/* Gestión de datos */}
        <section className="settings-section">
          <h3>💾 Gestión de Datos</h3>
          
          <div className="setting-item">
            <div>
              <div className="setting-label">Exportar datos</div>
              <div className="setting-description">Descarga una copia de seguridad completa</div>
            </div>
            <button className="btn-export" onClick={handleExportData}>
              📥 Exportar Todo
            </button>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Importar datos</div>
              <div className="setting-description">Restaura datos desde un archivo de respaldo</div>
            </div>
            <label className="btn-import">
              📤 Importar
              <input 
                type="file" 
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="setting-item">
            <div>
              <div className="setting-label">Restaurar configuración</div>
              <div className="setting-description">Vuelve a los valores predeterminados</div>
            </div>
            <button className="btn-reset" onClick={handleResetSettings}>
              🔄 Restaurar
            </button>
          </div>

          <div className="setting-item danger-zone">
            <div>
              <div className="setting-label">⚠️ Zona de peligro</div>
              <div className="setting-description">Elimina todos los datos permanentemente</div>
            </div>
            <button className="btn-danger" onClick={handleClearAllData}>
              🗑️ Borrar Todo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Export para que otras partes de la app puedan acceder a la configuración
export const getGeneralSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
};
