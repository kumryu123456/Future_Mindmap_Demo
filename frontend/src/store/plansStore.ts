import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type {
  PlansStoreState,
  Plan,
  PlanPhase,
  PlanTask,
  PlanMilestone,
  PlanTeamMember,
  PlanRisk,
  PlanDeliverable,
  PlanKPI,
  PlanFilters,
  PlanSearchFilters,
  PlanTemplate,
  PlanNotification
} from '../types/plans';

// Initial state
const initialState: PlansStoreState = {
  plans: {},
  activePlanId: undefined,
  
  selection: {
    selectedPlanIds: [],
    selectedPhaseId: undefined,
    selectedTaskIds: [],
    selectedMilestoneIds: [],
    lastSelectedId: undefined
  },
  
  view: {
    currentView: 'list',
    filters: {
      type: [],
      status: [],
      priority: [],
      assignee: [],
      dateRange: {
        start: '',
        end: '',
        field: 'createdAt'
      },
      tags: [],
      progress: { min: 0, max: 100 },
      budget: { min: 0, max: Infinity }
    },
    sorting: {
      field: 'updatedAt',
      direction: 'desc'
    },
    grouping: {
      field: 'none',
      collapsed: []
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  },
  
  search: {
    query: '',
    results: [],
    filters: {
      types: [],
      includeArchived: false
    },
    isActive: false
  },
  
  templates: {},
  presets: {},
  
  collaboration: {
    activeUsers: [],
    realtimeChanges: [],
    conflicts: [],
    permissions: {}
  },
  
  importExport: {
    status: 'idle',
    progress: 0,
    errors: []
  },
  
  notifications: [],
  
  settings: {
    defaultView: 'list',
    autoSave: true,
    notifications: true,
    theme: 'default',
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    }
  },
  
  ui: {
    isLoading: false,
    error: undefined,
    selectedTab: 'overview',
    sidebarOpen: true,
    modals: {
      createPlan: false,
      editTask: false,
      assignTeam: false,
      manageRisks: false,
      reports: false
    },
    dragDrop: {
      isDragging: false,
      draggedItem: undefined,
      dropTarget: undefined
    }
  },
  
  cache: {
    calculations: {},
    lastUpdated: {}
  },
  
  offline: {
    isOffline: false,
    pendingChanges: [],
    lastSync: new Date().toISOString()
  }
};

// Helper functions
const generatePlanId = (): string => `plan_${uuidv4()}`;
const generatePhaseId = (): string => `phase_${uuidv4()}`;
const generateTaskId = (): string => `task_${uuidv4()}`;
const generateMilestoneId = (): string => `milestone_${uuidv4()}`;

const calculatePlanProgress = (plan: Plan): number => {
  if (plan.phases.length === 0) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  plan.phases.forEach(phase => {
    totalTasks += phase.tasks.length;
    completedTasks += phase.tasks.filter(task => task.status === 'completed').length;
  });
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

const calculatePhaseProgress = (phase: PlanPhase): number => {
  if (phase.tasks.length === 0) return 0;
  
  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / phase.tasks.length) * 100);
};

const updatePlanTimestamps = (plan: Plan, userId: string) => {
  plan.metadata.updatedAt = new Date().toISOString();
  plan.metadata.lastModifiedBy = userId;
  plan.metadata.version += 1;
};

// Plans Store Actions Interface
export interface PlansStoreActions {
  // Plan Management
  createPlan: (planData: Partial<Plan>) => string;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  deletePlan: (planId: string) => void;
  duplicatePlan: (planId: string, newName?: string) => string;
  setActivePlan: (planId: string) => void;
  
  // Phase Management
  createPhase: (planId: string, phaseData: Partial<PlanPhase>) => string;
  updatePhase: (planId: string, phaseId: string, updates: Partial<PlanPhase>) => void;
  deletePhase: (planId: string, phaseId: string) => void;
  reorderPhases: (planId: string, phaseIds: string[]) => void;
  
