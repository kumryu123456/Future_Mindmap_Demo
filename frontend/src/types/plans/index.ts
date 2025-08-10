// Plans Store Types
export interface Plan {
  id: string;
  name: string;
  description?: string;
  type: 'business' | 'marketing' | 'product' | 'technical' | 'personal' | 'academic' | 'strategic' | 'operational';
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  visibility: 'private' | 'team' | 'organization' | 'public';
  
  // Plan Structure
  objective: string;
  overview: string;
  phases: PlanPhase[];
  
  // Timeline
  timeline: PlanTimeline;
  
  // Resources
  resources: PlanResources;
  
  // Risk Management
  risks: PlanRisk[];
  
  // Success Metrics
  successCriteria: string[];
  kpis: PlanKPI[];
  
  // Deliverables
  deliverables: PlanDeliverable[];
  
  // Dependencies
  dependencies: PlanDependency[];
  
  // Collaboration
  team: PlanTeamMember[];
  stakeholders: PlanStakeholder[];
  
  // Progress Tracking
  progress: PlanProgress;
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
    tags: string[];
    category?: string;
    industry?: string;
    geography?: string;
    templateId?: string;
  };
  
  // Settings
  settings: PlanSettings;
  
  // Integration
  integrations: PlanIntegration[];
}

export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Timeline
  startDate?: string;
  endDate?: string;
  duration: number; // in days
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Dependencies
  dependencies: string[]; // phase IDs
  blockers: PlanBlocker[];
  
  // Tasks
  tasks: PlanTask[];
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    percentage: number;
  };
  
  // Milestones
  milestones: PlanMilestone[];
  
  // Resources
  assignedTeam: string[]; // team member IDs
  budgetAllocated?: number;
  budgetUsed?: number;
  
  // Deliverables
  deliverables: string[]; // deliverable IDs
  
  // Approvals
  approvals: PlanApproval[];
  
  // Notes & Comments
  notes: string;
  comments: PlanComment[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PlanTask {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'subtask' | 'epic' | 'story' | 'bug' | 'research';
  
  // Assignment
  assignedTo: string; // team member ID
  reporter: string;
  reviewers: string[];
  
  // Timeline
  startDate?: string;
  dueDate?: string;
  estimatedHours: number;
  actualHours?: number;
  
  // Dependencies
  dependencies: string[]; // task IDs
  subtasks: string[]; // subtask IDs
  parentTask?: string;
  blockedBy: string[];
  blocking: string[];
  
  // Progress
  progress: number; // 0-100
  completedAt?: string;
  
  // Classification
  tags: string[];
  labels: PlanLabel[];
  component?: string;
  sprint?: string;
  
  // Attachments
  attachments: PlanAttachment[];
  
  // Activity
  timeTracking: PlanTimeEntry[];
  comments: PlanComment[];
  history: PlanTaskHistory[];
  
  // Acceptance Criteria
  acceptanceCriteria: string[];
  testCases: PlanTestCase[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
  };
}

export interface PlanMilestone {
  id: string;
  name: string;
  description: string;
  type: 'major' | 'minor' | 'checkpoint' | 'release' | 'deadline' | 'review';
  status: 'upcoming' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  
  // Timeline
  targetDate: string;
  actualDate?: string;
  
  // Criteria
  completionCriteria: string[];
  successMetrics: PlanMetric[];
  
  // Dependencies
  dependencies: string[]; // task/phase IDs
  
  // Deliverables
  requiredDeliverables: string[];
  
  // Approvals
  approvals: PlanApproval[];
  
  // Notifications
  notifications: PlanNotificationRule[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PlanTimeline {
  startDate: string;
  endDate: string;
  duration: number; // in days
  
  // Actual vs Planned
  actualStartDate?: string;
  actualEndDate?: string;
  actualDuration?: number;
  
  // Working Schedule
  workingDays: number[];
  holidays: PlanHoliday[];
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
  
  // Flexibility
  bufferTime: number; // percentage
  criticalPath: string[]; // task IDs
  
  // Scheduling
  schedulingMethod: 'manual' | 'auto' | 'hybrid';
  lastScheduled?: string;
}

export interface PlanResources {
  // Team
  requiredRoles: PlanRole[];
  teamCapacity: PlanCapacity[];
  
  // Budget
  totalBudget: number;
  budgetCurrency: string;
  budgetBreakdown: PlanBudgetCategory[];
  budgetTracking: PlanBudgetEntry[];
  
  // Technology
  tools: PlanTool[];
  infrastructure: PlanInfrastructure[];
  
  // Materials
  materials: PlanMaterial[];
  
  // External
  vendors: PlanVendor[];
  contractors: PlanContractor[];
}

export interface PlanRisk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'business' | 'operational' | 'financial' | 'legal' | 'strategic' | 'resource' | 'external';
  type: 'threat' | 'opportunity';
  
  // Assessment
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number; // calculated score
  
  // Timeline
  identifiedDate: string;
  reviewDate?: string;
  
  // Mitigation
  mitigation: PlanMitigation[];
  contingencyPlan?: string;
  
  // Ownership
  owner: string; // team member ID
  
  // Status
  status: 'identified' | 'assessed' | 'mitigating' | 'monitoring' | 'closed';
  
  // Impact Areas
  affectedPhases: string[];
  affectedTasks: string[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastReviewedBy?: string;
    lastReviewedAt?: string;
  };
}

export interface PlanKPI {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative';
  category: 'financial' | 'operational' | 'strategic' | 'quality' | 'customer' | 'team';
  
  // Measurement
  unit: string;
  targetValue: number;
  currentValue?: number;
  baseline?: number;
  
  // Thresholds
  excellentThreshold?: number;
  goodThreshold?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  
  // Calculation
  formula?: string;
  calculationMethod: 'manual' | 'automatic' | 'integrated';
  dataSource?: string;
  
  // Tracking
  measurements: PlanMeasurement[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'milestone';
  
  // Ownership
  owner: string;
  stakeholders: string[];
  
  // Status
  status: 'active' | 'inactive' | 'achieved' | 'missed';
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PlanDeliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'software' | 'process' | 'training' | 'hardware' | 'service' | 'report' | 'presentation';
  category: 'internal' | 'external' | 'client' | 'regulatory';
  
  // Status
  status: 'not_started' | 'in_progress' | 'review' | 'approved' | 'delivered' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Timeline
  dueDate: string;
  deliveredDate?: string;
  
  // Quality
  qualityCriteria: string[];
  acceptanceCriteria: string[];
  
  // Assignment
  owner: string;
  contributors: string[];
  approvers: string[];
  
  // Dependencies
  dependencies: string[];
  
  // Attachments
  files: PlanAttachment[];
  
  // Tracking
  versions: PlanVersion[];
  reviews: PlanReview[];
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
  };
}

export interface PlanTeamMember {
  id: string;
  userId: string;
  role: PlanRole;
  permissions: PlanPermission[];
  
  // Assignment
  allocation: number; // percentage
  startDate: string;
  endDate?: string;
  
  // Capacity
  availableHours: number; // per week
  assignedHours: number; // per week
  utilizationRate: number; // percentage
  
  // Skills
  skills: PlanSkill[];
  expertise: string[];
  
  // Performance
  performanceMetrics: PlanPerformanceMetric[];
  
  // Status
  status: 'active' | 'inactive' | 'on_leave' | 'left';
  
  // Contact
  contact: {
    email: string;
    phone?: string;
    timezone: string;
    preferredCommunication: string[];
  };
  
  // Metadata
  metadata: {
    joinedAt: string;
    lastActive?: string;
    addedBy: string;
  };
}

export interface PlanProgress {
  // Overall Progress
  overall: {
    percentage: number;
    status: 'on_track' | 'at_risk' | 'delayed' | 'ahead';
    lastUpdated: string;
  };
  
  // Phase Progress
  phases: {
    [phaseId: string]: {
      percentage: number;
      tasksCompleted: number;
      totalTasks: number;
      status: string;
      startedAt?: string;
      completedAt?: string;
    };
  };
  
  // Timeline Progress
  timeline: {
    daysElapsed: number;
    totalDays: number;
    percentageComplete: number;
    projectedEndDate: string;
    variance: number; // days ahead/behind
  };
  
  // Budget Progress
  budget: {
    spent: number;
    allocated: number;
    percentageUsed: number;
    projected: number;
    variance: number;
  };
  
  // Milestone Progress
  milestones: {
    completed: number;
    total: number;
    upcoming: PlanMilestone[];
    overdue: PlanMilestone[];
  };
  
  // Risk Progress
  risks: {
    totalRisks: number;
    highPriorityRisks: number;
    mitigatedRisks: number;
    newRisks: number;
  };
  
  // Team Progress
  team: {
    utilization: number;
    productivity: number;
    satisfaction?: number;
    capacity: number;
  };
  
  // Quality Progress
  quality: {
    deliverableQuality: number;
    defectRate: number;
    reviewCoverage: number;
    testCoverage: number;
  };
}

export interface PlanSettings {
  // Visibility
  isPublic: boolean;
  allowComments: boolean;
  allowFork: boolean;
  allowExport: boolean;
  
  // Notifications
  notifications: {
    email: boolean;
    inApp: boolean;
    slack?: boolean;
    webhook?: string;
  };
  
  // Workflow
  workflow: {
    requireApproval: boolean;
    autoAssign: boolean;
    autoSchedule: boolean;
    sendReminders: boolean;
  };
  
  // Integration
  integrations: {
    calendar: boolean;
    projectManagement?: string;
    timeTracking?: string;
    reporting?: string;
  };
  
  // Customization
  theme: string;
  layout: 'gantt' | 'kanban' | 'timeline' | 'calendar';
  defaultView: string;
  
  // Data
  autoSave: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // days
}

// Supporting Types
export interface PlanRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  requiredSkills: PlanSkill[];
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'expert';
  hourlyRate?: number;
}

export interface PlanSkill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
  weight: number; // importance weight
}

