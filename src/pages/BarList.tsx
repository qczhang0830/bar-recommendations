import BarCard from '../components/BarCard';
import { allBars } from '../data/bars';

export default function BarList() {
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
          <BarCard key={bar.id} bar={bar} />
        ))}
      </div>
    </div>
  );
} 