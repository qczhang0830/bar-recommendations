import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { InteractionStats } from '../types';

interface InteractionStats {
  pageViews: InteractionRecord[];  // 新增：页面浏览记录
  pageStayTimes: InteractionRecord[];  // 新增：页面停留时间
  cardViews: { [key: string]: InteractionRecord[] };
  recommendationViews: { [key: string]: InteractionRecord[] };
  recommendationLikes: { [key: string]: InteractionRecord[] };
  modalStayTimes: { [key: string]: InteractionRecord[] };
  uniqueCardViews: Set<string>;
}

interface StatsContextType {
  stats: InteractionStats;
  incrementCardView: (barId: string) => void;
  incrementRecommendationView: (recommendationId: string) => void;
  toggleRecommendationLike: (recommendationId: string) => void;
  recordModalStayTime: (barId: string, duration: number) => void;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<InteractionStats>(() => {
    try {
      const savedStats = localStorage.getItem('analyticsStats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        return {
          cardViews: parsed.cardViews || {},
          recommendationViews: parsed.recommendationViews || {},
          recommendationLikes: parsed.recommendationLikes || {},
          modalStayTimes: parsed.modalStayTimes || {},
          totalCardViews: parsed.totalCardViews || 0,
          uniqueCardViews: new Set(parsed.uniqueCardViews || [])
        };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    return {
      cardViews: {},
      recommendationViews: {},
      recommendationLikes: {},
      modalStayTimes: {},
      totalCardViews: 0,
      uniqueCardViews: new Set()
    };
  });

  useEffect(() => {
    try {
      const statsForStorage = {
        ...stats,
        uniqueCardViews: Array.from(stats.uniqueCardViews)
      };
      localStorage.setItem('analyticsStats', JSON.stringify(statsForStorage));
      console.log('Stats updated:', stats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }, [stats]);

  const incrementCardView = useCallback((barId: string) => {
    setStats(prev => ({
      ...prev,
      cardViews: {
        ...prev.cardViews,
        [barId]: Array.isArray(prev.cardViews[barId])
          ? [...prev.cardViews[barId], { timestamp: Date.now(), value: 1 }]
          : [{ timestamp: Date.now(), value: 1 }]
      },
      totalCardViews: prev.totalCardViews + 1,
      uniqueCardViews: new Set([...prev.uniqueCardViews, barId])
    }));
  }, []);

  const incrementRecommendationView = useCallback((recommendationId: string) => {
    setStats(prev => ({
      ...prev,
      recommendationViews: {
        ...prev.recommendationViews,
        [recommendationId]: Array.isArray(prev.recommendationViews[recommendationId])
          ? [...prev.recommendationViews[recommendationId], { timestamp: Date.now(), value: 1 }]
          : [{ timestamp: Date.now(), value: 1 }]
      }
    }));
  }, []);

  const toggleRecommendationLike = useCallback((recommendationId: string) => {
    setStats(prev => {
      const currentLikes = Array.isArray(prev.recommendationLikes[recommendationId])
        ? prev.recommendationLikes[recommendationId]
        : [];
      
      const lastLike = currentLikes.length > 0 
        ? currentLikes[currentLikes.length - 1] 
        : null;
      
      const isLiked = lastLike && lastLike.value > 0;

      return {
        ...prev,
        recommendationLikes: {
          ...prev.recommendationLikes,
          [recommendationId]: [
            ...currentLikes,
            { timestamp: Date.now(), value: isLiked ? -1 : 1 }
          ]
        }
      };
    });
  }, []);

  const recordModalStayTime = useCallback((barId: string, duration: number) => {
    console.log('Recording modal stay time:', { barId, duration });
    if (duration > 0) {
      setStats(prev => ({
        ...prev,
        modalStayTimes: {
          ...prev.modalStayTimes,
          [barId]: Array.isArray(prev.modalStayTimes[barId])
            ? [...prev.modalStayTimes[barId], { timestamp: Date.now(), value: duration }]
            : [{ timestamp: Date.now(), value: duration }]
        }
      }));
    }
  }, []);

  const resetStats = useCallback(() => {
    const emptyStats: InteractionStats = {
      cardViews: {},
      recommendationViews: {},
      recommendationLikes: {},
      modalStayTimes: {},
      totalCardViews: 0,
      uniqueCardViews: new Set()
    };

    setStats(emptyStats);

    localStorage.removeItem('analyticsStats');

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('analytics') || 
          key.includes('Views') || 
          key.includes('Likes') || 
          key.includes('StayTime')) {
        localStorage.removeItem(key);
      }
    });

    console.log('All stats have been reset');
  }, []);

  const value = useMemo(() => ({
    stats,
    incrementCardView,
    incrementRecommendationView,
    toggleRecommendationLike,
    recordModalStayTime,
    resetStats
  }), [stats, incrementCardView, incrementRecommendationView, toggleRecommendationLike, recordModalStayTime, resetStats]);

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
} 