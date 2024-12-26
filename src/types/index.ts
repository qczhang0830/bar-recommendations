export interface Recommendation {
  id: string;
  content: string;
  avatar: string;
  likes: number;
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

export interface AnalyticsData {
  totalViews: number;
  averageStayTime: number;
  averageCardsViewed: number;
  totalLikes: number;
  barStats: {
    barId: string;
    barName: string;
    views: number;
    averageStayTime: number;
    likes: number;
    recommendationStats: {
      recommendationId: string;
      content: string;
      views: number;
      likes: number;
    }[];
  }[];
}

export interface InteractionRecord {
  timestamp: number;
  value: number;
}

export interface InteractionStats {
  cardViews: { [barId: string]: InteractionRecord[] };
  recommendationViews: { [recommendationId: string]: InteractionRecord[] };
  recommendationLikes: { [recommendationId: string]: InteractionRecord[] };
  modalStayTimes: { [barId: string]: InteractionRecord[] };
  totalCardViews: number;
  uniqueCardViews: Set<string>;
} 