export interface PlanLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface PlanAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

export interface PlanComment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // for replies
  mentions: string[];
  attachments: PlanAttachment[];
}

export interface PlanTimeEntry {
  id: string;
  userId: string;
  taskId: string;
  date: string;
  hours: number;
  description?: string;
  billable: boolean;
  approved: boolean;
}

export interface PlanApproval {
  id: string;
  type: 'phase' | 'milestone' | 'deliverable' | 'change';
  status: 'pending' | 'approved' | 'rejected' | 'conditionally_approved';
  approver: string;
  approvedAt?: string;
  comments?: string;
  conditions?: string[];
}

export interface PlanMitigation {
  id: string;
  strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  actions: string[];
  owner: string;
  dueDate?: string;
  status: 'planned' | 'in_progress' | 'completed';
  effectiveness?: 'low' | 'medium' | 'high';
}

export interface PlanMetric {
  name: string;
  value: number;
  unit: string;
  target?: number;
  baseline?: number;
}

export interface PlanMeasurement {
  id: string;
  date: string;
  value: number;
  note?: string;
  measuredBy: string;
}

export interface PlanBlocker {
  id: string;
  title: string;
  description: string;
  type: 'dependency' | 'resource' | 'approval' | 'external' | 'technical' | 'business';
  status: 'open' | 'in_progress' | 'resolved';
  owner: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PlanDependency {
  id: string;
  type: 'task' | 'phase' | 'milestone' | 'deliverable' | 'resource' | 'external';
  sourceId: string;
  targetId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // days
  description?: string;
  critical: boolean;
}

export interface PlanStakeholder {
  id: string;
  name: string;
  role: string;
  organization?: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  contact: {
    email: string;
    phone?: string;
  };
  communicationPreference: string[];
  engagement: 'inform' | 'consult' | 'involve' | 'collaborate';
}

export interface PlanIntegration {
  id: string;
  type: 'api' | 'webhook' | 'sync' | 'import' | 'export';
  service: string;
  configuration: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

export interface PlanHoliday {
  date: string;
  name: string;
  type: 'public' | 'company' | 'personal';
  recurring: boolean;
}

export interface PlanCapacity {
  userId: string;
  date: string;
  availableHours: number;
  allocatedHours: number;
  utilizationRate: number;
}

export interface PlanBudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  percentage: number;
}

export interface PlanBudgetEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'expense' | 'income' | 'allocation' | 'transfer';
  description: string;
  approvedBy?: string;
  receipt?: string;
}

