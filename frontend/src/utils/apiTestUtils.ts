import { 
  parseInput, 
  parseInputSimple, 
  parseInputForMindmap 
} from '../services/parseInputApi';
import { 
  fetchEnterprise,
  fetchEnterpriseMindmaps,
  fetchEnterpriseAnalytics
} from '../services/enterpriseApi';
import { 
  generatePlan,
  generateBusinessPlan,
  generateTechnicalPlan
} from '../services/generatePlanApi';
import { 
  autoExpand,
  autoExpandMindmap,
  autoExpandConcept
} from '../services/autoExpandApi';
import { 
  ragDetail,
  ragResearch,
  ragExplain
} from '../services/ragDetailApi';
import { 
  saveSession,
  saveMindmapSession,
  saveProjectSession
} from '../services/saveSessionApi';
import { 
  loadSession,
  loadSessionBasic,
  loadSessionFull,
  querySessions,
  getUserSessions
} from '../services/loadSessionApi';

/**
 * Test utility for API functions
 */
export class ApiTestUtils {
  /**
   * Test basic parseInput functionality
   */
  static async testParseInput() {
    console.log('🧪 Testing parseInput API...');
    
    const testRequest = {
      input: 'Create a mindmap about artificial intelligence including machine learning, neural networks, and applications',
      context: 'test_environment',
      options: {
        format: 'json' as const,
        includeMetadata: true,
        maxTokens: 500
      }
    };

    try {
      const result = await parseInput(testRequest);
      console.log('✅ parseInput test result:', result);
      return result;
    } catch (error) {
      console.error('❌ parseInput test failed:', error);
      return null;
    }
  }

  /**
   * Test simple parseInput function
   */
  static async testParseInputSimple() {
    console.log('🧪 Testing parseInputSimple API...');
    
    try {
      const result = await parseInputSimple(
        'Machine learning fundamentals',
        'educational_content'
      );
      console.log('✅ parseInputSimple test result:', result);
      return result;
    } catch (error) {
      console.error('❌ parseInputSimple test failed:', error);
      return null;
    }
  }

  /**
   * Test mindmap-specific parseInput function
   */
  static async testParseInputForMindmap() {
    console.log('🧪 Testing parseInputForMindmap API...');
    
    try {
      const result = await parseInputForMindmap(
        'Project management workflow: planning, execution, monitoring, and closing phases'
      );
      console.log('✅ parseInputForMindmap test result:', result);
      return result;
    } catch (error) {
      console.error('❌ parseInputForMindmap test failed:', error);
      return null;
    }
  }

  /**
   * Test basic fetchEnterprise functionality
   */
  static async testFetchEnterprise() {
    console.log('🧪 Testing fetchEnterprise API...');
    
    const testRequest = {
      organizationId: 'test-org-12345',
      dataType: 'mindmaps' as const,
      filters: {
        status: 'active' as const,
        tags: ['test']
      },
      options: {
        includeMetadata: true,
        pagination: { page: 1, limit: 10 }
      }
    };

    try {
      const result = await fetchEnterprise(testRequest);
      console.log('✅ fetchEnterprise test result:', result);
      return result;
    } catch (error) {
      console.error('❌ fetchEnterprise test failed:', error);
      return null;
    }
  }

  /**
   * Test fetchEnterpriseMindmaps convenience function
   */
  static async testFetchEnterpriseMindmaps() {
    console.log('🧪 Testing fetchEnterpriseMindmaps API...');
    
    try {
      const result = await fetchEnterpriseMindmaps(
        'test-org-12345',
        { status: 'active', tags: ['product'] }
      );
      console.log('✅ fetchEnterpriseMindmaps test result:', result);
      return result;
    } catch (error) {
      console.error('❌ fetchEnterpriseMindmaps test failed:', error);
      return null;
    }
  }

  /**
   * Test fetchEnterpriseAnalytics convenience function
   */
  static async testFetchEnterpriseAnalytics() {
    console.log('🧪 Testing fetchEnterpriseAnalytics API...');
    
    try {
      const result = await fetchEnterpriseAnalytics(
        'test-org-12345',
        { startDate: '2024-01-01', endDate: '2024-01-31' }
      );
      console.log('✅ fetchEnterpriseAnalytics test result:', result);
      return result;
    } catch (error) {
      console.error('❌ fetchEnterpriseAnalytics test failed:', error);
      return null;
    }
  }

  /**
   * Test basic generatePlan functionality
   */
  static async testGeneratePlan() {
    console.log('🧪 Testing generatePlan API...');
    
    const testRequest = {
      projectType: 'technical' as const,
      objective: 'Build a React Native mobile app for task management',
      context: {
        industry: 'productivity',
        timeline: '4 months',
        teamSize: 4,
        requirements: ['React Native', 'TypeScript', 'Redux', 'Firebase']
      },
      preferences: {
        planStyle: 'agile' as const,
        includeTimelines: true,
        includeMilestones: true,
        includeResources: true,
        includeRisks: true,
        detailLevel: 'comprehensive' as const
      },
      options: {
        format: 'structured' as const,
        maxSteps: 25,
        includeMetadata: true
      }
    };

    try {
      const result = await generatePlan(testRequest);
      console.log('✅ generatePlan test result:', result);
      return result;
    } catch (error) {
      console.error('❌ generatePlan test failed:', error);
      return null;
    }
  }

  /**
   * Test generateBusinessPlan convenience function
   */
  static async testGenerateBusinessPlan() {
    console.log('🧪 Testing generateBusinessPlan API...');
    
    try {
      const result = await generateBusinessPlan(
        'Launch a sustainable food delivery service',
        {
          industry: 'food & beverage',
          timeline: '12 months',
          budget: '$500K',
          constraints: ['regulatory compliance', 'competitive market']
        }
      );
      console.log('✅ generateBusinessPlan test result:', result);
      return result;
    } catch (error) {
      console.error('❌ generateBusinessPlan test failed:', error);
      return null;
    }
  }

