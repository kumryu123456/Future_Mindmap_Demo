# Future Mindmap Demo - 프론트엔드 기술 명세서

## 개요

Future Mindmap Demo 프론트엔드는 AI 기반 마인드맵 생성 및 관리를 위한 현대적인 React 애플리케이션입니다. TypeScript를 기반으로 구축되었으며, React 19, ReactFlow를 활용한 대화형 마인드맵 캔버스, Zustand 기반 상태 관리, 그리고 Radix UI + TailwindCSS를 통한 모던한 UI/UX를 제공합니다.

## 시스템 아키텍처

### 기술 스택

- **프레임워크**: React 19.1.1
- **언어**: TypeScript 5.8.3
- **빌드 도구**: Vite 7.1.0
- **패키지 매니저**: npm
- **상태 관리**: Zustand 5.0.7
- **UI 컴포넌트**: Radix UI + Custom Components
- **스타일링**: TailwindCSS 4.1.11
- **다이어그램**: ReactFlow (@xyflow/react) 12.8.2
- **라우팅**: React Router 7.8.0
- **테스팅**: Jest 30.0.5 + Testing Library
- **아이콘**: Lucide React 0.539.0

### 핵심 구성 요소

```
frontend/
├── package.json              # 프로젝트 설정 및 의존성
├── vite.config.ts            # Vite 빌드 설정
├── tsconfig.json            # TypeScript 설정
├── tailwind.config.js       # TailwindCSS 설정
├── jest.config.mjs          # Jest 테스팅 설정
├── eslint.config.js         # ESLint 린팅 설정
├── public/                  # 정적 리소스
└── src/
    ├── main.tsx             # 애플리케이션 진입점
    ├── App.tsx              # 메인 앱 컴포넌트
    ├── components/          # React 컴포넌트
    │   ├── ui/              # 재사용 가능한 UI 컴포넌트
    │   ├── session/         # 세션 관리 컴포넌트
    │   └── *.tsx            # 페이지별 컴포넌트
    ├── pages/               # 페이지 컴포넌트
    ├── store/               # Zustand 상태 관리
    ├── services/            # API 서비스 레이어
    ├── hooks/               # 커스텀 React Hooks
    ├── utils/               # 유틸리티 함수
    ├── types/               # TypeScript 타입 정의
    ├── contexts/            # React Context 공급자
    └── styles/              # CSS 스타일시트
```

## 컴포넌트 아키텍처

### 1. 메인 애플리케이션 구조

#### App.tsx

