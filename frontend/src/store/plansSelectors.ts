import { usePlansStore } from './plansStore';
import type { Plan, PlanPhase, PlanTask, PlanMilestone } from '../types/plans';

/**
 * Zustand selectors for plans store with optimal re-rendering performance
 * Following patterns from mindmap store selectors
 */

// Core plan selectors with fine-grained subscriptions
export const usePlan = (id: string) => 
  usePlansStore(state => state.plans[id]);

export const usePlanName = (id: string) => 
  usePlansStore(state => state.plans[id]?.name);

export const usePlanStatus = (id: string) => 
  usePlansStore(state => state.plans[id]?.status);

export const usePlanType = (id: string) => 
  usePlansStore(state => state.plans[id]?.type);

export const usePlanPriority = (id: string) => 
  usePlansStore(state => state.plans[id]?.priority);

export const usePlanProgress = (id: string) => 
  usePlansStore(state => state.plans[id]?.progress);

export const usePlanTimeline = (id: string) => 
  usePlansStore(state => state.plans[id]?.timeline);

export const usePlanBudget = (id: string) => 
  usePlansStore(state => state.plans[id]?.resources);

export const usePlanTeam = (id: string) => 
  usePlansStore(state => state.plans[id]?.team || []);

export const usePlanPhases = (id: string) => 
  usePlansStore(state => state.plans[id]?.phases || []);

export const usePlanRisks = (id: string) => 
  usePlansStore(state => state.plans[id]?.risks || []);

export const usePlanKPIs = (id: string) => 
  usePlansStore(state => state.plans[id]?.kpis || []);

export const usePlanDeliverables = (id: string) => 
  usePlansStore(state => state.plans[id]?.deliverables || []);

// Phase selectors
export const usePhase = (planId: string, phaseId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    return plan?.phases.find(p => p.id === phaseId);
  });

export const usePhaseTasks = (planId: string, phaseId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    const phase = plan?.phases.find(p => p.id === phaseId);
    return phase?.tasks || [];
  });

export const usePhaseMilestones = (planId: string, phaseId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    const phase = plan?.phases.find(p => p.id === phaseId);
    return phase?.milestones || [];
  });

export const usePhaseProgress = (planId: string, phaseId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    const phase = plan?.phases.find(p => p.id === phaseId);
    return phase?.taskStats;
  });

// Task selectors
export const useTask = (planId: string, taskId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return undefined;
    
    for (const phase of plan.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  });

export const useTaskStatus = (planId: string, taskId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return undefined;
    
    for (const phase of plan.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task.status;
    }
    return undefined;
  });

export const useTaskAssignee = (planId: string, taskId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return undefined;
    
    for (const phase of plan.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task.assignedTo;
    }
    return undefined;
  });

export const useTaskProgress = (planId: string, taskId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return 0;
    
    for (const phase of plan.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task.progress;
    }
    return 0;
  });

export const useTaskDependencies = (planId: string, taskId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return [];
    
    for (const phase of plan.phases) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task.dependencies || [];
    }
    return [];
  });

// Milestone selectors
export const useMilestone = (planId: string, milestoneId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return undefined;
    
    for (const phase of plan.phases) {
      const milestone = phase.milestones.find(m => m.id === milestoneId);
      if (milestone) return milestone;
    }
    return undefined;
  });

export const useMilestoneStatus = (planId: string, milestoneId: string) => 
  usePlansStore(state => {
    const plan = state.plans[planId];
    if (!plan) return undefined;
    
    for (const phase of plan.phases) {
      const milestone = phase.milestones.find(m => m.id === milestoneId);
      if (milestone) return milestone.status;
    }
    return undefined;
  });

// Collection selectors
export const useAllPlans = () => 
  usePlansStore(state => Object.values(state.plans));

export const useActivePlan = () => 
  usePlansStore(state => 
    state.activePlanId ? state.plans[state.activePlanId] : undefined
  );

export const useActivePlanId = () => 
  usePlansStore(state => state.activePlanId);

export const usePlansByType = (type: Plan['type']) => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.type === type)
  );

export const usePlansByStatus = (status: Plan['status']) => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.status === status)
  );

export const usePlansByPriority = (priority: Plan['priority']) => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.priority === priority)
  );

export const useActivePlans = () => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.status === 'active')
  );

export const useDraftPlans = () => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.status === 'draft')
  );