  /**
   * Test generateTechnicalPlan convenience function
   */
  static async testGenerateTechnicalPlan() {
    console.log('🧪 Testing generateTechnicalPlan API...');
    
    try {
      const result = await generateTechnicalPlan(
        'Implement microservices architecture migration',
        6,
        ['Docker', 'Kubernetes', 'API Gateway', 'Service Mesh', 'Monitoring']
      );
      console.log('✅ generateTechnicalPlan test result:', result);
      return result;
    } catch (error) {
      console.error('❌ generateTechnicalPlan test failed:', error);
      return null;
    }
  }

  /**
   * Test basic autoExpand functionality
   */
  static async testAutoExpand() {
    console.log('🧪 Testing autoExpand API...');
    
    const testRequest = {
      content: {
        type: 'concept' as const,
        data: { concept: 'Machine Learning', title: 'Machine Learning' },
        context: {
          subject: 'Machine Learning',
          domain: 'artificial intelligence',
          audience: 'students',
          purpose: 'educational'
        }
      },
      expansionOptions: {
        direction: 'both' as const,
        maxNodes: 15,
        levels: 3,
        includeRelated: true,
        includeExamples: true,
        includeDetails: true
      },
      preferences: {
        creativity: 'moderate' as const,
        technicality: 'intermediate' as const,
        priority: 'relevance' as const,
        format: 'structured' as const
      }
    };

    try {
      const result = await autoExpand(testRequest);
      console.log('✅ autoExpand test result:', result);
      return result;
    } catch (error) {
      console.error('❌ autoExpand test failed:', error);
      return null;
    }
  }

  /**
   * Test autoExpandMindmap convenience function
   */
  static async testAutoExpandMindmap() {
    console.log('🧪 Testing autoExpandMindmap API...');
    
    const mindmapData = {
      title: 'Web Development',
      nodes: [
        { id: '1', title: 'Frontend', level: 1 },
        { id: '2', title: 'Backend', level: 1 },
        { id: '3', title: 'Database', level: 1 }
      ]
    };

    try {
      const result = await autoExpandMindmap(mindmapData, {
        maxNodes: 12,
        includeExamples: true
      });
      console.log('✅ autoExpandMindmap test result:', result);
      return result;
    } catch (error) {
      console.error('❌ autoExpandMindmap test failed:', error);
      return null;
    }
  }

  /**
   * Test autoExpandConcept convenience function
   */
  static async testAutoExpandConcept() {
    console.log('🧪 Testing autoExpandConcept API...');
    
    try {
      const result = await autoExpandConcept(
        'Renewable Energy',
        'sustainability',
        'general public'
      );
      console.log('✅ autoExpandConcept test result:', result);
      return result;
    } catch (error) {
      console.error('❌ autoExpandConcept test failed:', error);
      return null;
    }
  }

  /**
   * Test basic ragDetail functionality
   */
  static async testRAGDetail() {
    console.log('🧪 Testing ragDetail API...');
    
    const testRequest = {
      query: {
        text: 'Explain the principles of sustainable energy and their environmental impact',
        context: {
          domain: 'environmental science',
          topic: 'renewable energy',
          scope: 'comprehensive' as const,
          intent: 'explanation' as const
        }
      },
      retrievalOptions: {
        sources: ['documents', 'web', 'knowledge_base'] as const,
        maxSources: 12,
        relevanceThreshold: 0.8,
        recency: 'recent' as const,
        includeMetadata: true
      },
      generationOptions: {
        detailLevel: 'comprehensive' as const,
        perspective: 'analytical' as const,
        format: 'structured' as const,
        includeReferences: true,
        includeCitations: true,
        includeRelated: true
      },
      filters: {
        authorityLevel: 'verified' as const
      }
    };

    try {
      const result = await ragDetail(testRequest);
      console.log('✅ ragDetail test result:', result);
      return result;
    } catch (error) {
      console.error('❌ ragDetail test failed:', error);
      return null;
    }
  }

  /**
   * Test ragResearch convenience function
   */
  static async testRAGResearch() {
    console.log('🧪 Testing ragResearch API...');
    
    try {
      const result = await ragResearch(
        'Latest developments in artificial intelligence and machine learning',
        'technology',
        'comprehensive'
      );
      console.log('✅ ragResearch test result:', result);
      return result;
    } catch (error) {
      console.error('❌ ragResearch test failed:', error);
      return null;
    }
  }

  /**
   * Test ragExplain convenience function
   */
  static async testRAGExplain() {
    console.log('🧪 Testing ragExplain API...');
    
    try {
      const result = await ragExplain(
        'blockchain technology and cryptocurrencies',
        'intermediate'
      );
      console.log('✅ ragExplain test result:', result);
      return result;
    } catch (error) {
      console.error('❌ ragExplain test failed:', error);
      return null;
    }
  }

  /**
   * Test basic saveSession functionality
   */
  static async testSaveSession() {
    console.log('🧪 Testing saveSession API...');
    
    const testRequest = {
      session: {
        name: 'Test Mindmap Session',
        description: 'A test session for mindmap creation',
        type: 'mindmap' as const,
        status: 'active' as const
      },
      data: {
        mindmapData: {
          title: 'AI Learning Path',
          nodes: [
            { id: '1', text: 'Machine Learning', position: { x: 0, y: 0 } },
            { id: '2', text: 'Deep Learning', position: { x: 100, y: 50 } },
            { id: '3', text: 'Neural Networks', position: { x: 200, y: 0 } }
          ],
          connections: [
            { from: '1', to: '2' },
            { from: '2', to: '3' }
          ]
        },
        userInputs: [
          {
            id: 'input-1',
            type: 'text' as const,
            content: 'Create a mindmap about AI',
            timestamp: new Date().toISOString(),
            metadata: {
              source: 'user_interface',
              format: 'text',
              language: 'en'
            }
          }
        ],
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          timezone: 'UTC',
          autoSave: true,
          notifications: {
            email: false,
            push: true,
            inApp: true
          },
          display: {
            density: 'standard' as const,
            animations: true,
            shortcuts: true
          },
          privacy: {
            analytics: true,
            sharing: false,
            publicProfile: false
          }
        }
      },
      metadata: {
        userId: 'user-12345',
        tags: ['test', 'mindmap', 'ai'],
        category: 'learning',
        priority: 'medium' as const
      },
      options: {
        autoSave: true,
        compression: 'gzip' as const,
        encryption: false,
        backup: true,
        versionControl: true,
        notifications: true
      }
    };

