// Mock AI 마인드맵 생성기 (OpenAI 대신 사용할 임시 솔루션)
// ===============================================

export interface MockAIOptions {
  maxNodes?: number;
  language?: 'korean' | 'english';
  includeMetadata?: boolean;
}

interface TemplateItem {
  title: string;
  content: string;
}

type TemplateMap = Record<string, { korean: TemplateItem[]; english: TemplateItem[] }>;

interface NodeMetadata {
  source: string;
  confidence: number;
  keywords?: string[];
}

interface MindmapNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  type: string;
  parentId?: string;
  level: number;
  metadata: NodeMetadata;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

/**
 * 스마트한 Mock AI 마인드맵 생성기
 * OpenAI가 사용 불가능할 때 고품질 마인드맵을 생성
 */
export class MockAIGenerator {
  
  /**
   * 입력에 따른 동적 마인드맵 생성
   */
  async generateMindmapContent(
    userInput: string,
    parsedData?: { keywords?: { nouns?: string[] } },
    enterpriseData?: unknown,
    options: MockAIOptions = {}
  ): Promise<{ nodes: MindmapNode[]; connections: Connection[]; metadata: Record<string, unknown> }> {
    const opts = {
      maxNodes: 12,
      language: 'korean',
      includeMetadata: true,
      ...options
    };

    console.log(`🎯 Mock AI generating mindmap for: "${userInput}"`);

    // 입력 분석 및 카테고리 결정
    const category = this.detectCategory(userInput);
    const template = this.getTemplate(category, opts.language as 'korean' | 'english');

    // 키워드 추출
    const keywords = parsedData?.keywords?.nouns || this.extractKeywords(userInput);
    
    // 마인드맵 구조 생성
    const nodes = this.generateNodes(userInput, keywords, template, {
      ...opts,
      language: (opts.language || 'korean') as 'korean' | 'english'
    });
    const connections = this.generateConnections(nodes);

    console.log(`✅ Mock AI generated ${nodes.length} nodes, ${connections.length} connections`);

    return {
      nodes,
      connections,
      metadata: {
        generator: 'mock-ai',
        category,
        confidence: 0.85,
        processingTime: Date.now()
      }
    };
  }

  private detectCategory(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('startup') || lowerInput.includes('사업') || lowerInput.includes('창업')) {
      return 'startup';
    }
    if (lowerInput.includes('tech') || lowerInput.includes('기술') || lowerInput.includes('개발')) {
      return 'technology';
    }
    if (lowerInput.includes('marketing') || lowerInput.includes('마케팅') || lowerInput.includes('홍보')) {
      return 'marketing';
    }
    if (lowerInput.includes('education') || lowerInput.includes('교육') || lowerInput.includes('학습')) {
      return 'education';
    }
    if (lowerInput.includes('project') || lowerInput.includes('프로젝트') || lowerInput.includes('계획')) {
      return 'project';
    }
    