  // Task Management
  createTask: (planId: string, phaseId: string, taskData: Partial<PlanTask>) => string;
  updateTask: (planId: string, phaseId: string, taskId: string, updates: Partial<PlanTask>) => void;
  deleteTask: (planId: string, phaseId: string, taskId: string) => void;
  moveTask: (planId: string, taskId: string, fromPhaseId: string, toPhaseId: string) => void;
  assignTask: (planId: string, phaseId: string, taskId: string, userId: string) => void;
  
  // Milestone Management
  createMilestone: (planId: string, phaseId: string, milestoneData: Partial<PlanMilestone>) => string;
  updateMilestone: (planId: string, phaseId: string, milestoneId: string, updates: Partial<PlanMilestone>) => void;
  deleteMilestone: (planId: string, phaseId: string, milestoneId: string) => void;
  
  // Team Management
  addTeamMember: (planId: string, memberData: Partial<PlanTeamMember>) => void;
  updateTeamMember: (planId: string, memberId: string, updates: Partial<PlanTeamMember>) => void;
  removeTeamMember: (planId: string, memberId: string) => void;
  
  // Risk Management
  addRisk: (planId: string, riskData: Partial<PlanRisk>) => string;
  updateRisk: (planId: string, riskId: string, updates: Partial<PlanRisk>) => void;
  removeRisk: (planId: string, riskId: string) => void;
  
  // Deliverable Management
  addDeliverable: (planId: string, deliverableData: Partial<PlanDeliverable>) => string;
  updateDeliverable: (planId: string, deliverableId: string, updates: Partial<PlanDeliverable>) => void;
  removeDeliverable: (planId: string, deliverableId: string) => void;
  
  // KPI Management
  addKPI: (planId: string, kpiData: Partial<PlanKPI>) => string;
  updateKPI: (planId: string, kpiId: string, updates: Partial<PlanKPI>) => void;
  removeKPI: (planId: string, kpiId: string) => void;
  
