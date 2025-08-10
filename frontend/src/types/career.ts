// Career-related TypeScript type definitions

export interface CareerNode {
  id: string;
  type: 'center' | 'major' | 'detail' | 'goal';
  title: string;
  description?: string;
  x: number;
  y: number;
  color: string;
  connections: string[]; // Array of connected node IDs
  level: number; // Hierarchy level (0 = center, 1 = major, 2 = detail, 3 = goal)
  metadata?: {
    skills?: string[];
    timeframe?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    resources?: Resource[];
  };
}

export interface Resource {
  id: string;
  type: 'course' | 'certification' | 'book' | 'website' | 'tool';
  title: string;
  url?: string;
  description?: string;
  rating?: number;
  price?: string;
  provider?: string;
}

export interface CareerMap {
  id: string;
  userId: string;
  title: string;
  description: string;
  nodes: CareerNode[];
  connections: NodeConnection[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  likes: number;
  tags: string[];
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'sequential' | 'parallel' | 'optional';
}

export interface NodeDetails {
  node: CareerNode;
  relatedInfo: InfoData;
  reviews: ReviewData[];
  suggestions: string[];
}

export interface InfoData {
  id: string;
  nodeId: string;
  type: 'skill' | 'certification' | 'education' | 'experience';
  title: string;
  description: string;
  resources: Resource[];
  requirements: string[];
  benefits: string[];
  timeEstimate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  marketDemand: 'low' | 'medium' | 'high';
  averageSalary?: string;
  relatedRoles: string[];
}

export interface ReviewData {
  id: string;
  nodeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: string;
  tags: string[];
  verified: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  currentRole?: string;
  company?: string;
  location?: string;
  experience: string;
  skills: string[];
  interests: string[];
  careerMaps: string[]; // Array of CareerMap IDs
  socialLinks: SocialLink[];
  createdAt: string;
  isPublic: boolean;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'blog' | 'other';
  url: string;
  label?: string;
}

// API Request/Response Types
export interface GenerateCareerMapRequest {
  input: string;
  preferences?: {
    timeframe?: string;
    experience?: 'beginner' | 'intermediate' | 'experienced';
    focus?: string[];
  };
}

export interface GenerateCareerMapResponse {
  success: boolean;
  careerMap: CareerMap;
  message?: string;
}

export interface UpdateNodeRequest {
  nodeId: string;
  updates: Partial<CareerNode>;
  aiAssist?: boolean;
  context?: string;
}

export interface UpdateNodeResponse {
  success: boolean;
  node: CareerNode;
  suggestions?: string[];
  message?: string;
}

export interface FilterOptions {
  search?: string;
  tags?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  timeframe?: string[];
  sortBy?: 'popular' | 'recent' | 'similar';
  limit?: number;
  offset?: number;
}

export interface CareerListResponse {
  success: boolean;
  careerMaps: CareerMap[];
  total: number;
  hasMore: boolean;
}

export interface SimilarityScore {
  careerMapId: string;
  score: number;
  commonTags: string[];
  commonNodes: string[];
}

// UI State Types
export interface CareerUIState {
  activeNodeId?: string;
  selectedNodes: string[];
  sidebarView: 'info' | 'reviews';
  isEditing: boolean;
  isDragging: boolean;
  showSuggestions: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}