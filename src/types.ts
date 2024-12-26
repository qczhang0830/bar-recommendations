export interface InteractionRecord {
  timestamp: number;
  value: number;
}

export interface InteractionStats {
  pageViews: InteractionRecord[];
  pageStayTimes: InteractionRecord[];
  cardViews: { [key: string]: InteractionRecord[] };
  recommendationViews: { [key: string]: InteractionRecord[] };
  recommendationLikes: { [key: string]: InteractionRecord[] };
  modalStayTimes: { [key: string]: InteractionRecord[] };
  uniqueCardViews: Set<string>;
}

export interface AnalyticsData {
  totalPageViews: number;
  averagePageStayTime: number;
  totalLikes: number;
  uniqueCardViewsPerVisit: number;
  barStats: BarStat[];
}

export interface BarStat {
  barId: string;
  barName: string;
  views: number;
  averageStayTime: number;
  likes: number;
  recommendationStats: RecommendationStat[];
}

export interface RecommendationStat {
  recommendationId: string;
  content: string;
  views: number;
  likes: number;
  barId: string;
  barName: string;
}

export interface Bar {
  id: string;
  name: string;
  image: string;
  area: string;
  type: string;
  tags: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  content: string;
  avatar: string;
  likes: number;
} 