  // Selection Management
  selectPlan: (planId: string, addToSelection?: boolean) => void;
  selectPhase: (phaseId: string) => void;
  selectTask: (taskId: string, addToSelection?: boolean) => void;
  selectMilestone: (milestoneId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  
  // View Management
  setView: (view: PlansStoreState['view']['currentView']) => void;
  setFilters: (filters: Partial<PlanFilters>) => void;
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
  setGrouping: (field: string) => void;
  
  // Search
  startSearch: (query: string) => void;
  updateSearchFilters: (filters: Partial<PlanSearchFilters>) => void;
  clearSearch: () => void;
  
  // Templates
  createTemplate: (planId: string, templateData: Partial<PlanTemplate>) => string;
  updateTemplate: (templateId: string, updates: Partial<PlanTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string) => string;
  
  // Import/Export
  importPlans: (data: unknown, format: string) => void;
  exportPlans: (planIds: string[], format: string) => void;
  
  // Notifications
  addNotification: (notification: Partial<PlanNotification>) => void;
  removeNotification: (notificationId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Settings
  updateSettings: (settings: Partial<PlansStoreState['settings']>) => void;
  
  // UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  toggleModal: (modal: keyof PlansStoreState['ui']['modals']) => void;
  toggleSidebar: () => void;
  setDragDrop: (state: Partial<PlansStoreState['ui']['dragDrop']>) => void;
  
  // Collaboration
  addActiveUser: (user: PlansStoreState['collaboration']['activeUsers'][0]) => void;
  removeActiveUser: (userId: string) => void;
  addRealtimeChange: (change: PlansStoreState['collaboration']['realtimeChanges'][0]) => void;
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote') => void;
  
  // Offline Support
  setOfflineStatus: (isOffline: boolean) => void;
  addPendingChange: (change: PlansStoreState['offline']['pendingChanges'][0]) => void;
  syncPendingChanges: () => void;
}

// Create the Plans Store
export const usePlansStore = create<PlansStoreState & PlansStoreActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        
        // Plan Management
        createPlan: (planData) => {
          const planId = generatePlanId();
          const currentUser = 'current-user'; // TODO: Get from auth context
          
          set((state) => {
            const newPlan: Plan = {
              id: planId,
              name: planData.name || 'New Plan',
              description: planData.description || '',
              type: planData.type || 'business',
              status: planData.status || 'draft',
              priority: planData.priority || 'medium',
              visibility: planData.visibility || 'private',
              objective: planData.objective || '',
              overview: planData.overview || '',
              phases: [],
              timeline: {
                startDate: planData.timeline?.startDate || new Date().toISOString().split('T')[0],
                endDate: planData.timeline?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                duration: 30,
                workingDays: [1, 2, 3, 4, 5],
                holidays: [],
                workingHours: {
                  start: '09:00',
                  end: '17:00',
                  timezone: 'UTC'
                },
                bufferTime: 10,
                criticalPath: [],
                schedulingMethod: 'auto'
              },
              resources: {
                requiredRoles: [],
                teamCapacity: [],
                totalBudget: planData.resources?.totalBudget || 0,
                budgetCurrency: planData.resources?.budgetCurrency || 'USD',
                budgetBreakdown: [],
                budgetTracking: [],
                tools: [],
                infrastructure: [],
                materials: [],
                vendors: [],
                contractors: []
              },
              risks: [],
              successCriteria: planData.successCriteria || [],
              kpis: [],
              deliverables: [],
              dependencies: [],
              team: [],
              stakeholders: [],
              progress: {
                overall: {
                  percentage: 0,
                  status: 'on_track',
                  lastUpdated: new Date().toISOString()
                },
                phases: {},
                timeline: {
                  daysElapsed: 0,
                  totalDays: 30,
                  percentageComplete: 0,
                  projectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  variance: 0
                },
                budget: {
                  spent: 0,
                  allocated: planData.resources?.totalBudget || 0,
                  percentageUsed: 0,
                  projected: 0,
                  variance: 0
                },
                milestones: {
                  completed: 0,
                  total: 0,
                  upcoming: [],
                  overdue: []
                },
                risks: {
                  totalRisks: 0,
                  highPriorityRisks: 0,
                  mitigatedRisks: 0,
                  newRisks: 0
                },
                team: {
                  utilization: 0,
                  productivity: 0,
                  capacity: 0
                },
                quality: {
                  deliverableQuality: 0,
                  defectRate: 0,
                  reviewCoverage: 0,
                  testCoverage: 0
                }
              },
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: currentUser,
                lastModifiedBy: currentUser,
                version: 1,
                tags: planData.metadata?.tags || [],
                category: planData.metadata?.category,
                industry: planData.metadata?.industry,
                geography: planData.metadata?.geography,
                templateId: planData.metadata?.templateId
              },
              settings: {
                isPublic: planData.settings?.isPublic || false,
                allowComments: planData.settings?.allowComments || true,
                allowFork: planData.settings?.allowFork || false,
                allowExport: planData.settings?.allowExport || true,
                notifications: {
                  email: true,
                  inApp: true,
                  slack: false
                },
                workflow: {
                  requireApproval: false,
                  autoAssign: false,
                  autoSchedule: true,
                  sendReminders: true
                },
                integrations: {
                  calendar: false
                },
                theme: 'default',
                layout: 'gantt',
                defaultView: 'overview',
                autoSave: true,
                backupFrequency: 'daily',
                retentionPeriod: 90
              },
              integrations: []
            };
            
            state.plans[planId] = newPlan;
            state.activePlanId = planId;
          });
          
          return planId;
        },
        
