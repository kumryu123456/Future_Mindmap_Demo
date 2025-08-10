import type { 
  PlanStructure, 
  PlanTask, 
  GeneratePlanRequest,
  TeamRole,
  Milestone
} from '../types/api';

/**
 * Plan management utilities and helper functions
 */
export class PlanUtils {
  /**
   * Calculate total estimated hours for a plan
   */
  static calculateTotalHours(plan: PlanStructure): number {
    return plan.phases.reduce((total, phase) => {
      return total + phase.tasks.reduce((phaseTotal, task) => {
        return phaseTotal + (task.estimatedHours || 0);
      }, 0);
    }, 0);
  }

  /**
   * Calculate plan complexity score
   */
  static calculateComplexity(plan: PlanStructure): {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: {
      phases: number;
      tasks: number;
      dependencies: number;
      risks: number;
    };
  } {
    const phases = plan.phases.length;
    const tasks = plan.phases.reduce((total, phase) => total + phase.tasks.length, 0);
    const dependencies = plan.phases.reduce((total, phase) => {
      return total + phase.tasks.reduce((taskTotal, task) => {
        return taskTotal + (task.dependencies?.length || 0);
      }, 0) + (phase.dependencies?.length || 0);
    }, 0);
    const risks = plan.risks?.length || 0;

    // Complexity scoring algorithm
    const phaseScore = Math.min(phases * 2, 20);
    const taskScore = Math.min(tasks * 1, 30);
    const dependencyScore = Math.min(dependencies * 3, 30);
    const riskScore = Math.min(risks * 2, 20);

    const score = phaseScore + taskScore + dependencyScore + riskScore;
    
    let level: 'low' | 'medium' | 'high';
    if (score < 30) level = 'low';
    else if (score < 60) level = 'medium';
    else level = 'high';

    return {
      score,
      level,
      factors: { phases, tasks, dependencies, risks }
    };
  }

  /**
   * Get plan progress statistics
   */
  static calculateProgress(plan: PlanStructure): {
    overall: number;
    byPhase: Record<string, number>;
    completedTasks: number;
    totalTasks: number;
    blockedTasks: number;
  } {
    let completedTasks = 0;
    let totalTasks = 0;
    let blockedTasks = 0;
    const byPhase: Record<string, number> = {};

    plan.phases.forEach(phase => {
      let phaseCompleted = 0;
      const phaseTasks = phase.tasks.length;

      phase.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'completed') {
          completedTasks++;
          phaseCompleted++;
        } else if (task.status === 'blocked') {
          blockedTasks++;
        }
      });

