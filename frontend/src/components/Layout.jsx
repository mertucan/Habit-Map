import React from 'react';
import { Link, useLocation, useNavigation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart2, 
  LogOut, 
  ListTodo,
  Loader2
} from 'lucide-react';

const Layout = ({ children, isLoading }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150";
    const activeClass = "bg-[#137fec]/20 text-[#137fec]";
    const inactiveClass = "text-slate-300 hover:bg-[#137fec]/10 hover:text-white";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101922] font-sans">
      <div className="flex h-full min-h-screen">
        
        {/* SideNavBar */}
        <aside className="flex w-64 flex-col border-r border-slate-200/10 bg-[#111a22] p-4 text-white fixed h-full z-10">
          <div className="flex items-center gap-2 pb-8">
            <span className="material-symbols-outlined text-[#137fec] text-3xl">
              <ListTodo size={32} />
            </span>
            <h1 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">HabitMap</h1>
          </div>
          
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-col gap-4">
              {/* User Info */}
              <div className="flex gap-3">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-600 flex items-center justify-center text-lg font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-white text-base font-medium leading-normal">{user?.username}</h1>
                  <p className="text-slate-400 text-sm font-normal leading-normal">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col gap-1">
                <Link to="/" className={getLinkClass('/')}>
                  <LayoutDashboard size={20} />
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </Link>
                <Link to="/habits" className={getLinkClass('/habits')}>
                  <CheckSquare size={20} />
                  <p className="text-sm font-medium leading-normal">Habits</p>
                </Link>
                <Link to="/reports" className={getLinkClass('/reports')}>
                  <BarChart2 size={20} />
                  <p className="text-sm font-medium leading-normal">Reports</p>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#137fec]/10 hover:text-white transition-colors duration-150 w-full text-left">
                <LogOut size={20} />
                <p className="text-sm font-medium leading-normal">Log Out</p>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-64 relative">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-10 h-10 text-[#137fec] animate-spin" />
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
