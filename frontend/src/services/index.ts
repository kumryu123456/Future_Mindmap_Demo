// Export all API services
export { apiService, default as ApiService } from './api';
export { 
  parseInput, 
  parseInputSimple, 
  parseInputForMindmap 
} from './parseInputApi';
export {
  fetchEnterprise,
  fetchEnterpriseMindmaps,
  fetchEnterpriseAnalytics,
  fetchEnterpriseUsers,
  fetchEnterpriseProjects
} from './enterpriseApi';
export {
  generatePlan,
  generateBusinessPlan,
  generateMarketingPlan,
  generateTechnicalPlan,
  generateProductPlan,
  generatePersonalPlan,
  generateAcademicPlan
} from './generatePlanApi';
export {
  autoExpand,
  autoExpandMindmap,
  autoExpandText,
  autoExpandConcept,
  autoExpandOutline,
  autoExpandFocused,
  autoExpandCreative
} from './autoExpandApi';
export {
  ragDetail,
  ragResearch,
  ragExplain,
  ragCompare,
  ragAnalyze,
  ragSummarize,
  ragRecent,
  ragDomainSpecific
} from './ragDetailApi';
export {
  saveSession,
  saveMindmapSession,
  saveProjectSession,
  saveResearchSession,
  savePlanningSession,
  saveBrainstormingSession,
  saveAnalysisSession,
  autoSaveSession,
  saveCollaborativeSession
} from './saveSessionApi';
export {
  loadSession,
  loadSessionBasic,
  loadSessionFull,
  loadSessionForEdit,
  loadSessionHistory,
  loadSessionCollaborators,
  loadSessionPreview,
  querySessions,
  getUserSessions,
  getSharedSessions,
  getRecentSessions,
  searchSessions
} from './loadSessionApi';

// Re-export types for convenience
export type {
  ParseInputRequest,
  ParseInputResponse,
  EnterpriseDataRequest,
  EnterpriseDataResponse,
  EnterpriseItem,
  EnterpriseOrganization,
  GeneratePlanRequest,
  GeneratePlanResponse,
  PlanStructure,
  PlanPhase,
  PlanTask,
  Milestone,
  TeamRole,
  BudgetBreakdown,
  RiskAssessment,
  Deliverable,
  AutoExpandRequest,
  AutoExpandResponse,
  ExpandedContent,
  ContentNode,
  NodeRelationship,
  ContentCategory,
  ExpansionSuggestion,
  ApiResponse,
  ApiConfig,
  RequestOptions,
  HttpMethod,
  SaveSessionRequest,
  SaveSessionResponse,
  SavedSession,
  UserInput,
  ApiCallRecord,
  UserPreferences,
  SessionProgress,
  ProgressMilestone,
  SessionPermission,
  SessionAnalytics,
  ActivityLogEntry,
  LoadSessionRequest,
  LoadSessionResponse,
  LoadedSession,
  SessionCollaborator,
  SessionHistoryEntry,
  SessionBackup,
  SessionPermissionCheck,
  SessionSettings,
  SessionQueryRequest,
  SessionQueryResponse,
  SessionSummary
} from '../types/api';