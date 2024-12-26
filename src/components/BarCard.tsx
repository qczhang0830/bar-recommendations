import { useState, useEffect } from 'react';
import { Bar } from '../types';
import BarDetailModal from './BarDetailModal';
import { useStats } from '../contexts/StatsContext';

interface Props {
  bar: Bar;
}

export default function BarCard({ bar }: Props) {
  const { incrementCardView, incrementRecommendationView, toggleRecommendationLike, stats } = useStats();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [helpfulClicks, setHelpfulClicks] = useState<{ [key: string]: boolean }>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bar.recommendations.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bar.recommendations.length, isPaused]);

  useEffect(() => {
    if (bar.recommendations[currentIndex]) {
      incrementRecommendationView(bar.recommendations[currentIndex].id);
    }
  }, [currentIndex, bar.recommendations, incrementRecommendationView]);

  const handleCardClick = () => {
    incrementCardView(bar.id);
    setShowModal(true);
  };

  const handleHelpfulClick = (e: React.MouseEvent, recommendationId: string) => {
    e.stopPropagation();
    toggleRecommendationLike(recommendationId);
    setHelpfulClicks(prev => ({
      ...prev,
      [recommendationId]: !prev[recommendationId]
    }));
  };

  const getLikesCount = (recommendationId: string) => {
    if (!Array.isArray(stats.recommendationLikes[recommendationId])) return 0;
    return stats.recommendationLikes[recommendationId]
      .reduce((sum, record) => sum + record.value, 0);
  };

  // 监听统计数据变化，当数据被重置时更新点赞状态
  useEffect(() => {
    // 检查统计数据是否为空
    const isStatsEmpty = Object.keys(stats.recommendationLikes).length === 0;
    if (isStatsEmpty) {
      // 重置所有点赞状态
      setHelpfulClicks({});
    } else {
      // 根据实际点赞数据更新状态
      const newHelpfulClicks: { [key: string]: boolean } = {};
      bar.recommendations.forEach(rec => {
        const likes = stats.recommendationLikes[rec.id];
        if (Array.isArray(likes) && likes.length > 0) {
          const lastLike = likes[likes.length - 1];
          newHelpfulClicks[rec.id] = lastLike.value > 0;
        } else {
          newHelpfulClicks[rec.id] = false;
        }
      });
      setHelpfulClicks(newHelpfulClicks);
    }
  }, [stats.recommendationLikes, bar.recommendations]);

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex p-3">
          {/* 左侧图片区域 */}
          <div className="relative w-24 h-24">
            <img
              src={bar.image}
              alt={bar.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 ml-3">
            {/* 标题区域 */}
            <h3 className="text-lg font-bold">{bar.name}</h3>

            {/* 商圈和类型 */}
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
              <span>{bar.area}</span>
              <span>·</span>
              <span>{bar.type}</span>
            </div>

            {/* 标签Pills */}
            <div className="flex mt-2 space-x-2">
              {bar.tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`px-2 py-0.5 text-xs rounded ${
                    index === 0 ? 'bg-purple-50 text-purple-600' :
                    index === 1 ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 推荐语轮播区域 */}
            <div 
              className="mt-2 h-20 overflow-hidden relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {bar.recommendations.map((recommendation, index) => (
                <div
                  key={recommendation.id}
                  className={`transform transition-all duration-500 ease-in-out absolute w-full
                    ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start space-x-2">
                      <img
                        src={recommendation.avatar}
                        alt=""
                        className="w-5 h-5 rounded-full mt-0.5"
                      />
                      <p className="flex-1 text-gray-600 text-sm line-clamp-2">
                        {recommendation.content}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <div className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400">
                        <span>👍</span>
                        <span>{getLikesCount(recommendation.id)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 浮层 */}
      {showModal && (
        <BarDetailModal
          bar={bar}
          onClose={() => setShowModal(false)}
          onLike={handleHelpfulClick}
          helpfulClicks={helpfulClicks}
        />
      )}
    </>
  );
} 