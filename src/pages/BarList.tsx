import { useEffect } from 'react';
import BarCard from '../components/BarCard';
import { allBars } from '../data/bars';
import { useStats } from '../contexts/StatsContext';
import { Link } from 'react-router-dom';

export default function BarList() {
  const { stats, incrementCardView, recordPageView } = useStats();

  useEffect(() => {
    recordPageView();
    const startTime = Date.now();

    // 组件卸载时记录停留时间
    return () => {
      const duration = (Date.now() - startTime) / 1000;
      stats.pageStayTimes.push({ 
        timestamp: startTime,
        value: duration 
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="py-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">上海酒吧推荐</h1>
          <p className="mt-2 text-sm text-gray-600">
            精选上海10家风格各异的酒吧，帮你找到最适合的去处
          </p>
        </div>
        <Link
          to="/analytics"
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
        >
          查看数据
        </Link>
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