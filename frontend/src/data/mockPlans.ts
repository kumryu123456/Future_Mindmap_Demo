import type { Plan } from '../types/api';

/**
 * Mock plan data for demonstration purposes
 */
export const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Future Mindmap Development',
    description: 'Complete development of the Future Mindmap application with interactive features and collaborative capabilities.',
    type: 'software_development',
    category: 'development',
    status: 'in_progress',
    priority: 'high',
    timeline: {
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      estimatedDuration: 75,
      actualDuration: 45
    },
    phases: [
      {
        id: 'phase-1',
        name: 'Frontend Development',
        description: 'Build the user interface and user experience',
        status: 'in_progress',
        order: 1,
        timeline: {
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          estimatedDuration: 32,
          actualDuration: 25
        },
        tasks: [
          {
            id: 'task-1',
            name: 'Setup React Project',
            description: 'Initialize the React project with TypeScript and essential dependencies',
            status: 'completed',
            priority: 'high',
            assigneeId: 'user-1',
            timeline: {
              startDate: '2024-01-15',
              endDate: '2024-01-17',
              estimatedDuration: 3,
              actualDuration: 2
            },
            dependencies: [],
            completedAt: '2024-01-16T10:00:00Z'
          },
          {
            id: 'task-2',
            name: 'Implement Mindmap Canvas',
            description: 'Create interactive mindmap canvas with drag and drop functionality',
            status: 'in_progress',
            priority: 'high',
            assigneeId: 'user-1',
            timeline: {
              startDate: '2024-01-18',
              endDate: '2024-01-25',
              estimatedDuration: 8,
              actualDuration: 6
            },
            dependencies: ['task-1']
          },
          {
            id: 'task-3',
            name: 'Add Toast Notifications',
            description: 'Implement comprehensive toast notification system for user feedback',
            status: 'completed',
            priority: 'medium',
            assigneeId: 'user-2',
            timeline: {
              startDate: '2024-01-20',
              endDate: '2024-01-23',
              estimatedDuration: 4,
              actualDuration: 3
            },
            dependencies: ['task-1'],
            completedAt: '2024-01-23T14:30:00Z'
          }
        ],
        milestones: [
          {
            id: 'milestone-1',
            name: 'UI Components Complete',
            description: 'All core UI components implemented and tested',
            type: 'deliverable',
            status: 'in_progress',
            targetDate: '2024-02-10',
            dependencies: ['task-1', 'task-2', 'task-3'],
            completionCriteria: [
              'All components render correctly',
              'Responsive design implemented',
              'Accessibility standards met'
            ],
            requiredDeliverables: [
              'Component library',
              'Style guide',
              'Accessibility audit report'
            ]
          }
        ]
      },
      {
        id: 'phase-2',
        name: 'Backend Integration',
        description: 'Connect frontend to backend services',
        status: 'not_started',
        order: 2,
        timeline: {
          startDate: '2024-02-16',
          endDate: '2024-03-15',
          estimatedDuration: 28
        },
        tasks: [
          {
            id: 'task-4',
            name: 'API Integration',
            description: 'Connect to backend APIs for data management',
            status: 'not_started',
            priority: 'high',
            assigneeId: 'user-3',
            timeline: {
              startDate: '2024-02-16',
              endDate: '2024-02-25',
              estimatedDuration: 10
            },
            dependencies: ['task-2']
          },
          {
            id: 'task-5',
            name: 'Session Management',
            description: 'Implement session save/load functionality',
            status: 'not_started',
            priority: 'high',
            assigneeId: 'user-1',
            timeline: {
              startDate: '2024-02-20',
              endDate: '2024-02-28',
              estimatedDuration: 9
            },
            dependencies: ['task-4']
          }
        ],
        milestones: [
          {
            id: 'milestone-2',
            name: 'Backend Integration Complete',
            description: 'All backend services connected and working',
            type: 'integration',
            status: 'not_started',
            targetDate: '2024-03-10',
            dependencies: ['task-4', 'task-5'],
            completionCriteria: [
              'API endpoints integrated',
              'Session management working',
              'Error handling implemented'
            ],
            requiredDeliverables: [
              'Integration test suite',
              'API documentation',
              'Error handling guide'
            ]
          }
        ]
      },
      {
        id: 'phase-3',
        name: 'Testing & Deployment',
        description: 'Final testing and production deployment',
        status: 'not_started',
        order: 3,
        timeline: {
          startDate: '2024-03-16',
          endDate: '2024-03-30',
          estimatedDuration: 15
        },
        tasks: [
          {
            id: 'task-6',
            name: 'End-to-End Testing',
            description: 'Comprehensive E2E testing of all features',
            status: 'not_started',
            priority: 'high',
            assigneeId: 'user-2',
            timeline: {
              startDate: '2024-03-16',
              endDate: '2024-03-23',
              estimatedDuration: 8
            },
            dependencies: ['task-5']
          },
          {
            id: 'task-7',
            name: 'Production Deployment',
            description: 'Deploy to production environment',
            status: 'not_started',
            priority: 'critical',
            assigneeId: 'user-3',
            timeline: {
              startDate: '2024-03-24',
              endDate: '2024-03-30',
              estimatedDuration: 7
            },
            dependencies: ['task-6']
          }
        ],
        milestones: [
          {
            id: 'milestone-3',
            name: 'Production Ready',
            description: 'Application deployed and ready for users',
            type: 'launch',
            status: 'not_started',
            targetDate: '2024-03-30',
            dependencies: ['task-6', 'task-7'],
            completionCriteria: [
              'All tests passing',
              'Production deployment successful',
              'Monitoring in place'
            ],
            requiredDeliverables: [
              'Production environment',
              'Monitoring dashboard',
              'User documentation'
            ]
          }
        ]
      }
    ],
    team: [
      {
        id: 'user-1',
        role: 'Frontend Developer',
        permissions: ['read', 'write', 'comment']
      },
      {
        id: 'user-2',
        role: 'UI/UX Designer',
        permissions: ['read', 'write', 'comment']
      },
      {
        id: 'user-3',
        role: 'Backend Developer',
        permissions: ['read', 'write', 'comment']
      }
    ],
    metadata: {
      createdBy: 'user-1',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T15:30:00Z',
      version: '1.2',
      tags: ['development', 'mindmap', 'react', 'typescript'],
      estimatedBudget: 50000,
      actualBudget: 32000,
      currency: 'USD'
    }
  },
  {
    id: 'plan-2',
    name: 'User Experience Research',
    description: 'Conduct comprehensive user research to improve application usability and user satisfaction.',
    type: 'research',
    category: 'user_experience',
    status: 'completed',
    priority: 'medium',
    timeline: {
      startDate: '2023-12-01',
      endDate: '2024-01-15',
      estimatedDuration: 45,
      actualDuration: 42
    },
    phases: [
      {
        id: 'phase-ux-1',
        name: 'User Research',
        description: 'Gather user feedback and analyze usage patterns',
        status: 'completed',
        order: 1,
        timeline: {
          startDate: '2023-12-01',
          endDate: '2023-12-20',
          estimatedDuration: 20,
          actualDuration: 18
        },
        tasks: [
          {
            id: 'task-ux-1',
            name: 'User Interviews',
            description: 'Conduct interviews with target users',
            status: 'completed',
            priority: 'high',
            assigneeId: 'user-ux-1',
            timeline: {
              startDate: '2023-12-01',
              endDate: '2023-12-10',
              estimatedDuration: 10,
              actualDuration: 9
            },
            dependencies: [],
            completedAt: '2023-12-09T16:00:00Z'
          },
          {
            id: 'task-ux-2',
            name: 'Survey Analysis',
            description: 'Analyze survey responses and identify patterns',
            status: 'completed',
            priority: 'medium',
            assigneeId: 'user-ux-2',
            timeline: {
              startDate: '2023-12-11',
              endDate: '2023-12-20',
              estimatedDuration: 10,
              actualDuration: 9
            },
            dependencies: ['task-ux-1'],
            completedAt: '2023-12-19T14:00:00Z'
          }
        ],
        milestones: [
          {
            id: 'milestone-ux-1',
            name: 'Research Insights Complete',
            description: 'All user research data collected and analyzed',
            type: 'deliverable',
            status: 'completed',
            targetDate: '2023-12-20',
            actualDate: '2023-12-19',
            dependencies: ['task-ux-1', 'task-ux-2'],
            completionCriteria: [
              'User interviews completed',
              'Survey data analyzed',
              'Insights documented'
            ],
            requiredDeliverables: [
              'Research report',
              'User personas',
              'Journey maps'
            ]
          }
        ]
      },
      {
        id: 'phase-ux-2',
        name: 'Design Recommendations',
        description: 'Create design recommendations based on research findings',
        status: 'completed',
        order: 2,
        timeline: {
          startDate: '2023-12-21',
          endDate: '2024-01-15',
          estimatedDuration: 25,
          actualDuration: 24
        },
        tasks: [
          {
            id: 'task-ux-3',
            name: 'Design Guidelines',
            description: 'Create comprehensive design guidelines',
            status: 'completed',
            priority: 'high',
            assigneeId: 'user-ux-1',
            timeline: {
              startDate: '2023-12-21',
              endDate: '2024-01-05',
              estimatedDuration: 15,
              actualDuration: 14
            },
            dependencies: ['task-ux-2'],
            completedAt: '2024-01-04T17:00:00Z'
          },
          {
            id: 'task-ux-4',
            name: 'Prototype Testing',
            description: 'Test design prototypes with users',
            status: 'completed',
            priority: 'high',
            assigneeId: 'user-ux-2',
            timeline: {
              startDate: '2024-01-06',
              endDate: '2024-01-15',
              estimatedDuration: 10,
              actualDuration: 10
            },
            dependencies: ['task-ux-3'],
            completedAt: '2024-01-15T12:00:00Z'
          }
        ],
        milestones: [
          {
            id: 'milestone-ux-2',
            name: 'Design System Complete',
            description: 'Final design system and guidelines ready',
            type: 'deliverable',
            status: 'completed',
            targetDate: '2024-01-15',
            actualDate: '2024-01-15',
            dependencies: ['task-ux-3', 'task-ux-4'],
            completionCriteria: [
              'Design guidelines finalized',
              'Prototypes validated',
              'Component library created'
            ],
            requiredDeliverables: [
              'Design system',
              'Component library',
              'Usage guidelines'
            ]
          }
        ]
      }
    ],
    team: [
      {
        id: 'user-ux-1',
        role: 'UX Researcher',
        permissions: ['read', 'write', 'comment']
      },
      {
        id: 'user-ux-2',
        role: 'Product Designer',
        permissions: ['read', 'write', 'comment']
      }
    ],
    metadata: {
      createdBy: 'user-ux-1',
      createdAt: '2023-11-25T10:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      version: '2.0',
      tags: ['research', 'ux', 'design', 'user-testing'],
      estimatedBudget: 25000,
      actualBudget: 23500,
      currency: 'USD'
    }
  },
  {
    id: 'plan-3',
    name: 'Marketing Campaign Launch',
    description: 'Plan and execute comprehensive marketing campaign for product launch.',
    type: 'marketing',
    category: 'promotion',
    status: 'not_started',
    priority: 'high',
    timeline: {
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      estimatedDuration: 90
    },
    phases: [
      {
        id: 'phase-marketing-1',
        name: 'Campaign Planning',
        description: 'Develop comprehensive marketing strategy and plan',
        status: 'not_started',
        order: 1,
        timeline: {
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          estimatedDuration: 30
        },
        tasks: [
          {
            id: 'task-marketing-1',
            name: 'Market Analysis',
            description: 'Analyze target market and competition',
            status: 'not_started',
            priority: 'high',
            assigneeId: 'user-marketing-1',
            timeline: {
              startDate: '2024-04-01',
              endDate: '2024-04-15',
              estimatedDuration: 15
            },
            dependencies: []
          },
          {
            id: 'task-marketing-2',
            name: 'Content Strategy',
            description: 'Develop content strategy and calendar',
            status: 'not_started',
            priority: 'high',
            assigneeId: 'user-marketing-2',
            timeline: {
              startDate: '2024-04-10',
              endDate: '2024-04-30',
              estimatedDuration: 21
            },
            dependencies: ['task-marketing-1']
          }
        ],
        milestones: [
          {
            id: 'milestone-marketing-1',
            name: 'Strategy Complete',
            description: 'Marketing strategy and plan finalized',
            type: 'planning',
            status: 'not_started',
            targetDate: '2024-04-30',
            dependencies: ['task-marketing-1', 'task-marketing-2'],
            completionCriteria: [
              'Market analysis complete',
              'Target audience defined',
              'Content calendar created'
            ],
            requiredDeliverables: [
              'Marketing strategy document',
              'Content calendar',
              'Budget allocation plan'
            ]
          }
        ]
      }
    ],
    team: [
      {
        id: 'user-marketing-1',
        role: 'Marketing Manager',
        permissions: ['read', 'write', 'comment']
      },
      {
        id: 'user-marketing-2',
        role: 'Content Strategist',
        permissions: ['read', 'write', 'comment']
      }
    ],
    metadata: {
      createdBy: 'user-marketing-1',
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-25T16:00:00Z',
      version: '1.0',
      tags: ['marketing', 'launch', 'campaign', 'promotion'],
      estimatedBudget: 75000,
      currency: 'USD'
    }
  }
];

/**
 * Mock session data for demonstration
 */
export const mockSessionData = {
  mindmapData: {
    nodes: [
      { id: '1', x: 400, y: 300, text: 'Central Idea', color: '#667eea' },
      { id: '2', x: 200, y: 200, text: 'Branch 1', color: '#764ba2' },
      { id: '3', x: 600, y: 200, text: 'Branch 2', color: '#667eea' }
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '1', to: '3' }
    ]
  },
  projectData: {
    name: 'Demo Project',
    description: 'A demonstration project with sample data'
  }
};