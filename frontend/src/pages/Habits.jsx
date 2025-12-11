import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import HabitHeatmap from '../components/HabitHeatmap';
import { Plus, Check, X, Trash2 } from 'lucide-react';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Artık ısı haritası verileri dahil edilmiş alışkanlıkları getirir
      const habitsRes = await api.get('/habits');
      setHabits(habitsRes.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
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
      
      setNewHabitName('');
      setNewHabitDesc('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleLogToday = async (habitId) => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

      const response = await api.post(`/habits/${habitId}/logs`, { date: localDate });
      
      // Her şeyi yeniden getirmeden değişikliği hemen yansıtmak için yerel durumu güncelle
      setHabits(prevHabits => prevHabits.map(habit => {
        if (habit.id === habitId) {
          const isUnchecking = response.data.completed === false; // Backend yanıtına göre ayarla
          
          // Isı haritası verilerini iyimser bir şekilde güncellemeyi deneyelim
          const newHeatmap = { ...habit.heatmap };
          
          // Tamamlanıp tamamlanmadığını kontrol et (önceki duruma göre)
          const wasCompleted = newHeatmap[localDate] > 0;
          
          if (wasCompleted) {
             delete newHeatmap[localDate];
          } else {
             newHeatmap[localDate] = 1;
          }
          
          return { ...habit, heatmap: newHeatmap };
        }
        return habit;
      }));

    } catch (error) {
      console.error('Error logging habit:', error);
      // Hata olursa, değişiklikleri geri al? Veya güvenli olması için yeniden getir.
      fetchData();
    }
  };

  const isCompletedToday = (habit) => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    const habitData = habit.heatmap;
    
    return habitData && habitData[localDate] && habitData[localDate] > 0;
  };

  return (
    <Layout isLoading={loading}>
      {/* Sayfa Başlığı */}
      <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Habits</p>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#137fec]/90 transition-colors duration-200"
        >
          <Plus size={20} />
          <span className="truncate">Add New Habit</span>
        </button>
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

      {/* Alışkanlıklar Izgarası */}
      {habits.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit);
              return (
                <div key={habit.id} className="bg-[#111a22] border border-slate-800 rounded-xl p-6 hover:border-[#137fec]/50 transition-colors duration-200 flex flex-col gap-4 relative group">
                    <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white text-xl font-bold">{habit.name}</h3>
                          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{habit.description || 'No description.'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete habit"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleLogToday(habit.id)}
                            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                              completed 
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                                : 'bg-[#137fec]/20 text-[#137fec] hover:bg-[#137fec] hover:text-white'
                            }`}
                            title={completed ? "Mark as incomplete" : "Mark as complete today"}
                          >
                            {completed ? <X size={20} /> : <Check size={20} />}
                          </button>
                        </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Recent Activity</p>
                      {/* Daha iyi görünürlüğe sahip ısı haritası konteyneri */}
                      <div className="w-full overflow-hidden">
                          <HabitHeatmap data={habit.heatmap || {}} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                        <span className="text-xs text-slate-500">
                            Created: {new Date(habit.created_at).toLocaleDateString('en-GB')}
                        </span>
                    </div>
                </div>
              );
            })}
          </div>
      ) : (
          <div className="text-center py-12 text-slate-500 bg-[#111a22] rounded-xl border border-slate-800">
              <p className="mb-2">You haven't added any habits yet.</p>
              <button onClick={() => setShowAddModal(true)} className="text-[#137fec] hover:underline">
                  Add your first habit
              </button>
          </div>
      )}
    </Layout>
  );
};

export default Habits;
