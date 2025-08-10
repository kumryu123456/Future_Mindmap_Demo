// API Request/Response Types
export interface ParseInputRequest {
  input: string;
  context?: string;
  options?: {
    format?: 'json' | 'xml' | 'text';
    includeMetadata?: boolean;
    maxTokens?: number;
  };
}

export interface ParseInputResponse {
  success: boolean;
  data?: {
    parsedContent: Record<string, unknown>;
    metadata?: {
      tokenCount: number;
      processingTime: number;
      contentType: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// API Configuration
export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request options
export interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | string;
  timeout?: number;
}

// Enterprise Data Types
export interface EnterpriseDataRequest {
  organizationId: string;
  dataType: 'mindmaps' | 'templates' | 'analytics' | 'users' | 'projects' | 'all';
  filters?: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    userId?: string;
    projectId?: string;
    tags?: string[];
    status?: 'active' | 'archived' | 'draft';
  };
  options?: {
    includeMetadata?: boolean;
    includeShared?: boolean;
    pagination?: {
      page: number;
      limit: number;
    };
    sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'usage';
    sortOrder?: 'asc' | 'desc';
  };
}

export interface EnterpriseDataResponse {
  success: boolean;
  data?: {
    organizationId: string;
    dataType: string;
    items: EnterpriseItem[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    };
    metadata?: {
      fetchTime: number;
      cacheStatus: 'hit' | 'miss' | 'refresh';
      dataVersion: string;
      lastUpdated: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface EnterpriseItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'active' | 'archived' | 'draft';
  tags?: string[];
  metadata?: Record<string, unknown>;
  content?: Record<string, unknown>;
  sharing?: {
    isShared: boolean;
    sharedWith: string[];
    permissions: ('view' | 'edit' | 'admin')[];
  };
  analytics?: {
    viewCount: number;
    editCount: number;
    lastAccessed: string;
    collaborators: number;
  };
}

// Enterprise Organization Info
export interface EnterpriseOrganization {
  id: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  features: string[];
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    apiRateLimit: number;
  };
  settings: {
    allowSharing: boolean;
    enforceSSO: boolean;
    dataRetention: number;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

// Plan Generation Types
export interface GeneratePlanRequest {
  projectType: 'business' | 'marketing' | 'product' | 'technical' | 'personal' | 'academic';
  objective: string;
  context?: {
    industry?: string;
    timeline?: string;
    budget?: string;
    teamSize?: number;
    constraints?: string[];
    requirements?: string[];
  };
  preferences?: {
    planStyle?: 'detailed' | 'high-level' | 'agile' | 'waterfall' | 'hybrid';
    includeTimelines?: boolean;
    includeMilestones?: boolean;
    includeResources?: boolean;
    includeRisks?: boolean;
    detailLevel?: 'basic' | 'intermediate' | 'comprehensive';
  };
  options?: {
    format?: 'structured' | 'mindmap' | 'gantt' | 'kanban';
    maxSteps?: number;
    includeMetadata?: boolean;
    generateAlternatives?: boolean;
  };
}

export interface GeneratePlanResponse {
  success: boolean;
  data?: {
    plan: PlanStructure;
    alternatives?: PlanStructure[];
    metadata?: {
      generationTime: number;
      complexity: 'low' | 'medium' | 'high';
      confidence: number;
      version: string;
      generatedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PlanStructure {
  id: string;
  title: string;
  objective: string;
  projectType: string;
  overview: string;
  phases: PlanPhase[];
  timeline?: {
    totalDuration: string;
    startDate?: string;
    endDate?: string;
  };
  resources?: {
    team: TeamRole[];
    budget?: BudgetBreakdown;
    tools?: string[];
    infrastructure?: string[];
  };
  risks?: RiskAssessment[];
  success_criteria?: string[];
  deliverables?: Deliverable[];
}

export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  order: number;
  dependencies?: string[];
  tasks: PlanTask[];
  milestones?: Milestone[];
  deliverables?: string[];
}

export interface PlanTask {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  assignedTo?: string;
  dependencies?: string[];
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  tags?: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate?: string;
  criteria: string[];
  dependencies?: string[];
}

export interface TeamRole {
  role: string;
  skills: string[];
  responsibilities: string[];
  allocation: number; // percentage or hours
  level: 'junior' | 'mid' | 'senior' | 'lead';
}

export interface BudgetBreakdown {
  total: number;
  currency: string;
  categories: {
    personnel: number;
    technology: number;
    marketing?: number;
    operations?: number;
    contingency?: number;
    other?: number;
  };
}

export interface RiskAssessment {
  id: string;
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  contingency?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'software' | 'process' | 'training' | 'other';
  dueDate?: string;
  quality_criteria?: string[];
}

// Auto Expansion Types
export interface AutoExpandRequest {
  content: {
    type: 'mindmap' | 'outline' | 'text' | 'concept' | 'plan';
    data: Record<string, unknown>;
    context?: {
      subject?: string;
      domain?: string;
      audience?: string;
      purpose?: string;
    };
  };
  expansionOptions: {
    direction?: 'breadth' | 'depth' | 'both';
    maxNodes?: number;
    levels?: number;
    categories?: string[];
    includeRelated?: boolean;
    includeExamples?: boolean;
    includeDetails?: boolean;
  };
  preferences?: {
    creativity?: 'conservative' | 'moderate' | 'creative';
    technicality?: 'basic' | 'intermediate' | 'advanced';
    priority?: 'relevance' | 'completeness' | 'novelty';
    format?: 'structured' | 'natural' | 'hierarchical';
  };
  constraints?: {
    excludeTopics?: string[];
    focusAreas?: string[];
    maxDepth?: number;
    timeLimit?: number;
  };
}

export interface AutoExpandResponse {
  success: boolean;
  data?: {
    expandedContent: ExpandedContent;
    suggestions?: ExpansionSuggestion[];
    metadata?: {
      expansionTime: number;
      nodesAdded: number;
      categoriesFound: number;
      confidence: number;
      completeness: number;
      version: string;
      generatedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ExpandedContent {
  id: string;
  type: string;
  title: string;
  originalNodes: ContentNode[];
  expandedNodes: ContentNode[];
  relationships: NodeRelationship[];
  categories: ContentCategory[];
  summary: {
    totalNodes: number;
    newNodes: number;
    expansionRatio: number;
    mainTopics: string[];
  };
}

export interface ContentNode {
  id: string;
  title: string;
  description?: string;
  type: 'original' | 'expanded' | 'related';
  level: number;
  parentId?: string;
  children?: string[];
  category?: string;
  keywords?: string[];
  confidence?: number;
  relevance?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    source?: string;
    addedAt?: string;
    expansionReason?: string;
  };
}

export interface NodeRelationship {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'parent-child' | 'sibling' | 'related' | 'dependency' | 'example';
  strength: number; // 0-1
  direction?: 'bidirectional' | 'forward' | 'backward';
  label?: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  subcategories?: string[];
  color?: string;
  icon?: string;
}

export interface ExpansionSuggestion {
  id: string;
  type: 'add_node' | 'add_relationship' | 'merge_nodes' | 'split_node' | 'add_category';
  title: string;
  description: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  targetNodeId?: string;
  suggestedContent?: Record<string, unknown>;
}

// RAG (Retrieval-Augmented Generation) Detail Types
export interface RAGDetailRequest {
  query: {
    text: string;
    context?: {
      domain?: string;
      topic?: string;
      scope?: 'narrow' | 'broad' | 'comprehensive';
      intent?: 'research' | 'explanation' | 'analysis' | 'comparison' | 'summary';
    };
  };
  retrievalOptions: {
    sources?: readonly ('documents' | 'web' | 'knowledge_base' | 'database')[];
    maxSources?: number;
    relevanceThreshold?: number;
    recency?: 'any' | 'recent' | 'latest';
    languages?: string[];
    includeMetadata?: boolean;
  };
  generationOptions: {
    detailLevel?: 'brief' | 'standard' | 'comprehensive' | 'exhaustive';
    perspective?: 'neutral' | 'analytical' | 'critical' | 'comparative';
    format?: 'structured' | 'narrative' | 'bullet_points' | 'academic';
    includeReferences?: boolean;
    includeCitations?: boolean;
    includeRelated?: boolean;
  };
  filters?: {
    dateRange?: {
      startDate?: string;
      endDate?: string;
    };
    authorityLevel?: 'any' | 'verified' | 'authoritative';
    contentTypes?: string[];
    excludeDomains?: string[];
    includeDomains?: string[];
  };
}

export interface RAGDetailResponse {
  success: boolean;
  data?: {
    detailedResponse: DetailedResponse;
    sources: RetrievedSource[];
    relatedQueries?: string[];
    metadata?: {
      processingTime: number;
      sourcesRetrieved: number;
      sourcesUsed: number;
      confidenceScore: number;
      completenessScore: number;
      version: string;
      generatedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface DetailedResponse {
  id: string;
  query: string;
  answer: string;
  summary: string;
  keyPoints: string[];
  sections: ResponseSection[];
  analysis?: {
    strengths: string[];
    limitations: string[];
    gaps: string[];
    contradictions?: string[];
  };
  recommendations?: string[];
  followUpQuestions?: string[];
}

export interface ResponseSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'main_point' | 'example' | 'evidence' | 'analysis' | 'conclusion';
  sources: string[]; // Source IDs
  confidence: number;
  relevance: number;
}

export interface RetrievedSource {
  id: string;
  title: string;
  url?: string;
  content: string;
  snippet: string;
  type: 'document' | 'web_page' | 'article' | 'paper' | 'book' | 'database_entry';
  author?: string;
  publishDate?: string;
  domain?: string;
  relevanceScore: number;
  authorityScore: number;
  recencyScore: number;
  metadata?: {
    wordCount?: number;
    language?: string;
    category?: string;
    tags?: string[];
    sourceQuality?: 'high' | 'medium' | 'low';
  };
  citations?: Citation[];
}

export interface Citation {
  id: string;
  sourceId: string;
  text: string;
  context: string;
  pageNumber?: number;
  sectionTitle?: string;
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';
}

// Session Management Types
export interface SaveSessionRequest {
  session: {
    id?: string;
    name: string;
    description?: string;
    type: 'mindmap' | 'project' | 'research' | 'planning' | 'brainstorming' | 'analysis';
    status: 'active' | 'paused' | 'completed' | 'archived';
  };
  data: {
    mindmapData?: Record<string, unknown>;
    projectData?: Record<string, unknown>;
    userInputs?: UserInput[];
    apiCalls?: ApiCallRecord[];
    preferences?: UserPreferences;
    progress?: SessionProgress;
  };
  metadata: {
    userId?: string;
    organizationId?: string;
    collaborators?: string[];
    tags?: string[];
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  options?: {
    autoSave?: boolean;
    compression?: 'none' | 'gzip' | 'brotli';
    encryption?: boolean;
    backup?: boolean;
    versionControl?: boolean;
    notifications?: boolean;
  };
}

export interface SaveSessionResponse {
  success: boolean;
  data?: {
    session: SavedSession;
    backup?: {
      backupId: string;
      backupUrl?: string;
      timestamp: string;
    };
    metadata?: {
      saveTime: number;
      dataSize: number;
      compressionRatio?: number;
      version: string;
      checksum?: string;
      savedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SavedSession {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  userId?: string;
  organizationId?: string;
  collaborators: string[];
  tags: string[];
  category?: string;
  priority: string;
  dataSize: number;
  version: number;
  isShared: boolean;
  permissions: SessionPermission[];
  analytics: SessionAnalytics;
}

export interface UserInput {
  id: string;
  type: 'text' | 'voice' | 'upload' | 'selection' | 'interaction';
  content: string;
  timestamp: string;
  metadata?: {
    source?: string;
    format?: string;
    language?: string;
    confidence?: number;
  };
}

export interface ApiCallRecord {
  id: string;
  endpoint: string;
  method: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  requestSize: number;
  responseSize: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    cacheStatus?: 'hit' | 'miss';
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  display: {
    density: 'compact' | 'standard' | 'comfortable';
    animations: boolean;
    shortcuts: boolean;
  };
  privacy: {
    analytics: boolean;
    sharing: boolean;
    publicProfile: boolean;
  };
}

export interface SessionProgress {
  currentStep: number;
  totalSteps: number;
  completedTasks: string[];
  pendingTasks: string[];
  milestones: ProgressMilestone[];
  timeSpent: number; // in seconds
  estimatedTimeRemaining?: number;
}

export interface ProgressMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
  completedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progress: number; // 0-100
}

export interface SessionPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  permissions: ('read' | 'write' | 'delete' | 'share' | 'admin')[];
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export interface SessionAnalytics {
  totalViews: number;
  uniqueViewers: number;
  editCount: number;
  shareCount: number;
  collaborationTime: number;
  activityLog: ActivityLogEntry[];
  usageStats: {
    dailyActiveTime: number;
    weeklyActiveTime: number;
    monthlyActiveTime: number;
    lastActiveDate: string;
  };
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: 'view' | 'edit' | 'share' | 'comment' | 'collaborate' | 'export' | 'delete';
  timestamp: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Session Loading Types
export interface LoadSessionRequest {
  sessionId: string;
  options?: {
    includeData?: boolean;
    includeAnalytics?: boolean;
    includeCollaborators?: boolean;
    includeHistory?: boolean;
    includeBackups?: boolean;
    dataCompression?: 'auto' | 'none' | 'gzip' | 'brotli';
    version?: number;
    accessLevel?: 'read' | 'write' | 'admin';
  };
  filters?: {
    dataTypes?: readonly ('mindmapData' | 'projectData' | 'userInputs' | 'apiCalls' | 'preferences')[];
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    userId?: string;
    includeDeleted?: boolean;
  };
  metadata?: {
    requesterId?: string;
    organizationId?: string;
    clientInfo?: {
      userAgent?: string;
      ipAddress?: string;
      platform?: string;
      version?: string;
    };
  };
}

export interface LoadSessionResponse {
  success: boolean;
  data?: {
    session: LoadedSession;
    collaborators?: SessionCollaborator[];
    history?: SessionHistoryEntry[];
    backups?: SessionBackup[];
    permissions?: SessionPermissionCheck[];
    metadata?: {
      loadTime: number;
      dataSize: number;
      compressionUsed?: string;
      version: string;
      lastModified: string;
      accessLevel: string;
      loadedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface LoadedSession {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  userId?: string;
  organizationId?: string;
  collaborators: string[];
  tags: string[];
  category?: string;
  priority: string;
  dataSize: number;
  version: number;
  isShared: boolean;
  data?: {
    mindmapData?: Record<string, unknown>;
    projectData?: Record<string, unknown>;
    userInputs?: UserInput[];
    apiCalls?: ApiCallRecord[];
    preferences?: UserPreferences;
    progress?: SessionProgress;
  };
  permissions: SessionPermission[];
  analytics?: SessionAnalytics;
  settings?: SessionSettings;
}

export interface SessionCollaborator {
  userId: string;
  username?: string;
  email?: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  joinedAt: string;
  lastActiveAt?: string;
  status: 'active' | 'invited' | 'inactive';
  permissions: string[];
  contributionStats: {
    editsCount: number;
    commentsCount: number;
    timeSpent: number;
    lastContribution?: string;
  };
}

export interface SessionHistoryEntry {
  id: string;
  sessionId: string;
  version: number;
  action: 'created' | 'updated' | 'shared' | 'archived' | 'restored' | 'deleted';
  userId: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
    changeType: 'added' | 'modified' | 'deleted';
  }[];
  metadata?: {
    clientInfo?: Record<string, unknown>;
    changeSize?: number;
    description?: string;
  };
}

export interface SessionBackup {
  id: string;
  sessionId: string;
  version: number;
  createdAt: string;
  size: number;
  type: 'auto' | 'manual' | 'scheduled';
  status: 'available' | 'archived' | 'deleted';
  location?: string;
  checksum?: string;
  metadata?: {
    triggerEvent?: string;
    retentionDate?: string;
    compressionRatio?: number;
  };
}

export interface SessionPermissionCheck {
  userId: string;
  sessionId: string;
  permissions: string[];
  granted: boolean;
  reason?: string;
  restrictions?: {
    timeLimit?: string;
    accessCount?: number;
    ipWhitelist?: string[];
    features?: string[];
  };
}

export interface SessionSettings {
  autoSave: boolean;
  saveInterval: number;
  maxVersions: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  collaborationSettings: {
    allowInvites: boolean;
    defaultPermissions: string[];
    requireApproval: boolean;
    maxCollaborators: number;
  };
  notificationSettings: {
    onEdit: boolean;
    onComment: boolean;
    onShare: boolean;
    onMention: boolean;
  };
}

// Session Query Types
export interface SessionQueryRequest {
  query?: {
    userId?: string;
    organizationId?: string;
    type?: string[];
    status?: string[];
    tags?: string[];
    category?: string;
    priority?: string[];
    isShared?: boolean;
    hasCollaborators?: boolean;
  };
  filters?: {
    dateRange?: {
      startDate: string;
      endDate: string;
      field?: 'createdAt' | 'updatedAt' | 'lastAccessedAt';
    };
    sizeRange?: {
      minSize?: number;
      maxSize?: number;
    };
    versionRange?: {
      minVersion?: number;
      maxVersion?: number;
    };
    collaboratorCount?: {
      min?: number;
      max?: number;
    };
    activityLevel?: 'low' | 'medium' | 'high';
  };
  options?: {
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'priority' | 'activity';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    includeAnalytics?: boolean;
    includePreview?: boolean;
  };
}

export interface SessionQueryResponse {
  success: boolean;
  data?: {
    sessions: SessionSummary[];
    totalCount: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasMore: boolean;
      limit: number;
      offset: number;
    };
    aggregations?: {
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
      totalSize: number;
      averageSize: number;
    };
    metadata?: {
      queryTime: number;
      cacheHit: boolean;
      version: string;
      generatedAt: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SessionSummary {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  tags: string[];
  category?: string;
  priority: string;
  dataSize: number;
  version: number;
  isShared: boolean;
  collaboratorCount: number;
  preview?: {
    thumbnailUrl?: string;
    keyData?: Record<string, unknown>;
    summary?: string;
  };
  analytics?: {
    totalViews: number;
    lastAccessed?: string;
    activityScore: number;
  };
}