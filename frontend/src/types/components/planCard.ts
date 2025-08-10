import type { Plan, PlanMilestone, PlanPhase, PlanTask } from '../plans';

/**
 * Display modes for PlanCard component
 */
export type PlanCardViewMode = 'compact' | 'standard' | 'detailed' | 'timeline';

/**
 * Milestone display options
 */
export type MilestoneDisplayMode = 'list' | 'timeline' | 'progress' | 'grid';

/**
 * Configuration for PlanCard component
 */
export interface PlanCardConfig {
  /** Display mode for the plan card */
  viewMode: PlanCardViewMode;
  /** How to display milestones */
  milestoneDisplay: MilestoneDisplayMode;
  /** Show progress indicators */
  showProgress: boolean;
  /** Show team members */
  showTeam: boolean;
  /** Show timeline dates */
  showTimeline: boolean;
  /** Show status badges */
  showStatus: boolean;
  /** Maximum number of milestones to display */
  maxMilestones: number;
  /** Enable interactive features */
  interactive: boolean;
  /** Show action buttons */
  showActions: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Milestone display data optimized for UI
 */
export interface MilestoneDisplayData {
  id: string;
  name: string;
  description: string;
  type: PlanMilestone['type'];
  status: PlanMilestone['status'];
  targetDate: string;
  actualDate?: string;
  progress: number; // 0-100
  isOverdue: boolean;
  daysRemaining?: number;
  completionCriteria: string[];
  dependencies: string[];
  requiredDeliverables: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Plan progress summary
 */
export interface PlanProgressSummary {
  overall: number; // 0-100
  phases: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
  };
  milestones: {
    total: number;
    completed: number;
    upcoming: number;
    overdue: number;
    missed: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    daysTotal: number;
    daysElapsed: number;
    daysRemaining: number;
    isOnTrack: boolean;
  };
}

/**
 * Team member display data
 */
export interface TeamMemberDisplay {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  workload: number; // 0-100
  tasksAssigned: number;
  tasksCompleted: number;
}

/**
 * Props for PlanCard component
 */
export interface PlanCardProps {
  /** Plan data to display */
  plan: Plan;
  /** Configuration options */
  config?: Partial<PlanCardConfig>;
  /** Custom milestone data (overrides plan.phases.milestones) */
  milestones?: MilestoneDisplayData[];
  /** Custom progress data */
  progress?: Partial<PlanProgressSummary>;
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS classes */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  
  /** Event handlers */
  onClick?: (plan: Plan) => void;
  onMilestoneClick?: (milestone: MilestoneDisplayData) => void;
  onPhaseClick?: (phase: PlanPhase) => void;
  onTeamMemberClick?: (member: TeamMemberDisplay) => void;
  onEdit?: (plan: Plan) => void;
  onDuplicate?: (plan: Plan) => void;
  onArchive?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
  onShare?: (plan: Plan) => void;
}

/**
 * Props for MilestoneDisplay component
 */
export interface MilestoneDisplayProps {
  /** Milestones to display */
  milestones: MilestoneDisplayData[];
  /** Display mode */
  mode: MilestoneDisplayMode;
  /** Maximum number to show */
  limit?: number;
  /** Show progress indicators */
  showProgress?: boolean;
  /** Enable interactive features */
  interactive?: boolean;
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS classes */
  className?: string;
  
  /** Event handlers */
  onMilestoneClick?: (milestone: MilestoneDisplayData) => void;
  onViewAll?: () => void;
}

/**
 * Props for ProgressIndicator component
 */
export interface ProgressIndicatorProps {
  /** Progress data */
  progress: PlanProgressSummary;
  /** Display mode */
  mode: 'compact' | 'standard' | 'detailed';
  /** Show labels */
  showLabels?: boolean;
  /** Show percentages */
  showPercentages?: boolean;
  /** Custom colors */
  colors?: {
    completed: string;
    inProgress: string;
    notStarted: string;
    blocked: string;
    overdue: string;
  };
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS classes */
  className?: string;
}

/**
 * Props for TeamDisplay component
 */
export interface TeamDisplayProps {
  /** Team members to display */
  team: TeamMemberDisplay[];
  /** Maximum number to show */
  limit?: number;
  /** Show workload indicators */
  showWorkload?: boolean;
  /** Show task counts */
  showTaskCounts?: boolean;
  /** Layout mode */
  layout: 'horizontal' | 'vertical' | 'grid';
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS classes */
  className?: string;
  