export interface PlanTool {
  id: string;
  name: string;
  type: 'software' | 'hardware' | 'service';
  cost: number;
  license: string;
  assignedTo: string[];
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
}

export interface PlanInfrastructure {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'storage' | 'cloud';
  specifications: Record<string, unknown>;
  cost: number;
  provider?: string;
  status: 'active' | 'provisioning' | 'maintenance' | 'decommissioned';
}

export interface PlanMaterial {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  deliveryDate?: string;
  status: 'ordered' | 'delivered' | 'allocated' | 'consumed';
}

export interface PlanVendor {
  id: string;
  name: string;
  services: string[];
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  contractStart?: string;
  contractEnd?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface PlanContractor {
  id: string;
  name: string;
  skills: string[];
  hourlyRate: number;
  availability: number; // hours per week
  startDate?: string;
  endDate?: string;
  status: 'available' | 'assigned' | 'unavailable';
}

export interface PlanTaskHistory {
  id: string;
  action: 'created' | 'updated' | 'assigned' | 'commented' | 'completed' | 'reopened';
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  userId: string;
  timestamp: string;
  description?: string;
}

export interface PlanTestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'pass' | 'fail' | 'pending' | 'blocked';
  executedBy?: string;
  executedAt?: string;
  notes?: string;
}

export interface PlanNotificationRule {
  id: string;
  event: 'due_date' | 'overdue' | 'completed' | 'assigned' | 'mentioned' | 'milestone' | 'risk';
  recipients: string[];
  channels: ('email' | 'in_app' | 'slack' | 'webhook')[];
  frequency: 'immediate' | 'daily' | 'weekly';
  enabled: boolean;
}

