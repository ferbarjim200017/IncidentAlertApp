import React, { useState, useEffect } from 'react';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userRole?: string;
  userName?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  onLogout,
  userRole,
  userName
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  const menuItems = [
    { id: 'incidents', label: '📋 Incidencias', icon: '📋' },
    { id: 'stats', label: '📊 Estadísticas', icon: '📊' },
    { id: 'allIncidents', label: '📑 Todas las Incidencias', icon: '📑' },
    { id: 'settings', label: '⚙️ Ajustes', icon: '⚙️' },
  ];

  const adminItems = [
    { id: 'users', label: '👥 Usuarios', icon: '👥' },
    { id: 'roles', label: '🔐 Roles', icon: '🔐' },
  ];

  return (
    <>
      {isOpen && <div className="mobile-menu-overlay" onClick={onClose} />}
      <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-user-info">
            <div className="mobile-menu-avatar">
              {userName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="mobile-menu-user-details">
              <div className="mobile-menu-username">{userName || 'Usuario'}</div>
              <div className="mobile-menu-role">{userRole || 'user'}</div>
            </div>
          </div>
          <button className="mobile-menu-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <div className="mobile-menu-section">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-menu-item ${currentTab === item.id ? 'mobile-menu-item-active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="mobile-menu-icon">{item.icon}</span>
                <span className="mobile-menu-label">{item.label}</span>
              </button>
            ))}
          </div>

          {userRole === 'admin' && (
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Administración</div>
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  className={`mobile-menu-item ${currentTab === item.id ? 'mobile-menu-item-active' : ''}`}
                  onClick={() => handleTabClick(item.id)}
                >
                  <span className="mobile-menu-icon">{item.icon}</span>
                  <span className="mobile-menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="mobile-menu-footer">
          <button className="mobile-menu-logout" onClick={onLogout}>
            <span className="mobile-menu-icon">🚪</span>
            <span className="mobile-menu-label">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
