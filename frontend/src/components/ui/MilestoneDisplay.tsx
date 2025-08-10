import React, { useMemo, useCallback } from 'react';
// import { useUIState } from '../../hooks/useUIStore';
import type {
  MilestoneDisplayProps,
  MilestoneDisplayData
} from '../../types/components/planCard';
import { MILESTONE_STYLES } from '../../types/components/planCard';

/**
 * MilestoneDisplay component for rendering milestones in different layouts
 */
export const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({
  milestones,
  mode = 'list',
  limit,
  showProgress = true,
  interactive = true,
  style,
  className = '',
  onMilestoneClick,
  onViewAll
}) => {
  // Mock theme colors for this component
  const theme = {
    colors: {
      text: '#1a202c',
      textSecondary: '#718096',
      background: '#f7fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
      primary: '#667eea',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#f56565'
    }
  };

  // Limit milestones if specified
  const displayMilestones = useMemo(() => {
    return limit ? milestones.slice(0, limit) : milestones;
  }, [milestones, limit]);

  const hasMore = limit && milestones.length > limit;

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }, []);

  const getTimelinePosition = useCallback((milestone: MilestoneDisplayData) => {
    if (displayMilestones.length <= 1) return 0;
    
    const dates = displayMilestones.map(m => new Date(m.targetDate).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const currentDate = new Date(milestone.targetDate).getTime();
    
    if (maxDate === minDate) return 0;
    return ((currentDate - minDate) / (maxDate - minDate)) * 100;
  }, [displayMilestones]);

  const handleMilestoneClick = useCallback((milestone: MilestoneDisplayData, event: React.MouseEvent) => {
    if (!interactive || !onMilestoneClick) return;
    event.stopPropagation();
    onMilestoneClick(milestone);
  }, [interactive, onMilestoneClick]);

  const renderMilestone = useCallback((milestone: MilestoneDisplayData) => {
    const milestoneStyle = MILESTONE_STYLES[milestone.type];
    const isClickable = interactive && onMilestoneClick;

    const baseStyles = {
      cursor: isClickable ? 'pointer' : 'default',
      transition: 'all 0.2s ease'
    };

    const hoverProps = isClickable ? {
      onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      },
      onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }
    } : {};

    switch (mode) {
      case 'list':
        return (
          <div
            key={milestone.id}
            className="milestone-item milestone-item--list"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: milestoneStyle.bgColor,
              borderRadius: '8px',
              marginBottom: '8px',
              ...baseStyles
            }}
            onClick={(e) => handleMilestoneClick(milestone, e)}
            role={isClickable ? "button" : "listitem"}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={`Milestone: ${milestone.name}, ${milestone.status}, due ${formatDate(milestone.targetDate)}`}
            onKeyDown={isClickable ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMilestoneClick(milestone, e as any);
              }
            } : undefined}
            {...hoverProps}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: milestoneStyle.color + '20',
                fontSize: '16px'
              }}>
                {milestoneStyle.icon}
              </div>
              
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: '2px'
                }}>
                  {milestone.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{formatDate(milestone.targetDate)}</span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: milestoneStyle.color + '15',
                    color: milestoneStyle.color,
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    {milestone.type}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {milestone.status === 'completed' && (
                <span style={{ color: theme.colors.success, fontSize: '18px' }}>✅</span>
              )}
              {milestone.isOverdue && milestone.status !== 'completed' && (
                <span style={{ color: theme.colors.error, fontSize: '16px' }}>⚠️</span>
              )}
              {milestone.daysRemaining && milestone.status !== 'completed' && (
                <span style={{ 
                  fontSize: '12px', 
                  color: milestone.daysRemaining < 7 ? theme.colors.warning : theme.colors.textSecondary,
                  fontWeight: '500'
                }}>
                  {milestone.daysRemaining}d
                </span>
              )}
              {showProgress && (
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: theme.colors.background,
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${milestone.progress}%`,
                    height: '100%',
                    background: milestone.progress === 100 ? theme.colors.success : theme.colors.primary,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div
            key={milestone.id}
            className="milestone-item milestone-item--timeline"
            style={{
              position: 'absolute',
              left: `${getTimelinePosition(milestone)}%`,
              transform: 'translateX(-50%)',
              ...baseStyles
            }}
            onClick={(e) => handleMilestoneClick(milestone, e)}
            role={isClickable ? "button" : "presentation"}
            tabIndex={isClickable ? 0 : undefined}
            {...hoverProps}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: milestone.status === 'completed' ? theme.colors.success : milestoneStyle.color,
                border: `2px solid ${theme.colors.surface}`,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }} />
              
              <div style={{
                background: theme.colors.surface,
                padding: '6px 8px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.colors.border}`,
                minWidth: '80px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: theme.colors.text,
                  marginBottom: '2px'
                }}>
                  {milestone.name}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: theme.colors.textSecondary
                }}>
                  {formatDate(milestone.targetDate)}
                </div>
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div
            key={milestone.id}
            className="milestone-item milestone-item--progress"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              background: theme.colors.background,
              borderRadius: '6px',
              marginBottom: '6px',
              ...baseStyles
            }}
            onClick={(e) => handleMilestoneClick(milestone, e)}
            role={isClickable ? "button" : "listitem"}
            tabIndex={isClickable ? 0 : undefined}
            {...hoverProps}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: milestoneStyle.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {milestoneStyle.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: theme.colors.text
                }}>
                  {milestone.name}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: milestone.progress === 100 ? theme.colors.success : theme.colors.primary
                }}>
                  {milestone.progress}%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '6px',
                background: theme.colors.border,
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${milestone.progress}%`,
                  height: '100%',
                  background: milestone.progress === 100 ? theme.colors.success : theme.colors.primary,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div
            key={milestone.id}
            className="milestone-item milestone-item--grid"
            style={{
              background: milestoneStyle.bgColor,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              ...baseStyles
            }}
            onClick={(e) => handleMilestoneClick(milestone, e)}
            role={isClickable ? "button" : "gridcell"}
            tabIndex={isClickable ? 0 : undefined}
            {...hoverProps}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>
              {milestoneStyle.icon}
            </div>
            
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme.colors.text,
              marginBottom: '4px'
            }}>
              {milestone.name}
            </div>
            
            <div style={{
              fontSize: '12px',
              color: theme.colors.textSecondary,
              marginBottom: '8px'
            }}>
              {formatDate(milestone.targetDate)}
            </div>

            {milestone.status === 'completed' && (
              <div style={{ color: theme.colors.success, fontSize: '16px' }}>✅</div>
            )}
            {milestone.isOverdue && milestone.status !== 'completed' && (
              <div style={{ color: theme.colors.error, fontSize: '16px' }}>⚠️</div>
            )}
          </div>
        );

      default:
        return null;
    }
  }, [mode, theme, showProgress, formatDate, getTimelinePosition, handleMilestoneClick, interactive, onMilestoneClick]);

  const containerStyles = useMemo(() => {
    const baseStyle = {
      ...style
    };

    switch (mode) {
      case 'timeline':
        return {
          ...baseStyle,
          position: 'relative' as const,
          height: '100px',
          background: theme.colors.background,
          borderRadius: '8px',
          padding: '20px 16px',
          overflow: 'hidden'
        };
      
      case 'grid':
        return {
          ...baseStyle,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        };
      
      default:
        return baseStyle;
    }
  }, [mode, style, theme.colors.background]);

  if (displayMilestones.length === 0) {
    return (
      <div
        className={`milestone-display milestone-display--empty ${className}`}
        style={{
          padding: '24px',
          textAlign: 'center',
          color: theme.colors.textSecondary,
          fontSize: '14px',
          ...style
        }}
      >
        No milestones to display
      </div>
    );
  }

  return (
    <div
      className={`milestone-display milestone-display--${mode} ${className}`}
      style={containerStyles}
      role="region"
      aria-label="Milestones"
    >
      {mode === 'timeline' && (
        <>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '16px',
            right: '16px',
            height: '2px',
            background: theme.colors.border,
            transform: 'translateY(-50%)'
          }} />
          
          {/* Timeline milestones */}
          {displayMilestones.map(renderMilestone)}
        </>
      )}
      
      {mode !== 'timeline' && displayMilestones.map(renderMilestone)}

      {/* View All button */}
      {hasMore && onViewAll && (
        <button
          onClick={onViewAll}
          style={{
            background: 'transparent',
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: mode === 'grid' ? '8px' : '6px',
            padding: mode === 'grid' ? '16px' : '12px',
            width: '100%',
            color: theme.colors.textSecondary,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: mode === 'timeline' ? undefined : '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.color = theme.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border;
            e.currentTarget.style.color = theme.colors.textSecondary;
          }}
        >
          View {milestones.length - displayMilestones.length} more milestones
        </button>
      )}
    </div>
  );
};

export default MilestoneDisplay;