export type IncidentStatus = 'abierta' | 'en-progreso' | 'puesto-en-test' | 'verificado-en-test' | 'resuelta' | 'cerrada';
export type IncidentPriority = 'baja' | 'media' | 'alta' | 'crítica';
export type IncidentType = 'correctivo' | 'evolutivo' | 'consultivo' | 'tarea';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role?: string;
  avatar?: string;
  email?: string;
  createdAt?: string;
}

export interface Comment {
  id: string;
  incidentId: string;
  author: string;
  text: string;
  timestamp?: string;
  createdAt?: string;
}

export interface PR {
  id: string;
  link: string;
  description: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  hours: number;
  description: string;
  date: string;
  user?: string;
}

export interface Incident {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  type: IncidentType;
  contactUser: string;
  userId: string;
  prQA2: string;
  prMain: string;
  creationDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  comments?: Comment[];
  tags?: string[];
  prQA2List?: PR[];
  prMainList?: PR[];
  relevante?: string;
  realizado?: string;
  clasesModificadas?: string;
  timeTracking?: TimeEntry[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type AutomationTrigger = 'on-create' | 'on-status-change' | 'on-priority-change' | 'on-time-threshold';
export type AutomationAction = 'set-priority' | 'set-status' | 'add-tag' | 'assign-to';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationRuleAction[];
  createdAt: string;
}

export interface AutomationCondition {
  field: 'type' | 'priority' | 'status' | 'days-open' | 'has-tag';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
  value: string | number;
}

export interface AutomationRuleAction {
  type: AutomationAction;
  value: string;
}
