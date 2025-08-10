import type {
  Plan,
  PlanPhase,
  PlanTask,
  PlanMilestone,
  PlanRisk,
  PlanKPI,
  PlanDeliverable,
  PlansStoreState,
  PlanFilters,
  PlanDependency
} from '../types/plans';

/**
 * Plans utility functions for plan operations, calculations, and analysis
 */
export class PlansUtils {
  
  /**
   * Calculate overall plan progress
   */
  static calculatePlanProgress(plan: Plan): number {
    if (plan.phases.length === 0) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    let weightedProgress = 0;
    let totalWeight = 0;
    
    plan.phases.forEach(phase => {
      const phaseTasks = phase.tasks.length;
      const phaseCompleted = phase.tasks.filter(task => task.status === 'completed').length;
      const phaseProgress = phaseTasks > 0 ? (phaseCompleted / phaseTasks) : 0;
      
      // Weight phases by their duration and importance
      const phaseWeight = phase.duration || 1;
      weightedProgress += phaseProgress * phaseWeight;
      totalWeight += phaseWeight;
      
      totalTasks += phaseTasks;
      completedTasks += phaseCompleted;
    });
    
    // Return weighted progress if we have weights, otherwise simple percentage
    return totalWeight > 0 ? Math.round((weightedProgress / totalWeight) * 100) : 
           totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }
  
  /**
   * Calculate phase progress with detailed metrics
   */
  static calculatePhaseProgress(phase: PlanPhase): {
    percentage: number;
    completed: number;
    total: number;
    inProgress: number;
    blocked: number;
    estimatedCompletion: string;
    isOnTrack: boolean;
  } {
    const tasks = phase.tasks;
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate estimated completion based on current velocity
    const estimatedCompletion = this.calculateEstimatedCompletion(phase);
    
    // Determine if phase is on track
    const isOnTrack = this.isPhaseOnTrack(phase);
    
    return {
      percentage,
      completed,
      total,
      inProgress,
      blocked,
      estimatedCompletion,
      isOnTrack
    };
  }
  