    return 'general';
  }

  private getTemplate(category: string, language: 'korean' | 'english'): TemplateItem[] {
    const templates: TemplateMap = {
      startup: {
        korean: [
          { title: '비즈니스 모델', content: '수익 구조와 가치 제안' },
          { title: '시장 분석', content: '타겟 고객과 경쟁 분석' },
          { title: '제품/서비스', content: '핵심 기능과 차별화 요소' },
          { title: '마케팅 전략', content: '고객 획득 및 브랜딩' },
          { title: '팀 구성', content: '핵심 인력과 역할 분담' },
          { title: '자금 조달', content: '투자 계획과 재무 관리' }
        ],
        english: [
          { title: 'Business Model', content: 'Revenue streams and value proposition' },
          { title: 'Market Analysis', content: 'Target customers and competition' },
          { title: 'Product/Service', content: 'Core features and differentiation' },
          { title: 'Marketing Strategy', content: 'Customer acquisition and branding' },
          { title: 'Team Building', content: 'Key personnel and roles' },
          { title: 'Funding', content: 'Investment plan and financial management' }
        ]
      },
      technology: {
        korean: [
          { title: '기술 스택', content: '사용할 기술과 프레임워크' },
          { title: '아키텍처', content: '시스템 구조와 설계' },
          { title: '개발 프로세스', content: '개발 방법론과 절차' },
          { title: '품질 관리', content: '테스트와 코드 리뷰' },
          { title: '배포 전략', content: '서버 환경과 자동화' },
          { title: '유지보수', content: '모니터링과 업데이트' }
        ],
        english: [
          { title: 'Tech Stack', content: 'Technologies and frameworks' },
          { title: 'Architecture', content: 'System structure and design' },
          { title: 'Development Process', content: 'Methodology and procedures' },
          { title: 'Quality Assurance', content: 'Testing and code review' },
          { title: 'Deployment', content: 'Server environment and automation' },
          { title: 'Maintenance', content: 'Monitoring and updates' }
        ]
      },
      general: {
        korean: [
          { title: '목표 설정', content: '달성하고자 하는 목표' },
          { title: '현황 분석', content: '현재 상황과 문제점' },
          { title: '실행 계획', content: '구체적인 행동 방안' },
          { title: '자원 확보', content: '필요한 인력과 예산' },
          { title: '위험 관리', content: '예상 위험과 대응책' }
        ],
        english: [
          { title: 'Goal Setting', content: 'Objectives to achieve' },
          { title: 'Current Analysis', content: 'Present situation and issues' },
          { title: 'Action Plan', content: 'Specific implementation steps' },
          { title: 'Resource Allocation', content: 'Required personnel and budget' },
          { title: 'Risk Management', content: 'Anticipated risks and countermeasures' }
        ]
      }
    };

    const templateSet = templates[category] || templates.general;
    return templateSet[language] || templateSet.korean;
  }

  private extractKeywords(input: string): string[] {
    // 간단한 키워드 추출
    const words = input.toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
      .slice(0, 6);
    
    return words;
  }

  private generateNodes(
    userInput: string, 
    keywords: string[], 
    template: TemplateItem[], 
    options: MockAIOptions
  ): MindmapNode[] {
    const nodes: MindmapNode[] = [];

    // 중심 노드 생성
    nodes.push({
      id: 'center',
      title: userInput.length > 30 ? `${userInput.substring(0, 27)}...` : userInput,
      content: userInput,
      x: 0,
      y: 0,
      type: 'center',
      level: 0,
      metadata: {
        source: 'mock-ai',
        confidence: 0.95,
        keywords: keywords
      }
    });

    // 템플릿 기반 주요 노드 생성
    const maxMajorNodes = Math.min(template.length, (options.maxNodes ?? 12) - 1, 8);
    const radius = 250;

    for (let i = 0; i < maxMajorNodes; i++) {
      const angle = (i * 2 * Math.PI) / maxMajorNodes;
      const templateItem = template[i];

      nodes.push({
        id: `major-${i}`,
        title: templateItem.title,
        content: templateItem.content,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        type: 'major',
        parentId: 'center',
        level: 1,
        metadata: {
          source: 'mock-ai',
          confidence: 0.8,
          keywords: keywords.slice(0, 2)
        }
      });

      // 각 주요 노드에 세부 노드 추가 (선택적)
      if (nodes.length < (options.maxNodes ?? 12) && i < 3) {
        const subRadius = radius + 120;
        const subAngle = angle + (Math.random() - 0.5) * 0.5;

        const minorTitle = options.language === 'english' ? `${templateItem.title} Details` : `${templateItem.title} 세부사항`;
        const minorContent = options.language === 'english' ? `Specific plans and implementation strategies for ${templateItem.title}` : `${templateItem.title}에 대한 구체적인 계획과 실행방안`;
        
        nodes.push({
          id: `minor-${i}`,
          title: minorTitle,
          content: minorContent,
          x: Math.cos(subAngle) * subRadius,
          y: Math.sin(subAngle) * subRadius,
          type: 'minor',
          parentId: `major-${i}`,
          level: 2,
          metadata: {
            source: 'mock-ai',
            confidence: 0.7
          }
        });
      }
    }

    return nodes.slice(0, options.maxNodes ?? 12);
  }

  private generateConnections(nodes: MindmapNode[]): Connection[] {
    const connections: Connection[] = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        connections.push({
          id: `conn-${node.parentId}-${node.id}`,
          sourceId: node.parentId,
          targetId: node.id,
          type: node.level === 1 ? 'main' : 'sub'
        });
      }
    });

    return connections;
  }

  /**
   * 입력에 기반한 맞춤형 콘텐츠 생성
   */
  generateContentForKeyword(keyword: string, language: 'korean' | 'english'): string {
    const contentMap = {
      korean: {
        '창업': '새로운 사업 기회 발굴과 실행 계획',
        '기술': '혁신적인 기술 솔루션 개발',
        '마케팅': '고객 중심의 브랜드 전략 수립',
        '교육': '효과적인 학습 경험 설계',
        '프로젝트': '체계적인 업무 관리와 실행'
      },
      english: {
        'startup': 'Innovative business opportunity development',
        'tech': 'Advanced technology solution creation',
        'marketing': 'Customer-centric brand strategy',
        'education': 'Effective learning experience design',
        'project': 'Systematic work management and execution'
      }
    };

    const map = contentMap[language];
    const lowerKeyword = keyword.toLowerCase();
    
    // 🔧 FIX: Simplified type-safe access since map is always a defined object
    const value = (map as Record<string, unknown>)[lowerKeyword];
    if (typeof value === 'string') {
      return value;
    }
    
    // Return language-appropriate fallback
    return language === 'english' ? `Professional approach to ${keyword}` : `${keyword}에 대한 전문적인 접근`;
  }
}

// Export singleton instance
export const mockAIGenerator = new MockAIGenerator();