import { useState } from 'react';
import { useStats } from '../contexts/StatsContext';
import { AnalyticsData } from '../types';
import { allBars } from '../data/bars';

type ViewMode = 'bars' | 'recommendations';
type SortField = 'views' | 'likes' | 'averageStayTime' | 'likeRate';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function Analytics() {
  const { stats, resetStats } = useStats();
  const [viewMode, setViewMode] = useState<ViewMode>('recommendations');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'views', order: 'desc' });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // 计算时间范围内的统计数据
  const getStatsInRange = () => {
    // 总浏览量（页面加载次数）
    const totalPageViews = Array.isArray(stats.pageViews) 
      ? stats.pageViews.filter(record => 
          record.timestamp >= dateRange.start.getTime() && 
          record.timestamp <= dateRange.end.getTime()
        ).length
      : 0;

    // 页面平均停留时间（秒）
    const pageStayTimes = Array.isArray(stats.pageStayTimes)
      ? stats.pageStayTimes.filter(record =>
          record.timestamp >= dateRange.start.getTime() &&
          record.timestamp <= dateRange.end.getTime()
        )
      : [];
    const averagePageStayTime = pageStayTimes.length > 0
      ? pageStayTimes.reduce((sum, record) => sum + record.value, 0) / pageStayTimes.length
      : 0;

    // 总点赞数
    const totalLikes = Object.entries(stats.recommendationLikes).reduce((sum, [_, records]) => {
      if (!Array.isArray(records)) return sum;
      return sum + records
        .filter(record => 
          record.timestamp >= dateRange.start.getTime() && 
          record.timestamp <= dateRange.end.getTime()
        )
        .reduce((acc, record) => acc + record.value, 0);
    }, 0);

    // 人均浏览卡片数
    const uniqueCardViewsPerVisit = stats.uniqueCardViews.size / Math.max(1, totalPageViews);

    return { 
      totalPageViews,
      averagePageStayTime,
      totalLikes,
      uniqueCardViewsPerVisit
    };
  };

  const { totalPageViews, averagePageStayTime, totalLikes, uniqueCardViewsPerVisit } = getStatsInRange();

  const analyticsData: AnalyticsData = {
    totalPageViews,
    averagePageStayTime,
    totalLikes,
    uniqueCardViewsPerVisit,
    barStats: allBars.map(bar => {
      // 酒吧卡片查看数
      const cardViews = Array.isArray(stats.cardViews[bar.id])
        ? stats.cardViews[bar.id]
          .filter(record => 
            record.timestamp >= dateRange.start.getTime() && 
            record.timestamp <= dateRange.end.getTime()
          )
          .reduce((sum, record) => sum + record.value, 0)
        : 0;

      // 卡片查看停留时长（秒）
      const stayTimes = Array.isArray(stats.modalStayTimes[bar.id])
        ? stats.modalStayTimes[bar.id]
          .filter(record => 
            record.timestamp >= dateRange.start.getTime() && 
            record.timestamp <= dateRange.end.getTime()
          )
        : [];
      const averageStayTime = stayTimes.length > 0
        ? stayTimes.reduce((sum, record) => sum + record.value, 0) / stayTimes.length
        : 0;

      // 推荐语统计
      const recommendationStats = bar.recommendations.map(rec => {
        // 推荐语浏览量（卡片点击次数）
        const recViews = cardViews;

        // 推荐语点赞数
        const recLikes = Array.isArray(stats.recommendationLikes[rec.id])
          ? stats.recommendationLikes[rec.id]
            .filter(record => 
              record.timestamp >= dateRange.start.getTime() && 
              record.timestamp <= dateRange.end.getTime()
            )
            .reduce((sum, record) => sum + record.value, 0)
          : 0;

        return {
          recommendationId: rec.id,
          content: rec.content,
          views: recViews,
          likes: recLikes,
          barId: bar.id,
          barName: bar.name
        };
      });

      // 酒吧推荐语总点赞数
      const totalBarLikes = recommendationStats.reduce((sum, rec) => sum + rec.likes, 0);

      return {
        barId: bar.id,
        barName: bar.name,
        views: cardViews,
        averageStayTime,
        likes: totalBarLikes,
        recommendationStats
      };
    })
  };

  // 筛选推荐语数据
  const filteredRecommendations = analyticsData.barStats
    .flatMap(bar => bar.recommendationStats);

  // 排序函数
  const sortData = <T extends { views: number, likes: number, averageStayTime?: number }>(
    data: T[],
    field: SortField
  ) => {
    return [...data].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (field) {
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'likes':
          aValue = a.likes;
          bValue = b.likes;
          break;
        case 'averageStayTime':
          aValue = a.averageStayTime || 0;
          bValue = b.averageStayTime || 0;
          break;
        case 'likeRate':
          aValue = a.views > 0 ? (a.likes / a.views) : 0;
          bValue = b.views > 0 ? (b.likes / b.views) : 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      return sortConfig.order === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  // 处理排序点击
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  // 获取排序后的数据
  const sortedBarStats = sortData(analyticsData.barStats, sortConfig.field);
  const sortedRecommendations = sortData(filteredRecommendations, sortConfig.field);

  // 添加重置确认函数
  const handleReset = () => {
    if (window.confirm('确定要清空所有统计数据吗？此操作不可恢复。')) {
      resetStats();
    }
  };

  // 计算推荐语的总点赞数
  const getRecommendationLikes = (recommendationId: string) => {
    if (!Array.isArray(stats.recommendationLikes[recommendationId])) return 0;
    return stats.recommendationLikes[recommendationId]
      .filter(record => 
        record.timestamp >= dateRange.start.getTime() && 
        record.timestamp <= dateRange.end.getTime()
      )
      .reduce((sum, record) => sum + record.value, 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* 顶部标题区 */}
      <div className="py-4 sm:py-6 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">数据分析</h1>
          <p className="mt-1.5 sm:mt-2 text-sm text-gray-500">
            查看用户浏览和互动数据
          </p>
        </div>
        {/* 添加重置按钮 */}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          重置数据
        </button>
      </div>

      {/* 日期筛选 */}
      <div className="mt-4 flex space-x-4 items-center">
        <input
          type="date"
          value={dateRange.start.toISOString().split('T')[0]}
          onChange={(e) => setDateRange(prev => ({
            ...prev,
            start: new Date(e.target.value)
          }))}
          className="border rounded px-2 py-1"
        />
        <span>至</span>
        <input
          type="date"
          value={dateRange.end.toISOString().split('T')[0]}
          onChange={(e) => setDateRange(prev => ({
            ...prev,
            end: new Date(e.target.value)
          }))}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* 数据卡片网格 */}
      <div className="py-4 sm:py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">时段内总浏览量</h3>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold">{totalPageViews}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">平均停留时间</h3>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold">
            {averagePageStayTime.toFixed(1)} 秒
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">总点赞数</h3>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold">{totalLikes}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">人均浏览卡片</h3>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold">
            {uniqueCardViewsPerVisit.toFixed(1)} 张
          </p>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="mt-6 flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            viewMode === 'recommendations' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setViewMode('recommendations')}
        >
          推荐语数据
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            viewMode === 'bars' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setViewMode('bars')}
        >
          酒吧数据
        </button>
      </div>

      {/* 数据表格 */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border overflow-hidden">
        {viewMode === 'recommendations' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推荐语
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('views')}
                >
                  浏览量 {sortConfig.field === 'views' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('likes')}
                >
                  点赞数 {sortConfig.field === 'likes' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('likeRate')}
                >
                  点赞率 {sortConfig.field === 'likeRate' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecommendations.map((rec) => (
                <tr key={rec.recommendationId} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rec.content}</div>
                      <div className="text-sm text-gray-500">{rec.barName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">{rec.views}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">
                    {getRecommendationLikes(rec.recommendationId)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">
                    {rec.likes > 0 ? ((rec.likes / rec.views) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  酒吧
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('views')}
                >
                  卡片查看数 {sortConfig.field === 'views' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('likes')}
                >
                  推荐语点赞总数 {sortConfig.field === 'likes' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('averageStayTime')}
                >
                  平均停留时长(秒) {sortConfig.field === 'averageStayTime' && (sortConfig.order === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBarStats.map((bar) => (
                <tr key={bar.barId} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{bar.barName}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">{bar.views}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">{bar.likes}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">
                    {bar.averageStayTime.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 