    try {
      const result = await saveSession(testRequest);
      console.log('✅ saveSession test result:', result);
      return result;
    } catch (error) {
      console.error('❌ saveSession test failed:', error);
      return null;
    }
  }

  /**
   * Test saveMindmapSession convenience function
   */
  static async testSaveMindmapSession() {
    console.log('🧪 Testing saveMindmapSession API...');
    
    const mindmapData = {
      title: 'Project Planning',
      nodes: [
        { id: '1', text: 'Requirements', category: 'planning' },
        { id: '2', text: 'Design', category: 'development' },
        { id: '3', text: 'Implementation', category: 'development' },
        { id: '4', text: 'Testing', category: 'quality' },
        { id: '5', text: 'Deployment', category: 'operations' }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4' },
        { from: '4', to: '5' }
      ],
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };

    try {
      const result = await saveMindmapSession(
        'Project Planning Mindmap',
        mindmapData,
        'user-67890',
        {
          description: 'Planning phase for new project',
          tags: ['project', 'planning', 'workflow'],
          autoSave: true,
          backup: true
        }
      );
      console.log('✅ saveMindmapSession test result:', result);
      return result;
    } catch (error) {
      console.error('❌ saveMindmapSession test failed:', error);
      return null;
    }
  }

  /**
   * Test saveProjectSession convenience function
   */
  static async testSaveProjectSession() {
    console.log('🧪 Testing saveProjectSession API...');
    
    const projectData = {
      name: 'E-commerce Platform',
      description: 'Modern e-commerce solution with React and Node.js',
      phases: [
        {
          name: 'Planning',
          status: 'completed',
          tasks: ['Requirements gathering', 'Architecture design', 'Technology selection']
        },
        {
          name: 'Development',
          status: 'in_progress',
          tasks: ['Frontend development', 'Backend APIs', 'Database design']
        },
        {
          name: 'Testing',
          status: 'pending',
          tasks: ['Unit tests', 'Integration tests', 'User acceptance testing']
        }
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      timeline: {
        start: '2024-01-01',
        end: '2024-06-30',
        duration: '6 months'
      }
    };

    try {
      const result = await saveProjectSession(
        'E-commerce Platform Project',
        projectData,
        'user-11111',
        ['user-22222', 'user-33333']
      );
      console.log('✅ saveProjectSession test result:', result);
      return result;
    } catch (error) {
      console.error('❌ saveProjectSession test failed:', error);
      return null;
    }
  }

  /**
   * Test basic loadSession functionality
   */
  static async testLoadSession() {
    console.log('🧪 Testing loadSession API...');
    
    const testRequest = {
      sessionId: 'session-12345',
      options: {
        includeData: true,
        includeAnalytics: true,
        includeCollaborators: true,
        includeHistory: false,
        includeBackups: false,
        dataCompression: 'auto' as const,
        accessLevel: 'read' as const
      },
      filters: {
        dataTypes: ['mindmapData', 'preferences'] as const,
        userId: 'user-67890',
        includeDeleted: false
      },
      metadata: {
        requesterId: 'user-67890',
        clientInfo: {
          userAgent: 'test-browser',
          platform: 'test-platform',
          version: '1.0.0'
        }
      }
    };

    try {
      const result = await loadSession(testRequest);
      console.log('✅ loadSession test result:', result);
      return result;
    } catch (error) {
      console.error('❌ loadSession test failed:', error);
      return null;
    }
  }

  /**
   * Test loadSessionBasic convenience function
   */
  static async testLoadSessionBasic() {
    console.log('🧪 Testing loadSessionBasic API...');
    
    try {
      const result = await loadSessionBasic(
        'session-basic-123',
        true,
        'user-basic-456'
      );
      console.log('✅ loadSessionBasic test result:', result);
      return result;
    } catch (error) {
      console.error('❌ loadSessionBasic test failed:', error);
      return null;
    }
  }

  /**
   * Test loadSessionFull convenience function
   */
  static async testLoadSessionFull() {
    console.log('🧪 Testing loadSessionFull API...');
    
    try {
      const result = await loadSessionFull(
        'session-full-789',
        'user-full-101',
        'write'
      );
      console.log('✅ loadSessionFull test result:', result);
      return result;
    } catch (error) {
      console.error('❌ loadSessionFull test failed:', error);
      return null;
    }
  }

  /**
   * Test querySessions functionality
   */
  static async testQuerySessions() {
    console.log('🧪 Testing querySessions API...');
    
    const testRequest = {
      query: {
        userId: 'user-query-123',
        type: ['mindmap', 'project'],
        status: ['active', 'paused'],
        tags: ['test', 'demo'],
        priority: ['medium', 'high'],
        isShared: true,
        hasCollaborators: true
      },
      filters: {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          field: 'updatedAt' as const
        },
        sizeRange: {
          minSize: 1024,
          maxSize: 50 * 1024 * 1024
        },
        activityLevel: 'medium' as const
      },
      options: {
        sortBy: 'updatedAt' as const,
        sortOrder: 'desc' as const,
        limit: 20,
        offset: 0,
        includeAnalytics: true,
        includePreview: true
      }
    };

    try {
      const result = await querySessions(testRequest);
      console.log('✅ querySessions test result:', result);
      return result;
    } catch (error) {
      console.error('❌ querySessions test failed:', error);
      return null;
    }
  }

  /**
   * Test getUserSessions convenience function
   */
  static async testGetUserSessions() {
    console.log('🧪 Testing getUserSessions API...');
    
    try {
      const result = await getUserSessions(
        'user-sessions-123',
        {
          type: ['mindmap', 'project'],
          status: ['active', 'completed'],
          limit: 15,
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        }
      );
      console.log('✅ getUserSessions test result:', result);
      return result;
    } catch (error) {
      console.error('❌ getUserSessions test failed:', error);
      return null;
    }
  }

  /**
   * Run all API tests
   */
  static async runAllTests() {
    console.log('🚀 Starting API tests...');
    
    const results = await Promise.allSettled([
      this.testParseInput(),
      this.testParseInputSimple(),
      this.testParseInputForMindmap(),
      this.testFetchEnterprise(),
      this.testFetchEnterpriseMindmaps(),
      this.testFetchEnterpriseAnalytics(),
      this.testGeneratePlan(),
      this.testGenerateBusinessPlan(),
      this.testGenerateTechnicalPlan(),
      this.testAutoExpand(),
      this.testAutoExpandMindmap(),
      this.testAutoExpandConcept(),
      this.testRAGDetail(),
      this.testRAGResearch(),
      this.testRAGExplain(),
      this.testSaveSession(),
      this.testSaveMindmapSession(),
      this.testSaveProjectSession(),
      this.testLoadSession(),
      this.testLoadSessionBasic(),
      this.testLoadSessionFull(),
      this.testQuerySessions(),
      this.testGetUserSessions()
    ]);

    const passed = results.filter(r => r.status === 'fulfilled').length;
    const total = results.length;

    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    return { passed, total, results };
  }
}

