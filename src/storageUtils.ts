import { Incident, Comment, AutomationRule, PR } from './types';

const STORAGE_KEY = 'incidents';
const COMMENTS_STORAGE_KEY = 'incident_comments';
const AUTOMATION_RULES_KEY = 'automation_rules';
const SYSTEM_TAGS_KEY = 'system_tags';

const migrateIncidents = (incidents: any[]): Incident[] => {
  return incidents.map(incident => ({
    ...incident,
    title: incident.title || '',
    contactUser: incident.contactUser || '',
    userId: incident.userId || 'user-legacy',
    prQA2: incident.prQA2 || '',
    prMain: incident.prMain || '',
    creationDate: incident.creationDate || new Date().toISOString().split('T')[0],
    type: incident.type || 'correctivo',
    assignedTo: incident.assignedTo || '',
    comments: incident.comments || [],
    timeEntries: incident.timeEntries || [],
    estimatedHours: incident.estimatedHours || 0,
    tags: incident.tags || [],
    prQA2List: incident.prQA2List || [],
    prMainList: incident.prMainList || [],
  }));
};

export const storageUtils = {
  getIncidents: (): Incident[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return migrateIncidents(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Error loading incidents:', error);
      return [];
    }
  },

  saveIncidents: (incidents: Incident[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch (error) {
      console.error('Error saving incidents:', error);
    }
  },

  addIncident: (incident: Incident): Incident[] => {
    const incidents = storageUtils.getIncidents();
    incidents.push(incident);
    storageUtils.saveIncidents(incidents);
    return incidents;
  },

  updateIncident: (id: string, updates: Partial<Incident> | Incident): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const index = incidents.findIndex(inc => inc.id === id);
    if (index !== -1) {
      incidents[index] = { ...incidents[index], ...updates, updatedAt: new Date().toISOString() };
      storageUtils.saveIncidents(incidents);
    }
    return incidents;
  },

  deleteIncident: (id: string): Incident[] => {
    const incidents = storageUtils.getIncidents().filter(inc => inc.id !== id);
    storageUtils.saveIncidents(incidents);
    return incidents;
  },

  addComment: (incidentId: string, author: string, text: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident) {
      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        incidentId,
        author,
        text,
        createdAt: new Date().toISOString(),
      };

      if (!incident.comments) {
        incident.comments = [];
      }
      
      incident.comments.push(comment);
      incident.updatedAt = new Date().toISOString();
      storageUtils.saveIncidents(incidents);
    }
    
    return incidents;
  },

  deleteComment: (incidentId: string, commentId: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident && incident.comments) {
      incident.comments = incident.comments.filter(comment => comment.id !== commentId);
      incident.updatedAt = new Date().toISOString();
      storageUtils.saveIncidents(incidents);
    }
    
    return incidents;
  },

  addTag: (incidentId: string, tag: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident) {
      if (!incident.tags) {
        incident.tags = [];
      }
      
      const normalizedTag = tag.trim().toLowerCase();
      if (normalizedTag && !incident.tags.includes(normalizedTag)) {
        incident.tags.push(normalizedTag);
        incident.updatedAt = new Date().toISOString();
        storageUtils.saveIncidents(incidents);
        
        // Agregar la etiqueta al sistema si no existe
        storageUtils.addSystemTag(normalizedTag);
      }
    }
    
    return incidents;
  },

  removeTag: (incidentId: string, tag: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident && incident.tags) {
      incident.tags = incident.tags.filter(t => t !== tag);
      incident.updatedAt = new Date().toISOString();
      storageUtils.saveIncidents(incidents);
    }
    
    return incidents;
  },

  getSystemTags: (): string[] => {
    try {
      const data = localStorage.getItem(SYSTEM_TAGS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading system tags:', error);
      return [];
    }
  },

  saveSystemTags: (tags: string[]): void => {
    try {
      localStorage.setItem(SYSTEM_TAGS_KEY, JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving system tags:', error);
    }
  },

  addSystemTag: (tag: string): string[] => {
    const tags = storageUtils.getSystemTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      tags.sort();
      storageUtils.saveSystemTags(tags);
    }
    return tags;
  },

  deleteSystemTag: (tag: string): string[] => {
    const tags = storageUtils.getSystemTags().filter(t => t !== tag);
    storageUtils.saveSystemTags(tags);
    return tags;
  },

  getAllTags: (): string[] => {
    return storageUtils.getSystemTags();
  },

  deleteTagFromAllIncidents: (tagToDelete: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    
    incidents.forEach(incident => {
      if (incident.tags) {
        incident.tags = incident.tags.filter(tag => tag !== tagToDelete);
      }
    });
    
    storageUtils.saveIncidents(incidents);
    
    // Eliminar la etiqueta del sistema también
    storageUtils.deleteSystemTag(tagToDelete);
    
    return incidents;
  },

  addPR: (incidentId: string, type: 'qa2' | 'main', link: string, description: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident) {
      const pr: PR = {
        id: `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        link,
        description,
        createdAt: new Date().toISOString(),
      };

      if (type === 'qa2') {
        if (!incident.prQA2List) {
          incident.prQA2List = [];
        }
        incident.prQA2List.push(pr);
      } else {
        if (!incident.prMainList) {
          incident.prMainList = [];
        }
        incident.prMainList.push(pr);
      }
      
      incident.updatedAt = new Date().toISOString();
      storageUtils.saveIncidents(incidents);
    }
    
    return incidents;
  },

  removePR: (incidentId: string, type: 'qa2' | 'main', prId: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident) {
      if (type === 'qa2' && incident.prQA2List) {
        incident.prQA2List = incident.prQA2List.filter(pr => pr.id !== prId);
      } else if (type === 'main' && incident.prMainList) {
        incident.prMainList = incident.prMainList.filter(pr => pr.id !== prId);
      }
      
      incident.updatedAt = new Date().toISOString();
      storageUtils.saveIncidents(incidents);
    }
    
    return incidents;
  },

  updatePR: (incidentId: string, type: 'qa2' | 'main', prId: string, link: string, description: string): Incident[] => {
    const incidents = storageUtils.getIncidents();
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident) {
      let prList = type === 'qa2' ? incident.prQA2List : incident.prMainList;
      
      if (prList) {
        const prIndex = prList.findIndex(pr => pr.id === prId);
        if (prIndex !== -1) {
          prList[prIndex] = {
            ...prList[prIndex],
            link,
            description,
          };
          
          incident.updatedAt = new Date().toISOString();
          storageUtils.saveIncidents(incidents);
        }
      }
    }
    
    return incidents;
  },

  // Automation Rules
  getAutomationRules: (): AutomationRule[] => {
    try {
      const data = localStorage.getItem(AUTOMATION_RULES_KEY);
      if (!data) return [];
      const rules = JSON.parse(data);
      
      // Migrar reglas antiguas al nuevo formato
      return rules.map((rule: any) => ({
        ...rule,
        conditions: rule.conditions || [],
        actions: rule.actions || []
      }));
    } catch (error) {
      console.error('Error loading automation rules:', error);
      return [];
    }
  },

  saveAutomationRules: (rules: AutomationRule[]): void => {
    try {
      localStorage.setItem(AUTOMATION_RULES_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error('Error saving automation rules:', error);
    }
  },

  addAutomationRule: (rule: Omit<AutomationRule, 'id' | 'createdAt'>): AutomationRule[] => {
    const rules = storageUtils.getAutomationRules();
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    rules.push(newRule);
    storageUtils.saveAutomationRules(rules);
    return rules;
  },

  updateAutomationRule: (ruleId: string, updates: Partial<AutomationRule>): AutomationRule[] => {
    const rules = storageUtils.getAutomationRules();
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex !== -1) {
      rules[ruleIndex] = { ...rules[ruleIndex], ...updates };
      storageUtils.saveAutomationRules(rules);
    }
    
    return rules;
  },

  deleteAutomationRule: (ruleId: string): AutomationRule[] => {
    const rules = storageUtils.getAutomationRules().filter(r => r.id !== ruleId);
    storageUtils.saveAutomationRules(rules);
    return rules;
  },

  applyAutomationRules: (incident: Incident, trigger: string): Incident => {
    const rules = storageUtils.getAutomationRules().filter(r => r.enabled && r.trigger === trigger);
    let updatedIncident = { ...incident };

    rules.forEach(rule => {
      // Verificar si todas las condiciones se cumplen
      const conditionsMet = rule.conditions.every(condition => {
        const fieldValue = updatedIncident[condition.field as keyof Incident];
        
        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'not-equals':
            return fieldValue !== condition.value;
          case 'greater-than':
            if (condition.field === 'days-open') {
              const daysOpen = Math.floor((Date.now() - new Date(updatedIncident.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              return daysOpen > (condition.value as number);
            }
            return false;
          case 'less-than':
            if (condition.field === 'days-open') {
              const daysOpen = Math.floor((Date.now() - new Date(updatedIncident.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              return daysOpen < (condition.value as number);
            }
            return false;
          case 'contains':
            if (condition.field === 'has-tag' && updatedIncident.tags) {
              return updatedIncident.tags.includes(condition.value as string);
            }
            return false;
          default:
            return false;
        }
      });

      // Si se cumplen las condiciones, ejecutar las acciones
      if (conditionsMet) {
        rule.actions.forEach(action => {
          switch (action.type) {
            case 'set-priority':
              updatedIncident.priority = action.value as any;
              break;
            case 'set-status':
              updatedIncident.status = action.value as any;
              break;
            case 'add-tag':
              if (!updatedIncident.tags) updatedIncident.tags = [];
              if (!updatedIncident.tags.includes(action.value)) {
                updatedIncident.tags.push(action.value);
              }
              break;
            case 'assign-to':
              updatedIncident.assignedTo = action.value;
              break;
          }
        });
      }
    });

    return updatedIncident;
  }
};
