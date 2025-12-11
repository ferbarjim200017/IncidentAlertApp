import { useState } from 'react';
import { User } from '../types';
import * as firebaseService from '../firebaseService';
import './AppearanceSettings.css';

interface AppearanceSettingsProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
  currentUser: User;
}

const themes = [
  {
    id: 'purple-gradient',
    name: 'Púrpura Degradado',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'blue-ocean',
    name: 'Océano Azul',
    gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    preview: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)'
  },
  {
    id: 'sunset-orange',
    name: 'Atardecer Naranja',
    gradient: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
    preview: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)'
  },
  {
    id: 'forest-green',
    name: 'Bosque Verde',
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
  },
  {
    id: 'pink-paradise',
    name: 'Paraíso Rosa',
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    preview: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)'
  },
  {
    id: 'midnight-blue',
    name: 'Azul Medianoche',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
  },
  {
    id: 'coral-reef',
    name: 'Arrecife Coral',
    gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    preview: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)'
  },
  {
    id: 'mint-fresh',
    name: 'Menta Fresca',
    gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
    preview: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
  },
  {
    id: 'royal-purple',
    name: 'Púrpura Real',
    gradient: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)',
    preview: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)'
  },
  {
    id: 'warm-flame',
    name: 'Llama Cálida',
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 50%, #ff99ac 100%)',
    preview: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)'
  }
];

export function AppearanceSettings({ onThemeChange, currentTheme, currentUser }: AppearanceSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
    
    // Guardar en Firebase
    try {
      await firebaseService.updateUserPreferences(currentUser.id, {
        ...currentUser.preferences,
        theme: themeId
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <div className="appearance-settings">
      <h3>🎨 Apariencia</h3>
      <p className="appearance-description">
        Personaliza el color de fondo de la aplicación según tus preferencias
      </p>

      <div className="theme-grid">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`theme-card ${selectedTheme === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.id)}
          >
            <div
              className="theme-preview"
              style={{ background: theme.preview }}
            >
              {selectedTheme === theme.id && (
                <div className="theme-check">✓</div>
              )}
            </div>
            <div className="theme-name">{theme.name}</div>
          </div>
        ))}
      </div>

      {selectedTheme !== currentTheme && (
        <div className="theme-info">
          <p>✨ Tema aplicado correctamente</p>
        </div>
      )}
    </div>
  );
}

export { themes };