export const useCompletedPlans = () => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => plan.status === 'completed')
  );

export const useHighPriorityPlans = () => 
  usePlansStore(state => 
    Object.values(state.plans).filter(plan => 
      plan.priority === 'high' || plan.priority === 'critical'
    )
  );

// Selection selectors
export const useSelection = () => 
  usePlansStore(state => state.selection);

export const useSelectedPlanIds = () => 
  usePlansStore(state => state.selection.selectedPlanIds);

export const useSelectedPhaseId = () => 
  usePlansStore(state => state.selection.selectedPhaseId);

export const useSelectedTaskIds = () => 
  usePlansStore(state => state.selection.selectedTaskIds);

export const useSelectedMilestoneIds = () => 
  usePlansStore(state => state.selection.selectedMilestoneIds);

export const useLastSelectedId = () => 
  usePlansStore(state => state.selection.lastSelectedId);

export const useSelectedPlans = () => 
  usePlansStore(state => 
    state.selection.selectedPlanIds.map(id => state.plans[id]).filter(Boolean)
  );

export const useHasSelection = () => 
  usePlansStore(state => 
    state.selection.selectedPlanIds.length > 0 ||
    state.selection.selectedTaskIds.length > 0 ||
    state.selection.selectedMilestoneIds.length > 0
  );

export const useSelectionCount = () => 
  usePlansStore(state => 
    state.selection.selectedPlanIds.length +
    state.selection.selectedTaskIds.length +
    state.selection.selectedMilestoneIds.length
  );

// View and filter selectors
export const useViewState = () => 
  usePlansStore(state => state.view);

export const useCurrentView = () => 
  usePlansStore(state => state.view.currentView);

export const useFilters = () => 
  usePlansStore(state => state.view.filters);

export const useSorting = () => 
  usePlansStore(state => state.view.sorting);

export const useGrouping = () => 
  usePlansStore(state => state.view.grouping);

export const usePagination = () => 
  usePlansStore(state => state.view.pagination);

// Search selectors
export const useSearchState = () => 
  usePlansStore(state => state.search);

export const useSearchQuery = () => 
  usePlansStore(state => state.search.query);

export const useSearchResults = () => 
  usePlansStore(state => state.search.results);

export const useSearchFilters = () => 
  usePlansStore(state => state.search.filters);

export const useIsSearchActive = () => 
  usePlansStore(state => state.search.isActive);

// Templates and presets selectors
export const useTemplates = () => 
  usePlansStore(state => state.templates);

export const useTemplate = (id: string) => 
  usePlansStore(state => state.templates[id]);

export const usePresets = () => 
  usePlansStore(state => state.presets);

export const usePreset = (id: string) => 
  usePlansStore(state => state.presets[id]);

// Collaboration selectors
export const useCollaborationState = () => 
  usePlansStore(state => state.collaboration);

export const useActiveUsers = () => 
  usePlansStore(state => state.collaboration.activeUsers);

export const useRealtimeChanges = () => 
  usePlansStore(state => state.collaboration.realtimeChanges);

export const useConflicts = () => 
  usePlansStore(state => state.collaboration.conflicts);

export const usePermissions = () => 
  usePlansStore(state => state.collaboration.permissions);

// Import/Export selectors
export const useImportExportState = () => 
  usePlansStore(state => state.importExport);

export const useImportExportStatus = () => 
  usePlansStore(state => state.importExport.status);

export const useImportExportProgress = () => 
  usePlansStore(state => state.importExport.progress);

export const useImportExportErrors = () => 
  usePlansStore(state => state.importExport.errors);

// Notifications selectors
export const useNotifications = () => 
  usePlansStore(state => state.notifications);

export const useUnreadNotifications = () => 
  usePlansStore(state => 
    state.notifications.filter(notification => !notification.read)
  );

export const useNotificationCount = () => 
  usePlansStore(state => state.notifications.length);

export const useUnreadNotificationCount = () => 
  usePlansStore(state => 
    state.notifications.filter(notification => !notification.read).length
  );

// Settings selectors
export const useSettings = () => 
  usePlansStore(state => state.settings);

export const useDefaultView = () => 
  usePlansStore(state => state.settings.defaultView);

export const useAutoSave = () => 
  usePlansStore(state => state.settings.autoSave);

export const useNotificationsEnabled = () => 
  usePlansStore(state => state.settings.notifications);

