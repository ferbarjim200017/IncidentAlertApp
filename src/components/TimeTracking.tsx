import { useState } from 'react';
import { TimeEntry } from '../types';
import './TimeTracking.css';

interface TimeTrackingProps {
  incidentId: string;
  timeEntries: TimeEntry[];
  estimatedHours?: number;
  onAddTime: (incidentId: string, user: string, hours: number, description: string, date: string) => void;
  onDeleteTime: (incidentId: string, timeEntryId: string) => void;
  onUpdateEstimate: (incidentId: string, estimatedHours: number) => void;
}

export function TimeTracking({ 
  incidentId, 
  timeEntries, 
  estimatedHours = 0,
  onAddTime, 
  onDeleteTime,
  onUpdateEstimate 
}: TimeTrackingProps) {
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEstimateEdit, setShowEstimateEdit] = useState(false);
  const [estimateValue, setEstimateValue] = useState(estimatedHours.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() && hours && parseFloat(hours) > 0) {
      onAddTime(incidentId, user.trim(), parseFloat(hours), description.trim(), date);
      setUser('');
      setHours('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowForm(false);
    }
  };

  const handleEstimateUpdate = () => {
    const value = parseFloat(estimateValue);
    if (!isNaN(value) && value >= 0) {
      onUpdateEstimate(incidentId, value);
      setShowEstimateEdit(false);
    }
  };

  const handleDelete = (timeEntryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de tiempo?')) {
      onDeleteTime(incidentId, timeEntryId);
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const remainingHours = estimatedHours - totalHours;
  const progressPercentage = estimatedHours > 0 ? Math.min((totalHours / estimatedHours) * 100, 100) : 0;

  const sortedEntries = [...timeEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="time-tracking-section">
      <div className="time-tracking-header">
        <h3>⏱️ Gestión de Tiempo</h3>
        <button 
          className="btn-add-time"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Registrar Tiempo'}
        </button>
      </div>

      <div className="time-summary">
        <div className="time-summary-cards">
          <div className="time-card estimate">
            <div className="time-card-content">
              <span className="time-card-label">Estimado</span>
              {showEstimateEdit ? (
                <div className="estimate-edit">
                  <input
                    type="number"
                    value={estimateValue}
                    onChange={(e) => setEstimateValue(e.target.value)}
                    step="0.5"
                    min="0"
                    className="estimate-input"
                  />
                  <button onClick={handleEstimateUpdate} className="btn-save-estimate">✓</button>
                  <button onClick={() => setShowEstimateEdit(false)} className="btn-cancel-estimate">✕</button>
                </div>
              ) : (
                <div className="estimate-display">
                  <span className="time-card-value">{estimatedHours}h</span>
                  <button onClick={() => setShowEstimateEdit(true)} className="btn-edit-estimate">✏️</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="time-card worked">
            <div className="time-card-content">
              <span className="time-card-label">Trabajado</span>
              <span className="time-card-value">{totalHours.toFixed(1)}h</span>
            </div>
          </div>
          
          <div className={`time-card remaining ${remainingHours < 0 ? 'over-budget' : ''}`}>
            <div className="time-card-content">
              <span className="time-card-label">Restante</span>
              <span className="time-card-value">
                {remainingHours > 0 ? `${remainingHours.toFixed(1)}h` : `${Math.abs(remainingHours).toFixed(1)}h extra`}
              </span>
            </div>
          </div>
        </div>

        {estimatedHours > 0 && (
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className={`progress-fill ${progressPercentage > 100 ? 'over-budget' : ''}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <span className="progress-label">{progressPercentage.toFixed(0)}% completado</span>
          </div>
        )}
      </div>

      {showForm && (
        <form className="time-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Usuario *</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Horas *</label>
              <input
                type="number"
                placeholder="0.0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                step="0.5"
                min="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              placeholder="¿Qué trabajaste?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <button type="submit" className="btn-submit-time">
            ⏱️ Registrar Tiempo
          </button>
        </form>
      )}

      <div className="time-entries-list">
        <h4>Registros de Tiempo ({timeEntries.length})</h4>
        {sortedEntries.length === 0 ? (
          <div className="no-entries">
            <span className="no-entries-icon">⏰</span>
            <p>No hay registros de tiempo. Comienza a trackear tu trabajo.</p>
          </div>
        ) : (
          <div className="entries-table">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="entry-row">
                <div className="entry-main">
                  <div className="entry-user">
                    <span className="user-icon">👤</span>
                    <strong>{entry.user}</strong>
                  </div>
                  <div className="entry-hours">
                    <span className="hours-badge">{entry.hours}h</span>
                  </div>
                  <div className="entry-date">
                    {new Date(entry.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <button
                    className="btn-delete-entry"
                    onClick={() => handleDelete(entry.id)}
                    title="Eliminar registro"
                  >
                    🗑️
                  </button>
                </div>
                {entry.description && (
                  <div className="entry-description">
                    {entry.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
