import { useState } from 'react';
import { Incident, IncidentStatus, IncidentPriority, IncidentType } from '../types';
import './IncidentEdit.css';

interface IncidentEditProps {
  incident: Incident;
  onSave: (incident: Incident) => void;
  onCancel: () => void;
}

export const IncidentEdit: React.FC<IncidentEditProps> = ({ incident, onSave, onCancel }) => {
  const [name, setName] = useState(incident.name);
  const [contactUser, setContactUser] = useState(incident.contactUser || '');
  const [prQA2, setPrQA2] = useState(incident.prQA2 || '');
  const [prMain, setPrMain] = useState(incident.prMain || '');
  const [creationDate, setCreationDate] = useState(incident.creationDate || '');
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [priority, setPriority] = useState<IncidentPriority>(incident.priority);
  const [type, setType] = useState<IncidentType>(incident.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la incidencia');
      return;
    }

    onSave({
      ...incident,
      name: name.trim(),
      contactUser: contactUser.trim(),
      prQA2: prQA2.trim(),
      prMain: prMain.trim(),
      creationDate,
      status,
      priority,
      type,
    });
  };

  return (
    <div className="incident-edit-overlay">
      <form className="incident-edit-form" onSubmit={handleSubmit}>
        <h2>Editar Incidencia</h2>

        <div className="form-group">
          <label htmlFor="edit-name">Nombre *</label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la incidencia"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-contactUser">Usuario de Contacto</label>
          <input
            id="edit-contactUser"
            type="text"
            value={contactUser}
            onChange={(e) => setContactUser(e.target.value)}
            placeholder="Nombre del contacto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-prQA2">PR QA2</label>
          <input
            id="edit-prQA2"
            type="text"
            value={prQA2}
            onChange={(e) => setPrQA2(e.target.value)}
            placeholder="ID de PR para QA2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-prMain">PR MAIN</label>
          <input
            id="edit-prMain"
            type="text"
            value={prMain}
            onChange={(e) => setPrMain(e.target.value)}
            placeholder="ID de PR para MAIN"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-creationDate">Fecha de Creación</label>
          <input
            id="edit-creationDate"
            type="date"
            value={creationDate}
            onChange={(e) => setCreationDate(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-status">Estado</label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
            >
              <option value="abierta">Abierta</option>
              <option value="en-progreso">En Progreso</option>
              <option value="resuelta">Resuelta</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-priority">Prioridad</label>
            <select
              id="edit-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IncidentPriority)}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="crítica">Crítica</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-type">Tipo</label>
            <select
              id="edit-type"
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
            >
              <option value="correctivo">Correctivo</option>
              <option value="evolutivo">Evolutivo</option>
              <option value="tarea">Tarea</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">Guardar Cambios</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};
