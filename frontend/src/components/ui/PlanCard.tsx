import React, { useMemo, useState, useCallback } from 'react';
// import { useUIState } from '../../hooks/useUIStore';
import { useTheme } from '../../contexts/ThemeContext';
import type {
  PlanCardProps,
  PlanCardConfig,
  MilestoneDisplayData,
  PlanProgressSummary,
  TeamMemberDisplay
} from '../../types/components/planCard';
import {
  DEFAULT_PLAN_CARD_CONFIG,
  MILESTONE_STYLES,
  PLAN_STATUS_STYLES
} from '../../types/components/planCard';

/**
 * PlanCard component with milestone display functionality
 * Displays plan information with interactive milestone tracking
 */
export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  config: userConfig,
  milestones: customMilestones,
  progress: customProgress,
  style,
  className = '',
  loading = false,
  error,
  onClick,
  onMilestoneClick,
  onPhaseClick: _onPhaseClick,
  onTeamMemberClick,
  onEdit,
  onDuplicate: _onDuplicate,
  onArchive: _onArchive,
  onDelete: _onDelete,
  onShare
}) => {
  const { theme } = useTheme();
  
  // Merge user config with defaults
  const config: PlanCardConfig = { ...DEFAULT_PLAN_CARD_CONFIG, ...userConfig };
  
  // State for expanded sections
  const [expanded, setExpanded] = useState({
    milestones: false,
    progress: false,
    team: false,
    details: false
  });

  // Calculate milestones from plan data or use custom
  const milestones = useMemo((): MilestoneDisplayData[] => {
    if (customMilestones) return customMilestones;
    
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
          progress: milestone.status === 'completed' ? 100 : 
                   milestone.status === 'in_progress' ? 50 : 0,
          isOverdue: daysRemaining < 0 && milestone.status !== 'completed',
          daysRemaining: daysRemaining > 0 ? daysRemaining : undefined,
          completionCriteria: milestone.completionCriteria,
          dependencies: milestone.dependencies,
          requiredDeliverables: milestone.requiredDeliverables,
          priority: 'medium' // Default priority, could be enhanced
        });
      });
    });
    
    return planMilestones.slice(0, config.maxMilestones);
  }, [plan, customMilestones, config.maxMilestones]);

  // Calculate progress summary
  const progress = useMemo((): PlanProgressSummary => {
    if (customProgress) return { ...getDefaultProgress(), ...customProgress };
    
    const phases = plan.phases;
    const allTasks = phases.flatMap(phase => phase.tasks);
    const allMilestones = phases.flatMap(phase => phase.milestones);
    
    const phaseStats = phases.reduce(
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
    
    const taskStats = allTasks.reduce(
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
    
    const milestoneStats = allMilestones.reduce(
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
    
    const overallProgress = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;
    
    const startDate = new Date(plan.timeline.startDate);
    const endDate = new Date(plan.timeline.endDate);
    const now = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      overall: overallProgress,
      phases: phaseStats,
      tasks: taskStats,
      milestones: milestoneStats,
      timeline: {
        startDate: plan.timeline.startDate,
        endDate: plan.timeline.endDate,
        daysTotal: totalDays,
        daysElapsed: Math.max(0, elapsedDays),
        daysRemaining: Math.max(0, remainingDays),
        isOnTrack: overallProgress >= (elapsedDays / totalDays) * 100
      }
    };
  }, [plan, customProgress]);

  // Get team member display data
  const team = useMemo((): TeamMemberDisplay[] => {
    return plan.team.map(member => ({
      id: member.id,
      name: (member as any).name || `User ${member.id}`,
      role: String(member.role),
      avatar: (member as any).avatar,
      workload: 75, // Mock workload data
      tasksAssigned: Math.floor(Math.random() * 10) + 1,
      tasksCompleted: Math.floor(Math.random() * 8) + 1
    }));
  }, [plan.team]);

  const toggleSection = useCallback((section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // Prevent bubbling from child elements
    onClick?.(plan);
  }, [onClick, plan]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getDefaultProgress = (): PlanProgressSummary => ({
    overall: 0,
    phases: { total: 0, completed: 0, inProgress: 0, notStarted: 0, blocked: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, notStarted: 0, blocked: 0 },
    milestones: { total: 0, completed: 0, upcoming: 0, overdue: 0, missed: 0 },
    timeline: {
      startDate: '',
      endDate: '',
      daysTotal: 0,
      daysElapsed: 0,
      daysRemaining: 0,
      isOnTrack: true
    }
  });

  if (loading) {
    return (
      <div
        className={`plan-card plan-card--loading ${className}`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          ...style
        }}
      >
        <div style={{
          background: 'var(--bg-primary)',
          height: '20px',
          borderRadius: '4px',
          marginBottom: '12px',
          opacity: 0.7
        }} />
        <div style={{
          background: 'var(--bg-primary)',
          height: '16px',
          borderRadius: '4px',
          width: '70%',
          marginBottom: '20px',
          opacity: 0.5
        }} />
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: 'var(--bg-primary)',
              height: '24px',
              width: '60px',
              borderRadius: '12px',
              opacity: 0.4
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`plan-card plan-card--error ${className}`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '24px',
          ...style
        }}
      >
        <div style={{ color: '#ef4444', fontSize: '16px', fontWeight: '500' }}>
          Error Loading Plan
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
          {error}
        </div>
      </div>
    );
  }

  const statusStyle = PLAN_STATUS_STYLES[plan.status] || PLAN_STATUS_STYLES.active;
  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936', 
    high: '#f56565',
    critical: '#dc2626'
  };

  return (
    <div
      className={`plan-card plan-card--${config.viewMode} ${className} ${theme}`}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: config.viewMode === 'compact' ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        cursor: config.interactive && onClick ? 'pointer' : 'default',
        color: 'var(--text-primary)',
        ...style
      }}
      onClick={config.interactive ? handleCardClick : undefined}
      onMouseEnter={(e) => {
        if (config.interactive && onClick) {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (config.interactive && onClick) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      role={config.interactive ? "button" : "article"}
      tabIndex={config.interactive && onClick ? 0 : undefined}
      aria-label={`Plan: ${plan.name}`}
      onKeyDown={(e) => {
        if (config.interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(plan);
        }
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: config.viewMode === 'compact' ? '12px' : '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: config.viewMode === 'compact' ? '16px' : '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}>
            {plan.name}
          </h3>
          
          {config.showActions && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(plan); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Edit Plan"
                  aria-label="Edit Plan"
                >
                  ✏️
                </button>
              )}
              {onShare && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(plan); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Share Plan"
                  aria-label="Share Plan"
                >
                  🔗
                </button>
              )}
            </div>
          )}
        </div>

        {config.viewMode !== 'compact' && plan.description && (
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {plan.description}
          </p>
        )}

        {/* Status and Priority Badges */}
        {config.showStatus && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              background: statusStyle.bgColor,
              color: statusStyle.color
            }}>
              <span>{statusStyle.icon}</span>
              {plan.status.replace('_', ' ')}
            </span>
            
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              background: priorityColors[plan.priority] + '20',
              color: priorityColors[plan.priority]
            }}>
              {plan.priority} priority
            </span>

            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              background: '#3b82f6' + '20',
              color: '#3b82f6'
            }}>
              {plan.type}
            </span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {config.showProgress && (
        <div style={{ marginBottom: config.viewMode === 'compact' ? '12px' : '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Progress
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
              {progress.overall}%
            </span>
          </div>
          
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              height: '100%',
              width: `${progress.overall}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {config.viewMode !== 'compact' && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Tasks: {progress.tasks.completed}/{progress.tasks.total}</span>
              <span>Phases: {progress.phases.completed}/{progress.phases.total}</span>
              {config.showTimeline && (
                <span>Days: {progress.timeline.daysElapsed}/{progress.timeline.daysTotal}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <div style={{ marginBottom: config.viewMode === 'compact' ? '12px' : '20px' }}>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '12px',
              cursor: 'pointer'
            }}
            onClick={() => toggleSection('milestones')}
          >
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Milestones ({milestones.length})
            </span>
            <span style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '12px',
              transform: expanded.milestones ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </div>

          {(expanded.milestones || config.viewMode === 'detailed') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {milestones.slice(0, expanded.milestones ? undefined : 3).map(milestone => {
                const milestoneStyle = MILESTONE_STYLES[milestone.type];
                return (
                  <div
                    key={milestone.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: milestoneStyle.bgColor,
                      borderRadius: '8px',
                      cursor: config.interactive && onMilestoneClick ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (config.interactive && onMilestoneClick) {
                        onMilestoneClick(milestone);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (config.interactive && onMilestoneClick) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (config.interactive && onMilestoneClick) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{milestoneStyle.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {milestone.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {formatDate(milestone.targetDate)}
                          {milestone.isOverdue && (
                            <span style={{ color: '#ef4444', marginLeft: '4px' }}>
                              (Overdue)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {milestone.status === 'completed' && (
                        <span style={{ color: '#10b981', fontSize: '14px' }}>✅</span>
                      )}
                      {milestone.isOverdue && milestone.status !== 'completed' && (
                        <span style={{ color: '#ef4444', fontSize: '14px' }}>⚠️</span>
                      )}
                      {milestone.daysRemaining && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: milestone.daysRemaining < 7 ? '#f59e0b' : 'var(--text-secondary)' 
                        }}>
                          {milestone.daysRemaining}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!expanded.milestones && milestones.length > 3 && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleSection('milestones'); }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                marginTop: '8px',
                width: '100%'
              }}
            >
              Show {milestones.length - 3} more milestones
            </button>
          )}
        </div>
      )}

      {/* Team Section */}
      {config.showTeam && team.length > 0 && config.viewMode !== 'compact' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Team ({team.length})
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {team.slice(0, 5).map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  background: 'var(--bg-primary)',
                  borderRadius: '16px',
                  cursor: config.interactive && onTeamMemberClick ? 'pointer' : 'default',
                  fontSize: '12px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (config.interactive && onTeamMemberClick) {
                    onTeamMemberClick(member);
                  }
                }}
                title={`${member.name} - ${member.role}`}
              >
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
            
            {team.length > 5 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                +{team.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Section */}
      {config.showTimeline && config.viewMode === 'detailed' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Start Date</div>
            <div>{formatDate(plan.timeline.startDate)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Duration</div>
            <div>{progress.timeline.daysTotal} days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>End Date</div>
            <div>{formatDate(plan.timeline.endDate)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCard;