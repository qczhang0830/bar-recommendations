import BarCard from '../components/BarCard';
import { allBars } from '../data/bars';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        {allBars.map((bar) => (
          <BarCard key={bar.id} bar={bar} />
        ))}
      </div>
    </div>
  );
} 