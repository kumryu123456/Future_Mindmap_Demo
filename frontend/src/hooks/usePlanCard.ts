import { useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  Plan, 
  PlanMilestone,
  PlanPhase,
  PlanTask
} from '../types/plans';
import type {
  PlanCardConfig,
  PlanCardState,
  PlanCardActions,
  MilestoneDisplayData,
  PlanProgressSummary,
  TeamMemberDisplay,
  PlanCardViewMode
} from '../types/components/planCard';
import { DEFAULT_PLAN_CARD_CONFIG } from '../types/components/planCard';

/**
 * Custom hook for managing PlanCard state and interactions
 */
export const usePlanCard = (plan: Plan, initialConfig?: Partial<PlanCardConfig>) => {
  // Configuration
  const [config, setConfig] = useState<PlanCardConfig>({
    ...DEFAULT_PLAN_CARD_CONFIG,
    ...initialConfig
  });

  // State
  const [state, setState] = useState<PlanCardState>({
    viewMode: config.viewMode,
    expanded: {
      milestones: false,
      progress: false,
      team: false,
      timeline: false
    },
    loading: {
      plan: false,
      milestones: false,
      progress: false
    },
    errors: {}
  });

  // Calculate milestone display data
  const milestones = useMemo((): MilestoneDisplayData[] => {
    const planMilestones: MilestoneDisplayData[] = [];
    
    plan.phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        const targetDate = new Date(milestone.targetDate);
        const now = new Date();
        const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        planMilestones.push({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          type: milestone.type,
          status: milestone.status,
          targetDate: milestone.targetDate,
          actualDate: milestone.actualDate,
          progress: calculateMilestoneProgress(milestone, phase),
          isOverdue: daysRemaining < 0 && milestone.status !== 'completed',
          daysRemaining: daysRemaining > 0 ? daysRemaining : undefined,
          completionCriteria: milestone.completionCriteria,
          dependencies: milestone.dependencies,
          requiredDeliverables: milestone.requiredDeliverables,
          priority: determineMilestonePriority(milestone, daysRemaining)
        });
      });
    });
    
    // Sort by target date
    planMilestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    
    return planMilestones.slice(0, config.maxMilestones);
  }, [plan, config.maxMilestones]);

  // Calculate progress summary
  const progress = useMemo((): PlanProgressSummary => {
    const phases = plan.phases;
    const allTasks = phases.flatMap(phase => phase.tasks);
    const allMilestones = phases.flatMap(phase => phase.milestones);
    
    const phaseStats = calculatePhaseStats(phases);
    const taskStats = calculateTaskStats(allTasks);
    const milestoneStats = calculateMilestoneStats(allMilestones);
    
    const overallProgress = calculateOverallProgress(taskStats, phaseStats);
    const timelineData = calculateTimelineData(plan.timeline, overallProgress);
    
    return {
      overall: overallProgress,
      phases: phaseStats,
      tasks: taskStats,
      milestones: milestoneStats,
      timeline: timelineData
    };
  }, [plan]);

  // Get team member display data
  const team = useMemo((): TeamMemberDisplay[] => {
    return plan.team.map(member => {
      const assignedTasks = plan.phases
        .flatMap(phase => phase.tasks)
        .filter(task => task.assignedTo === member.id);
      
      const completedTasks = assignedTasks.filter(task => task.status === 'completed');
      const workload = calculateMemberWorkload(member, assignedTasks);

      return {
        id: member.id,
        name: (member as any).name || `User ${member.id}`,
        role: String(member.role),
        avatar: (member as any).avatar,
        workload,
        tasksAssigned: assignedTasks.length,
        tasksCompleted: completedTasks.length
      };
    });
  }, [plan]);

  // Actions
  const actions: PlanCardActions = {
    setViewMode: useCallback((mode: PlanCardViewMode) => {
      setState(prev => ({ ...prev, viewMode: mode }));
      setConfig(prev => ({ ...prev, viewMode: mode }));
    }, []),

    toggleSection: useCallback((section: keyof PlanCardState['expanded']) => {
      setState(prev => ({
        ...prev,
        expanded: {
          ...prev.expanded,
          [section]: !prev.expanded[section]
        }
      }));
    }, []),

    refreshPlan: useCallback(() => {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, plan: true },
        errors: { ...prev.errors, plan: undefined }
      }));
      
      // Simulate async refresh - in real app, this would call an API
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, plan: false }
        }));
      }, 1000);
    }, []),

    refreshMilestones: useCallback(() => {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, milestones: true },
        errors: { ...prev.errors, milestones: undefined }
      }));
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, milestones: false }
        }));
      }, 500);
    }, []),

    refreshProgress: useCallback(() => {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, progress: true },
        errors: { ...prev.errors, progress: undefined }
      }));
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, progress: false }
        }));
      }, 500);
    }, []),

    handlePlanAction: useCallback((action: 'edit' | 'duplicate' | 'archive' | 'delete' | 'share') => {
      console.log(`Plan action: ${action}`, plan);
      // In real app, this would dispatch appropriate actions
    }, [plan])
  };

  // Auto-refresh data periodically
  useEffect(() => {
    if (!config.interactive) return;

    const interval = setInterval(() => {
      // Only refresh if not currently loading
      const isLoading = Object.values(state.loading).some(loading => loading);
      if (!isLoading) {
        // Simulate periodic progress updates
        actions.refreshProgress();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [config.interactive, state.loading, actions]);

  return {
    config,
    state,
    actions,
    milestones,
    progress,
    team,
    setConfig: useCallback((newConfig: Partial<PlanCardConfig>) => {
      setConfig(prev => ({ ...prev, ...newConfig }));
    }, [])
  };
};

// Helper functions
function calculateMilestoneProgress(milestone: PlanMilestone, phase: PlanPhase): number {
  if (milestone.status === 'completed') return 100;
  if (milestone.status === 'cancelled') return 0;
  
  // Calculate based on dependent tasks
  const dependentTasks = phase.tasks.filter(task => 
    milestone.dependencies.includes(task.id)
  );
  
  if (dependentTasks.length === 0) {
    return milestone.status === 'in_progress' ? 50 : 0;
  }
  
  const completedTasks = dependentTasks.filter(task => task.status === 'completed');
  return Math.round((completedTasks.length / dependentTasks.length) * 100);
}

function determineMilestonePriority(milestone: PlanMilestone, daysRemaining?: number): 'low' | 'medium' | 'high' | 'critical' {
  if (milestone.type === 'deadline' || milestone.type === 'major') {
    if (daysRemaining !== undefined && daysRemaining < 7) return 'critical';
    if (daysRemaining !== undefined && daysRemaining < 14) return 'high';
    return 'medium';
  }
  
  if (milestone.type === 'release') return 'high';
  if (milestone.type === 'checkpoint') return 'medium';
  
  return 'low';
}

function calculatePhaseStats(phases: PlanPhase[]) {
  return phases.reduce(
    (acc, phase) => {
      acc.total++;
      switch (phase.status) {
        case 'completed': acc.completed++; break;
        case 'in_progress': acc.inProgress++; break;
        case 'blocked': acc.blocked++; break;
        default: acc.notStarted++; break;
      }
      return acc;
    },
    { total: 0, completed: 0, inProgress: 0, notStarted: 0, blocked: 0 }
  );
}

function calculateTaskStats(tasks: PlanTask[]) {
  return tasks.reduce(
    (acc, task) => {
      acc.total++;
      switch (task.status) {
        case 'completed': acc.completed++; break;
        case 'in_progress': acc.inProgress++; break;
        case 'blocked': acc.blocked++; break;
        default: acc.notStarted++; break;
      }
      return acc;
    },
    { total: 0, completed: 0, inProgress: 0, notStarted: 0, blocked: 0 }
  );
}

function calculateMilestoneStats(milestones: PlanMilestone[]) {
  return milestones.reduce(
    (acc, milestone) => {
      acc.total++;
      switch (milestone.status) {
        case 'completed': acc.completed++; break;
        case 'upcoming': acc.upcoming++; break;
        case 'missed': acc.overdue++; break;
        case 'in_progress': acc.upcoming++; break;
        default: acc.upcoming++; break;
      }
      return acc;
    },
    { total: 0, completed: 0, upcoming: 0, overdue: 0, missed: 0 }
  );
}

function calculateOverallProgress(taskStats: any, phaseStats: any): number {
  // Weighted calculation: 70% tasks, 30% phases
  const taskProgress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) : 0;
  const phaseProgress = phaseStats.total > 0 ? (phaseStats.completed / phaseStats.total) : 0;
  
  return Math.round((taskProgress * 0.7 + phaseProgress * 0.3) * 100);
}

function calculateTimelineData(timeline: Plan['timeline'], overallProgress: number) {
  const startDate = new Date(timeline.startDate);
  const endDate = new Date(timeline.endDate);
  const now = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate if on track: expected progress vs actual progress
  const expectedProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
  const isOnTrack = overallProgress >= expectedProgress * 0.9; // Allow 10% tolerance
  
  return {
    startDate: timeline.startDate,
    endDate: timeline.endDate,
    daysTotal: Math.max(0, totalDays),
    daysElapsed: Math.max(0, Math.min(elapsedDays, totalDays)),
    daysRemaining: Math.max(0, remainingDays),
    isOnTrack
  };
}

function calculateMemberWorkload(_member: any, assignedTasks: PlanTask[]): number {
  if (assignedTasks.length === 0) return 0;
  
  // Calculate workload based on task complexity and status
  // Calculate workload based on remaining tasks
  const remainingHours = assignedTasks
    .filter(task => task.status !== 'completed')
    .reduce((sum, task) => sum + (task.estimatedHours || 8), 0);
  
  // Assume 40 hours per week capacity
  const weeklyCapacity = 40;
  const currentWorkload = (remainingHours / weeklyCapacity) * 100;
  
  return Math.min(Math.round(currentWorkload), 100);
}

/**
 * Hook for managing milestone interactions
 */
export const useMilestoneInteractions = (milestones: MilestoneDisplayData[]) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDisplayData | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'overdue'>('all');

  const filteredMilestones = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return milestones.filter(m => m.status === 'upcoming' || m.status === 'in_progress');
      case 'completed':
        return milestones.filter(m => m.status === 'completed');
      case 'overdue':
        return milestones.filter(m => m.isOverdue);
      default:
        return milestones;
    }
  }, [milestones, filter]);

  const handleMilestoneSelect = useCallback((milestone: MilestoneDisplayData | null) => {
    setSelectedMilestone(milestone);
  }, []);

  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
    setSelectedMilestone(null);
  }, []);

  return {
    selectedMilestone,
    filter,
    filteredMilestones,
    handleMilestoneSelect,
    handleFilterChange
  };
};

export default usePlanCard;