```typescript
function App() {
  const [selectedPlan, setSelectedPlan] = useState(mockPlans[0]);
  const [currentSessionData, setCurrentSessionData] = useState(mockSessionData);
  const [activeView, setActiveView] = useState<"career" | "browse" | "dashboard">("career");
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="app">
          <Header />
          <div className="main-content">
            <Routes>
              <Route index element={<Carrer />} />
              <Route path="dashboard" element={<DashboardView />} />
              <Route path="browse" element={<Browse />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

#### 진입점 (main.tsx)

```typescript
// 글로벌 에러 핸들링과 Toast 시스템 초기화
const AppWithErrorHandler = () => {
  const toast = useToast();
  
  useEffect(() => {
    setGlobalToast(toast); // 전역 토스트 인스턴스 설정
  }, [toast]);
  
  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider position="top-right">
      <AppWithErrorHandler />
    </ToastProvider>
  </StrictMode>
);
```

### 2. 핵심 컴포넌트

#### AICareerCanvas (메인 마인드맵 캔버스)

**2,461라인의 고도로 정교한 마인드맵 인터페이스**

##### 주요 기능

- **ReactFlow 기반**: 대화형 노드/엣지 조작
- **AI 통합**: OpenAI 기반 마인드맵 자동 생성
- **다중 노드 타입**: Center, Major, Minor, Detail, Goal, Expanded
- **실시간 연결**: 핸들 드래그, 버튼 연결, 컨텍스트 메뉴
- **테마 지원**: Dark/Light 모드 동적 전환
- **사이드바 통합**: 정보, 리뷰, RAG 상세 검색 탭

##### 노드 타입 시스템

```typescript
const nodeTypes: NodeTypes = {
  centerNode: CenterNode,    // 중앙 주제 노드
  majorNode: MajorNode,      // 주요 영역 노드 (AI 확장 가능)
  minorNode: MinorNode,      // 세부 항목 노드
  detailNode: DetailNode,    // 상세 단계 노드
  goalNode: GoalNode,        // 최종 목표 노드
  expandedNode: ExpandedNode // AI 생성 확장 노드
};
```

##### 연결 시스템 (고급 엣지 관리)

```typescript
// 통합 연결 생성 헬퍼 - 모든 연결 타입에서 일관성 보장
const createConsistentEdge = useCallback((
  sourceNodeId: string,
  targetNodeId: string, 
  connectionType: "handle_drag" | "connect_button" | "context_add" | "auto_connect",
  userSourceHandle?: string,
  userTargetHandle?: string
) => {
  // 최적 핸들 계산 및 스타일 적용
  const optimal = calculateOptimalConnection(sourceNode, targetNode);
  const { strokeColor, strokeWidth } = getConnectionStyle(
    optimal.sourceHandle, 
    optimal.targetHandle
  );
  
  return {
    id: `e${sourceNodeId}-${targetNodeId}-${Date.now()}`,
    source: sourceNodeId,
    target: targetNodeId,
    sourceHandle: optimal.sourceHandle,
    targetHandle: optimal.targetHandle,
    type: "smoothstep",
    animated: true,
    style: { stroke: strokeColor, strokeWidth },
    markerEnd: { type: "arrowclosed", color: strokeColor }
  };
}, [nodes, calculateOptimalConnection, getConnectionStyle]);
```

##### 고급 기능

1. **AI 노드 확장**: 선택된 노드를 AI가 자동으로 하위 노드들로 확장
2. **실시간 연결 편집**: 에지 재연결, 핸들 변경, 스타일 동적 적용
3. **컨텍스트 메뉴**: 우클릭으로 편집, 삭제, 연결, AI 확장
4. **키보드 단축키**: Delete (삭제), Ctrl+L (자동 정렬), ESC (모드 취소)
5. **자동 레이아웃**: 원형 배치로 노드 자동 정렬

#### UI 컴포넌트 시스템

##### 1. Toast 알림 시스템 (ToastNotification.tsx)

```typescript
// 고급 토스트 시스템 - 위치, 타입, 액션 지원
interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const useToast = () => {
  const show = (message: string, options?: ToastOptions) => {
    // 토스트 표시 로직
  };
  const info = (message: string, options?: Omit<ToastOptions, 'type'>) => 
    show(message, { ...options, type: 'info' });
  
  return { show, success, error, warning, info };
};
```

##### 2. 키워드 입력 시스템 (KeywordInput.tsx)

```typescript
// 한국어 특화 키워드 입력 컴포넌트
interface KeywordInputProps {
  placeholder?: string;
  maxKeywords?: number;
  minLength?: number;
  maxLength?: number;
  onKeywordsChange?: (keywords: string[]) => void;
  validation?: {
    required?: boolean;
    duplicates?: boolean;
    customValidation?: (keyword: string) => boolean | string;
  };
  suggestions?: string[];
  allowCustom?: boolean;
  className?: string;
}
```

##### 3. 로딩 인디케이터 시스템 (LoadingIndicator.tsx)

```typescript
// 다양한 로딩 상태를 위한 컴포넌트 시스템
export const GlobalLoadingIndicator: React.FC = () => {
  // 전역 로딩 오버레이
};

export const OperationsIndicator: React.FC = () => {
  // 백그라운드 작업 진행 상태
};

export const InlineLoading: React.FC<{size?: 'sm' | 'md' | 'lg'}> = () => {
  // 인라인 로딩 스피너
};

export const LoadingButton: React.FC<ButtonProps & {loading?: boolean}> = () => {
  // 로딩 상태가 있는 버튼
};
```

##### 4. 마인드맵 노드 시스템 (MindmapNode.tsx, MindmapEdge.tsx)

```typescript
// 커스텀 노드 타입 정의
export const nodeTypes = {
  default: DefaultNode,
  custom: CustomNode,
  group: GroupNode,
  connector: ConnectorNode,
};

export const edgeTypes = {
  default: DefaultEdge,
  custom: CustomEdge,
  animated: AnimatedEdge,
  dashed: DashedEdge,
};
```

### 3. 페이지 컴포넌트

#### Career 페이지 (pages/Career/Career.tsx)

- AI 커리어 설계 메인 인터페이스
- AICareerCanvas 통합
- 세션 관리 및 데이터 지속성

#### Browse 페이지 (Browse.tsx)

- 커리어 프로필 탐색 인터페이스
- 검색 및 필터링 기능
- 페이지네이션 지원

## 상태 관리 시스템

### Zustand 기반 상태 아키텍처

#### 1. 마인드맵 스토어 (mindmapStore.ts)

```typescript
interface MindmapStore {
  // 노드 관리
  nodes: MindmapNode[];
  connections: MindmapConnection[];
  selectedNodes: string[];
  selectedConnections: string[];
  
