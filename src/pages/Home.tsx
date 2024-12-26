import { useState } from 'react';
import { allBars } from '../data/bars';
import BarCard from '../components/BarCard';

export default function Home() {
  const handleLike = (recommendationId: string) => {
    console.log('Liked:', recommendationId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* 顶部标题区 */}
      <div className="py-4 sm:py-6 border-b">
        <h1 className="text-xl sm:text-2xl font-bold">上海推荐酒吧</h1>
        <p className="mt-1.5 sm:mt-2 text-sm text-gray-500">
          精选上海10家人气酒吧，来自真实顾客体验和评价
        </p>
        <div className="mt-2 sm:mt-3 text-xs text-gray-400">
          更新于 2024年12月 · 10 家酒吧 · 30 条评价
        </div>
      </div>

      {/* 酒吧列表 */}
      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {allBars.map(bar => (
          <BarCard 
            key={bar.id}
            bar={bar}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  );
} 