import { useEffect } from 'react';
import BarCard from '../components/BarCard';
import { allBars } from '../data/bars';
import { useStats } from '../contexts/StatsContext';

export default function BarList() {
  const { stats, incrementCardView, recordPageView } = useStats();

  // 记录页面访问
  useEffect(() => {
    // 记录页面浏览（仅在组件挂载时记录一次）
    recordPageView();

    // 记录页面停留时间
    const startTime = Date.now();
    return () => {
      const duration = (Date.now() - startTime) / 1000;
      stats.pageStayTimes.push({ 
        timestamp: startTime,
        value: duration 
      });
    };
  }, []); // 移除 stats 依赖，避免重复记录

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900">上海酒吧推荐</h1>
        <p className="mt-2 text-sm text-gray-600">
          精选上海10家风格各异的酒吧，帮你找到最适合的去处
        </p>
      </div>

      <div className="space-y-6 pb-8">
        {allBars.map((bar) => (
          <BarCard 
            key={bar.id} 
            bar={bar} 
            onView={() => incrementCardView(bar.id)}
          />
        ))}
      </div>
    </div>
  );
} 