  // 캔버스 상태
  canvas: {
    scale: number;
    offset: { x: number; y: number };
    size: { width: number; height: number };
    grid: { visible: boolean; size: number };
  };
  
  // 레이아웃 관리
  layout: {
    type: 'force' | 'tree' | 'circular' | 'grid' | 'manual';
    center: { x: number; y: number };
    spacing: number;
    direction: 'horizontal' | 'vertical';
  };
  
  // 히스토리 관리
  history: {
    past: MindmapAction[];
    future: MindmapAction[];
    maxSize: number;
  };
  
  // 액션
  addNode: (node: Partial<MindmapNode>) => string;
  updateNode: (id: string, updates: Partial<MindmapNode>) => void;
  deleteNode: (id: string) => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  undo: () => void;
  redo: () => void;
}
```

#### 2. 세션 스토어 (sessionStore.ts)

```typescript
interface SessionStore {
  // 세션 데이터
  sessionId: string | null;
  sessionName: string;
  lastActivity: Date;
  autoSave: boolean;
  
  // 사용자 입력
  userInputs: string[];
  currentPlanId: string | null;
  
  // 뷰포트 상태
  viewport: {
    center: { x: number; y: number };
    zoom: number;
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  };
  
  // 액션
  createSession: (name?: string) => Promise<string>;
  loadSession: (sessionId: string) => Promise<boolean>;
  saveSession: () => Promise<boolean>;
  clearSession: () => void;
}
```

#### 3. UI 스토어 (uiStore.ts)

```typescript
interface UIStore {
  // UI 상태
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  toolbarVisible: boolean;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string>;
  
  // 모달 관리
  modals: {
    nodeEdit: { open: boolean; nodeId?: string };
    settings: { open: boolean };
    help: { open: boolean };
  };
  
  // 검색 상태
  search: {
    query: string;
    results: SearchResult[];
    active: boolean;
    filters: SearchFilters;
  };
  
  // 액션
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  openModal: (modalType: string, data?: any) => void;
  closeModal: (modalType: string) => void;
}
```

### 고급 선택자 시스템 (selectors.ts)

```typescript
// 성능 최적화된 선택자들
export const useVisibleNodes = () => useMindmapStore(
  state => state.nodes.filter(node => node.visible),
  shallow
);

export const useSelectedNodesByType = (nodeType: string) => 
  useMindmapStore(
    state => state.nodes.filter(node => 
      state.selectedNodes.includes(node.id) && node.type === nodeType
    ),
    shallow
  );

export const useNodeHierarchy = (nodeId: string) => 
  useMindmapStore(
    state => ({
      ancestors: getAncestors(state.nodes, nodeId),
      descendants: getDescendants(state.nodes, nodeId),
      siblings: getSiblings(state.nodes, nodeId),
      depth: getNodeDepth(state.nodes, nodeId)
    }),
    shallow
  );
```

## 서비스 레이어

### 1. API 서비스 (services/api.ts)

#### 통합 API 클라이언트

```typescript
class ApiService {
  private config: Required<ApiConfig> = {
    baseUrl: 'http://127.0.0.1:54321', // Supabase Edge Functions
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };
  
  async request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    // 타임아웃, 에러 핸들링, 재시도 로직
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    try {
      const response = await fetch(url, requestInit);
      // 응답 처리 및 에러 핸들링
      return { success: true, data: responseData };
    } catch (error) {
      // 자동 에러 처리 및 토스트 알림
      globalErrorHandler.handleApiError(apiResponse, 'Network Request');
      return apiResponse;
    }
  }
}
```

### 2. 마인드맵 API 서비스 (services/smartMindmapApi.ts)

```typescript
// AI 마인드맵 생성 서비스
export async function createSmartMindmapSimple(
  userInput: string,
  includeEnterpriseData: boolean = false
): Promise<ApiResponse<SmartMindmapResponse>> {
  
  const payload = {
    rawText: userInput,
    options: {
      maxNodes: 12,
      language: 'korean',
      includeMetadata: true,
      includeEnterpriseData
    }
  };
  
  return apiService.post('/functions/v1/create-smart-mindmap', payload);
}