        updatePlan: (planId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            Object.assign(plan, updates);
            updatePlanTimestamps(plan, 'current-user');
            
            // Recalculate progress if phases were updated
            if (updates.phases) {
              plan.progress.overall.percentage = calculatePlanProgress(plan);
              plan.progress.overall.lastUpdated = new Date().toISOString();
            }
          });
        },
        
        deletePlan: (planId) => {
          set((state) => {
            delete state.plans[planId];
            
            // Update active plan if deleted
            if (state.activePlanId === planId) {
              const remainingPlans = Object.keys(state.plans);
              state.activePlanId = remainingPlans.length > 0 ? remainingPlans[0] : undefined;
            }
            
            // Remove from selection
            state.selection.selectedPlanIds = state.selection.selectedPlanIds.filter(id => id !== planId);
          });
        },
        
        duplicatePlan: (planId, newName) => {
          const originalPlan = get().plans[planId];
          if (!originalPlan) return '';
          
          const duplicatedPlan = {
            ...originalPlan,
            name: newName || `${originalPlan.name} (Copy)`,
            metadata: {
              ...originalPlan.metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1
            }
          };
          
          return get().createPlan(duplicatedPlan);
        },
        
        setActivePlan: (planId) => {
          set((state) => {
            if (state.plans[planId]) {
              state.activePlanId = planId;
            }
          });
        },
        
        // Phase Management
        createPhase: (planId, phaseData) => {
          const phaseId = generatePhaseId();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const newPhase: PlanPhase = {
              id: phaseId,
              name: phaseData.name || 'New Phase',
              description: phaseData.description || '',
              order: phaseData.order || plan.phases.length + 1,
              status: phaseData.status || 'not_started',
              priority: phaseData.priority || 'medium',
              startDate: phaseData.startDate,
              endDate: phaseData.endDate,
              duration: phaseData.duration || 7,
              dependencies: phaseData.dependencies || [],
              blockers: [],
              tasks: [],
              taskStats: {
                total: 0,
                completed: 0,
                inProgress: 0,
                blocked: 0,
                percentage: 0
              },
              milestones: [],
              assignedTeam: phaseData.assignedTeam || [],
              budgetAllocated: phaseData.budgetAllocated,
              budgetUsed: 0,
              deliverables: phaseData.deliverables || [],
              approvals: [],
              notes: phaseData.notes || '',
              comments: [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user'
              }
            };
            
            plan.phases.push(newPhase);
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return phaseId;
        },
        
        updatePhase: (planId, phaseId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            Object.assign(phase, updates);
            phase.metadata.updatedAt = new Date().toISOString();
            
            // Recalculate task stats
            const tasks = phase.tasks;
            phase.taskStats = {
              total: tasks.length,
              completed: tasks.filter(t => t.status === 'completed').length,
              inProgress: tasks.filter(t => t.status === 'in_progress').length,
              blocked: tasks.filter(t => t.status === 'blocked').length,
              percentage: calculatePhaseProgress(phase)
            };
            
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        deletePhase: (planId, phaseId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            plan.phases = plan.phases.filter(p => p.id !== phaseId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        reorderPhases: (planId, phaseIds) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const reorderedPhases = phaseIds.map(phaseId => 
              plan.phases.find(p => p.id === phaseId)
            ).filter(Boolean) as PlanPhase[];
            
            reorderedPhases.forEach((phase, index) => {
              phase.order = index + 1;
            });
            
            plan.phases = reorderedPhases;
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // Task Management
        createTask: (planId, phaseId, taskData) => {
          const taskId = generateTaskId();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            const newTask: PlanTask = {
              id: taskId,
              name: taskData.name || 'New Task',
              description: taskData.description || '',
              status: taskData.status || 'not_started',
              priority: taskData.priority || 'medium',
              type: taskData.type || 'task',
              assignedTo: taskData.assignedTo || '',
              reporter: taskData.reporter || 'current-user',
              reviewers: taskData.reviewers || [],
              startDate: taskData.startDate,
              dueDate: taskData.dueDate,
              estimatedHours: taskData.estimatedHours || 8,
              actualHours: taskData.actualHours,
              dependencies: taskData.dependencies || [],
              subtasks: [],
              parentTask: taskData.parentTask,
              blockedBy: [],
              blocking: [],
              progress: 0,
              tags: taskData.tags || [],
              labels: taskData.labels || [],
              component: taskData.component,
              sprint: taskData.sprint,
              attachments: [],
              timeTracking: [],
              comments: [],
              history: [],
              acceptanceCriteria: taskData.acceptanceCriteria || [],
              testCases: [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user',
                lastModifiedBy: 'current-user'
              }
            };
            
            phase.tasks.push(newTask);
            
            // Update phase task stats
            get().updatePhase(planId, phaseId, {});
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return taskId;
        },
        
        updateTask: (planId, phaseId, taskId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            const task = phase.tasks.find(t => t.id === taskId);
            if (!task) return;
            
            Object.assign(task, updates);
            task.metadata.updatedAt = new Date().toISOString();
            task.metadata.lastModifiedBy = 'current-user';
            
            // Update progress based on status
            if (updates.status === 'completed' && task.progress !== 100) {
              task.progress = 100;
              task.completedAt = new Date().toISOString();
            } else if (updates.status !== 'completed' && task.progress === 100) {
              task.progress = Math.max(0, task.progress - 10);
              task.completedAt = undefined;
            }
            
            // Update phase task stats
            get().updatePhase(planId, phaseId, {});
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        deleteTask: (planId, phaseId, taskId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            phase.tasks = phase.tasks.filter(t => t.id !== taskId);
            
            // Update phase task stats
            get().updatePhase(planId, phaseId, {});
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        moveTask: (planId, taskId, fromPhaseId, toPhaseId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const fromPhase = plan.phases.find(p => p.id === fromPhaseId);
            const toPhase = plan.phases.find(p => p.id === toPhaseId);
            
            if (!fromPhase || !toPhase) return;
            
            const taskIndex = fromPhase.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return;
            
            const task = fromPhase.tasks.splice(taskIndex, 1)[0];
            toPhase.tasks.push(task);
            
            // Update both phases
            get().updatePhase(planId, fromPhaseId, {});
            get().updatePhase(planId, toPhaseId, {});
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        assignTask: (planId, phaseId, taskId, userId) => {
          get().updateTask(planId, phaseId, taskId, { assignedTo: userId });
        },
        
        // Milestone Management
        createMilestone: (planId, phaseId, milestoneData) => {
          const milestoneId = generateMilestoneId();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            const newMilestone: PlanMilestone = {
              id: milestoneId,
              name: milestoneData.name || 'New Milestone',
              description: milestoneData.description || '',
              type: milestoneData.type || 'checkpoint',
              status: milestoneData.status || 'upcoming',
              targetDate: milestoneData.targetDate || new Date().toISOString().split('T')[0],
              completionCriteria: milestoneData.completionCriteria || [],
              successMetrics: milestoneData.successMetrics || [],
              dependencies: milestoneData.dependencies || [],
              requiredDeliverables: milestoneData.requiredDeliverables || [],
              approvals: [],
              notifications: [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user'
              }
            };
            
            phase.milestones.push(newMilestone);
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return milestoneId;
        },
        
        updateMilestone: (planId, phaseId, milestoneId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            const milestone = phase.milestones.find(m => m.id === milestoneId);
            if (!milestone) return;
            
            Object.assign(milestone, updates);
            milestone.metadata.updatedAt = new Date().toISOString();
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        deleteMilestone: (planId, phaseId, milestoneId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const phase = plan.phases.find(p => p.id === phaseId);
            if (!phase) return;
            
            phase.milestones = phase.milestones.filter(m => m.id !== milestoneId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // Team Management
        addTeamMember: (planId, memberData) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const newMember: PlanTeamMember = {
              id: uuidv4(),
              userId: memberData.userId || '',
              role: memberData.role || {
                id: 'member',
                name: 'Team Member',
                description: 'General team member',
                responsibilities: [],
                requiredSkills: [],
                level: 'mid'
              },
              permissions: memberData.permissions || [],
              allocation: memberData.allocation || 100,
              startDate: memberData.startDate || new Date().toISOString().split('T')[0],
              availableHours: memberData.availableHours || 40,
              assignedHours: 0,
              utilizationRate: 0,
              skills: memberData.skills || [],
              expertise: memberData.expertise || [],
              performanceMetrics: [],
              status: 'active',
              contact: memberData.contact || {
                email: '',
                timezone: 'UTC',
                preferredCommunication: ['email']
              },
              metadata: {
                joinedAt: new Date().toISOString(),
                addedBy: 'current-user'
              }
            };
            
            plan.team.push(newMember);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        updateTeamMember: (planId, memberId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const member = plan.team.find(m => m.id === memberId);
            if (!member) return;
            
            Object.assign(member, updates);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        removeTeamMember: (planId, memberId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            plan.team = plan.team.filter(m => m.id !== memberId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // Risk Management
        addRisk: (planId, riskData) => {
          const riskId = uuidv4();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const newRisk: PlanRisk = {
              id: riskId,
              title: riskData.title || 'New Risk',
              description: riskData.description || '',
              category: riskData.category || 'business',
              type: riskData.type || 'threat',
              probability: riskData.probability || 'medium',
              impact: riskData.impact || 'medium',
              riskScore: 5, // Calculate based on probability and impact
              identifiedDate: new Date().toISOString().split('T')[0],
              mitigation: riskData.mitigation || [],
              owner: riskData.owner || 'current-user',
              status: 'identified',
              affectedPhases: riskData.affectedPhases || [],
              affectedTasks: riskData.affectedTasks || [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user'
              }
            };
            
            plan.risks.push(newRisk);
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return riskId;
        },
        
        updateRisk: (planId, riskId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const risk = plan.risks.find(r => r.id === riskId);
            if (!risk) return;
            
            Object.assign(risk, updates);
            risk.metadata.updatedAt = new Date().toISOString();
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        removeRisk: (planId, riskId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            plan.risks = plan.risks.filter(r => r.id !== riskId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // Deliverable Management
        addDeliverable: (planId, deliverableData) => {
          const deliverableId = uuidv4();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const newDeliverable: PlanDeliverable = {
              id: deliverableId,
              name: deliverableData.name || 'New Deliverable',
              description: deliverableData.description || '',
              type: deliverableData.type || 'document',
              category: deliverableData.category || 'internal',
              status: 'not_started',
              priority: deliverableData.priority || 'medium',
              dueDate: deliverableData.dueDate || new Date().toISOString().split('T')[0],
              qualityCriteria: deliverableData.qualityCriteria || [],
              acceptanceCriteria: deliverableData.acceptanceCriteria || [],
              owner: deliverableData.owner || 'current-user',
              contributors: deliverableData.contributors || [],
              approvers: deliverableData.approvers || [],
              dependencies: deliverableData.dependencies || [],
              files: [],
              versions: [],
              reviews: [],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user',
                lastModifiedBy: 'current-user'
              }
            };
            
            plan.deliverables.push(newDeliverable);
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return deliverableId;
        },
        
        updateDeliverable: (planId, deliverableId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const deliverable = plan.deliverables.find(d => d.id === deliverableId);
            if (!deliverable) return;
            
            Object.assign(deliverable, updates);
            deliverable.metadata.updatedAt = new Date().toISOString();
            deliverable.metadata.lastModifiedBy = 'current-user';
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        removeDeliverable: (planId, deliverableId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            plan.deliverables = plan.deliverables.filter(d => d.id !== deliverableId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // KPI Management
        addKPI: (planId, kpiData) => {
          const kpiId = uuidv4();
          
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const newKPI: PlanKPI = {
              id: kpiId,
              name: kpiData.name || 'New KPI',
              description: kpiData.description || '',
              type: kpiData.type || 'quantitative',
              category: kpiData.category || 'operational',
              unit: kpiData.unit || '',
              targetValue: kpiData.targetValue || 0,
              calculationMethod: kpiData.calculationMethod || 'manual',
              measurements: [],
              frequency: kpiData.frequency || 'monthly',
              owner: kpiData.owner || 'current-user',
              stakeholders: kpiData.stakeholders || [],
              status: 'active',
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user'
              }
            };
            
            plan.kpis.push(newKPI);
            updatePlanTimestamps(plan, 'current-user');
          });
          
          return kpiId;
        },
        
        updateKPI: (planId, kpiId, updates) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            const kpi = plan.kpis.find(k => k.id === kpiId);
            if (!kpi) return;
            
            Object.assign(kpi, updates);
            kpi.metadata.updatedAt = new Date().toISOString();
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        removeKPI: (planId, kpiId) => {
          set((state) => {
            const plan = state.plans[planId];
            if (!plan) return;
            
            plan.kpis = plan.kpis.filter(k => k.id !== kpiId);
            updatePlanTimestamps(plan, 'current-user');
          });
        },
        
        // Selection Management
        selectPlan: (planId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selection.selectedPlanIds.includes(planId)) {
                state.selection.selectedPlanIds.push(planId);
              }
            } else {
              state.selection.selectedPlanIds = [planId];
            }
            state.selection.lastSelectedId = planId;
          });
        },
        
        selectPhase: (phaseId) => {
          set((state) => {
            state.selection.selectedPhaseId = phaseId;
            state.selection.lastSelectedId = phaseId;
          });
        },
        
        selectTask: (taskId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selection.selectedTaskIds.includes(taskId)) {
                state.selection.selectedTaskIds.push(taskId);
              }
            } else {
              state.selection.selectedTaskIds = [taskId];
            }
            state.selection.lastSelectedId = taskId;
          });
        },
        
        selectMilestone: (milestoneId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selection.selectedMilestoneIds.includes(milestoneId)) {
                state.selection.selectedMilestoneIds.push(milestoneId);
              }
            } else {
              state.selection.selectedMilestoneIds = [milestoneId];
            }
            state.selection.lastSelectedId = milestoneId;
          });
        },
        
        clearSelection: () => {
          set((state) => {
            state.selection.selectedPlanIds = [];
            state.selection.selectedPhaseId = undefined;
            state.selection.selectedTaskIds = [];
            state.selection.selectedMilestoneIds = [];
            state.selection.lastSelectedId = undefined;
          });
        },
        
        // View Management
        setView: (view) => {
          set((state) => {
            state.view.currentView = view;
          });
        },
        
        setFilters: (filters) => {
          set((state) => {
            Object.assign(state.view.filters, filters);
          });
        },
        
        setSorting: (field, direction) => {
          set((state) => {
            state.view.sorting.field = field;
            state.view.sorting.direction = direction;
          });
        },
        
        setGrouping: (field) => {
          set((state) => {
            state.view.grouping.field = field;
            state.view.grouping.collapsed = [];
          });
        },
        
        // Search
        startSearch: (query) => {
          set((state) => {
            state.search.query = query;
            state.search.isActive = true;
            
            // Simple search implementation
            const results = [];
            for (const plan of Object.values(state.plans)) {
              // Search plan
              if (plan.name.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  planId: plan.id,
                  type: 'plan' as const,
                  id: plan.id,
                  title: plan.name,
                  description: plan.description || '',
                  score: 1,
                  highlights: [plan.name]
                });
              }
              
              // Search phases
              for (const phase of plan.phases) {
                if (phase.name.toLowerCase().includes(query.toLowerCase())) {
                  results.push({
                    planId: plan.id,
                    type: 'phase' as const,
                    id: phase.id,
                    title: phase.name,
                    description: phase.description,
                    score: 0.8,
                    highlights: [phase.name]
                  });
                }
                
                // Search tasks
                for (const task of phase.tasks) {
                  if (task.name.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                      planId: plan.id,
                      type: 'task' as const,
                      id: task.id,
                      title: task.name,
                      description: task.description,
                      score: 0.6,
                      highlights: [task.name]
                    });
                  }
                }
              }
            }
            
            state.search.results = results.sort((a, b) => b.score - a.score);
          });
        },
        
        updateSearchFilters: (filters) => {
          set((state) => {
            Object.assign(state.search.filters, filters);
          });
        },
        
        clearSearch: () => {
          set((state) => {
            state.search.query = '';
            state.search.results = [];
            state.search.isActive = false;
          });
        },
        
        // Templates
        createTemplate: (planId, templateData) => {
          const templateId = uuidv4();
          const plan = get().plans[planId];
          
          if (!plan) return '';
          
          set((state) => {
            const template: PlanTemplate = {
              id: templateId,
              name: templateData.name || `${plan.name} Template`,
              description: templateData.description || '',
              category: templateData.category || 'custom',
              type: plan.type,
              structure: {
                name: '',
                type: plan.type,
                phases: plan.phases.map(phase => ({
                  ...phase,
                  id: '',
                  tasks: phase.tasks.map(task => ({
                    ...task,
                    id: '',
                    assignedTo: '',
                    status: 'not_started'
                  }))
                }))
              },
              customFields: [],
              popularity: 0,
              rating: 0,
              createdBy: 'current-user',
              isPublic: templateData.isPublic || false
            };
            
            state.templates[templateId] = template;
          });
          
          return templateId;
        },
        
        updateTemplate: (templateId, updates) => {
          set((state) => {
            const template = state.templates[templateId];
            if (!template) return;
            
            Object.assign(template, updates);
          });
        },
        
        deleteTemplate: (templateId) => {
          set((state) => {
            delete state.templates[templateId];
          });
        },
        
        applyTemplate: (templateId) => {
          const template = get().templates[templateId];
          if (!template) return '';
          
          return get().createPlan(template.structure);
        },
        
        // Import/Export
        importPlans: (data, format) => {
          set((state) => {
            state.importExport.status = 'importing';
            state.importExport.format = format;
            state.importExport.progress = 0;
            
            // TODO: Implement actual import logic
            console.log('Importing plans:', format, data);
            
            state.importExport.status = 'idle';
            state.importExport.progress = 100;
          });
        },
        
        exportPlans: (planIds, format) => {
          set((state) => {
            state.importExport.status = 'exporting';
            state.importExport.format = format;
            state.importExport.progress = 0;
            
            // TODO: Implement actual export logic
            console.log('Exporting plans:', planIds, format);
            
            state.importExport.status = 'idle';
            state.importExport.progress = 100;
          });
        },
        
        // Notifications
        addNotification: (notificationData) => {
          set((state) => {
            const notification: PlanNotification = {
              id: uuidv4(),
              type: notificationData.type || 'info',
              title: notificationData.title || '',
              message: notificationData.message || '',
              planId: notificationData.planId,
              entityId: notificationData.entityId,
              actions: notificationData.actions || [],
              timestamp: new Date().toISOString(),
              read: false,
              persistent: notificationData.persistent || false
            };
            
            state.notifications.unshift(notification);
          });
        },
        
        removeNotification: (notificationId) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== notificationId);
          });
        },
        
        markNotificationRead: (notificationId) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.read = true;
            }
          });
        },
        
        clearNotifications: () => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.persistent);
          });
        },
        
        // Settings
        updateSettings: (settings) => {
          set((state) => {
            Object.assign(state.settings, settings);
          });
        },
        
        // UI State
        setLoading: (loading) => {
          set((state) => {
            state.ui.isLoading = loading;
          });
        },
        
        setError: (error) => {
          set((state) => {
            state.ui.error = error;
          });
        },
        
        toggleModal: (modal) => {
          set((state) => {
            state.ui.modals[modal] = !state.ui.modals[modal];
          });
        },
        
        toggleSidebar: () => {
          set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          });
        },
        
        setDragDrop: (dragDropState) => {
          set((state) => {
            Object.assign(state.ui.dragDrop, dragDropState);
          });
        },
        
        // Collaboration
        addActiveUser: (user) => {
          set((state) => {
            const existingIndex = state.collaboration.activeUsers.findIndex(u => u.userId === user.userId);
            if (existingIndex >= 0) {
              state.collaboration.activeUsers[existingIndex] = user;
            } else {
              state.collaboration.activeUsers.push(user);
            }
          });
        },
        
        removeActiveUser: (userId) => {
          set((state) => {
            state.collaboration.activeUsers = state.collaboration.activeUsers.filter(u => u.userId !== userId);
          });
        },
        
        addRealtimeChange: (change) => {
          set((state) => {
            state.collaboration.realtimeChanges.push(change);
          });
        },
        
        resolveConflict: (conflictId, resolution) => {
          set((state) => {
            const conflict = state.collaboration.conflicts.find(c => c.id === conflictId);
            if (!conflict) return;
            
            conflict.resolved = true;
            
            // Apply the resolution
            // TODO: Implement conflict resolution logic
            console.log('Resolving conflict:', conflictId, resolution);
          });
        },
        
        // Offline Support
        setOfflineStatus: (isOffline) => {
          set((state) => {
            state.offline.isOffline = isOffline;
          });
        },
        
        addPendingChange: (change) => {
          set((state) => {
            state.offline.pendingChanges.push(change);
          });
        },
        
        syncPendingChanges: () => {
          set((state) => {
            // TODO: Implement sync logic
            console.log('Syncing pending changes:', state.offline.pendingChanges);
            
            state.offline.pendingChanges = [];
            state.offline.lastSync = new Date().toISOString();
          });
        }
      })),
      {
        name: 'plans-store',
        partialize: (state) => ({
          plans: state.plans,
          templates: state.templates,
          settings: state.settings
        })
      }
    )
  )
);

export type PlansStore = typeof usePlansStore;