  /**
   * Calculate task velocity and productivity metrics
   */
  static calculateVelocity(plan: Plan, days: number = 30): {
    tasksCompletedPerDay: number;
    averageTaskDuration: number;
    velocity: number;
    trend: 'up' | 'down' | 'stable';
    burndownRate: number;
  } {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const completedTasks: PlanTask[] = [];
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (task.status === 'completed' && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          if (completedDate >= startDate && completedDate <= endDate) {
            completedTasks.push(task);
          }
        }
      });
    });
    
    const tasksCompletedPerDay = completedTasks.length / days;
    
    // Calculate average task duration
    const durationsInHours = completedTasks
      .filter(task => task.actualHours && task.actualHours > 0)
      .map(task => task.actualHours!);
    
    const averageTaskDuration = durationsInHours.length > 0 
      ? durationsInHours.reduce((sum, hours) => sum + hours, 0) / durationsInHours.length 
      : 0;
    
    // Calculate velocity (story points or tasks per day)
    const velocity = tasksCompletedPerDay;
    
    // Calculate trend (simplified - compare first half vs second half)
    const midPoint = Math.floor(days / 2);
    const firstHalf = completedTasks.filter(task => {
      const completedDate = new Date(task.completedAt!);
      const daysSinceStart = Math.floor((completedDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      return daysSinceStart < midPoint;
    }).length;
    
    const secondHalf = completedTasks.length - firstHalf;
    const firstHalfRate = firstHalf / midPoint;
    const secondHalfRate = secondHalf / (days - midPoint);
    
    let trend: 'up' | 'down' | 'stable';
    if (secondHalfRate > firstHalfRate * 1.1) trend = 'up';
    else if (secondHalfRate < firstHalfRate * 0.9) trend = 'down';
    else trend = 'stable';
    
    // Calculate burndown rate (remaining tasks / current velocity)
    const remainingTasks = this.getRemainingTaskCount(plan);
    const burndownRate = velocity > 0 ? remainingTasks / velocity : Infinity;
    
    return {
      tasksCompletedPerDay,
      averageTaskDuration,
      velocity,
      trend,
      burndownRate
    };
  }
  
  /**
   * Analyze critical path and dependencies
   */
  static analyzeCriticalPath(plan: Plan): {
    criticalPath: string[];
    totalDuration: number;
    bottlenecks: PlanTask[];
    parallelOpportunities: string[][];
    riskFactors: string[];
  } {
    // Build dependency graph
    const taskGraph = this.buildTaskDependencyGraph(plan);
    
    // Find critical path using topological sort + longest path
    const criticalPath = this.findLongestPath(taskGraph);
    
    // Calculate total duration
    const totalDuration = this.calculatePathDuration(criticalPath, plan);
    
    // Identify bottlenecks (tasks with many dependencies)
    const bottlenecks = this.identifyBottlenecks(plan, taskGraph);
    
    // Find parallel opportunities
    const parallelOpportunities = this.findParallelOpportunities(plan, taskGraph);
    
    // Analyze risk factors
    const riskFactors = this.analyzeCriticalPathRisks(plan, criticalPath);
    
    return {
      criticalPath,
      totalDuration,
      bottlenecks,
      parallelOpportunities,
      riskFactors
    };
  }
  
  /**
   * Calculate resource utilization and capacity
   */
  static calculateResourceUtilization(plan: Plan): {
    overall: {
      utilization: number;
      capacity: number;
      overallocation: number;
    };
    byTeamMember: {
      [userId: string]: {
        utilization: number;
        capacity: number;
        assignedHours: number;
        availableHours: number;
        overallocation: number;
      };
    };
    byPhase: {
      [phaseId: string]: {
        requiredCapacity: number;
        availableCapacity: number;
        utilization: number;
      };
    };
    recommendations: string[];
  } {
    const teamMembers = plan.team;
    const phases = plan.phases;
    
    let totalCapacity = 0;
    let totalAssigned = 0;
    const byTeamMember: any = {};
    
    // Calculate by team member
    teamMembers.forEach(member => {
      const assignedTasks = this.getTasksAssignedToUser(plan, member.userId);
      const assignedHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      
      const utilization = member.availableHours > 0 ? (assignedHours / member.availableHours) * 100 : 0;
      const overallocation = Math.max(0, assignedHours - member.availableHours);
      
      byTeamMember[member.userId] = {
        utilization,
        capacity: member.availableHours,
        assignedHours,
        availableHours: member.availableHours,
        overallocation
      };
      
      totalCapacity += member.availableHours;
      totalAssigned += assignedHours;
    });
    
    // Calculate by phase
    const byPhase: any = {};
    phases.forEach(phase => {
      const phaseTasks = phase.tasks;
      const requiredCapacity = phaseTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
      const availableCapacity = phase.assignedTeam.reduce((sum, userId) => {
        const member = teamMembers.find(m => m.userId === userId);
        return sum + (member ? member.availableHours * (member.allocation / 100) : 0);
      }, 0);
      
      byPhase[phase.id] = {
        requiredCapacity,
        availableCapacity,
        utilization: availableCapacity > 0 ? (requiredCapacity / availableCapacity) * 100 : 0
      };
    });
    
    // Generate recommendations
    const recommendations = this.generateResourceRecommendations(byTeamMember, byPhase);
    
    return {
      overall: {
        utilization: totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0,
        capacity: totalCapacity,
        overallocation: Math.max(0, totalAssigned - totalCapacity)
      },
      byTeamMember,
      byPhase,
      recommendations
    };
  }
  
  /**
   * Analyze plan risks and their impact
   */
  static analyzeRisks(plan: Plan): {
    riskMatrix: {
      [key: string]: PlanRisk[];
    };
    topRisks: PlanRisk[];
    riskScore: number;
    mitigationCoverage: number;
    recommendations: string[];
  } {
    const risks = plan.risks;
    
    // Create risk matrix
    const riskMatrix: { [key: string]: PlanRisk[] } = {
      'high-high': [],
      'high-medium': [],
      'high-low': [],
      'medium-high': [],
      'medium-medium': [],
      'medium-low': [],
      'low-high': [],
      'low-medium': [],
      'low-low': []
    };
    
    risks.forEach(risk => {
      const key = `${risk.probability}-${risk.impact}`;
      if (riskMatrix[key]) {
        riskMatrix[key].push(risk);
      }
    });
    
    // Calculate risk scores and identify top risks
    const scoredRisks = risks.map(risk => ({
      ...risk,
      calculatedScore: this.calculateRiskScore(risk)
    })).sort((a, b) => b.calculatedScore - a.calculatedScore);
    
    const topRisks = scoredRisks.slice(0, 5);
    
    // Calculate overall risk score
    const riskScore = this.calculateOverallRiskScore(scoredRisks);
    
    // Calculate mitigation coverage
    const mitigatedRisks = risks.filter(risk => 
      risk.mitigation && risk.mitigation.length > 0 && 
      risk.mitigation.some(m => m.status === 'completed' || m.status === 'in_progress')
    );
    const mitigationCoverage = risks.length > 0 ? (mitigatedRisks.length / risks.length) * 100 : 0;
    
    // Generate recommendations
    const recommendations = this.generateRiskRecommendations(scoredRisks, mitigationCoverage);
    
    return {
      riskMatrix,
      topRisks,
      riskScore,
      mitigationCoverage,
      recommendations
    };
  }
  
  /**
   * Calculate budget analysis and forecasting
   */
  static analyzeBudget(plan: Plan): {
    summary: {
      allocated: number;
      spent: number;
      committed: number;
      remaining: number;
      projectedTotal: number;
      variance: number;
      utilizationRate: number;
    };
    byCategory: {
      [category: string]: {
        allocated: number;
        spent: number;
        percentage: number;
        variance: number;
      };
    };
    forecast: {
      projectedSpend: number;
      completionCost: number;
      budgetRisk: 'low' | 'medium' | 'high';
      recommendedActions: string[];
    };
    trends: {
      spendRate: number;
      burnRate: number;
      monthlyProjection: number;
    };
  } {
    const budget = plan.resources;
    const progress = this.calculatePlanProgress(plan);
    
    // Calculate summary
    const allocated = budget.totalBudget;
    const spent = budget.budgetTracking.reduce((sum, entry) => 
      sum + (entry.type === 'expense' ? entry.amount : 0), 0);
    const committed = budget.budgetBreakdown.reduce((sum, category) => sum + category.committed, 0);
    const remaining = allocated - spent - committed;
    const utilizationRate = allocated > 0 ? (spent / allocated) * 100 : 0;
    
    // Project total cost based on progress
    const projectedTotal = progress > 0 ? (spent / progress) * 100 : spent;
    const variance = projectedTotal - allocated;
    
    // Calculate by category
    const byCategory: any = {};
    budget.budgetBreakdown.forEach(category => {
      byCategory[category.name] = {
        allocated: category.allocated,
        spent: category.spent,
        percentage: allocated > 0 ? (category.allocated / allocated) * 100 : 0,
        variance: category.spent - category.allocated
      };
    });
    
    // Calculate trends
    const trends = this.calculateBudgetTrends(budget);
    
    // Generate forecast
    const forecast = this.generateBudgetForecast(allocated, spent, progress, trends);
    
    return {
      summary: {
        allocated,
        spent,
        committed,
        remaining,
        projectedTotal,
        variance,
        utilizationRate
      },
      byCategory,
      forecast,
      trends
    };
  }
  
  /**
   * Generate plan health score and insights
   */
  static calculatePlanHealth(plan: Plan): {
    overallScore: number;
    scores: {
      schedule: number;
      budget: number;
      quality: number;
      risk: number;
      team: number;
    };
    status: 'healthy' | 'at_risk' | 'critical';
    insights: string[];
    recommendations: string[];
  } {
    // Calculate individual scores
    const scheduleScore = this.calculateScheduleHealth(plan);
    const budgetScore = this.calculateBudgetHealth(plan);
    const qualityScore = this.calculateQualityHealth(plan);
    const riskScore = 100 - this.analyzeRisks(plan).riskScore; // Invert risk score
    const teamScore = this.calculateTeamHealth(plan);
    
    // Calculate overall score (weighted average)
    const weights = { schedule: 0.25, budget: 0.2, quality: 0.2, risk: 0.2, team: 0.15 };
    const overallScore = Math.round(
      scheduleScore * weights.schedule +
      budgetScore * weights.budget +
      qualityScore * weights.quality +
      riskScore * weights.risk +
      teamScore * weights.team
    );
    
    // Determine status
    let status: 'healthy' | 'at_risk' | 'critical';
    if (overallScore >= 80) status = 'healthy';
    else if (overallScore >= 60) status = 'at_risk';
    else status = 'critical';
    
    // Generate insights and recommendations
    const insights = this.generateHealthInsights(plan, { schedule: scheduleScore, budget: budgetScore, quality: qualityScore, risk: riskScore, team: teamScore });
    const recommendations = this.generateHealthRecommendations(plan, status, { schedule: scheduleScore, budget: budgetScore, quality: qualityScore, risk: riskScore, team: teamScore });
    
    return {
      overallScore,
      scores: {
        schedule: scheduleScore,
        budget: budgetScore,
        quality: qualityScore,
        risk: riskScore,
        team: teamScore
      },
      status,
      insights,
      recommendations
    };
  }
  
  /**
   * Filter and sort plans based on criteria
   */
  static filterPlans(
    plans: Record<string, Plan>,
    filters: PlanFilters
  ): Plan[] {
    let filteredPlans = Object.values(plans);
    
    // Filter by type
    if (filters.type && filters.type.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.type.includes(plan.type));
    }
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.status.includes(plan.status));
    }
    
    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      filteredPlans = filteredPlans.filter(plan => filters.priority.includes(plan.priority));
    }
    
    // Filter by assignee
    if (filters.assignee && filters.assignee.length > 0) {
      filteredPlans = filteredPlans.filter(plan =>
        plan.team.some(member => filters.assignee.includes(member.userId))
      );
    }
    
    // Filter by date range
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
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredPlans = filteredPlans.filter(plan =>
        filters.tags.some(tag => plan.metadata.tags.includes(tag))
      );
    }
    
    // Filter by progress
    if (filters.progress) {
      filteredPlans = filteredPlans.filter(plan => {
        const progress = this.calculatePlanProgress(plan);
        return progress >= filters.progress.min && progress <= filters.progress.max;
      });
    }
    
    // Filter by budget
    if (filters.budget) {
      filteredPlans = filteredPlans.filter(plan =>
        plan.resources.totalBudget >= filters.budget.min &&
        plan.resources.totalBudget <= filters.budget.max
      );
    }
    
    return filteredPlans;
  }
  
  /**
   * Sort plans by various criteria
   */
  static sortPlans(
    plans: Plan[],
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ): Plan[] {
    return [...plans].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
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
        case 'progress':
          valueA = this.calculatePlanProgress(a);
          valueB = this.calculatePlanProgress(b);
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
        case 'budget':
          valueA = a.resources.totalBudget;
          valueB = b.resources.totalBudget;
          break;
        case 'teamSize':
          valueA = a.team.length;
          valueB = b.team.length;
          break;
        default:
          valueA = a.metadata.updatedAt;
          valueB = b.metadata.updatedAt;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  /**
   * Export plan data to various formats
   */
  static exportPlan(plan: Plan, format: 'json' | 'csv' | 'pdf' | 'xlsx' | 'mpp'): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify(plan, null, 2);
      
      case 'csv':
        return this.exportPlanToCSV(plan);
      
      case 'pdf':
        // Would integrate with PDF generation library
        return this.exportPlanToPDF(plan);
      
      case 'xlsx':
        // Would integrate with Excel generation library
        return this.exportPlanToExcel(plan);
      
      case 'mpp':
        // Would integrate with Microsoft Project format
        return this.exportPlanToMSProject(plan);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  // Private helper methods
  private static calculateEstimatedCompletion(phase: PlanPhase): string {
    const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = phase.tasks.length;
    const inProgressTasks = phase.tasks.filter(t => t.status === 'in_progress').length;
    
    if (totalTasks === 0) return new Date().toISOString().split('T')[0];
    
    const progress = (completedTasks + (inProgressTasks * 0.5)) / totalTasks;
    const remainingWork = 1 - progress;
    
    // Simple estimation based on original timeline
    const phaseDuration = phase.duration || 7;
    const remainingDays = Math.ceil(remainingWork * phaseDuration);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + remainingDays);
    
    return estimatedDate.toISOString().split('T')[0];
  }
  
  private static isPhaseOnTrack(phase: PlanPhase): boolean {
    if (!phase.startDate || !phase.endDate) return true;
    
    const now = new Date();
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    const expectedProgress = totalDuration > 0 ? elapsedTime / totalDuration : 0;
    
    const actualProgress = this.calculatePhaseProgress(phase).percentage / 100;
    
    // Allow 10% variance
    return actualProgress >= expectedProgress - 0.1;
  }
  
  private static getRemainingTaskCount(plan: Plan): number {
    let remaining = 0;
    plan.phases.forEach(phase => {
      remaining += phase.tasks.filter(task => 
        task.status !== 'completed' && task.status !== 'cancelled'
      ).length;
    });
    return remaining;
  }
  
  private static buildTaskDependencyGraph(plan: Plan): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        graph[task.id] = task.dependencies || [];
      });
    });
    
    return graph;
  }
  
  private static findLongestPath(graph: Record<string, string[]>): string[] {
    // Simplified longest path algorithm
    // In a real implementation, would use more sophisticated algorithms
    const visited = new Set<string>();
    const pathLengths: Record<string, number> = {};
    
    const calculatePath = (nodeId: string): number => {
      if (visited.has(nodeId)) return pathLengths[nodeId] || 0;
      
      visited.add(nodeId);
      const dependencies = graph[nodeId] || [];
      let maxLength = 0;
      
      dependencies.forEach(depId => {
        maxLength = Math.max(maxLength, calculatePath(depId));
      });
      
      pathLengths[nodeId] = maxLength + 1;
      return pathLengths[nodeId];
    };
    
    // Calculate path lengths for all nodes
    Object.keys(graph).forEach(nodeId => {
      calculatePath(nodeId);
    });
    
    // Find the longest path
    let longestPath: string[] = [];
    let maxLength = 0;
    
    Object.entries(pathLengths).forEach(([nodeId, length]) => {
      if (length > maxLength) {
        maxLength = length;
        // Reconstruct path (simplified)
        longestPath = [nodeId]; // Would reconstruct full path in real implementation
      }
    });
    
    return longestPath;
  }
  
  private static calculatePathDuration(path: string[], plan: Plan): number {
    let duration = 0;
    
    path.forEach(taskId => {
      plan.phases.forEach(phase => {
        const task = phase.tasks.find(t => t.id === taskId);
        if (task) {
          duration += task.estimatedHours || 0;
        }
      });
    });
    
    return duration;
  }
  
  private static identifyBottlenecks(plan: Plan, graph: Record<string, string[]>): PlanTask[] {
    const dependencyCounts: Record<string, number> = {};
    
    // Count how many tasks depend on each task
    Object.values(graph).forEach(dependencies => {
      dependencies.forEach(depId => {
        dependencyCounts[depId] = (dependencyCounts[depId] || 0) + 1;
      });
    });
    
    // Find tasks with high dependency counts
    const bottlenecks: PlanTask[] = [];
    const threshold = 3; // Tasks with 3+ dependents are bottlenecks
    
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if ((dependencyCounts[task.id] || 0) >= threshold) {
          bottlenecks.push(task);
        }
      });
    });
    
    return bottlenecks.sort((a, b) => (dependencyCounts[b.id] || 0) - (dependencyCounts[a.id] || 0));
  }
  
  private static findParallelOpportunities(plan: Plan, graph: Record<string, string[]>): string[][] {
    // Simplified parallel opportunity detection
    const opportunities: string[][] = [];
    
    plan.phases.forEach(phase => {
      const tasksWithoutDependencies = phase.tasks.filter(task => 
        !task.dependencies || task.dependencies.length === 0
      );
      
      if (tasksWithoutDependencies.length > 1) {
        opportunities.push(tasksWithoutDependencies.map(t => t.id));
      }
    });
    
    return opportunities;
  }
  
  private static analyzeCriticalPathRisks(plan: Plan, criticalPath: string[]): string[] {
    const risks: string[] = [];
    
    // Check for risks affecting critical path tasks
    plan.risks.forEach(risk => {
      const affectsCP = risk.affectedTasks.some(taskId => criticalPath.includes(taskId));
      if (affectsCP && (risk.probability === 'high' || risk.impact === 'high')) {
        risks.push(`Risk "${risk.title}" affects critical path`);
      }
    });
    
    // Check for resource constraints
    criticalPath.forEach(taskId => {
      plan.phases.forEach(phase => {
        const task = phase.tasks.find(t => t.id === taskId);
        if (task && !task.assignedTo) {
          risks.push(`Critical path task "${task.name}" is unassigned`);
        }
      });
    });
    
    return risks;
  }
  
  private static getTasksAssignedToUser(plan: Plan, userId: string): PlanTask[] {
    const tasks: PlanTask[] = [];
    
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (task.assignedTo === userId) {
          tasks.push(task);
        }
      });
    });
    
    return tasks;
  }
  
  private static generateResourceRecommendations(byTeamMember: any, byPhase: any): string[] {
    const recommendations: string[] = [];
    
    // Check for overallocated team members
    Object.entries(byTeamMember).forEach(([userId, data]: [string, any]) => {
      if (data.overallocation > 0) {
        recommendations.push(`Team member ${userId} is overallocated by ${data.overallocation} hours`);
      }
      if (data.utilization < 50) {
        recommendations.push(`Team member ${userId} is underutilized (${Math.round(data.utilization)}%)`);
      }
    });
    
    // Check for capacity issues in phases
    Object.entries(byPhase).forEach(([phaseId, data]: [string, any]) => {
      if (data.utilization > 100) {
        recommendations.push(`Phase ${phaseId} requires more capacity than available`);
      }
    });
    
    return recommendations;
  }
  
  private static calculateRiskScore(risk: PlanRisk): number {
    const probabilityScores = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    const impactScores = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    
    const probScore = probabilityScores[risk.probability] || 3;
    const impactScore = impactScores[risk.impact] || 3;
    
    return probScore * impactScore;
  }
  
  private static calculateOverallRiskScore(risks: Array<PlanRisk & { calculatedScore: number }>): number {
    if (risks.length === 0) return 0;
    
    const totalScore = risks.reduce((sum, risk) => sum + risk.calculatedScore, 0);
    const maxPossibleScore = risks.length * 25; // max score per risk is 5*5=25
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }
  
  private static generateRiskRecommendations(risks: Array<PlanRisk & { calculatedScore: number }>, mitigationCoverage: number): string[] {
    const recommendations: string[] = [];
    
    if (mitigationCoverage < 50) {
      recommendations.push('Low mitigation coverage - consider developing mitigation strategies');
    }
    
    const highRisks = risks.filter(risk => risk.calculatedScore >= 15);
    if (highRisks.length > 0) {
      recommendations.push(`${highRisks.length} high-impact risks require immediate attention`);
    }
    
    const unmitigatedHighRisks = risks.filter(risk => 
      risk.calculatedScore >= 12 && (!risk.mitigation || risk.mitigation.length === 0)
    );
    if (unmitigatedHighRisks.length > 0) {
      recommendations.push('Several high-score risks lack mitigation strategies');
    }
    
    return recommendations;
  }
  
  private static calculateBudgetTrends(budget: Plan['resources']): {
    spendRate: number;
    burnRate: number;
    monthlyProjection: number;
  } {
    const entries = budget.budgetTracking.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    if (entries.length < 2) {
      return { spendRate: 0, burnRate: 0, monthlyProjection: 0 };
    }
    
    // Calculate spend rate (money per day)
    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    const daysDiff = Math.max(1, Math.floor((new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (24 * 60 * 60 * 1000)));
    
    const totalSpent = entries.reduce((sum, entry) => 
      sum + (entry.type === 'expense' ? entry.amount : 0), 0
    );
    
    const spendRate = totalSpent / daysDiff;
    const burnRate = spendRate; // Simplified
    const monthlyProjection = spendRate * 30;
    
    return { spendRate, burnRate, monthlyProjection };
  }
  
  private static generateBudgetForecast(allocated: number, spent: number, progress: number, trends: any): {
    projectedSpend: number;
    completionCost: number;
    budgetRisk: 'low' | 'medium' | 'high';
    recommendedActions: string[];
  } {
    const projectedSpend = progress > 0 ? (spent / progress) * 100 : spent;
    const completionCost = projectedSpend;
    
    let budgetRisk: 'low' | 'medium' | 'high' = 'low';
    if (projectedSpend > allocated * 1.2) budgetRisk = 'high';
    else if (projectedSpend > allocated * 1.1) budgetRisk = 'medium';
    
    const recommendedActions: string[] = [];
    if (budgetRisk === 'high') {
      recommendedActions.push('Urgent budget review required');
      recommendedActions.push('Consider scope reduction or additional funding');
    } else if (budgetRisk === 'medium') {
      recommendedActions.push('Monitor spending closely');
      recommendedActions.push('Review remaining scope vs. budget');
    }
    
    return {
      projectedSpend,
      completionCost,
      budgetRisk,
      recommendedActions
    };
  }
  
  private static calculateScheduleHealth(plan: Plan): number {
    let score = 100;
    const now = new Date();
    
    // Check if plan is on schedule
    plan.phases.forEach(phase => {
      if (phase.endDate) {
        const phaseEnd = new Date(phase.endDate);
        const phaseProgress = this.calculatePhaseProgress(phase);
        
        if (now > phaseEnd && phaseProgress.percentage < 100) {
          score -= 20; // Penalty for overdue phases
        }
      }
    });
    
    return Math.max(0, score);
  }
  
  private static calculateBudgetHealth(plan: Plan): number {
    const budget = this.analyzeBudget(plan);
    const variance = Math.abs(budget.summary.variance);
    const allocated = budget.summary.allocated;
    
    if (allocated === 0) return 100;
    
    const variancePercentage = (variance / allocated) * 100;
    
    if (variancePercentage <= 5) return 100;
    if (variancePercentage <= 10) return 80;
    if (variancePercentage <= 20) return 60;
    return 40;
  }
  
  private static calculateQualityHealth(plan: Plan): number {
    // Simplified quality calculation based on deliverable status
    const deliverables = plan.deliverables;
    if (deliverables.length === 0) return 100;
    
    const approvedDeliverables = deliverables.filter(d => d.status === 'approved').length;
    return Math.round((approvedDeliverables / deliverables.length) * 100);
  }
  
  private static calculateTeamHealth(plan: Plan): number {
    if (plan.team.length === 0) return 100;
    
    const utilization = this.calculateResourceUtilization(plan);
    const avgUtilization = utilization.overall.utilization;
    
    // Optimal utilization is around 80%
    if (avgUtilization >= 70 && avgUtilization <= 90) return 100;
    if (avgUtilization >= 60 && avgUtilization <= 100) return 80;
    if (avgUtilization >= 50 && avgUtilization <= 110) return 60;
    return 40;
  }
  
  private static generateHealthInsights(plan: Plan, scores: any): string[] {
    const insights: string[] = [];
    
    if (scores.schedule < 70) {
      insights.push('Schedule is behind target - consider resource reallocation');
    }
    
    if (scores.budget < 70) {
      insights.push('Budget variance is high - review spending patterns');
    }
    
    if (scores.quality < 70) {
      insights.push('Quality metrics need attention - increase review processes');
    }
    
    if (scores.risk > 30) { // Remember risk score is inverted
      insights.push('High risk exposure detected - prioritize mitigation');
    }
    
    if (scores.team < 70) {
      insights.push('Team utilization is suboptimal - balance workload');
    }
    
    return insights;
  }
  
  private static generateHealthRecommendations(plan: Plan, status: string, scores: any): string[] {
    const recommendations: string[] = [];
    
    if (status === 'critical') {
      recommendations.push('Immediate intervention required');
      recommendations.push('Consider escalating to stakeholders');
    }
    
    // Specific recommendations based on lowest scores
    const lowestScore = Math.min(scores.schedule, scores.budget, scores.quality, scores.team);
    
    if (scores.schedule === lowestScore) {
      recommendations.push('Focus on schedule recovery plan');
    } else if (scores.budget === lowestScore) {
      recommendations.push('Implement cost control measures');
    } else if (scores.quality === lowestScore) {
      recommendations.push('Strengthen quality assurance processes');
    } else if (scores.team === lowestScore) {
      recommendations.push('Review team capacity and allocation');
    }
    
    return recommendations;
  }
  
  private static exportPlanToCSV(plan: Plan): string {
    const headers = ['Phase', 'Task', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Progress'];
    const rows = [headers.join(',')];
    
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const row = [
          phase.name,
          task.name,
          task.status,
          task.priority,
          task.assignedTo || '',
          task.dueDate || '',
          `${task.progress}%`
        ].map(field => `"${field}"`);
        
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');
  }
  
  private static exportPlanToPDF(plan: Plan): Blob {
    // Would integrate with a PDF library like jsPDF
    // For now, return a placeholder
    return new Blob(['PDF export not implemented'], { type: 'application/pdf' });
  }
  
  private static exportPlanToExcel(plan: Plan): Blob {
    // Would integrate with a library like xlsx or exceljs
    // For now, return a placeholder
    return new Blob(['Excel export not implemented'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  
  private static exportPlanToMSProject(plan: Plan): Blob {
    // Would integrate with Microsoft Project format libraries
    // For now, return a placeholder
    return new Blob(['MS Project export not implemented'], { type: 'application/vnd.ms-project' });
  }

  /**
   * Search plans and plan elements
   */
  static searchPlans(
    query: string,
    plans: Record<string, Plan>,
    options: {
      caseSensitive?: boolean;
      regex?: boolean;
      wholeWords?: boolean;
      includeMetadata?: boolean;
      maxResults?: number;
    } = {}
  ): Array<{
    planId: string;
    type: 'plan' | 'phase' | 'task' | 'milestone';
    id: string;
    title: string;
    description: string;
    score: number;
    highlights: string[];
  }> {
    const {
      caseSensitive = false,
      regex = false,
      wholeWords = false,
      includeMetadata = false,
      maxResults = 50
    } = options;

    if (!query.trim()) return [];

    const results: Array<{
      planId: string;
      type: 'plan' | 'phase' | 'task' | 'milestone';
      id: string;
      title: string;
      description: string;
      score: number;
      highlights: string[];
    }> = [];

    const searchQuery = caseSensitive ? query : query.toLowerCase();

    Object.values(plans).forEach(plan => {
      // Search plan itself
      const planText = caseSensitive ? plan.name : plan.name.toLowerCase();
      const planDesc = caseSensitive ? plan.description || '' : (plan.description || '').toLowerCase();
      
      let match = false;
      let score = 0;
      const highlights: string[] = [];

      if (regex) {
        try {
          const regexPattern = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi');
          if (regexPattern.test(planText) || regexPattern.test(planDesc)) {
            match = true;
            score = 1;
            highlights.push(query);
          }
        } catch {
          // Invalid regex, fall back to normal search
        }
      }

      if (!match) {
        if (wholeWords) {
          const wordBoundaryRegex = new RegExp(`\\b${searchQuery}\\b`, caseSensitive ? '' : 'i');
          if (wordBoundaryRegex.test(planText) || wordBoundaryRegex.test(planDesc)) {
            match = true;
            score = 1;
          }
        } else {
          if (planText.includes(searchQuery) || planDesc.includes(searchQuery)) {
            match = true;
            score = 1;
          }
        }
      }

      if (match) {
        results.push({
          planId: plan.id,
          type: 'plan',
          id: plan.id,
          title: plan.name,
          description: plan.description || '',
          score,
          highlights
        });
      }

      // Search phases
      plan.phases.forEach(phase => {
        const phaseText = caseSensitive ? phase.name : phase.name.toLowerCase();
        const phaseDesc = caseSensitive ? phase.description : phase.description.toLowerCase();
        
        if (phaseText.includes(searchQuery) || phaseDesc.includes(searchQuery)) {
          results.push({
            planId: plan.id,
            type: 'phase',
            id: phase.id,
            title: phase.name,
            description: phase.description,
            score: 0.8,
            highlights: [query]
          });
        }

        // Search tasks
        phase.tasks.forEach(task => {
          const taskText = caseSensitive ? task.name : task.name.toLowerCase();
          const taskDesc = caseSensitive ? task.description : task.description.toLowerCase();
          
          if (taskText.includes(searchQuery) || taskDesc.includes(searchQuery)) {
            results.push({
              planId: plan.id,
              type: 'task',
              id: task.id,
              title: task.name,
              description: task.description,
              score: 0.6,
              highlights: [query]
            });
          }
        });
      });

      // Search milestones
      plan.phases.forEach(phase => {
        phase.milestones.forEach(milestone => {
          const milestoneText = caseSensitive ? milestone.name : milestone.name.toLowerCase();
          const milestoneDesc = caseSensitive ? milestone.description : milestone.description.toLowerCase();
          
          if (milestoneText.includes(searchQuery) || milestoneDesc.includes(searchQuery)) {
            results.push({
              planId: plan.id,
              type: 'milestone',
              id: milestone.id,
              title: milestone.name,
              description: milestone.description,
              score: 0.7,
              highlights: [query]
            });
          }
        });
      });
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Validate plan data structure
   */
  static validatePlan(plan: Partial<Plan>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!plan.id || typeof plan.id !== 'string') {
      errors.push('Plan ID is required and must be a string');
    }

    if (!plan.name || typeof plan.name !== 'string') {
      errors.push('Plan name is required and must be a string');
    }

    if (!plan.type || !['business', 'marketing', 'product', 'technical', 'personal', 'academic', 'strategic', 'operational'].includes(plan.type)) {
      errors.push('Plan type is required and must be a valid type');
    }

    if (!plan.status || !['draft', 'active', 'completed', 'paused', 'cancelled', 'archived'].includes(plan.status)) {
      errors.push('Plan status is required and must be a valid status');
    }

    if (!plan.timeline) {
      errors.push('Plan timeline is required');
    } else {
      if (!plan.timeline.startDate) {
        errors.push('Plan start date is required');
      }
      if (!plan.timeline.endDate) {
        errors.push('Plan end date is required');
      }
      if (plan.timeline.startDate && plan.timeline.endDate) {
        const startDate = new Date(plan.timeline.startDate);
        const endDate = new Date(plan.timeline.endDate);
        if (endDate <= startDate) {
          errors.push('Plan end date must be after start date');
        }
      }
    }

    // Warnings
    if (!plan.description || plan.description.trim() === '') {
      warnings.push('Plan description is recommended');
    }

    if (!plan.phases || plan.phases.length === 0) {
      warnings.push('Plan should have at least one phase');
    }

    if (!plan.team || plan.team.length === 0) {
      warnings.push('Plan should have team members assigned');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate plan statistics
   */
  static calculatePlanStats(state: PlansStoreState): {
    totalPlans: number;
    plansByType: Record<string, number>;
    plansByStatus: Record<string, number>;
    plansByPriority: Record<string, number>;
    averageProgress: number;
    totalBudget: number;
    totalTeamMembers: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  } {
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

    const totalProgress = plans.reduce((sum, plan) => sum + this.calculatePlanProgress(plan), 0);
    const averageProgress = plans.length > 0 ? Math.round(totalProgress / plans.length) : 0;

    const totalBudget = plans.reduce((sum, plan) => sum + plan.resources.totalBudget, 0);

    const uniqueTeamMembers = new Set<string>();
    plans.forEach(plan => {
      plan.team.forEach(member => uniqueTeamMembers.add(member.userId));
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const now = new Date();

    plans.forEach(plan => {
      plan.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          totalTasks++;
          if (task.status === 'completed') {
            completedTasks++;
          }
          if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
            overdueTasks++;
          }
        });
      });
    });

    return {
      totalPlans: plans.length,
      plansByType,
      plansByStatus,
      plansByPriority,
      averageProgress,
      totalBudget,
      totalTeamMembers: uniqueTeamMembers.size,
      totalTasks,
      completedTasks,
      overdueTasks
    };
  }

  /**
   * Import plan from various formats
   */
  static importPlanFromFormat(
    data: string,
    format: 'json' | 'csv' | 'xml'
  ): Partial<Plan> | null {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(data);

        case 'csv': {
          const lines = data.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          const rows = lines.slice(1).filter(line => line.trim());

          // Basic CSV parsing for tasks
          const phases: PlanPhase[] = [];
          let currentPhase: Partial<PlanPhase> | null = null;

          rows.forEach(row => {
            const values = row.split(',').map(v => v.replace(/"/g, ''));
            const rowData = Object.fromEntries(
              headers.map((header, index) => [header, values[index]])
            );

            if (rowData['Phase'] && rowData['Phase'] !== currentPhase?.name) {
              if (currentPhase) {
                phases.push(currentPhase as PlanPhase);
              }
              currentPhase = {
                id: `phase_${phases.length + 1}`,
                name: rowData['Phase'],
                description: '',
                order: phases.length,
                status: 'not_started',
                priority: 'medium',
                duration: 7,
                tasks: [],
                milestones: [],
                assignedTeam: [],
                approvals: [],
                notes: '',
                comments: [],
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: 'import'
                }
              };
            }

            if (currentPhase && rowData['Task']) {
              const task: PlanTask = {
                id: `task_${currentPhase.tasks!.length + 1}`,
                name: rowData['Task'],
                description: '',
                status: (rowData['Status'] as any) || 'not_started',
                priority: (rowData['Priority'] as any) || 'medium',
                type: 'task',
                assignedTo: rowData['Assigned To'] || '',
                reporter: 'import',
                reviewers: [],
                estimatedHours: parseInt(rowData['Estimated Hours']) || 8,
                progress: parseInt(rowData['Progress']) || 0,
                dependencies: [],
                subtasks: [],
                blockedBy: [],
                blocking: [],
                tags: [],
                labels: [],
                attachments: [],
                timeTracking: [],
                comments: [],
                history: [],
                acceptanceCriteria: [],
                testCases: [],
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: 'import',
                  lastModifiedBy: 'import'
                }
              };
              currentPhase.tasks!.push(task);
            }
          });

          if (currentPhase) {
            phases.push(currentPhase as PlanPhase);
          }

          return {
            id: `imported_${Date.now()}`,
            name: 'Imported Plan',
            type: 'business',
            status: 'draft',
            priority: 'medium',
            visibility: 'private',
            phases,
            timeline: {
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
              schedulingMethod: 'manual'
            }
          };
        }

        case 'xml': {
          // Basic XML parsing would require a proper XML parser
          // For now, return null as placeholder
          console.warn('XML import not yet implemented');
          return null;
        }

        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      return null;
    }
  }

  /**
   * Calculate plan dependencies
   */
  static analyzePlanDependencies(plan: Plan): {
    internal: PlanDependency[];
    external: PlanDependency[];
    circular: string[];
    bottlenecks: string[];
  } {
    const internal: PlanDependency[] = [];
    const external: PlanDependency[] = [];
    const circular: string[] = [];

    // Analyze task dependencies
    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        task.dependencies.forEach(depId => {
          // Check if dependency is within the same plan
          const isInternal = plan.phases.some(p => 
            p.tasks.some(t => t.id === depId)
          );

          const dependency: PlanDependency = {
            id: `dep_${task.id}_${depId}`,
            type: 'task',
            sourceId: depId,
            targetId: task.id,
            dependencyType: 'finish_to_start',
            lag: 0,
            critical: false
          };

          if (isInternal) {
            internal.push(dependency);
          } else {
            external.push(dependency);
          }
        });
      });
    });

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCircular = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) {
        circular.push(taskId);
        return true;
      }
      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = plan.phases.flatMap(p => p.tasks).find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (detectCircular(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    plan.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (!visited.has(task.id)) {
          detectCircular(task.id);
        }
      });
    });

    // Identify bottlenecks (tasks with many dependents)
    const dependentCounts = new Map<string, number>();
    internal.forEach(dep => {
      const count = dependentCounts.get(dep.sourceId) || 0;
      dependentCounts.set(dep.sourceId, count + 1);
    });

    const bottlenecks = Array.from(dependentCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([taskId, _]) => taskId);

    return {
      internal,
      external,
      circular,
      bottlenecks
    };
  }

  /**
   * Generate plan templates
   */
  static generatePlanTemplate(plan: Plan): {
    id: string;
    name: string;
    description: string;
    category: string;
    type: string;
    structure: Partial<Plan>;
    customFields: any[];
    isPublic: boolean;
  } {
    return {
      id: `template_${Date.now()}`,
      name: `${plan.name} Template`,
      description: `Template based on ${plan.name}`,
      category: plan.type,
      type: plan.type,
      structure: {
        ...plan,
        id: undefined,
        name: '',
        metadata: {
          ...plan.metadata,
          createdAt: '',
          updatedAt: '',
          createdBy: '',
          lastModifiedBy: ''
        }
      },
      customFields: [],
      isPublic: false
    };
  }
}