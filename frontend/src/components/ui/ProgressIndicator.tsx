import React, { useMemo } from 'react';
// import { useUIState } from '../../hooks/useUIStore';
import type {
  ProgressIndicatorProps
} from '../../types/components/planCard';
import { DEFAULT_PROGRESS_COLORS } from '../../types/components/planCard';

/**
 * ProgressIndicator component for displaying plan progress in various formats
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  mode = 'standard',
  showLabels = true,
  showPercentages = true,
  colors: customColors,
  style,
  className = ''
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

  const colors = useMemo(() => ({
    ...DEFAULT_PROGRESS_COLORS,
    ...customColors
  }), [customColors]);

  const renderCompactProgress = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Overall Progress */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          {showLabels && (
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              Overall
            </span>
          )}
          {showPercentages && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.colors.primary
            }}>
              {progress.overall}%
            </span>
          )}
        </div>
        
        <div style={{
          background: theme.colors.background,
          borderRadius: '6px',
          height: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${colors.completed}, ${theme.colors.primary})`,
            height: '100%',
            width: `${progress.overall}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        gap: '8px',
        fontSize: '10px',
        color: theme.colors.textSecondary
      }}>
        <span>{progress.tasks.completed}/{progress.tasks.total}</span>
      </div>
    </div>
  );

  const renderStandardProgress = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overall Progress */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.text
          }}>
            Overall Progress
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: '700',
            color: theme.colors.primary
          }}>
            {progress.overall}%
          </span>
        </div>
        
        <div style={{
          background: theme.colors.background,
          borderRadius: '8px',
          height: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${colors.completed}, ${theme.colors.primary})`,
            height: '100%',
            width: `${progress.overall}%`,
            transition: 'width 0.3s ease'
          }} />
          
          {/* Timeline indicator if on track */}
          {progress.timeline.daysTotal > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${(progress.timeline.daysElapsed / progress.timeline.daysTotal) * 100}%`,
              width: '2px',
              height: '100%',
              background: progress.timeline.isOnTrack ? colors.completed : colors.overdue,
              opacity: 0.7
            }} />
          )}
        </div>
      </div>

      {/* Progress Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {/* Tasks */}
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: '6px'
          }}>
            Tasks ({progress.tasks.completed}/{progress.tasks.total})
          </div>
          
          <div style={{
            background: theme.colors.background,
            borderRadius: '6px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: colors.completed,
              height: '100%',
              width: progress.tasks.total > 0 ? `${(progress.tasks.completed / progress.tasks.total) * 100}%` : '0%',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Phases */}
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: '6px'
          }}>
            Phases ({progress.phases.completed}/{progress.phases.total})
          </div>
          
          <div style={{
            background: theme.colors.background,
            borderRadius: '6px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: colors.completed,
              height: '100%',
              width: progress.phases.total > 0 ? `${(progress.phases.completed / progress.phases.total) * 100}%` : '0%',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: '6px'
          }}>
            Milestones ({progress.milestones.completed}/{progress.milestones.total})
          </div>
          
          <div style={{
            background: theme.colors.background,
            borderRadius: '6px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: colors.completed,
              height: '100%',
              width: progress.milestones.total > 0 ? `${(progress.milestones.completed / progress.milestones.total) * 100}%` : '0%',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedProgress = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overall Progress with Timeline */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: theme.colors.text
            }}>
              Overall Progress
            </h4>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: theme.colors.textSecondary
            }}>
              {progress.timeline.isOnTrack ? 'On track' : 'Behind schedule'} • {progress.timeline.daysRemaining} days remaining
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.colors.primary,
              lineHeight: 1
            }}>
              {progress.overall}%
            </div>
            <div style={{
              fontSize: '11px',
              color: theme.colors.textSecondary,
              marginTop: '2px'
            }}>
              Complete
            </div>
          </div>
        </div>
        
        <div style={{
          background: theme.colors.background,
          borderRadius: '10px',
          height: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Progress bar */}
          <div style={{
            background: `linear-gradient(90deg, ${colors.completed}, ${theme.colors.primary})`,
            height: '100%',
            width: `${progress.overall}%`,
            transition: 'width 0.3s ease'
          }} />
          
          {/* Timeline indicator */}
          {progress.timeline.daysTotal > 0 && (
            <>
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${(progress.timeline.daysElapsed / progress.timeline.daysTotal) * 100}%`,
                width: '3px',
                height: '100%',
                background: progress.timeline.isOnTrack ? colors.completed : colors.overdue,
                borderRadius: '1px',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)'
              }} />
              
              {/* Timeline tooltip */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: `${(progress.timeline.daysElapsed / progress.timeline.daysTotal) * 100}%`,
                transform: 'translateX(-50%)',
                background: theme.colors.surface,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                color: theme.colors.text,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.colors.border}`,
                whiteSpace: 'nowrap'
              }}>
                Day {progress.timeline.daysElapsed} of {progress.timeline.daysTotal}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {/* Tasks Breakdown */}
        <div style={{
          background: theme.colors.background,
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.text
          }}>
            Tasks
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Completed', value: progress.tasks.completed, color: colors.completed },
              { label: 'In Progress', value: progress.tasks.inProgress, color: colors.inProgress },
              { label: 'Not Started', value: progress.tasks.notStarted, color: colors.notStarted },
              { label: 'Blocked', value: progress.tasks.blocked, color: colors.blocked }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: item.color
                }} />
                <span style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  flex: 1
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.text
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '8px 0',
            borderTop: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: theme.colors.text }}>
              Total
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
              {progress.tasks.total}
            </span>
          </div>
        </div>

        {/* Phases Breakdown */}
        <div style={{
          background: theme.colors.background,
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.text
          }}>
            Phases
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Completed', value: progress.phases.completed, color: colors.completed },
              { label: 'In Progress', value: progress.phases.inProgress, color: colors.inProgress },
              { label: 'Not Started', value: progress.phases.notStarted, color: colors.notStarted },
              { label: 'Blocked', value: progress.phases.blocked, color: colors.blocked }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: item.color
                }} />
                <span style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  flex: 1
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.text
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '8px 0',
            borderTop: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: theme.colors.text }}>
              Total
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
              {progress.phases.total}
            </span>
          </div>
        </div>

        {/* Milestones Status */}
        <div style={{
          background: theme.colors.background,
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme.colors.text
          }}>
            Milestones
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Completed', value: progress.milestones.completed, color: colors.completed },
              { label: 'Upcoming', value: progress.milestones.upcoming, color: colors.inProgress },
              { label: 'Overdue', value: progress.milestones.overdue, color: colors.overdue },
              { label: 'Missed', value: progress.milestones.missed, color: colors.blocked }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: item.color
                }} />
                <span style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  flex: 1
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.text
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '8px 0',
            borderTop: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: theme.colors.text }}>
              Total
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text }}>
              {progress.milestones.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`progress-indicator progress-indicator--${mode} ${className}`}
      style={{
        ...style
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress.overall}
      aria-label={`Overall progress: ${progress.overall}%`}
    >
      {mode === 'compact' && renderCompactProgress()}
      {mode === 'standard' && renderStandardProgress()}
      {mode === 'detailed' && renderDetailedProgress()}
    </div>
  );
};

export default ProgressIndicator;