import { Bar } from '../types';
import { extractTags } from '../utils/tagExtractor';
import realBarsData from './real-bars.json';

// 处理真实数据
export const allBars: Bar[] = realBarsData.bars.map(bar => ({
  ...bar,
  tags: extractTags(bar)
}));

// 如果需要获取单个酒吧数据的辅助函数
export const getBarById = (id: string): Bar | undefined => {
  return allBars.find(bar => bar.id === id);
};

// 如果需要获取推荐语的辅助函数
export const getRecommendationById = (barId: string, recommendationId: string) => {
  const bar = getBarById(barId);
  return bar?.recommendations.find(rec => rec.id === recommendationId);
};

// 导出一些有用的常量
export const TOTAL_BARS = allBars.length;
export const RECOMMENDATIONS_PER_BAR = 3; 