// XYFlow 형식으로 변환
export function convertToXYFlowNodes(backendNodes: BackendNode[]): Node[] {
  return backendNodes.map(node => ({
    id: node.id,
    type: `${node.type}Node`,
    position: { x: node.x, y: node.y },
    data: {
      label: node.title,
      content: node.content,
      subtitle: node.subtitle,
      metadata: node.metadata
    }
  }));
}
```

### 3. 노드 확장 API (services/nodeExpandApi.ts)

```typescript
// 데이터베이스 기반 노드 확장
export async function quickExpandNode(
  nodeId: string, 
  style: 'comprehensive' | 'focused' | 'creative' | 'analytical'
): Promise<NodeExpandResponse> {
  
  return apiService.post('/functions/v1/auto-expand', {
    nodeId,
    expandStyle: style,
    maxChildren: 5
  });
}

// 메모리 기반 노드 확장 (폴백)
export async function expandMemoryNode(
  nodeData: any,
  style: string
): Promise<NodeExpandResponse> {
  
  const response = await apiService.post('/functions/v1/smart-expand', {
    parentNode: nodeData,
    expandStyle: style,
    generateConnections: true
  });
  
  if (response.success) {
    return {
      success: true,
      nodes: convertToXYFlowNodes(response.data.nodes),
      edges: convertToXYFlowEdges(response.data.connections)
    };
  }
  
  return response;
}
```

### 4. 세션 관리 서비스 (services/sessionApi.ts)

```typescript
// 세션 저장/로드 서비스
export async function saveUserSession(sessionData: SessionData): Promise<ApiResponse<SaveSessionResponse>> {
  
  const payload = {
    sessionId: sessionData.sessionId,
    sessionName: sessionData.sessionName || `Session ${new Date().toISOString()}`,
    sessionData: {
      mindmapNodes: sessionData.mindmapData.nodes,
      connections: sessionData.mindmapData.connections,
      userInputs: sessionData.userInputs,
      currentPlanId: sessionData.currentPlanId,
      lastExpansion: sessionData.lastExpansion
    },
    viewportState: sessionData.viewportState,
    uiPreferences: sessionData.uiPreferences
  };
  
  return apiService.post('/functions/v1/save-session', payload);
}

export async function loadUserSession(sessionId: string): Promise<ApiResponse<LoadSessionResponse>> {
  return apiService.post('/functions/v1/load-session', { sessionId });
}
```

## 테마 및 스타일링 시스템

### 1. 테마 공급자 (contexts/ThemeContext.tsx)

```typescript
type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
  
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }
  
    root.classList.add(theme);
  }, [theme]);
}
```

### 2. TailwindCSS 설정 (tailwind.config.js)

```javascript
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // 커스텀 마인드맵 색상
        mindmap: {
          center: 'var(--mindmap-center)',
          major: 'var(--mindmap-major)',
          minor: 'var(--mindmap-minor)',
          connection: 'var(--mindmap-connection)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      }
    }
  }
};
```

### 3. CSS 변수 시스템 (styles/globals.css)

```css
:root {
  /* Light Theme */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --mindmap-center: #3b82f6;
  --mindmap-major: #1d4ed8;
  --mindmap-minor: #60a5fa;
  --mindmap-connection: #94a3b8;
}

.dark {
  /* Dark Theme */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --mindmap-center: #1e40af;
  --mindmap-major: #1d4ed8;
  --mindmap-minor: #2563eb;
  --mindmap-connection: #475569;
}

/* 마인드맵 전용 스타일 */
.career-node {
  @apply rounded-lg border-2 border-gray-300 bg-white p-3 shadow-md transition-all duration-200 hover:shadow-lg;
}

.career-node.center-node {
  @apply border-blue-500 bg-blue-50 text-blue-900;
}

.career-node.major-node {
  @apply border-green-500 bg-green-50 text-green-900;
}
```

## 커스텀 Hook 시스템

### 1. 마인드맵 Hook (hooks/useMindmapStore.ts)

```typescript
// 고급 마인드맵 상태 관리 훅
export function useMindmap() {
  const store = useMindmapStore();
  
  const addNodeWithConnection = useCallback((
    parentId: string,
    nodeData: Partial<MindmapNode>
  ) => {
    const nodeId = store.addNode(nodeData);
    store.connectNodes(parentId, nodeId);
    return nodeId;
  }, [store]);
  
  const getNodeHierarchy = useCallback((nodeId: string) => {
    const nodes = store.nodes;
    return {
      ancestors: getAncestors(nodes, nodeId),
      descendants: getDescendants(nodes, nodeId),
      depth: getNodeDepth(nodes, nodeId)
    };
  }, [store.nodes]);
  
  return {
    ...store,
    addNodeWithConnection,
    getNodeHierarchy
  };
}

