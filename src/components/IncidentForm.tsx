import { useState } from 'react';
import { Incident, IncidentStatus, IncidentPriority, IncidentType } from '../types';
import './IncidentForm.css';

interface IncidentFormProps {
  onAdd: (incident: Incident) => void;
  onNavigateToDetail?: (incident: Incident) => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ onAdd, onNavigateToDetail }) => {
  const [name, setName] = useState('MOV-');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactUser, setContactUser] = useState('');
  const [relevante, setRelevante] = useState('');
  const [realizado, setRealizado] = useState('');
  const [clasesModificadas, setClasesModificadas] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<IncidentStatus>('abierta');
  const [priority, setPriority] = useState<IncidentPriority>('media');
  const [type, setType] = useState<IncidentType>('correctivo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la incidencia');
      return;
    }

    const newIncident: Incident = {
      id: Date.now().toString(),
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      contactUser: contactUser.trim(),
      relevante: relevante.trim(),
      realizado: realizado.trim(),
      clasesModificadas: clasesModificadas.trim(),
      prQA2: '',
      prMain: '',
      creationDate: creationDate,
      status,
      priority,
      type,
      userId: 'admin',
      assignedTo: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(newIncident);
    
    // Si está configurado, navegar al detalle de la incidencia
    if (onNavigateToDetail) {
      onNavigateToDetail(newIncident);
    }
    
    setName('MOV-');
    setTitle('');
    setDescription('');
    setContactUser('');
    setRelevante('');
    setRealizado('');
    setClasesModificadas('');
    setCreationDate(new Date().toISOString().split('T')[0]);
    setStatus('abierta');
    setPriority('media');
    setType('correctivo');
  };

  return (
    <div className="incident-form-container">
      <form className="incident-form" onSubmit={handleSubmit}>
        <h2>✨ Crear Nueva Incidencia</h2>
      
      <div className="form-section">
        <div className="form-group-full">
          <label htmlFor="name">Nombre de la Incidencia *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MOV-XXXX"
            className="input-large"
          />
        </div>

        <div className="form-group-full">
          <label htmlFor="title">📌 Título</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título para envío a PRO"
            className="input-large"
          />
        </div>

        <div className="form-group-full">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción detallada de la incidencia..."
            rows={4}
            className="input-large"
          />
        </div>

        <div className="form-group-full">
          <label htmlFor="relevante">🔑 Relevante</label>
          <textarea
            id="relevante"
            value={relevante}
            onChange={(e) => setRelevante(e.target.value)}
            placeholder="Información relevante..."
            rows={3}
            className="input-large"
          />
        </div>

        <div className="form-group-full">
          <label htmlFor="realizado">✅ Realizado</label>
          <textarea
            id="realizado"
            value={realizado}
            onChange={(e) => setRealizado(e.target.value)}
            placeholder="Qué se ha realizado..."
            rows={3}
            className="input-large"
          />
        </div>

        <div className="form-group-full">
          <label htmlFor="clasesModificadas">💻 Clases Modificadas</label>
          <textarea
            id="clasesModificadas"
            value={clasesModificadas}
            onChange={(e) => setClasesModificadas(e.target.value)}
            placeholder="Clases o archivos modificados..."
            rows={3}
            className="input-large"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📊 Prioridad</h3>
        <div className="chip-selector">
          {(['baja', 'media', 'alta', 'crítica'] as IncidentPriority[]).map(p => (
            <button
              key={p}
              type="button"
              className={`chip-option priority-${p} ${priority === p ? 'selected' : ''}`}
              onClick={() => setPriority(p)}
            >
              {p === 'baja' && '🟢 Baja'}
              {p === 'media' && '🟡 Media'}
              {p === 'alta' && '🟠 Alta'}
              {p === 'crítica' && '🔴 Crítica'}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>📋 Estado</h3>
        <div className="chip-selector">
          {(['abierta', 'en-progreso', 'puesto-en-test', 'verificado-en-test', 'resuelta', 'cerrada'] as IncidentStatus[]).map(s => (
            <button
              key={s}
              type="button"
              className={`chip-option ${status === s ? 'selected' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === 'abierta' && 'Abierta'}
              {s === 'en-progreso' && 'En Progreso'}
              {s === 'puesto-en-test' && 'Puesto en Test'}
              {s === 'verificado-en-test' && 'Verificado en Test'}
              {s === 'resuelta' && 'Resuelta'}
              {s === 'cerrada' && 'Cerrada'}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>🔧 Tipo</h3>
        <div className="chip-selector">
          {(['correctivo', 'evolutivo', 'tarea'] as IncidentType[]).map(t => (
            <button
              key={t}
              type="button"
              className={`chip-option ${type === t ? 'selected' : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'correctivo' && '🔧 Correctivo'}
              {t === 'evolutivo' && '🚀 Evolutivo'}
              {t === 'tarea' && '📋 Tarea'}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>📅 Información Adicional</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="creationDate">Fecha de Creación</label>
            <input
              id="creationDate"
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactUser">Usuario de Contacto</label>
            <input
              id="contactUser"
              type="text"
              value={contactUser}
              onChange={(e) => setContactUser(e.target.value)}
              placeholder="Nombre del contacto"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-submit">✓ Crear Incidencia</button>
      </form>
    </div>
  );
};
