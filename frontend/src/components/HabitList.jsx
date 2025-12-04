import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './HabitList.css';

const HabitList = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const response = await api.post('/habits', { name: newHabitName });
      setHabits([...habits, response.data]);
      setNewHabitName('');
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return (
    <div className="habit-list-container">
      <h3>My Habits</h3>
      
      <form onSubmit={handleAddHabit} className="add-habit-form">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit name..."
          required
        />
        <button type="submit">Add Habit</button>
      </form>

      <div className="habit-grid">
        {habits.map(habit => (
          <div key={habit.id} className="habit-card">
            <Link to={`/habits/${habit.id}`} className="habit-link">
              <h4>{habit.name}</h4>
              <p>{habit.description}</p>
            </Link>
            <button onClick={() => handleDelete(habit.id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitList;