// 노드별 상태 관리 훅
export function useNode(nodeId: string) {
  const node = useMindmapStore(state => 
    state.nodes.find(n => n.id === nodeId)
  );
  const updateNode = useMindmapStore(state => state.updateNode);
  const deleteNode = useMindmapStore(state => state.deleteNode);
  
  const update = useCallback((updates: Partial<MindmapNode>) => {
    updateNode(nodeId, updates);
  }, [nodeId, updateNode]);
  
  const remove = useCallback(() => {
    deleteNode(nodeId);
  }, [nodeId, deleteNode]);
  
  return { node, update, remove };
}
```

### 2. 키워드 입력 Hook (hooks/useKeywordInput.ts)

```typescript
interface UseKeywordInputProps {
  initialKeywords?: string[];
  maxKeywords?: number;
  validation?: KeywordValidation;
  onKeywordsChange?: (keywords: string[]) => void;
}

export function useKeywordInput({
  initialKeywords = [],
  maxKeywords = 10,
  validation = {},
  onKeywordsChange
}: UseKeywordInputProps) {
  
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [inputValue, setInputValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const addKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
  
    // 검증 로직
    const validationResult = validateKeyword(trimmed, keywords, validation);
    if (!validationResult.isValid) {
      setErrors(prev => [...prev, validationResult.error!]);
      return false;
    }
  
    const newKeywords = [...keywords, trimmed];
    setKeywords(newKeywords);
    onKeywordsChange?.(newKeywords);
    setInputValue('');
    setErrors([]);
  
    return true;
  }, [keywords, validation, onKeywordsChange]);
  
  const removeKeyword = useCallback((index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    onKeywordsChange?.(newKeywords);
  }, [keywords, onKeywordsChange]);
  
  return {
    keywords,
    inputValue,
    errors,
    setInputValue,
    addKeyword,
    removeKeyword,
    clearKeywords: () => {
      setKeywords([]);
      setInputValue('');
      setErrors([]);
      onKeywordsChange?.([]);
    }
  };
}
```

### 3. 세션 관리 Hook (hooks/useSessionStore.ts)

```typescript
export function useSession() {
  const sessionStore = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const saveSession = useCallback(async (sessionName?: string) => {
    if (isLoading) return false;
  
    setIsLoading(true);
    toast.info('세션을 저장하는 중...');
  
    try {
      const success = await sessionStore.saveSession(sessionName);
      if (success) {
        toast.success('세션이 저장되었습니다');
      } else {
        toast.error('세션 저장에 실패했습니다');
      }
      return success;
    } catch (error) {
      toast.error(`세션 저장 중 오류: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionStore, isLoading, toast]);
  
  const loadSession = useCallback(async (sessionId: string) => {
    if (isLoading) return false;
  
    setIsLoading(true);
    toast.info('세션을 불러오는 중...');
  
    try {
      const success = await sessionStore.loadSession(sessionId);
      if (success) {
        toast.success('세션이 불러와졌습니다');
      } else {
        toast.error('세션을 불러올 수 없습니다');
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [sessionStore, isLoading, toast]);
  
  return {
    ...sessionStore,
    isLoading,
    saveSession,
    loadSession
  };
}
```

## 타입 시스템

### 1. 컴포넌트 타입 (types/components.ts)

```typescript
// 키워드 입력 컴포넌트 타입
export interface KeywordInputProps {
  placeholder?: string;
  maxKeywords?: number;
  minLength?: number;
  maxLength?: number;
  onKeywordsChange?: (keywords: string[]) => void;
  validation?: KeywordValidation;
  suggestions?: string[];
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface KeywordValidation {
  required?: boolean;
  duplicates?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidation?: (keyword: string) => boolean | string;
}

// 로딩 인디케이터 타입
export interface LoadingIndicatorProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  color?: 'primary' | 'secondary' | 'accent' | 'neutral';
  message?: string;
  className?: string;
}
```

### 2. 스토어 타입 (types/store.ts)

```typescript
// 마인드맵 노드 타입
export interface MindmapNode {
  id: string;
  type: 'center' | 'major' | 'minor' | 'detail' | 'goal' | 'expanded';
  title: string;
  content?: string;
  subtitle?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: NodeStyle;
  metadata?: NodeMetadata;
  visible?: boolean;
  selected?: boolean;
  locked?: boolean;
  parentId?: string;
  childIds?: string[];
  level?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 연결 타입
export interface MindmapConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: 'default' | 'smoothstep' | 'straight' | 'bezier';
  style?: ConnectionStyle;
  animated?: boolean;
  label?: string;
  selected?: boolean;
  createdAt: Date;
}

// 스토어 상태 타입
export interface MindmapStoreState {
  // 데이터
  nodes: MindmapNode[];
  connections: MindmapConnection[];
  
  // 선택 상태
  selection: {
    nodeIds: string[];
    connectionIds: string[];
    isMultiSelect: boolean;
  };
  
  // 캔버스 상태
  canvas: {
    scale: number;
    offset: { x: number; y: number };
    size: { width: number; height: number };
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    gridVisible: boolean;
    gridSize: number;
  };
  
  // 레이아웃 상태
  layout: MindmapLayout;
  
  // UI 상태
  theme: MindmapTheme;
  search: MindmapSearch;
  history: MindmapHistory;
}
```

### 3. API 타입 (types/api.ts)

```typescript
// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    processingTime?: number;
  };
}

// 마인드맵 생성 응답
export interface SmartMindmapResponse {
  nodes: BackendNode[];
  connections: BackendConnection[];
  metadata: {
    processingTime: number;
    sources: string[];
    language: 'korean' | 'english';
    nodeCount: number;
    connectionCount: number;
  };
}

// 노드 확장 응답
export interface NodeExpandResponse {
  success: boolean;
  nodes?: XYFlowNode[];
  edges?: XYFlowEdge[];
  error?: ApiError;
  metadata?: {
    expandStyle: string;
    parentNodeId: string;
    generatedCount: number;
  };
}
```

## 테스팅 시스템

### Jest 설정 (jest.config.mjs)

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
```

### 테스트 예시

#### 1. 컴포넌트 테스트 (ToastNotification.test.tsx)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastNotification';

// Mock 컴포넌트
const TestComponent = () => {
  const toast = useToast();
  
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error message', { duration: 1000 })}>
        Show Error
      </button>
    </div>
  );
};

describe('ToastNotification', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('토스트 메시지를 표시하고 자동으로 사라집니다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  
    fireEvent.click(screen.getByText('Show Success'));
  
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toHaveClass('toast-success');
  
    // 기본 3초 후 사라짐
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });
  
  it('커스텀 duration으로 토스트가 표시됩니다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  
    fireEvent.click(screen.getByText('Show Error'));
  
    expect(screen.getByText('Error message')).toBeInTheDocument();
  
    // 커스텀 1초 후 사라짐
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });
});
```

#### 2. Hook 테스트 (useKeywordInput.test.ts)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useKeywordInput } from '../useKeywordInput';

describe('useKeywordInput', () => {
  it('키워드를 추가하고 제거할 수 있습니다', () => {
    const { result } = renderHook(() => useKeywordInput({
      maxKeywords: 5
    }));
  
    expect(result.current.keywords).toEqual([]);
  
    // 키워드 추가
    act(() => {
      result.current.addKeyword('React');
    });
  
    expect(result.current.keywords).toEqual(['React']);
  
    // 키워드 제거
    act(() => {
      result.current.removeKeyword(0);
    });
  
    expect(result.current.keywords).toEqual([]);
  });
  
  it('중복 키워드를 방지합니다', () => {
    const { result } = renderHook(() => useKeywordInput({
      validation: { duplicates: false }
    }));
  
    act(() => {
      result.current.addKeyword('React');
    });
  
    const success = result.current.addKeyword('React');
  
    expect(success).toBe(false);
    expect(result.current.keywords).toEqual(['React']);
    expect(result.current.errors).toContain('이미 존재하는 키워드입니다');
  });
});
```

#### 3. 스토어 테스트 (mindmapStore.test.ts)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMindmapStore } from '../store/mindmapStore';

describe('MindmapStore', () => {
  it('노드를 추가하고 업데이트할 수 있습니다', () => {
    const { result } = renderHook(() => useMindmapStore());
  
    // 노드 추가
    act(() => {
      const nodeId = result.current.addNode({
        type: 'center',
        title: 'Test Node',
        position: { x: 0, y: 0 }
      });
    
      expect(nodeId).toBeDefined();
      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].title).toBe('Test Node');
    });
  
    // 노드 업데이트
    act(() => {
      const nodeId = result.current.nodes[0].id;
      result.current.updateNode(nodeId, { title: 'Updated Node' });
    
      expect(result.current.nodes[0].title).toBe('Updated Node');
    });
  });
  
  it('연결을 생성할 수 있습니다', () => {
    const { result } = renderHook(() => useMindmapStore());
  
    let node1Id: string;
    let node2Id: string;
  
    act(() => {
      node1Id = result.current.addNode({
        type: 'center',
        title: 'Node 1',
        position: { x: 0, y: 0 }
      });
    
      node2Id = result.current.addNode({
        type: 'major',
        title: 'Node 2',
        position: { x: 100, y: 100 }
      });
    
      result.current.connectNodes(node1Id, node2Id);
    });
  
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0].sourceId).toBe(node1Id);
    expect(result.current.connections[0].targetId).toBe(node2Id);
  });
});
```

## 빌드 및 배포

### Vite 설정 (vite.config.ts)

```typescript
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          reactflow: ['@xyflow/react'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          store: ['zustand', 'immer']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/functions': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true
      }
    }
  }
});
```

### Package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "jest --config jest.config.mjs",
    "test:watch": "jest --config jest.config.mjs --watch",
    "test:coverage": "jest --config jest.config.mjs --coverage",
    "test:ci": "jest --config jest.config.mjs --coverage --watchAll=false",
    "type-check": "tsc --noEmit"
  }
}
```

### 환경 변수 (.env)

```bash
# API 설정
VITE_API_BASE_URL=http://127.0.0.1:54321
VITE_API_TIMEOUT=30000

# Supabase 설정
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 개발 설정
VITE_APP_NAME=Future Mindmap Demo
VITE_APP_VERSION=1.0.0
VITE_LOG_LEVEL=debug
```

## 성능 최적화

### 1. 코드 분할 (Code Splitting)

```typescript
// 라우트 기반 지연 로딩
const Career = lazy(() => import('@/pages/Career/Career'));
const Browse = lazy(() => import('@/components/Browse'));
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));

// 컴포넌트 기반 지연 로딩
const AICareerCanvas = lazy(() => import('@/components/AICareerCanvas'));
const MindmapCanvas = lazy(() => import('@/components/ui/MindmapCanvasNew'));
```

### 2. 메모이제이션 최적화

```typescript
// React.memo로 컴포넌트 메모이제이션
export const MindmapNode = React.memo<MindmapNodeProps>(({ 
  node, 
  selected, 
  onUpdate 
}) => {
  return (
    <div className={`mindmap-node ${selected ? 'selected' : ''}`}>
      {/* 노드 컨텐츠 */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.node.updatedAt === nextProps.node.updatedAt
  );
});

// useMemo로 계산 비용이 큰 작업 메모이제이션
const visibleNodes = useMemo(() => {
  return nodes.filter(node => {
    const isInViewport = isNodeInViewport(node.position, viewport);
    return node.visible && isInViewport;
  });
}, [nodes, viewport]);

// useCallback으로 이벤트 핸들러 메모이제이션
const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
  event.stopPropagation();
  onNodeSelect(nodeId);
}, [onNodeSelect]);
```

### 3. 가상화 (Virtualization)

```typescript
// 대용량 노드 목록을 위한 가상화
import { FixedSizeList as List } from 'react-window';

