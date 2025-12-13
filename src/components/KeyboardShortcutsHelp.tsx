import React, { useEffect } from 'react';
import './KeyboardShortcutsHelp.css';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts: Shortcut[] = [
    { key: 'K', ctrl: true, description: 'Búsqueda rápida de incidencias' },
    { key: 'N', description: 'Crear nueva incidencia' },
    { key: 'E', description: 'Editar incidencia seleccionada' },
    { key: '?', shift: true, description: 'Mostrar este panel de ayuda' },
    { key: 'Esc', description: 'Cerrar modal o panel activo' },
    { key: '/', description: 'Ir al buscador' },
    { key: '1-4', description: 'Cambiar entre pestañas principales' },
  ];

  const renderKey = (key: string, ctrl?: boolean, shift?: boolean) => {
    return (
      <div className="shortcut-keys">
        {ctrl && <kbd className="key">Ctrl</kbd>}
        {shift && <kbd className="key">Shift</kbd>}
        <kbd className="key">{key}</kbd>
      </div>
    );
  };

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Atajos de Teclado</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="shortcuts-content">
          <p className="shortcuts-intro">
            Usa estos atajos para navegar más rápido por la aplicación
          </p>
          
          <div className="shortcuts-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                {renderKey(shortcut.key, shortcut.ctrl, shortcut.shift)}
                <span className="shortcut-description">{shortcut.description}</span>
              </div>
            ))}
          </div>

          <div className="shortcuts-footer">
            <p className="shortcuts-tip">
              💡 <strong>Tip:</strong> Presiona <kbd className="key">?</kbd> en cualquier momento para ver esta ayuda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
