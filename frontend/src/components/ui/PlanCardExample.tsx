import React, { useState } from 'react';
import { PlanCard } from './PlanCard';
import { MilestoneDisplay } from './MilestoneDisplay';
import { ProgressIndicator } from './ProgressIndicator';
import { usePlanCard, useMilestoneInteractions } from '../../hooks/usePlanCard';
import type { Plan } from '../../types/plans';
import type { 
  MilestoneDisplayMode,
  MilestoneDisplayData,
  PlanProgressSummary
} from '../../types/components/planCard';

/**
 * Example component demonstrating PlanCard usage with milestone display
 */
export const PlanCardExample: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<'basic' | 'detailed' | 'interactive' | 'components'>('basic');

  // Simplified sample plan data
  const samplePlan: Plan = {
    id: 'example-plan',
    name: 'Website Redesign Project',
    description: 'Complete overhaul of company website with modern design and improved user experience',
    type: 'product',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    objective: 'Increase user engagement and conversion rates by 25%',
    overview: 'This project involves redesigning our main website to improve user experience, mobile responsiveness, and overall conversion rates.',
    phases: [
      {
        id: 'research',
        name: 'Research & Discovery',
        description: 'User research, competitive analysis, and requirements gathering',
        order: 1,
        status: 'completed',
        priority: 'high',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        duration: 31,
        actualStartDate: '2024-01-15',
        actualEndDate: '2024-02-12',
        dependencies: [],
        blockers: [],
        tasks: [
          {
            id: 'user-research',
            name: 'User Research',
            description: 'Conduct user interviews and surveys',
            status: 'completed',
            priority: 'high',
            type: 'task',
            assignedTo: 'user-researcher-1',
            reporter: 'pm-1',
            reviewers: [],
            startDate: '2024-01-15',
            dueDate: '2024-01-25',
            estimatedHours: 40,
            actualHours: 38,
            dependencies: [],
            subtasks: [],
            blockedBy: [],
            blocking: [],
            progress: 100,
            completedAt: '2024-01-24',
            tags: ['research', 'ux'],
            labels: [],
            attachments: [],
            timeTracking: [],
            comments: [],
            history: [],
            acceptanceCriteria: [],
            testCases: [],
            metadata: {
              createdAt: '2024-01-15',
              updatedAt: '2024-01-24',
              createdBy: 'pm-1',
              lastModifiedBy: 'user-researcher-1'
            }
          }
        ],
        taskStats: {
          total: 4,
          completed: 4,
          inProgress: 0,
          blocked: 0,
          percentage: 100
        },
        milestones: [
          {
            id: 'research-complete',
            name: 'Research Complete',
            description: 'All user research and competitive analysis completed',
            type: 'checkpoint',
            status: 'completed',
            targetDate: '2024-02-15',
            actualDate: '2024-02-12',
            completionCriteria: ['User interviews completed', 'Competitive analysis done'],
            successMetrics: [],
            dependencies: ['user-research'],
            requiredDeliverables: [],
            approvals: [],
            notifications: [],
            metadata: {
              createdAt: '2024-01-15',
              updatedAt: '2024-02-12',
              createdBy: 'pm-1'
            }
          }
        ],
        assignedTeam: ['user-researcher-1', 'designer-1'],
        budgetAllocated: 15000,
        budgetUsed: 14200,
        deliverables: ['research-report'],
        approvals: [],
        notes: 'Research phase completed ahead of schedule',
        comments: [],
        metadata: {
          createdAt: '2024-01-15',
          updatedAt: '2024-02-12',
          createdBy: 'pm-1'
        }
      }
    ],
    timeline: {
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      duration: 181,
      actualStartDate: '2024-01-15',
      workingDays: [1, 2, 3, 4, 5],
      holidays: [],
      workingHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC'
      },
      bufferTime: 10,
      criticalPath: [],
      schedulingMethod: 'manual',
      lastScheduled: '2024-01-15'
    },
    resources: {
      requiredRoles: [],
      teamCapacity: [],
      totalBudget: 85000,
      budgetCurrency: 'USD',
      budgetBreakdown: [],
      budgetTracking: [],
      tools: [],
      infrastructure: [],
      materials: [],
      vendors: [],
      contractors: []
    },
    risks: [],
    successCriteria: ['25% increase in conversion rate', 'Improved mobile performance', 'Better SEO rankings'],
    kpis: [],
    deliverables: [],
    dependencies: [],
    team: [
      {
        id: 'pm-1',
        role: 'pm' as any,
        email: 'sarah.johnson@company.com',
        permissions: [],
        workload: 80,
        capacity: 40,
        hourlyRate: 75,
        availability: {
          start: '2024-01-15',
          end: '2024-07-15',
          hoursPerWeek: 40,
          workingDays: [1, 2, 3, 4, 5],
          timeZone: 'UTC'
        },
        skills: [],
        certifications: [],
        metadata: {
          joinedAt: '2024-01-15',
          lastActive: '2024-03-20',
          addedBy: 'admin'
        }
      }
    ],
    stakeholders: [],
    progress: {
      overall: 42,
      phases: {
        completed: 1,
        inProgress: 1,
        notStarted: 1,
        total: 3
      },
      tasks: {
        completed: 6,
        inProgress: 3,
        blocked: 1,
        total: 10
      },
      milestones: {
        completed: 2,
        upcoming: 3,
        overdue: 0,
        total: 5
      }
    },
    metadata: {
      createdAt: '2024-01-15',
      updatedAt: '2024-03-20',
      createdBy: 'pm-1',
      lastModifiedBy: 'designer-1',
      version: 3,
      tags: ['web', 'redesign', 'ux'],
      category: 'Product Development',
      industry: 'Technology'
    },
    settings: {
      visibility: 'team',
      permissions: {
        view: ['team'],
        edit: ['team-leads'],
        admin: ['pm-1']
      },
      notifications: {
        email: true,
        inApp: true
      },
      automation: {
        statusUpdates: true,
        reminderNotifications: true,
        progressReporting: true
      },
      integrations: []
    },
    integrations: []
  };

  // Initialize hooks
  const planCardHook = usePlanCard(samplePlan, {
    viewMode: 'standard',
    interactive: true,
    showProgress: true
  });

  // const milestoneInteractions = useMilestoneInteractions(planCardHook.milestones);

  // Sample milestone data for component examples
  const sampleMilestones: MilestoneDisplayData[] = [
    {
      id: 'milestone-1',
      name: 'Research Complete',
      description: 'User research and analysis finished',
      type: 'checkpoint',
      status: 'completed',
      targetDate: '2024-02-15',
      actualDate: '2024-02-12',
      progress: 100,
      isOverdue: false,
      completionCriteria: ['User interviews completed'],
      dependencies: [],
      requiredDeliverables: [],
      priority: 'medium'
    },
    {
      id: 'milestone-2',
      name: 'Design System Ready',
      description: 'Complete design system and components',
      type: 'major',
      status: 'in_progress',
      targetDate: '2024-04-01',
      progress: 65,
      isOverdue: false,
      daysRemaining: 12,
      completionCriteria: ['Component library complete'],
      dependencies: [],
      requiredDeliverables: [],
      priority: 'high'
    }
  ];

  const sampleProgress: PlanProgressSummary = {
    overall: 42,
    phases: { total: 3, completed: 1, inProgress: 1, notStarted: 1, blocked: 0 },
    tasks: { total: 10, completed: 6, inProgress: 3, notStarted: 0, blocked: 1 },
    milestones: { total: 5, completed: 2, upcoming: 2, overdue: 1, missed: 0 },
    timeline: {
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      daysTotal: 181,
      daysElapsed: 65,
      daysRemaining: 116,
      isOnTrack: true
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '12px'
        }}>
          PlanCard Component Examples
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#718096',
          lineHeight: '1.6'
        }}>
          Interactive examples of PlanCard with milestone display functionality
        </p>
      </div>

      {/* Example Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        padding: '8px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {[
          { id: 'basic', label: 'Basic Usage' },
          { id: 'detailed', label: 'Detailed View' },
          { id: 'interactive', label: 'Interactive Features' },
          { id: 'components', label: 'Sub-Components' }
        ].map(example => (
          <button
            key={example.id}
            onClick={() => setSelectedExample(example.id as any)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: selectedExample === example.id ? '#667eea' : 'transparent',
              color: selectedExample === example.id ? 'white' : '#4a5568',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Examples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {selectedExample === 'basic' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
              Basic PlanCard Usage
            </h2>
            <p style={{ fontSize: '16px', color: '#718096', marginBottom: '24px' }}>
              Simple plan card with milestone display in standard configuration.
            </p>
            
            <PlanCard
              plan={samplePlan}
              onClick={(plan) => console.log('Clicked plan:', plan)}
              onMilestoneClick={(milestone) => console.log('Clicked milestone:', milestone)}
            />
          </div>
        )}

        {selectedExample === 'detailed' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
              Detailed View
            </h2>
            <p style={{ fontSize: '16px', color: '#718096', marginBottom: '24px' }}>
              Plan card in detailed view mode with expanded information display.
            </p>
            
            <PlanCard
              plan={samplePlan}
              config={{
                viewMode: 'detailed',
                milestoneDisplay: 'timeline',
                showProgress: true,
                showTeam: true,
                showTimeline: true
              }}
              onClick={(plan) => console.log('Clicked plan:', plan)}
              onMilestoneClick={(milestone) => console.log('Clicked milestone:', milestone)}
              onEdit={(plan) => console.log('Edit plan:', plan)}
              onShare={(plan) => console.log('Share plan:', plan)}
            />
          </div>
        )}

        {selectedExample === 'components' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
              Individual Components
            </h2>
            <p style={{ fontSize: '16px', color: '#718096', marginBottom: '24px' }}>
              Standalone usage of milestone display and progress indicator components.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Milestone Display Components */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
                  MilestoneDisplay Modes
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {(['list', 'timeline', 'progress', 'grid'] as MilestoneDisplayMode[]).map(mode => (
                    <div key={mode} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                      </h4>
                      <MilestoneDisplay
                        milestones={sampleMilestones}
                        mode={mode}
                        limit={4}
                        onMilestoneClick={(milestone) => console.log('Milestone clicked:', milestone)}
                        onViewAll={() => console.log('View all clicked')}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicator Components */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
                  ProgressIndicator Modes
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {(['compact', 'standard', 'detailed'] as const).map(mode => (
                    <div key={mode} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                      </h4>
                      <ProgressIndicator
                        progress={sampleProgress}
                        mode={mode}
                        showLabels={true}
                        showPercentages={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCardExample;