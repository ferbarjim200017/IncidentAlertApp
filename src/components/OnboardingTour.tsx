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

  const tourSteps: TourStep[] = [
    {
      target: '.app-header',
      title: '🎯 Bienvenido a Incident Manager',
      content: 'Te guiaremos por las funciones principales de la aplicación para que puedas empezar rápidamente.',
      position: 'bottom'
    },
    {
      target: '.tabs',
      title: '📑 Navegación Principal',
      content: 'Usa estas pestañas para moverte entre las diferentes secciones: Incidencias, Estadísticas y más.',
      position: 'bottom'
    },
    {
      target: '.keyboard-shortcut-trigger',
      title: '⌨️ Atajos de Teclado',
      content: 'Presiona "?" para ver todos los atajos disponibles. Usa Ctrl+K para búsqueda rápida.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    if (isActive) {
      // Pequeño delay para que los elementos se rendericen
      const timer = setTimeout(() => {
        const step = tourSteps[currentStep];
        const element = document.querySelector(step.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isActive, onSkip]);

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

      <div className="tour-tooltip-modal">
        <div className="tour-tooltip-header">
          <h3 className="tour-tooltip-title">{step.title}</h3>
          <button className="tour-tooltip-close" onClick={onSkip} title="Cerrar tour">✕</button>
        </div>
        
        <div className="tour-tooltip-content">
          <p>{step.content}</p>
        </div>

        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            Paso {currentStep + 1} de {tourSteps.length}
          </div>
          
          <div className="tour-actions">
            <button 
              className="tour-btn tour-btn-skip" 
              onClick={onSkip}
            >
              Saltar tour
            </button>
            
            {currentStep > 0 && (
              <button 
                className="tour-btn tour-btn-secondary" 
                onClick={handlePrevious}
              >
                ← Anterior
              </button>
            )}
            
            <button 
              className="tour-btn tour-btn-primary" 
              onClick={handleNext}
            >
              {currentStep < tourSteps.length - 1 ? 'Siguiente →' : '✓ Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
