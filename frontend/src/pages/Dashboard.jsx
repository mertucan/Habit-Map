import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import HabitHeatmap from '../components/HabitHeatmap';
import Layout from '../components/Layout';
import { Plus, Flame, CheckSquare, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({ total_habits: 0, current_streak: 0, best_streak: 0 });
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalHeatmapData, setGlobalHeatmapData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, statsRes] = await Promise.all([
        api.get('/habits'),
        api.get('/stats')
      ]);
      
      setHabits(habitsRes.data);
      setStats(statsRes.data);
      
      // Birleştirmek için tüm alışkanlıkların ısı haritası verilerini getir
      const heatmapPromises = habitsRes.data.map(h => api.get(`/habits/${h.id}/heatmap`));
      const heatmaps = await Promise.all(heatmapPromises);
      
      const aggregatedData = {};
      heatmaps.forEach(res => {
        Object.entries(res.data).forEach(([date, count]) => {
            aggregatedData[date] = (aggregatedData[date] || 0) + count;
        });
      });
      setGlobalHeatmapData(aggregatedData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const response = await api.post('/habits', { 
        name: newHabitName,
        description: newHabitDesc 
      });
      setHabits([...habits, response.data]);
      // İstatistikleri yerel olarak güncelle veya yeniden getir
      setStats(prev => ({ ...prev, total_habits: prev.total_habits + 1 }));
      
      setNewHabitName('');
      setNewHabitDesc('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  return (
    <Layout isLoading={loading}>
      {/* Sayfa Başlığı */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard</p>
      </div>

      {/* Alışkanlık Ekle Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111a22] p-6 rounded-xl border border-slate-800 w-full max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">New Habit</h3>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Habit Name (e.g. Drink Water)"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="bg-[#101922] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#137fec]"
                required
              />
              <input
                type="text"
                placeholder="Description (e.g. 2 Liters Daily)"
                value={newHabitDesc}
                onChange={(e) => setNewHabitDesc(e.target.value)}
                className="bg-[#101922] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#137fec]"
              />
              <div className="flex justify-end gap-2 mt-2">
                  <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                      Cancel
                  </button>
                  <button 
                      type="submit"
                      className="px-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90"
                  >
                      Add
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* İstatistikler - Rapor Stili */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* En İyi Seri */}
        <div className={`p-6 rounded-xl border flex items-center gap-4 ${
          stats.best_streak > 0 
            ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-red-600/20' 
            : 'border-slate-800 bg-[#111a22]'
        }`}>
          <div className={`p-3 rounded-lg ${
             stats.best_streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'
          }`}>
             {stats.best_streak > 0 ? <Flame size={32} className="animate-pulse" /> : <TrendingUp size={32} />}
          </div>
          <div>
            <p className={`text-sm ${stats.best_streak > 0 ? 'text-orange-200' : 'text-slate-400'}`}>Best Streak</p>
            <p className="text-white text-2xl font-bold">{stats.best_streak} Days</p>
          </div>
        </div>

        {/* Mevcut Seri */}
        <div className="bg-[#111a22] p-6 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Current Streak</p>
            <p className="text-white text-2xl font-bold">{stats.current_streak} Days</p>
          </div>
        </div>

        {/* Toplam Alışkanlıklar */}
        <div className="bg-[#111a22] p-6 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
            <CheckSquare size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Habits</p>
            <p className="text-white text-2xl font-bold">{stats.total_habits}</p>
          </div>
        </div>
      </div>

      {/* Isı Haritası için Bölüm Başlığı */}
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Activity Map</h2>

      {/* Isı Haritası Konteyneri */}
      <div className="rounded-xl border border-slate-800 bg-[#111a22] p-6 mb-8">
        <div className="w-full overflow-hidden">
            <HabitHeatmap data={globalHeatmapData} />
        </div>
      </div>

      {/* Mevcut Alışkanlıklar için Bölüm Başlığı */}
      <div className="flex flex-wrap justify-between gap-4 items-center mt-8 mb-4">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Active Habits</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#137fec]/90 transition-colors duration-200"
        >
          <Plus size={20} />
          <span className="truncate">Add New Habit</span>
        </button>
      </div>

      {/* Alışkanlıklar Tablosu */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#111a22]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
            <tr>
              <th className="px-6 py-3" scope="col">Habit</th>
              <th className="px-6 py-3" scope="col">Description</th>
              <th className="px-6 py-3" scope="col">Created At</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <th className="px-6 py-4 font-medium text-white whitespace-nowrap" scope="row">{habit.name}</th>
                  <td className="px-6 py-4">{habit.description || '-'}</td>
                  <td className="px-6 py-4">{new Date(habit.created_at).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
            {habits.length === 0 && (
                <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                        You haven't added any habits yet. Add one above.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Dashboard;