const VirtualizedNodeList: React.FC<{ nodes: MindmapNode[] }> = ({ nodes }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <NodePreview node={nodes[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={nodes.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 4. 상태 최적화

```typescript
// Zustand의 선택적 구독으로 불필요한 리렌더링 방지
const useOptimizedNodeSelection = (nodeId: string) => {
  return useMindmapStore(
    useCallback(
      (state) => ({
        node: state.nodes.find(n => n.id === nodeId),
        isSelected: state.selection.nodeIds.includes(nodeId),
        connections: state.connections.filter(
          c => c.sourceId === nodeId || c.targetId === nodeId
        )
      }),
      [nodeId]
    ),
    shallow // shallow 비교로 성능 최적화
  );
};
```

## 접근성 (Accessibility)

### 1. 키보드 네비게이션

```typescript
// 키보드 단축키 시스템
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + 키 조합
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'a':
            e.preventDefault();
            selectAllNodes();
            break;
          case 's':
            e.preventDefault();
            saveSession();
            break;
        }
      }
    
      // 단일 키
      switch (e.key) {
        case 'Delete':
          deleteSelectedNodes();
          break;
        case 'Escape':
          clearSelection();
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

### 2. ARIA 라벨링

```typescript
// 마인드맵 노드 접근성
const AccessibleMindmapNode: React.FC<NodeProps> = ({ node, selected }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  return (
    <div
      ref={nodeRef}
      role="treeitem"
      tabIndex={selected ? 0 : -1}
      aria-selected={selected}
      aria-label={`노드: ${node.title}, 타입: ${node.type}, 레벨: ${node.level}`}
      aria-describedby={`node-content-${node.id}`}
      className="mindmap-node"
    >
      <div id={`node-content-${node.id}`} className="node-content">
        <h3 className="node-title">{node.title}</h3>
        {node.content && (
          <p className="node-description">{node.content}</p>
        )}
      </div>
    </div>
  );
};
```

### 3. 스크린 리더 지원

```typescript
// 라이브 영역으로 동적 상태 알림
const LiveAnnouncements: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    const handleNodeAdd = (event: CustomEvent) => {
      setAnnouncement(`새 노드 "${event.detail.title}"이 추가되었습니다.`);
    };
  
    const handleNodeDelete = (event: CustomEvent) => {
      setAnnouncement(`노드 "${event.detail.title}"이 삭제되었습니다.`);
    };
  
    window.addEventListener('node-add', handleNodeAdd);
    window.addEventListener('node-delete', handleNodeDelete);
  
    return () => {
      window.removeEventListener('node-add', handleNodeAdd);
      window.removeEventListener('node-delete', handleNodeDelete);
    };
  }, []);
  
  return (
    <div 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
```

## 보안 및 모범 사례

### 1. XSS 방지

```typescript
// 사용자 입력 새니타이제이션
import DOMPurify from 'dompurify';

const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};

// 안전한 HTML 렌더링
const SafeHtmlRenderer: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => 
    sanitizeUserInput(content), 
    [content]
  );
  
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizedContent 
      }} 
    />
  );
};
```

### 2. API 보안

```typescript
// API 요청 인증 및 검증
class SecureApiService extends ApiService {
  constructor() {
    super({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF 방지
        'Authorization': `Bearer ${this.getValidToken()}`
      }
    });
  }
  
  private getValidToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token || this.isTokenExpired(token)) {
      this.redirectToLogin();
      throw new Error('Invalid or expired token');
    }
    return token;
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

