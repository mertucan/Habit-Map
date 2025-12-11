import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import HabitHeatmap from '../components/HabitHeatmap';
import Layout from '../components/Layout';
import { 
  CheckSquare, 
  TrendingUp,
  Award,
  Flame
} from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return <Layout isLoading={true}><div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center text-white">Loading...</div></Layout>;
  }

  return (
    <Layout>
      {/* Sayfa Başlığı */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Reports</p>
      </div>

      {/* Genel Bakış İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* En İyi Seri */}
          <div className={`p-6 rounded-xl border flex items-center gap-4 ${
              data?.stats?.best_streak > 0 
              ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-red-600/20' 
              : 'border-slate-800 bg-[#111a22]'
          }`}>
            <div className={`p-3 rounded-lg ${
                data?.stats?.best_streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'
            }`}>
              {data?.stats?.best_streak > 0 ? <Flame size={32} className="animate-pulse" /> : <Award size={32} />}
            </div>
            <div>
              <p className={`text-sm ${data?.stats?.best_streak > 0 ? 'text-orange-200' : 'text-slate-400'}`}>Best Streak</p>
              <p className="text-white text-2xl font-bold">{data?.stats?.best_streak || 0} Days</p>
            </div>
          </div>

          <div className="bg-[#111a22] p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Current Streak</p>
              <p className="text-white text-2xl font-bold">{data?.stats?.current_streak || 0} Days</p>
            </div>
          </div>

          <div className="bg-[#111a22] p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
              <CheckSquare size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Habits</p>
              <p className="text-white text-2xl font-bold">{data?.stats?.total_habits || 0}</p>
            </div>
          </div>
      </div>

      {/* Isı Haritası Bölümü */}
      <h2 className="text-white text-xl font-bold mb-4">Activity Map</h2>
      <div className="rounded-xl border border-slate-800 bg-[#111a22] p-6 mb-8">
          <div className="w-full overflow-hidden">
              <HabitHeatmap data={data?.heatmap || {}} />
          </div>
          <div className="mt-4 text-center text-slate-400 text-sm">
              Summary of all your habit activities over the last year.
          </div>
      </div>
    </Layout>
  );
};

export default Reports;
