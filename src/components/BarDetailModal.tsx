import { useEffect, useState } from 'react';
import { Bar } from '../types';
import { useStats } from '../contexts/StatsContext';

interface Props {
  bar: Bar;
  onClose: () => void;
  onLike: (e: React.MouseEvent, recommendationId: string) => void;
  helpfulClicks: { [key: string]: boolean };
}

export default function BarDetailModal({ bar, onClose, onLike, helpfulClicks }: Props) {
  const { recordModalStayTime, stats } = useStats();
  const [startTime] = useState(Date.now());

  // 在组件卸载时记录停留时间
  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`Recording stay time for ${bar.id}:`, duration);
      recordModalStayTime(bar.id, duration);
    };
  }, [bar.id, recordModalStayTime, startTime]);

  // 添加计算点赞数的函数
  const getLikesCount = (recommendationId: string) => {
    if (!Array.isArray(stats.recommendationLikes[recommendationId])) return 0;
    return stats.recommendationLikes[recommendationId]
      .reduce((sum, record) => sum + record.value, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{bar.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
              <span>{bar.area}</span>
              <span>·</span>
              <span>{bar.type}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 推荐语列表 */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-4">
            {bar.recommendations.map((recommendation) => (
              <div 
                key={recommendation.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <img
                  src={recommendation.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">
                    {recommendation.content}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={(e) => onLike(e, recommendation.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors
                        ${helpfulClicks[recommendation.id] 
                          ? 'bg-blue-50 text-blue-500' 
                          : 'text-gray-400 hover:text-blue-500'}`}
                    >
                      <span>👍</span>
                      <span>有帮助</span>
                      <span>({getLikesCount(recommendation.id)})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 