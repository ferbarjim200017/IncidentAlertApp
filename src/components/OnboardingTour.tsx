import React, { useState, useEffect } from 'react';
import './OnboardingTour.css';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const tourSteps: TourStep[] = [
    {
      target: '.tabs',
      title: '🎯 Navegación Principal',
      content: 'Usa estas pestañas para moverte entre las diferentes secciones de la aplicación.',
      position: 'bottom'
    },
    {
      target: '.btn-new-incident',
      title: '✨ Crear Incidencia',
      content: 'Haz clic aquí para crear una nueva incidencia. También puedes usar el atajo de teclado "N".',
      position: 'bottom'
    },
    {
      target: '.incident-list',
      title: '📋 Lista de Incidencias',
      content: 'Aquí verás todas tus incidencias. Haz clic en cualquiera para ver los detalles.',
      position: 'top'
    },
    {
      target: '.advanced-search',
      title: '🔍 Búsqueda Avanzada',
      content: 'Usa los filtros para encontrar incidencias específicas. ¡Prueba Ctrl+K para búsqueda rápida!',
      position: 'bottom'
    },
    {
      target: '.user-profile',
      title: '👤 Tu Perfil',
      content: 'Gestiona tu cuenta y preferencias desde aquí.',
      position: 'left'
    }
  ];

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      return () => window.removeEventListener('resize', updateTooltipPosition);
    }
  }, [isActive, currentStep]);

  const updateTooltipPosition = () => {
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const position = step.position || 'bottom';
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = rect.bottom + window.scrollY + 20;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'top':
          top = rect.top + window.scrollY - 20;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - 20;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + 20;
          break;
      }

      setTooltipPosition({ top, left });

      // Scroll al elemento
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const element = document.querySelector(step.target);

  return (
    <>
      <div className="tour-overlay" onClick={onSkip} />
      
      {element && (
        <div 
          className="tour-spotlight"
          style={{
            top: element.getBoundingClientRect().top + window.scrollY - 8,
            left: element.getBoundingClientRect().left + window.scrollX - 8,
            width: element.getBoundingClientRect().width + 16,
            height: element.getBoundingClientRect().height + 16,
          }}
        />
      )}

      <div 
        className={`tour-tooltip tour-tooltip-${step.position || 'bottom'}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="tour-tooltip-header">
          <h3 className="tour-tooltip-title">{step.title}</h3>
          <button className="tour-tooltip-close" onClick={onSkip}>✕</button>
        </div>
        
        <div className="tour-tooltip-content">
          <p>{step.content}</p>
        </div>

        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            {currentStep + 1} de {tourSteps.length}
          </div>
          
          <div className="tour-actions">
            <button 
              className="tour-btn tour-btn-skip" 
              onClick={onSkip}
            >
              Saltar
            </button>
            
            {currentStep > 0 && (
              <button 
                className="tour-btn tour-btn-secondary" 
                onClick={handlePrevious}
              >
                Anterior
              </button>
            )}
            
            <button 
              className="tour-btn tour-btn-primary" 
              onClick={handleNext}
            >
              {currentStep < tourSteps.length - 1 ? 'Siguiente' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
