import { useState } from 'react';
import { AutomationRule, AutomationTrigger, AutomationAction, IncidentStatus, IncidentPriority, IncidentType } from '../types';
import './AutomationRules.css';

interface AutomationRulesProps {
  rules: AutomationRule[];
  onAddRule: (rule: Omit<AutomationRule, 'id' | 'createdAt'>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  onDeleteRule: (ruleId: string) => void;
}

export function AutomationRules({ rules = [], onAddRule, onUpdateRule, onDeleteRule }: AutomationRulesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'on-create' as AutomationTrigger,
    conditionField: 'type' as any,
    conditionOperator: 'equals' as any,
    conditionValue: '',
    actionType: 'set-priority' as AutomationAction,
    actionValue: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRule: Omit<AutomationRule, 'id' | 'createdAt'> = {
      name: formData.name,
      enabled: true,
      trigger: formData.trigger,
      conditions: [{
        field: formData.conditionField,
        operator: formData.conditionOperator,
        value: formData.conditionValue,
      }],
      actions: [{
        type: formData.actionType,
        value: formData.actionValue,
      }],
    };

    if (editingRule) {
      onUpdateRule(editingRule.id, newRule);
      setEditingRule(null);
    } else {
      onAddRule(newRule);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: 'on-create',
      conditionField: 'type',
      conditionOperator: 'equals',
      conditionValue: '',
      actionType: 'set-priority',
      actionValue: '',
    });
    setShowForm(false);
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      trigger: rule.trigger,
      conditionField: rule.conditions[0]?.field || 'type',
      conditionOperator: rule.conditions[0]?.operator || 'equals',
      conditionValue: rule.conditions[0]?.value.toString() || '',
      actionType: rule.actions[0]?.type || 'set-priority',
      actionValue: rule.actions[0]?.value || '',
    });
    setShowForm(true);
  };

  const getTriggerLabel = (trigger: AutomationTrigger) => {
    const labels: Record<AutomationTrigger, string> = {
      'on-create': 'Al crear incidencia',
      'on-status-change': 'Al cambiar estado',
      'on-priority-change': 'Al cambiar prioridad',
      'on-time-threshold': 'Por tiempo transcurrido',
    };
    return labels[trigger];
  };

  return (
    <div className="automation-rules-container">
      <div className="rules-header">
        <div className="header-title">
          <h2>⚙️ Reglas de Automatización</h2>
          <p className="header-subtitle">Automatiza acciones basadas en condiciones</p>
        </div>
        <button 
          className="btn-add-rule"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Regla'}
        </button>
      </div>

      {showForm && (
        <form className="rule-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>{editingRule ? 'Editar Regla' : 'Nueva Regla'}</h3>
            
            <div className="form-group">
              <label>Nombre de la regla</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Escalar prioridad de bugs críticos"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Disparador</label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value as AutomationTrigger })}
                >
                  <option value="on-create">Al crear incidencia</option>
                  <option value="on-status-change">Al cambiar estado</option>
                  <option value="on-priority-change">Al cambiar prioridad</option>
                  <option value="on-time-threshold">Por tiempo transcurrido</option>
                </select>
              </div>
            </div>

            <div className="form-divider">
              <span>SI</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Campo</label>
                <select
                  value={formData.conditionField}
                  onChange={(e) => setFormData({ ...formData, conditionField: e.target.value as any })}
                >
                  <option value="type">Tipo</option>
                  <option value="priority">Prioridad</option>
                  <option value="status">Estado</option>
                  <option value="days-open">Días abierta</option>
                  <option value="has-tag">Tiene etiqueta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Operador</label>
                <select
                  value={formData.conditionOperator}
                  onChange={(e) => setFormData({ ...formData, conditionOperator: e.target.value as any })}
                >
                  <option value="equals">Es igual a</option>
                  <option value="not-equals">Es diferente de</option>
                  {(formData.conditionField === 'days-open') && (
                    <>
                      <option value="greater-than">Mayor que</option>
                      <option value="less-than">Menor que</option>
                    </>
                  )}
                  {formData.conditionField === 'has-tag' && (
                    <option value="contains">Contiene</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Valor</label>
                {formData.conditionField === 'type' ? (
                  <select
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="evolutivo">Evolutivo</option>
                    <option value="tarea">Tarea</option>
                  </select>
                ) : formData.conditionField === 'priority' ? (
                  <select
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="crítica">Crítica</option>
                  </select>
                ) : formData.conditionField === 'status' ? (
                  <select
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="abierta">Abierta</option>
                    <option value="en-progreso">En Progreso</option>
                    <option value="puesto-en-test">Puesto en Test</option>
                    <option value="verificado-en-test">Verificado en Test</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                ) : formData.conditionField === 'days-open' ? (
                  <input
                    type="number"
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    placeholder="Días"
                    min="0"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    placeholder="Valor"
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-divider">
              <span>ENTONCES</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Acción</label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value as AutomationAction })}
                >
                  <option value="set-priority">Cambiar prioridad</option>
                  <option value="set-status">Cambiar estado</option>
                  <option value="add-tag">Añadir etiqueta</option>
                  <option value="assign-to">Asignar a</option>
                </select>
              </div>

              <div className="form-group">
                <label>Valor</label>
                {formData.actionType === 'set-priority' ? (
                  <select
                    value={formData.actionValue}
                    onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="crítica">Crítica</option>
                  </select>
                ) : formData.actionType === 'set-status' ? (
                  <select
                    value={formData.actionValue}
                    onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="abierta">Abierta</option>
                    <option value="en-progreso">En Progreso</option>
                    <option value="puesto-en-test">Puesto en Test</option>
                    <option value="verificado-en-test">Verificado en Test</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.actionValue}
                    onChange={(e) => setFormData({ ...formData, actionValue: e.target.value })}
                    placeholder={formData.actionType === 'add-tag' ? 'Nombre de etiqueta' : 'Usuario asignado'}
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save-rule">
                {editingRule ? '💾 Actualizar Regla' : '✓ Crear Regla'}
              </button>
              <button type="button" className="btn-cancel-rule" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="rules-list">
        {rules.length === 0 ? (
          <div className="no-rules">
            <p>📋 No hay reglas de automatización configuradas</p>
            <p className="no-rules-hint">Crea tu primera regla para automatizar acciones en tus incidencias</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className={`rule-card ${rule.enabled ? 'rule-enabled' : 'rule-disabled'}`}>
              <div className="rule-header-card">
                <div className="rule-info">
                  <h3>{rule.name}</h3>
                  <span className="rule-trigger">{getTriggerLabel(rule.trigger)}</span>
                </div>
                <div className="rule-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onUpdateRule(rule.id, { enabled: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <button
                    className="btn-edit-rule"
                    onClick={() => handleEdit(rule)}
                    title="Editar regla"
                  >
                    ✎
                  </button>
                  <button
                    className="btn-delete-rule"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la regla "${rule.name}"?`)) {
                        onDeleteRule(rule.id);
                      }
                    }}
                    title="Eliminar regla"
                  >
                    🗑
                  </button>
                </div>
              </div>
              
              <div className="rule-logic">
                <div className="logic-section">
                  <span className="logic-label">SI:</span>
                  <div className="logic-content">
                    {(rule.conditions || []).map((cond, idx) => (
                      <span key={idx} className="condition-badge">
                        {cond.field} {cond.operator} {cond.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="logic-arrow">→</div>
                <div className="logic-section">
                  <span className="logic-label">ENTONCES:</span>
                  <div className="logic-content">
                    {(rule.actions || []).map((action, idx) => (
                      <span key={idx} className="action-badge">
                        {action.type}: {action.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
