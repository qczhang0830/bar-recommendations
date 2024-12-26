import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StatsProvider } from './contexts/StatsContext';
import BarList from './pages/BarList';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <StatsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<BarList />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </BrowserRouter>
    </StatsProvider>
  );
} 