      byPhase[phase.id] = phaseTasks > 0 ? (phaseCompleted / phaseTasks) * 100 : 0;
    });

    const overall = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      overall,
      byPhase,
      completedTasks,
      totalTasks,
      blockedTasks
    };
  }

  /**
   * Filter tasks by criteria
   */
  static filterTasks(
    plan: PlanStructure,
    filters: {
      priority?: ('low' | 'medium' | 'high' | 'critical')[];
      status?: ('not_started' | 'in_progress' | 'completed' | 'blocked')[];
      assignedTo?: string;
      phaseId?: string;
      search?: string;
    }
  ): PlanTask[] {
    let allTasks: PlanTask[] = [];

    plan.phases.forEach(phase => {
      if (!filters.phaseId || phase.id === filters.phaseId) {
        allTasks = allTasks.concat(phase.tasks);
      }
    });

    return allTasks.filter(task => {
      // Priority filter
      if (filters.priority && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Status filter
      if (filters.status && !filters.status.includes(task.status || 'not_started')) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(searchLower);
        const matchesDescription = task.description.toLowerCase().includes(searchLower);
        const matchesTags = task.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort tasks by criteria
   */
  static sortTasks(
    tasks: PlanTask[],
    sortBy: 'priority' | 'name' | 'estimatedHours' | 'status',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): PlanTask[] {
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const statusOrder = { not_started: 1, in_progress: 2, blocked: 3, completed: 4 };

    return [...tasks].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'priority':
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'estimatedHours':
          valueA = a.estimatedHours || 0;
          valueB = b.estimatedHours || 0;
          break;
        case 'status':
          valueA = statusOrder[a.status || 'not_started'];
          valueB = statusOrder[b.status || 'not_started'];
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Identify critical path tasks
   */
  static findCriticalPath(plan: PlanStructure): PlanTask[] {
    // Simple critical path identification based on dependencies and priorities
    const criticalTasks: PlanTask[] = [];

    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        // Tasks are critical if they have high/critical priority and dependencies
        if (
          (task.priority === 'critical' || task.priority === 'high') &&
          (task.dependencies && task.dependencies.length > 0)
        ) {
          criticalTasks.push(task);
        }
      });
    });

    return this.sortTasks(criticalTasks, 'priority', 'desc');
  }

  /**
   * Get overdue milestones
   */
  static getOverdueMilestones(plan: PlanStructure): Milestone[] {
    const now = new Date();
    const overdue: Milestone[] = [];

    plan.phases.forEach(phase => {
      phase.milestones?.forEach(milestone => {
        if (milestone.targetDate) {
          const targetDate = new Date(milestone.targetDate);
          if (targetDate < now) {
            overdue.push(milestone);
          }
        }
      });
    });

    return overdue;
  }

  /**
   * Calculate resource utilization
   */
  static calculateResourceUtilization(plan: PlanStructure): {
    totalAllocation: number;
    byRole: Record<string, number>;
    overAllocated: TeamRole[];
    underUtilized: TeamRole[];
  } {
    const totalAllocation = plan.resources?.team.reduce((total, role) => {
      return total + role.allocation;
    }, 0) || 0;

    const byRole: Record<string, number> = {};
    const overAllocated: TeamRole[] = [];
    const underUtilized: TeamRole[] = [];

    plan.resources?.team.forEach(role => {
      byRole[role.role] = role.allocation;
      
      if (role.allocation > 100) {
        overAllocated.push(role);
      } else if (role.allocation < 50) {
        underUtilized.push(role);
      }
    });

    return {
      totalAllocation,
      byRole,
      overAllocated,
      underUtilized
    };
  }

  /**
   * Generate plan summary
   */
  static generateSummary(plan: PlanStructure): {
    title: string;
    phases: number;
    tasks: number;
    estimatedHours: number;
    complexity: string;
    risks: number;
    team: number;
    duration: string;
  } {
    const complexity = this.calculateComplexity(plan);
    const totalHours = this.calculateTotalHours(plan);

    return {
      title: plan.title,
      phases: plan.phases.length,
      tasks: complexity.factors.tasks,
      estimatedHours: totalHours,
      complexity: complexity.level,
      risks: plan.risks?.length || 0,
      team: plan.resources?.team.length || 0,
      duration: plan.timeline?.totalDuration || 'Not specified'
    };
  }

  /**
   * Validate plan structure
   */
  static validatePlan(plan: Partial<PlanStructure>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!plan.title || plan.title.trim().length === 0) {
      errors.push('Plan title is required');
    }

    if (!plan.objective || plan.objective.trim().length === 0) {
      errors.push('Plan objective is required');
    }

    if (!plan.phases || plan.phases.length === 0) {
      errors.push('Plan must have at least one phase');
    }

    // Phase validation
    plan.phases?.forEach((phase, index) => {
      if (!phase.name || phase.name.trim().length === 0) {
        errors.push(`Phase ${index + 1} must have a name`);
      }

      if (!phase.tasks || phase.tasks.length === 0) {
        warnings.push(`Phase "${phase.name}" has no tasks`);
      }

      // Task validation
      phase.tasks?.forEach((task, taskIndex) => {
        if (!task.name || task.name.trim().length === 0) {
          errors.push(`Task ${taskIndex + 1} in phase "${phase.name}" must have a name`);
        }
      });
    });

    // Resource validation
    if (plan.resources?.team) {
      const totalAllocation = plan.resources.team.reduce((total, role) => {
        return total + role.allocation;
      }, 0);

      if (totalAllocation > 500) {
        warnings.push('Total team allocation exceeds 500% - check for over-allocation');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Build plan request with common defaults
   */
  static buildPlanRequest(
    projectType: GeneratePlanRequest['projectType'],
    objective: string,
    overrides: Partial<GeneratePlanRequest> = {}
  ): GeneratePlanRequest {
    return {
      projectType,
      objective,
      context: {
        timeline: '3-6 months',
        teamSize: 3,
        constraints: [],
        requirements: [],
        ...overrides.context
      },
      preferences: {
        planStyle: 'detailed',
        includeTimelines: true,
        includeMilestones: true,
        includeResources: true,
        includeRisks: true,
        detailLevel: 'intermediate',
        ...overrides.preferences
      },
      options: {
        format: 'structured',
        maxSteps: 20,
        includeMetadata: true,
        generateAlternatives: false,
        ...overrides.options
      },
      ...overrides
    };
  }

  /**
   * Convert plan to different formats
   */
  static convertPlanFormat(
    plan: PlanStructure,
    format: 'json' | 'markdown' | 'csv'
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(plan, null, 2);
      
      case 'markdown':
        return this.planToMarkdown(plan);
      
      case 'csv':
        return this.planToCSV(plan);
      
      default:
        return JSON.stringify(plan, null, 2);
    }
  }

  /**
   * Convert plan to Markdown format
   * @private
   */
  private static planToMarkdown(plan: PlanStructure): string {
    let markdown = `# ${plan.title}\n\n`;
    markdown += `**Objective:** ${plan.objective}\n\n`;
    markdown += `**Overview:** ${plan.overview}\n\n`;

    if (plan.timeline) {
      markdown += `**Duration:** ${plan.timeline.totalDuration}\n\n`;
    }

    markdown += `## Phases\n\n`;
    plan.phases.forEach((phase, index) => {
      markdown += `### ${index + 1}. ${phase.name}\n\n`;
      markdown += `${phase.description}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n\n`;
      
      if (phase.tasks.length > 0) {
        markdown += `**Tasks:**\n`;
        phase.tasks.forEach(task => {
          markdown += `- **${task.name}** (${task.priority}): ${task.description}\n`;
        });
        markdown += '\n';
      }
    });

    return markdown;
  }

  /**
   * Convert plan tasks to CSV format
   * @private
   */
  private static planToCSV(plan: PlanStructure): string {
    let csv = 'Phase,Task,Priority,Status,Estimated Hours,Assigned To,Description\n';
    
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const row = [
          phase.name,
          task.name,
          task.priority,
          task.status || 'not_started',
          task.estimatedHours || 0,
          task.assignedTo || '',
          `"${task.description.replace(/"/g, '""')}"`
        ].join(',');
        csv += row + '\n';
      });
    });

    return csv;
  }
}