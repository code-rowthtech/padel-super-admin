// TypeScript type definitions for OpenMatches component

export interface User {
  _id: string;
  id?: string;
  token?: string;
  profilePic?: string;
  name?: string;
}

export interface Club {
  _id: string;
  clubName: string;
  city: string;
  zipCode?: string;
}

export interface SlotTime {
  time: string;
  amount: number;
  _id?: string;
}

export interface Court {
  slotTimes: SlotTime[];
  _id?: string;
}

export interface Player {
  userId: User;
  name?: string;
  profilePic?: string;
  _id?: string;
}

export interface Team {
  players: Player[];
  _id?: string;
}

export interface Match {
  _id: string;
  matchDate: string;
  matchTime?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  gender?: 'male' | 'female' | 'mixed';
  clubId: Club;
  teamA: Player[];
  teamB: Player[];
  slot: Court[];
  players?: Player[];
  updatedAt?: string;
  formattedMatchTime?: string;
  [key: string]: any;
}

export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    Excellent?: number;
    Good?: number;
    Average?: number;
    Below?: number;
    Poor?: number;
  };
}

export interface DateInfo {
  fullDate: string;
  day: string;
  date?: number;
  month?: string;
}

export interface FilterOptions {
  level: string;
  time: string | null;
  date: string | null;
  matchFilter: 'all' | 'my';
}

export interface MatchFilter {
  level: string | null;
  time: string | null;
  matchFilter: string;
}

export interface TabConfig {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  key: string;
}

export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  reRenderCount: number;
}

export interface OptimisticUpdate {
  matchId: string;
  update: Partial<Match>;
  timestamp: number;
  isOptimistic: boolean;
  hasError?: boolean;
}

export interface ViewMode {
  mode: 'grid' | 'list' | 'map';
  label: string;
  icon: string;
}

// Component Props Types
export interface MatchCardProps {
  match: Match;
  index: number;
  onViewMatch: (match: Match) => void;
  onJoinTeam: (match: Match, team: string) => void;
  showShareDropdown: string | null;
  setShowShareDropdown: (dropdown: string | null) => void;
  matchCardRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
}

export interface PlayerAvatarProps {
  player: Player;
  idx: number;
  total: number;
  size?: number;
}

export interface DateSelectorProps {
  selectedDate: DateInfo | null;
  setSelectedDate: (date: DateInfo) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  dateRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  getMatchesUser: any;
  clubId: string | null;
  user: User | null;
  matchFilter: string;
  dispatch: any;
  setSelectedTime: (time: string | null) => void;
}

export interface FilterControlsProps {
  matchFilter: string;
  setMatchFilter: (filter: string) => void;
  selectedLevel: string | null;
  setSelectedLevel: (level: string | null) => void;
  showCreateButton: boolean;
  onCreateMatches: () => void;
  onHideCreateButton: () => void;
}

export interface RatingDisplayProps {
  reviewData: ReviewData | undefined;
  reviewLoading: boolean;
}

export interface VirtualizedMatchListProps {
  matches: Match[];
  onViewMatch: (match: Match) => void;
  onJoinTeam: (match: Match, team: string) => void;
  showShareDropdown: string | null;
  setShowShareDropdown: (dropdown: string | null) => void;
  matchCardRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  isLoading?: boolean;
}

// Utility function types
export type MatchFilterFunction = (matches: Match[], filters: FilterOptions) => Match[];
export type SortFunction = (matches: Match[], sorting: { field: string; direction: 'asc' | 'desc' }) => Match[];

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface MatchesApiResponse {
  data: Match[];
  success: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

// Error types
export interface OpenMatchesError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Performance monitoring types
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  memoryUsage: number;
  timestamp: number;
}

export interface BundleAnalysis {
  componentName: string;
  bundleSize: number;
  gzipSize: number;
  loadTime: number;
  timestamp: number;
}

// Web Worker message types
export interface WorkerMessage {
  type: 'CALCULATE_PRICES' | 'FILTER_MATCHES' | 'SORT_MATCHES' | 'ANALYZE_PERFORMANCE';
  payload: any;
  id: string;
}

export interface WorkerResponse {
  type: 'RESULT' | 'ERROR';
  payload: any;
  id: string;
  error?: string;
}

// Configuration types
export interface OpenMatchesConfig {
  enableVirtualScrolling: boolean;
  enablePerformanceMonitoring: boolean;
  enableOptimisticUpdates: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  cacheTimeout: number;
  debounceDelay: number;
}

// Hook return types
export interface UseMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  pagination: PaginationInfo;
  performance: PerformanceMetrics;
  actions: {
    fetchMatches: (params?: any) => Promise<void>;
    setFilters: (filters: Partial<FilterOptions>) => void;
    setPagination: (pagination: Partial<PaginationInfo>) => void;
    updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
    refreshMatches: () => void;
  };
}

export interface UsePerformanceReturn {
  metrics: PerformanceMetrics;
  startMeasure: (label: string) => void;
  endMeasure: (label: string) => number;
  logMetrics: () => void;
  resetMetrics: () => void;
}

// Event types
export interface MatchEvent {
  type: 'view' | 'join' | 'share' | 'filter' | 'sort' | 'page_change';
  matchId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties: {
    component: string;
    action: string;
    value?: any;
    userId?: string;
    sessionId: string;
    timestamp: number;
  };
}

// Common type exports are already done above