### 3. 환경 변수 보안

```typescript
// 환경 변수 검증 및 타입 안전성
interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'staging' | 'production';
}

const validateConfig = (): AppConfig => {
  const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    environment: import.meta.env.MODE as 'development' | 'staging' | 'production'
  };
  
  // 필수 환경 변수 검증
  const requiredKeys = ['apiBaseUrl', 'supabaseUrl', 'supabaseAnonKey'];
  const missingKeys = requiredKeys.filter(key => !config[key as keyof AppConfig]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
  
  return config;
};

export const appConfig = validateConfig();
```

## 결론

### 🎯 핵심 특징

1. **모던 기술 스택**: React 19 + TypeScript + Vite를 활용한 최신 개발 환경
2. **고도화된 상호작용**: ReactFlow 기반 2,461라인의 정교한 마인드맵 캔버스
3. **지능형 상태 관리**: Zustand를 통한 효율적이고 타입 안전한 상태 관리
4. **컴포넌트 시스템**: Radix UI 기반의 접근성을 고려한 재사용 가능한 컴포넌트
5. **AI 통합**: 백엔드 AI 서비스와의 seamless한 통합으로 지능형 마인드맵 생성

### 🚀 기술적 우수성

1. **성능 최적화**: 코드 분할, 메모이제이션, 가상화를 통한 최적화
2. **접근성**: WCAG 지침을 준수한 키보드 네비게이션 및 스크린 리더 지원
3. **타입 안전성**: 전체 애플리케이션에 걸친 엄격한 TypeScript 타이핑
4. **테스팅**: Jest + Testing Library를 통한 포괄적인 테스트 커버리지
5. **보안**: XSS 방지, API 보안, 환경 변수 보안 등 종합적인 보안 대책

### 🌟 사용자 경험

1. **직관적 인터페이스**: 드래그 앤 드롭, 컨텍스트 메뉴, 키보드 단축키 지원
2. **실시간 피드백**: Toast 알림, 로딩 상태, 에러 핸들링을 통한 즉각적 피드백
3. **테마 지원**: Dark/Light 모드 동적 전환으로 개인화된 사용 경험
4. **세션 지속성**: 자동 저장 및 로드를 통한 작업 연속성 보장
5. **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