export const useTheme = () => 
  usePlansStore(state => state.settings.theme);

export const useTimezone = () => 
  usePlansStore(state => state.settings.timezone);

export const useWorkingHours = () => 
  usePlansStore(state => state.settings.workingHours);

// UI state selectors
export const useUIState = () => 
  usePlansStore(state => state.ui);

export const useIsLoading = () => 
  usePlansStore(state => state.ui.isLoading);

export const useError = () => 
  usePlansStore(state => state.ui.error);

export const useSelectedTab = () => 
  usePlansStore(state => state.ui.selectedTab);

export const useIsSidebarOpen = () => 
  usePlansStore(state => state.ui.sidebarOpen);

export const useModals = () => 
  usePlansStore(state => state.ui.modals);

export const useIsCreatePlanModalOpen = () => 
  usePlansStore(state => state.ui.modals.createPlan);

export const useIsEditTaskModalOpen = () => 
  usePlansStore(state => state.ui.modals.editTask);

export const useIsAssignTeamModalOpen = () => 
  usePlansStore(state => state.ui.modals.assignTeam);

export const useIsManageRisksModalOpen = () => 
  usePlansStore(state => state.ui.modals.manageRisks);

export const useIsReportsModalOpen = () => 
  usePlansStore(state => state.ui.modals.reports);

export const useDragDropState = () => 
  usePlansStore(state => state.ui.dragDrop);

export const useIsDragging = () => 
  usePlansStore(state => state.ui.dragDrop.isDragging);

export const useDraggedItem = () => 
  usePlansStore(state => state.ui.dragDrop.draggedItem);

export const useDropTarget = () => 
  usePlansStore(state => state.ui.dragDrop.dropTarget);

// Cache and performance selectors
export const useCache = () => 
  usePlansStore(state => state.cache);

export const useCachedCalculations = () => 
  usePlansStore(state => state.cache.calculations);

export const useLastUpdated = () => 
  usePlansStore(state => state.cache.lastUpdated);

// Offline support selectors
export const useOfflineState = () => 
  usePlansStore(state => state.offline);

export const useIsOffline = () => 
  usePlansStore(state => state.offline.isOffline);

export const usePendingChanges = () => 
  usePlansStore(state => state.offline.pendingChanges);

export const useLastSync = () => 
  usePlansStore(state => state.offline.lastSync);

// Computed selectors
export const usePlanStats = () => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    
    const plansByType = plans.reduce((acc, plan) => {
      acc[plan.type] = (acc[plan.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const plansByStatus = plans.reduce((acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const plansByPriority = plans.reduce((acc, plan) => {
      acc[plan.priority] = (acc[plan.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: plans.length,
      byType: plansByType,
      byStatus: plansByStatus,
      byPriority: plansByPriority
    };
  });

export const useTaskStats = () => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let blockedTasks = 0;

    plans.forEach(plan => {
      plan.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          totalTasks++;
          switch (task.status) {
            case 'completed':
              completedTasks++;
              break;
            case 'in_progress':
              inProgressTasks++;
              break;
            case 'blocked':
              blockedTasks++;
              break;
          }
        });
      });
    });

    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  });

export const useBudgetSummary = () => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    let totalAllocated = 0;
    let totalSpent = 0;

    plans.forEach(plan => {
      totalAllocated += plan.resources.totalBudget;
      totalSpent += plan.resources.budgetTracking.reduce((sum, entry) => 
        sum + (entry.type === 'expense' ? entry.amount : 0), 0);
    });

    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: totalAllocated - totalSpent,
      utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0
    };
  });

export const useTeamUtilization = () => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    const teamMembers = new Map<string, { 
      total: number; 
      allocated: number; 
      name?: string; 
    }>();

    plans.forEach(plan => {
      plan.team.forEach(member => {
        if (!teamMembers.has(member.userId)) {
          teamMembers.set(member.userId, {
            total: member.availableHours,
            allocated: member.assignedHours,
            name: member.userId // Would ideally have user name from user data
          });
        } else {
          const existing = teamMembers.get(member.userId)!;
          existing.allocated += member.assignedHours;
        }
      });
    });

    const utilizationData = Array.from(teamMembers.entries()).map(([userId, data]) => ({
      userId,
      name: data.name,
      availableHours: data.total,
      allocatedHours: data.allocated,
      utilizationRate: data.total > 0 ? Math.round((data.allocated / data.total) * 100) : 0,
      overallocated: data.allocated > data.total
    }));

    const avgUtilization = utilizationData.length > 0 
      ? Math.round(utilizationData.reduce((sum, member) => sum + member.utilizationRate, 0) / utilizationData.length)
      : 0;

    return {
      teamMembers: utilizationData,
      averageUtilization: avgUtilization,
      overallocatedCount: utilizationData.filter(member => member.overallocated).length
    };
  });

