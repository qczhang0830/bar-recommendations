import { Bar } from '../types';

// 标签提取规则
const tagRules: { [key: string]: string[] } = {
  '环境': ['安静', '舒适', '复古', '优雅', '精致'],
  '特色': ['鸡尾酒', '威士忌', '清吧', '音乐'],
  '氛围': ['轻松', '文艺', '小资', '情调'],
  '位置': ['小巷', '弄堂', '隐蔽'],
  '服务': ['专业', '贴心', '热情']
};

export function extractTags(bar: Bar): string[] {
  const allContent = bar.recommendations.map(r => r.content).join(' ');
  const tags: string[] = [];
  
  // 遍历规则检查推荐语内容
  Object.entries(tagRules).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (allContent.includes(keyword)) {
        tags.push(`${keyword}${category}`);
      }
    });
  });

  // 限制标签数量为2-3个
  return tags.slice(0, Math.min(3, Math.max(2, tags.length)));
} 