export interface PlanPerformanceMetric {
  name: string;
  value: number;
  unit: string;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PlanVersion {
  id: string;
  version: string;
  changes: string;
  createdBy: string;
  createdAt: string;
  fileUrl: string;
  size: number;
  status: 'draft' | 'review' | 'approved' | 'current' | 'archived';
}

export interface PlanReview {
  id: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  comments: string;
  reviewedAt?: string;
  criteria: string[];
}

// Plans Store State
export interface PlansStoreState {
  // Core Data
  plans: Record<string, Plan>;
  activePlanId?: string;
  
  // Selection & Navigation
  selection: {
    selectedPlanIds: string[];
    selectedPhaseId?: string;
    selectedTaskIds: string[];
    selectedMilestoneIds: string[];
    lastSelectedId?: string;
  };
  
  // Views & Filters
  view: {
    currentView: 'list' | 'gantt' | 'kanban' | 'calendar' | 'timeline' | 'dashboard';
    filters: PlanFilters;
    sorting: PlanSorting;
    grouping: PlanGrouping;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  
  // Search & Analytics
  search: {
    query: string;
    results: PlanSearchResult[];
    filters: PlanSearchFilters;
    isActive: boolean;
  };
  
  // Templates & Presets
  templates: Record<string, PlanTemplate>;
  presets: Record<string, PlanPreset>;
  
  // Collaboration
  collaboration: {
    activeUsers: PlanActiveUser[];
    realtimeChanges: PlanChange[];
    conflicts: PlanConflict[];
    permissions: Record<string, PlanPermission[]>;
  };
  
  // Import/Export
  importExport: {
    status: 'idle' | 'importing' | 'exporting' | 'processing';
    progress: number;
    format?: string;
    errors: string[];
  };
  
  // Notifications
  notifications: PlanNotification[];
  
  // Settings
  settings: {
    defaultView: string;
    autoSave: boolean;
    notifications: boolean;
    theme: string;
    timezone: string;
    workingHours: {
      start: string;
      end: string;
      days: number[];
    };
  };
  
  // UI State
  ui: {
    isLoading: boolean;
    error?: string;
    selectedTab: string;
    sidebarOpen: boolean;
    modals: {
      createPlan: boolean;
      editTask: boolean;
      assignTeam: boolean;
      manageRisks: boolean;
      reports: boolean;
    };
    dragDrop: {
      isDragging: boolean;
      draggedItem?: {
        type: 'task' | 'phase' | 'milestone';
        id: string;
      };
      dropTarget?: {
        type: string;
        id: string;
      };
    };
  };
  
  // Cache & Performance
  cache: {
    calculations: Record<string, unknown>;
    lastUpdated: Record<string, string>;
  };
  
  // Offline Support
  offline: {
    isOffline: boolean;
    pendingChanges: PlanChange[];
    lastSync: string;
  };
}

// Supporting Search & Filter Types
export interface PlanFilters {
  type: string[];
  status: string[];
  priority: string[];
  assignee: string[];
  dateRange: {
    start: string;
    end: string;
    field: 'createdAt' | 'updatedAt' | 'dueDate' | 'startDate';
  };
  tags: string[];
  progress: {
    min: number;
    max: number;
  };
  budget: {
    min: number;
    max: number;
  };
}

export interface PlanSorting {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface PlanGrouping {
  field: string;
  collapsed: string[];
}

export interface PlanSearchResult {
  planId: string;
  type: 'plan' | 'phase' | 'task' | 'milestone';
  id: string;
  title: string;
  description: string;
  score: number;
  highlights: string[];
}

export interface PlanSearchFilters {
  types: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeArchived: boolean;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  structure: Partial<Plan>;
  customFields: PlanCustomField[];
  popularity: number;
  rating: number;
  createdBy: string;
  isPublic: boolean;
}

export interface PlanPreset {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, unknown>;
  type: 'view' | 'filter' | 'report' | 'workflow';
}

export interface PlanActiveUser {
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  currentPlan?: string;
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
    target: string;
  };
}

export interface PlanChange {
  id: string;
  planId: string;
  type: 'create' | 'update' | 'delete' | 'move';
  entity: 'plan' | 'phase' | 'task' | 'milestone' | 'team';
  entityId: string;
  data: Record<string, unknown>;
  userId: string;
  timestamp: string;
  applied: boolean;
}

export interface PlanConflict {
  id: string;
  planId: string;
  entityId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  users: string[];
  timestamp: string;
  resolved: boolean;
}

export interface PlanPermission {
  action: string;
  resource: string;
  granted: boolean;
  conditions?: Record<string, unknown>;
}

export interface PlanNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  planId?: string;
  entityId?: string;
  actions?: PlanNotificationAction[];
  timestamp: string;
  read: boolean;
  persistent: boolean;
}

export interface PlanNotificationAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface PlanCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'boolean' | 'user';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}