export const useOverdueItems = () => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    const now = new Date();
    const overdueItems: Array<{
      planId: string;
      planName: string;
      type: 'task' | 'milestone';
      id: string;
      name: string;
      dueDate: string;
      daysOverdue: number;
    }> = [];

    plans.forEach(plan => {
      plan.phases.forEach(phase => {
        // Check overdue tasks
        phase.tasks.forEach(task => {
          if (task.dueDate && task.status !== 'completed' && task.status !== 'cancelled') {
            const dueDate = new Date(task.dueDate);
            if (dueDate < now) {
              const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
              overdueItems.push({
                planId: plan.id,
                planName: plan.name,
                type: 'task',
                id: task.id,
                name: task.name,
                dueDate: task.dueDate,
                daysOverdue
              });
            }
          }
        });

        // Check overdue milestones
        phase.milestones.forEach(milestone => {
          if (milestone.status !== 'completed' && milestone.status !== 'cancelled') {
            const targetDate = new Date(milestone.targetDate);
            if (targetDate < now) {
              const daysOverdue = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
              overdueItems.push({
                planId: plan.id,
                planName: plan.name,
                type: 'milestone',
                id: milestone.id,
                name: milestone.name,
                dueDate: milestone.targetDate,
                daysOverdue
              });
            }
          }
        });
      });
    });

    return overdueItems.sort((a, b) => b.daysOverdue - a.daysOverdue);
  });

// Performance optimized selectors for large datasets
export const usePlanPage = (page: number, pageSize: number = 20) => 
  usePlansStore(state => {
    const plans = Object.values(state.plans);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return plans.slice(startIndex, endIndex);
  });

export const useFilteredPlans = () => 
  usePlansStore(state => {
    const { filters, sorting } = state.view;
    let filteredPlans = Object.values(state.plans);

    // Apply filters
    if (filters.type && filters.type.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.type.includes(plan.type));
    }

    if (filters.status && filters.status.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.status.includes(plan.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.priority.includes(plan.priority));
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filteredPlans = filteredPlans.filter(plan =>
        plan.team.some(member => filters.assignee.includes(member.userId))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredPlans = filteredPlans.filter(plan =>
        filters.tags.some(tag => plan.metadata.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      filteredPlans = filteredPlans.filter(plan => {
        let dateToCheck: Date;
        switch (filters.dateRange.field) {
          case 'createdAt':
            dateToCheck = new Date(plan.metadata.createdAt);
            break;
          case 'updatedAt':
            dateToCheck = new Date(plan.metadata.updatedAt);
            break;
          case 'startDate':
            dateToCheck = new Date(plan.timeline.startDate);
            break;
          case 'dueDate':
            dateToCheck = new Date(plan.timeline.endDate);
            break;
          default:
            dateToCheck = new Date(plan.metadata.updatedAt);
        }
        return dateToCheck >= startDate && dateToCheck <= endDate;
      });
    }

    // Apply sorting
    if (sorting.field) {
      filteredPlans.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (sorting.field) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          case 'priority':
            const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
            valueA = priorityOrder[a.priority as keyof typeof priorityOrder];
            valueB = priorityOrder[b.priority as keyof typeof priorityOrder];
            break;
          case 'createdAt':
            valueA = new Date(a.metadata.createdAt);
            valueB = new Date(b.metadata.createdAt);
            break;
          case 'updatedAt':
            valueA = new Date(a.metadata.updatedAt);
            valueB = new Date(b.metadata.updatedAt);
            break;
          case 'startDate':
            valueA = new Date(a.timeline.startDate);
            valueB = new Date(b.timeline.startDate);
            break;
          case 'endDate':
            valueA = new Date(a.timeline.endDate);
            valueB = new Date(b.timeline.endDate);
            break;
          default:
            valueA = a.metadata.updatedAt;
            valueB = b.metadata.updatedAt;
        }
        
        if (valueA < valueB) return sorting.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredPlans;
  });