  /** Event handlers */
  onMemberClick?: (member: TeamMemberDisplay) => void;
  onViewAll?: () => void;
}

/**
 * State for PlanCard component
 */
export interface PlanCardState {
  /** Current view mode */
  viewMode: PlanCardViewMode;
  /** Expanded sections */
  expanded: {
    milestones: boolean;
    progress: boolean;
    team: boolean;
    timeline: boolean;
  };
  /** Loading states */
  loading: {
    plan: boolean;
    milestones: boolean;
    progress: boolean;
  };
  /** Error states */
  errors: {
    plan?: string;
    milestones?: string;
    progress?: string;
  };
}

/**
 * Actions for PlanCard component
 */
export interface PlanCardActions {
  /** Change view mode */
  setViewMode: (mode: PlanCardViewMode) => void;
  /** Toggle section expansion */
  toggleSection: (section: keyof PlanCardState['expanded']) => void;
  /** Refresh plan data */
  refreshPlan: () => void;
  /** Refresh milestone data */
  refreshMilestones: () => void;
  /** Refresh progress data */
  refreshProgress: () => void;
  /** Handle plan action */
  handlePlanAction: (action: 'edit' | 'duplicate' | 'archive' | 'delete' | 'share') => void;
}

/**
 * Default configuration for PlanCard
 */
export const DEFAULT_PLAN_CARD_CONFIG: PlanCardConfig = {
  viewMode: 'standard',
  milestoneDisplay: 'list',
  showProgress: true,
  showTeam: true,
  showTimeline: true,
  showStatus: true,
  maxMilestones: 5,
  interactive: true,
  showActions: true
};

/**
 * Default colors for progress indicators
 */
export const DEFAULT_PROGRESS_COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  notStarted: '#6b7280',
  blocked: '#ef4444',
  overdue: '#f59e0b'
};

/**
 * Milestone type colors and icons
 */
export const MILESTONE_STYLES = {
  major: {
    color: '#8b5cf6',
    icon: '🎯',
    bgColor: '#8b5cf620'
  },
  minor: {
    color: '#06b6d4',
    icon: '📍',
    bgColor: '#06b6d420'
  },
  checkpoint: {
    color: '#10b981',
    icon: '✓',
    bgColor: '#10b98120'
  },
  release: {
    color: '#f59e0b',
    icon: '🚀',
    bgColor: '#f59e0b20'
  },
  deadline: {
    color: '#ef4444',
    icon: '⏰',
    bgColor: '#ef444420'
  },
  review: {
    color: '#6366f1',
    icon: '👁️',
    bgColor: '#6366f120'
  }
} as const;

/**
 * Plan status colors and icons
 */
export const PLAN_STATUS_STYLES = {
  draft: {
    color: '#6b7280',
    icon: '📝',
    bgColor: '#6b728020'
  },
  active: {
    color: '#10b981',
    icon: '🟢',
    bgColor: '#10b98120'
  },
  completed: {
    color: '#8b5cf6',
    icon: '✅',
    bgColor: '#8b5cf620'
  },
  paused: {
    color: '#f59e0b',
    icon: '⏸️',
    bgColor: '#f59e0b20'
  },
  cancelled: {
    color: '#ef4444',
    icon: '❌',
    bgColor: '#ef444420'
  },
  archived: {
    color: '#6b7280',
    icon: '📦',
    bgColor: '#6b728020'
  }
} as const;