/**
 * Mock API response for development/testing
 */
export const mockParseInputResponse = {
  success: true,
  data: {
    parsedContent: {
      title: 'Artificial Intelligence',
      nodes: [
        { id: '1', text: 'Machine Learning', category: 'core' },
        { id: '2', text: 'Neural Networks', category: 'core' },
        { id: '3', text: 'Applications', category: 'practical' },
        { id: '4', text: 'Natural Language Processing', category: 'application' },
        { id: '5', text: 'Computer Vision', category: 'application' }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '3', to: '4' },
        { from: '3', to: '5' }
      ]
    },
    metadata: {
      tokenCount: 150,
      processingTime: 250,
      contentType: 'mindmap_structure'
    }
  }
};

/**
 * Mock enterprise API response for development/testing
 */
export const mockEnterpriseResponse = {
  success: true,
  data: {
    organizationId: 'org-12345',
    dataType: 'mindmaps',
    items: [
      {
        id: 'mindmap-001',
        name: 'Product Roadmap 2024',
        type: 'mindmap',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        createdBy: 'user-123',
        status: 'active',
        tags: ['product', 'roadmap', '2024'],
        sharing: {
          isShared: true,
          sharedWith: ['user-456', 'user-789'],
          permissions: ['view', 'edit']
        },
        analytics: {
          viewCount: 45,
          editCount: 12,
          lastAccessed: '2024-01-20T09:15:00Z',
          collaborators: 3
        }
      },
      {
        id: 'mindmap-002',
        name: 'Marketing Strategy',
        type: 'mindmap',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-18T16:20:00Z',
        createdBy: 'user-456',
        status: 'active',
        tags: ['marketing', 'strategy'],
        sharing: {
          isShared: false,
          sharedWith: [],
          permissions: ['view']
        },
        analytics: {
          viewCount: 23,
          editCount: 8,
          lastAccessed: '2024-01-18T11:30:00Z',
          collaborators: 1
        }
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
      hasMore: true
    },
    metadata: {
      fetchTime: 180,
      cacheStatus: 'miss',
      dataVersion: '1.2.0',
      lastUpdated: '2024-01-20T15:00:00Z'
    }
  }
};

/**
 * Mock generatePlan API response for development/testing
 */
export const mockGeneratePlanResponse = {
  success: true,
  data: {
    plan: {
      id: 'plan-001',
      title: 'React Native Task Management App',
      objective: 'Build a React Native mobile app for task management',
      projectType: 'technical',
      overview: 'Develop a cross-platform mobile application for task and project management with real-time synchronization',
      phases: [
        {
          id: 'phase-1',
          name: 'Planning & Setup',
          description: 'Project initialization and development environment setup',
          duration: '2 weeks',
          order: 1,
          dependencies: [],
          tasks: [
            {
              id: 'task-1',
              name: 'Set up development environment',
              description: 'Install React Native, configure development tools and emulators',
              priority: 'high',
              estimatedHours: 16,
              status: 'not_started',
              tags: ['setup', 'environment']
            },
            {
              id: 'task-2',
              name: 'Design database schema',
              description: 'Design Firebase database structure for tasks and user management',
              priority: 'high',
              estimatedHours: 12,
              status: 'not_started',
              tags: ['database', 'design']
            }
          ],
          milestones: [
            {
              id: 'milestone-1',
              name: 'Development Environment Ready',
              description: 'All team members have working development setup',
              criteria: ['React Native CLI installed', 'Emulators configured', 'Firebase project created']
            }
          ]
        },
        {
          id: 'phase-2',
          name: 'Core Development',
          description: 'Implement core app functionality and user interface',
          duration: '6 weeks',
          order: 2,
          dependencies: ['phase-1'],
          tasks: [
            {
              id: 'task-3',
              name: 'Implement user authentication',
              description: 'Create login/signup screens with Firebase authentication',
              priority: 'critical',
              estimatedHours: 24,
              status: 'not_started',
              tags: ['auth', 'security']
            },
            {
              id: 'task-4',
              name: 'Build task management screens',
              description: 'Create task list, creation, and editing interfaces',
              priority: 'critical',
              estimatedHours: 40,
              status: 'not_started',
              tags: ['ui', 'core-feature']
            }
          ],
          milestones: [
            {
              id: 'milestone-2',
              name: 'MVP Features Complete',
              description: 'Core task management functionality working',
              criteria: ['User can create tasks', 'User can edit tasks', 'Data syncs with Firebase']
            }
          ]
        }
      ],
      timeline: {
        totalDuration: '4 months',
        startDate: '2024-02-01',
        endDate: '2024-06-01'
      },
      resources: {
        team: [
          {
            role: 'React Native Developer',
            skills: ['React Native', 'TypeScript', 'Mobile Development'],
            responsibilities: ['UI implementation', 'Mobile-specific features'],
            allocation: 100,
            level: 'senior'
          },
          {
            role: 'Backend Developer',
            skills: ['Firebase', 'Node.js', 'Database Design'],
            responsibilities: ['API development', 'Database management'],
            allocation: 75,
            level: 'mid'
          }
        ],
        budget: {
          total: 120000,
          currency: 'USD',
          categories: {
            personnel: 100000,
            technology: 15000,
            operations: 5000
          }
        },
        tools: ['React Native', 'TypeScript', 'Firebase', 'Redux Toolkit', 'Jest']
      },
      risks: [
        {
          id: 'risk-1',
          risk: 'Platform compatibility issues',
          probability: 'medium',
          impact: 'high',
          mitigation: ['Regular testing on both iOS and Android', 'Use React Native best practices'],
          contingency: 'Allocate additional time for platform-specific fixes'
        }
      ],
      success_criteria: [
        'App works on both iOS and Android',
        'User authentication and data sync functional',
        'Performance meets mobile app standards',
        'User acceptance testing completed'
      ],
      deliverables: [
        {
          id: 'deliverable-1',
          name: 'Mobile Application',
          description: 'Cross-platform React Native app with task management features',
          type: 'software',
          dueDate: '2024-05-15',
          quality_criteria: ['95% crash-free rate', 'App store ready']
        }
      ]
    },
    metadata: {
      generationTime: 1250,
      complexity: 'medium',
      confidence: 0.85,
      version: '1.0.0',
      generatedAt: '2024-01-20T10:30:00Z'
    }
  }
};

/**
 * Mock autoExpand API response for development/testing
 */
export const mockAutoExpandResponse = {
  success: true,
  data: {
    expandedContent: {
      id: 'expanded-001',
      type: 'concept',
      title: 'Machine Learning - Expanded',
      originalNodes: [
        {
          id: 'original-1',
          title: 'Machine Learning',
          description: 'AI technique for learning from data',
          type: 'original',
          level: 0,
          category: 'core',
          confidence: 1.0,
          relevance: 1.0,
          priority: 'critical'
        }
      ],
      expandedNodes: [
        {
          id: 'expanded-1',
          title: 'Supervised Learning',
          description: 'Learning with labeled training data',
          type: 'expanded',
          level: 1,
          parentId: 'original-1',
          category: 'algorithms',
          keywords: ['classification', 'regression', 'training'],
          confidence: 0.95,
          relevance: 0.9,
          priority: 'high',
          metadata: {
            source: 'expansion_ai',
            addedAt: '2024-01-20T10:30:00Z',
            expansionReason: 'fundamental_concept'
          }
        },
        {
          id: 'expanded-2',
          title: 'Unsupervised Learning',
          description: 'Learning patterns from unlabeled data',
          type: 'expanded',
          level: 1,
          parentId: 'original-1',
          category: 'algorithms',
          keywords: ['clustering', 'dimensionality reduction', 'pattern recognition'],
          confidence: 0.92,
          relevance: 0.88,
          priority: 'high',
          metadata: {
            source: 'expansion_ai',
            addedAt: '2024-01-20T10:30:05Z',
            expansionReason: 'fundamental_concept'
          }
        },
        {
          id: 'expanded-3',
          title: 'Neural Networks',
          description: 'Brain-inspired computational models',
          type: 'expanded',
          level: 1,
          parentId: 'original-1',
          category: 'models',
          keywords: ['deep learning', 'neurons', 'layers'],
          confidence: 0.88,
          relevance: 0.85,
          priority: 'medium',
          metadata: {
            source: 'expansion_ai',
            addedAt: '2024-01-20T10:30:10Z',
            expansionReason: 'popular_technique'
          }
        },
        {
          id: 'expanded-4',
          title: 'Linear Regression',
          description: 'Simple supervised learning for continuous values',
          type: 'expanded',
          level: 2,
          parentId: 'expanded-1',
          category: 'algorithms',
          keywords: ['regression', 'linear', 'prediction'],
          confidence: 0.85,
          relevance: 0.82,
          priority: 'medium'
        }
      ],
      relationships: [
        {
          id: 'rel-1',
          fromNodeId: 'original-1',
          toNodeId: 'expanded-1',
          type: 'parent-child',
          strength: 0.95,
          direction: 'forward',
          label: 'includes'
        },
        {
          id: 'rel-2',
          fromNodeId: 'original-1',
          toNodeId: 'expanded-2',
          type: 'parent-child',
          strength: 0.92,
          direction: 'forward',
          label: 'includes'
        },
        {
          id: 'rel-3',
          fromNodeId: 'expanded-1',
          toNodeId: 'expanded-2',
          type: 'sibling',
          strength: 0.75,
          direction: 'bidirectional',
          label: 'contrasts_with'
        },
        {
          id: 'rel-4',
          fromNodeId: 'expanded-1',
          toNodeId: 'expanded-4',
          type: 'parent-child',
          strength: 0.88,
          direction: 'forward',
          label: 'example_of'
        }
      ],
      categories: [
        {
          id: 'cat-1',
          name: 'algorithms',
          description: 'Machine learning algorithms and techniques',
          nodeCount: 3,
          color: '#4f46e5',
          icon: 'algorithm'
        },
        {
          id: 'cat-2',
          name: 'models',
          description: 'Machine learning models and architectures',
          nodeCount: 1,
          color: '#059669',
          icon: 'model'
        },
        {
          id: 'cat-3',
          name: 'core',
          description: 'Core machine learning concepts',
          nodeCount: 1,
          color: '#dc2626',
          icon: 'core'
        }
      ],
      summary: {
        totalNodes: 5,
        newNodes: 4,
        expansionRatio: 4.0,
        mainTopics: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks']
      }
    },
    suggestions: [
      {
        id: 'suggestion-1',
        type: 'add_node',
        title: 'Add Reinforcement Learning',
        description: 'Consider adding reinforcement learning as another major ML paradigm',
        confidence: 0.88,
        effort: 'low',
        impact: 'high',
        targetNodeId: 'original-1',
        suggestedContent: {
          title: 'Reinforcement Learning',
          description: 'Learning through interaction and rewards'
        }
      },
      {
        id: 'suggestion-2',
        type: 'add_relationship',
        title: 'Connect Neural Networks to Deep Learning',
        description: 'Add relationship showing neural networks enable deep learning',
        confidence: 0.92,
        effort: 'low',
        impact: 'medium',
        targetNodeId: 'expanded-3'
      }
    ],
    metadata: {
      expansionTime: 2100,
      nodesAdded: 4,
      categoriesFound: 3,
      confidence: 0.89,
      completeness: 0.78,
      version: '1.0.0',
      generatedAt: '2024-01-20T10:30:00Z'
    }
  }
};

/**
 * Mock ragDetail API response for development/testing
 */
export const mockRAGDetailResponse = {
  success: true,
  data: {
    detailedResponse: {
      id: 'rag-response-001',
      query: 'Explain the principles of sustainable energy and their environmental impact',
      answer: 'Sustainable energy refers to energy systems that meet present needs without compromising the ability of future generations to meet their own energy needs. The core principles include renewable resource utilization, environmental protection, economic viability, and social equity.',
      summary: 'Sustainable energy encompasses renewable sources like solar, wind, and hydro power, which significantly reduce environmental impact compared to fossil fuels while providing long-term economic and social benefits.',
      keyPoints: [
        'Renewable energy sources are naturally replenished and virtually inexhaustible',
        'Solar and wind power have the lowest environmental impact among energy sources',
        'Sustainable energy reduces greenhouse gas emissions by 70-90% compared to fossil fuels',
        'Economic benefits include job creation and energy independence',
        'Technology improvements continue to reduce costs and increase efficiency'
      ],
      sections: [
        {
          id: 'section-1',
          title: 'Core Principles of Sustainable Energy',
          content: 'Sustainable energy is built on four fundamental principles: renewability, environmental stewardship, economic viability, and social equity. These principles guide the development and implementation of energy systems that can operate indefinitely without depleting natural resources.',
          type: 'introduction',
          sources: ['source-1', 'source-3'],
          confidence: 0.95,
          relevance: 0.98
        },
        {
          id: 'section-2',
          title: 'Environmental Benefits',
          content: 'The environmental impact of sustainable energy is dramatically lower than conventional fossil fuels. Solar photovoltaic systems produce 95% fewer lifecycle carbon emissions than coal power plants. Wind energy has a carbon payback time of just 3-6 months.',
          type: 'main_point',
          sources: ['source-2', 'source-4', 'source-5'],
          confidence: 0.92,
          relevance: 0.94
        },
        {
          id: 'section-3',
          title: 'Economic Impact and Job Creation',
          content: 'The renewable energy sector employed over 13 million people globally in 2022, with solar photovoltaics being the largest employer. The sector continues to create jobs at a faster rate than traditional energy industries.',
          type: 'evidence',
          sources: ['source-6', 'source-7'],
          confidence: 0.88,
          relevance: 0.85
        }
      ],
      analysis: {
        strengths: [
          'Comprehensive coverage of environmental benefits',
          'Strong quantitative evidence on emissions reduction',
          'Current employment data from authoritative sources'
        ],
        limitations: [
          'Limited discussion of energy storage challenges',
          'Insufficient coverage of grid integration issues',
          'Regional variations not fully addressed'
        ],
        gaps: [
          'Intermittency and reliability considerations',
          'Infrastructure investment requirements',
          'Policy and regulatory framework analysis'
        ]
      },
      recommendations: [
        'Consider energy storage solutions in sustainable energy planning',
        'Invest in smart grid infrastructure for better renewable integration',
        'Develop supportive policy frameworks for accelerated adoption'
      ],
      followUpQuestions: [
        'What are the main challenges in energy storage for renewables?',
        'How do different countries approach renewable energy policy?',
        'What role does nuclear power play in sustainable energy mix?'
      ]
    },
    sources: [
      {
        id: 'source-1',
        title: 'Renewable Energy: Principles and Practice',
        url: 'https://example.com/renewable-energy-principles',
        content: 'Comprehensive overview of sustainable energy principles and their implementation in modern energy systems.',
        snippet: 'Sustainable energy systems are characterized by their ability to provide energy services while minimizing environmental impact and ensuring long-term availability.',
        type: 'book',
        author: 'Dr. Sarah Johnson',
        publishDate: '2023-03-15',
        domain: 'academic',
        relevanceScore: 0.98,
        authorityScore: 0.95,
        recencyScore: 0.85,
        metadata: {
          wordCount: 45000,
          language: 'en',
          category: 'academic_textbook',
          tags: ['renewable energy', 'sustainability', 'environmental impact'],
          sourceQuality: 'high'
        },
        citations: [
          {
            id: 'citation-1',
            sourceId: 'source-1',
            text: 'Sustainable energy systems are characterized by their renewability and low environmental impact',
            context: 'Introduction to sustainable energy principles',
            pageNumber: 23,
            sectionTitle: 'Defining Sustainable Energy',
            citationStyle: 'apa'
          }
        ]
      },
      {
        id: 'source-2',
        title: 'Environmental Impact Assessment of Solar Energy',
        url: 'https://example.com/solar-environmental-impact',
        content: 'Detailed lifecycle analysis of solar photovoltaic systems and their environmental benefits compared to fossil fuels.',
        snippet: 'Solar PV systems demonstrate 95% lower lifecycle carbon emissions compared to coal-fired power plants.',
        type: 'article',
        author: 'Environmental Research Institute',
        publishDate: '2023-11-20',
        domain: 'research',
        relevanceScore: 0.94,
        authorityScore: 0.92,
        recencyScore: 0.95,
        metadata: {
          wordCount: 8500,
          language: 'en',
          category: 'research_paper',
          tags: ['solar energy', 'lifecycle assessment', 'carbon emissions'],
          sourceQuality: 'high'
        }
      },
      {
        id: 'source-3',
        title: 'Global Energy Transition Report 2023',
        url: 'https://example.com/global-energy-transition-2023',
        content: 'Annual report on worldwide progress in transitioning to sustainable energy systems.',
        snippet: 'The global renewable energy capacity increased by 295 GW in 2022, with solar and wind accounting for 90% of additions.',
        type: 'document',
        author: 'International Renewable Energy Agency',
        publishDate: '2023-06-01',
        domain: 'international_organization',
        relevanceScore: 0.91,
        authorityScore: 0.98,
        recencyScore: 0.88,
        metadata: {
          wordCount: 25000,
          language: 'en',
          category: 'official_report',
          tags: ['global energy', 'renewable capacity', 'energy transition'],
          sourceQuality: 'high'
        }
      }
    ],
    relatedQueries: [
      'What are the economic benefits of renewable energy?',
      'How does energy storage work with renewable sources?',
      'What are the challenges of grid integration for renewables?',
      'Which countries lead in sustainable energy adoption?'
    ],
    metadata: {
      processingTime: 3200,
      sourcesRetrieved: 25,
      sourcesUsed: 7,
      confidenceScore: 0.91,
      completenessScore: 0.87,
      version: '1.0.0',
      generatedAt: '2024-01-20T11:15:00Z'
    }
  }
};

/**
 * Mock saveSession API response for development/testing
 */
export const mockSaveSessionResponse = {
  success: true,
  data: {
    session: {
      id: 'session-001',
      name: 'Test Mindmap Session',
      description: 'A test session for mindmap creation',
      type: 'mindmap',
      status: 'active',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      lastAccessedAt: '2024-01-20T10:30:00Z',
      userId: 'user-12345',
      organizationId: undefined,
      collaborators: [],
      tags: ['test', 'mindmap', 'ai'],
      category: 'learning',
      priority: 'medium',
      dataSize: 2048,
      version: 1,
      isShared: false,
      permissions: [
        {
          userId: 'user-12345',
          role: 'owner',
          permissions: ['read', 'write', 'delete', 'share', 'admin'],
          grantedAt: '2024-01-20T10:30:00Z',
          grantedBy: 'system',
          expiresAt: undefined
        }
      ],
      analytics: {
        totalViews: 1,
        uniqueViewers: 1,
        editCount: 1,
        shareCount: 0,
        collaborationTime: 0,
        activityLog: [
          {
            id: 'activity-1',
            userId: 'user-12345',
            action: 'edit',
            timestamp: '2024-01-20T10:30:00Z',
            details: { action: 'session_created' },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        ],
        usageStats: {
          dailyActiveTime: 30,
          weeklyActiveTime: 30,
          monthlyActiveTime: 30,
          lastActiveDate: '2024-01-20T10:30:00Z'
        }
      }
    },
    backup: {
      backupId: 'backup-001',
      backupUrl: 'https://storage.example.com/backups/backup-001.json',
      timestamp: '2024-01-20T10:30:05Z'
    },
    metadata: {
      saveTime: 250,
      dataSize: 2048,
      compressionRatio: 0.65,
      version: '1.0.0',
      checksum: 'a1b2c3d4e5f6789012345678901234567890abcd',
      savedAt: '2024-01-20T10:30:00Z'
    }
  }
};

/**
 * Mock loadSession API response for development/testing
 */
export const mockLoadSessionResponse = {
  success: true,
  data: {
    session: {
      id: 'session-12345',
      name: 'AI Research Project',
      description: 'Comprehensive research project on artificial intelligence and machine learning',
      type: 'research',
      status: 'active',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      lastAccessedAt: '2024-01-20T14:25:00Z',
      userId: 'user-67890',
      organizationId: 'org-research-001',
      collaborators: ['user-67890', 'user-11111', 'user-22222'],
      tags: ['ai', 'research', 'machine-learning', 'analysis'],
      category: 'academic',
      priority: 'high',
      dataSize: 5242880, // 5MB
      version: 3,
      isShared: true,
      data: {
        mindmapData: {
          title: 'AI Research Mindmap',
          nodes: [
            { id: '1', text: 'Artificial Intelligence', position: { x: 0, y: 0 }, category: 'root' },
            { id: '2', text: 'Machine Learning', position: { x: 150, y: -50 }, category: 'branch' },
            { id: '3', text: 'Deep Learning', position: { x: 300, y: -100 }, category: 'leaf' },
            { id: '4', text: 'Neural Networks', position: { x: 300, y: 0 }, category: 'leaf' },
            { id: '5', text: 'Computer Vision', position: { x: 150, y: 50 }, category: 'branch' },
            { id: '6', text: 'Natural Language Processing', position: { x: 150, y: 100 }, category: 'branch' }
          ],
          connections: [
            { from: '1', to: '2', type: 'child' },
            { from: '2', to: '3', type: 'child' },
            { from: '2', to: '4', type: 'child' },
            { from: '1', to: '5', type: 'child' },
            { from: '1', to: '6', type: 'child' }
          ],
          metadata: {
            created: '2024-01-15T09:00:00Z',
            lastModified: '2024-01-20T13:15:00Z',
            nodeCount: 6,
            connectionCount: 5
          }
        },
        userInputs: [
          {
            id: 'input-1',
            type: 'text',
            content: 'Research AI applications in healthcare',
            timestamp: '2024-01-15T10:00:00Z',
            metadata: {
              source: 'research_query',
              format: 'text',
              language: 'en'
            }
          },
          {
            id: 'input-2',
            type: 'text',
            content: 'Analyze machine learning algorithms for medical diagnosis',
            timestamp: '2024-01-16T11:30:00Z',
            metadata: {
              source: 'research_query',
              format: 'text',
              language: 'en'
            }
          }
        ],
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          autoSave: true,
          notifications: {
            email: true,
            push: false,
            inApp: true
          },
          display: {
            density: 'standard',
            animations: true,
            shortcuts: true
          },
          privacy: {
            analytics: true,
            sharing: true,
            publicProfile: false
          }
        },
        progress: {
          currentStep: 3,
          totalSteps: 5,
          completedTasks: ['literature_review', 'data_collection', 'initial_analysis'],
          pendingTasks: ['model_development', 'validation'],
          milestones: [
            {
              id: 'milestone-1',
              name: 'Literature Review Complete',
              status: 'completed',
              progress: 100
            },
            {
              id: 'milestone-2',
              name: 'Data Analysis Phase',
              status: 'in_progress',
              progress: 75
            }
          ],
          timeSpent: 14400 // 4 hours
        }
      },
      permissions: [
        {
          userId: 'user-67890',
          role: 'owner',
          permissions: ['read', 'write', 'delete', 'share', 'admin'],
          grantedAt: '2024-01-15T09:00:00Z',
          grantedBy: 'system'
        },
        {
          userId: 'user-11111',
          role: 'editor',
          permissions: ['read', 'write', 'share'],
          grantedAt: '2024-01-16T10:00:00Z',
          grantedBy: 'user-67890'
        },
        {
          userId: 'user-22222',
          role: 'viewer',
          permissions: ['read'],
          grantedAt: '2024-01-17T14:00:00Z',
          grantedBy: 'user-67890'
        }
      ],
      analytics: {
        totalViews: 45,
        uniqueViewers: 8,
        editCount: 23,
        shareCount: 3,
        collaborationTime: 7200,
        activityLog: [
          {
            id: 'activity-1',
            userId: 'user-67890',
            action: 'edit',
            timestamp: '2024-01-20T14:25:00Z',
            details: { action: 'node_added', nodeId: '6' }
          },
          {
            id: 'activity-2',
            userId: 'user-11111',
            action: 'view',
            timestamp: '2024-01-20T13:45:00Z',
            details: { duration: 300 }
          }
        ],
        usageStats: {
          dailyActiveTime: 120,
          weeklyActiveTime: 480,
          monthlyActiveTime: 900,
          lastActiveDate: '2024-01-20T14:25:00Z'
        }
      },
      settings: {
        autoSave: true,
        saveInterval: 300,
        maxVersions: 10,
        compressionEnabled: true,
        encryptionEnabled: false,
        backupEnabled: true,
        collaborationSettings: {
          allowInvites: true,
          defaultPermissions: ['read'],
          requireApproval: false,
          maxCollaborators: 20
        },
        notificationSettings: {
          onEdit: true,
          onComment: true,
          onShare: false,
          onMention: true
        }
      }
    },
    collaborators: [
      {
        userId: 'user-67890',
        username: 'research_lead',
        email: 'lead@research.com',
        role: 'owner',
        joinedAt: '2024-01-15T09:00:00Z',
        lastActiveAt: '2024-01-20T14:25:00Z',
        status: 'active',
        permissions: ['read', 'write', 'delete', 'share', 'admin'],
        contributionStats: {
          editsCount: 18,
          commentsCount: 5,
          timeSpent: 10800,
          lastContribution: '2024-01-20T14:25:00Z'
        }
      },
      {
        userId: 'user-11111',
        username: 'data_analyst',
        email: 'analyst@research.com',
        role: 'editor',
        joinedAt: '2024-01-16T10:00:00Z',
        lastActiveAt: '2024-01-19T16:30:00Z',
        status: 'active',
        permissions: ['read', 'write', 'share'],
        contributionStats: {
          editsCount: 5,
          commentsCount: 12,
          timeSpent: 3600,
          lastContribution: '2024-01-19T15:45:00Z'
        }
      },
      {
        userId: 'user-22222',
        username: 'reviewer',
        role: 'viewer',
        joinedAt: '2024-01-17T14:00:00Z',
        lastActiveAt: '2024-01-18T11:20:00Z',
        status: 'active',
        permissions: ['read'],
        contributionStats: {
          editsCount: 0,
          commentsCount: 3,
          timeSpent: 1200,
          lastContribution: '2024-01-18T11:20:00Z'
        }
      }
    ],
    metadata: {
      loadTime: 180,
      dataSize: 5242880,
      compressionUsed: 'gzip',
      version: '1.0.0',
      lastModified: '2024-01-20T14:30:00Z',
      accessLevel: 'read',
      loadedAt: '2024-01-20T15:00:00Z'
    }
  }
};

/**
 * Mock querySessions API response for development/testing
 */
export const mockQuerySessionsResponse = {
  success: true,
  data: {
    sessions: [
      {
        id: 'session-001',
        name: 'AI Research Project',
        description: 'Machine learning research',
        type: 'research',
        status: 'active',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        userId: 'user-67890',
        tags: ['ai', 'research'],
        category: 'academic',
        priority: 'high',
        dataSize: 5242880,
        version: 3,
        isShared: true,
        collaboratorCount: 3,
        preview: {
          thumbnailUrl: '/api/thumbnails/session-001.png',
          summary: 'AI research with 6 nodes and 5 connections',
          keyData: { nodeCount: 6, connectionCount: 5 }
        },
        analytics: {
          totalViews: 45,
          lastAccessed: '2024-01-20T14:25:00Z',
          activityScore: 85
        }
      },
      {
        id: 'session-002',
        name: 'Product Roadmap Q1',
        description: 'Quarterly product planning',
        type: 'planning',
        status: 'active',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        userId: 'user-11111',
        tags: ['product', 'roadmap', 'q1'],
        category: 'business',
        priority: 'critical',
        dataSize: 2048000,
        version: 2,
        isShared: true,
        collaboratorCount: 5,
        preview: {
          summary: 'Q1 product roadmap with milestones',
          keyData: { milestones: 8, features: 12 }
        },
        analytics: {
          totalViews: 78,
          lastAccessed: '2024-01-18T16:40:00Z',
          activityScore: 92
        }
      }
    ],
    totalCount: 2,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
      limit: 20,
      offset: 0
    },
    aggregations: {
      byType: { research: 1, planning: 1 },
      byStatus: { active: 2 },
      byPriority: { high: 1, critical: 1 },
      totalSize: 7290880,
      averageSize: 3645440
    },
    metadata: {
      queryTime: 45,
      cacheHit: false,
      version: '1.0.0',
      generatedAt: '2024-01-20T15:05:00Z'
    }
  }
};