import { Link } from 'react-router-dom';
import { ListTodo } from 'lucide-react';

export const Header = ({ isLogin }) => (
  <header className="flex items-center justify-between whitespace-nowrap px-10 py-5 w-full">
      <div className="flex items-center gap-4 text-black dark:text-white">
          <div className="text-[#137fec]">
              <ListTodo size={32} />
          </div>
          <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">HabitMap</h2>
      </div>
      <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <Link 
            to={isLogin ? '/register' : '/login'} 
            className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#137fec] px-4 text-sm font-bold text-white hover:bg-[#137fec]/90 no-underline"
          >
              <span className="truncate">{isLogin ? 'Sign Up' : 'Log In'}</span>
          </Link>
      </div>
  </header>
);

export const Footer = () => (
  <footer className="w-full py-4 text-center text-sm text-slate-500 dark:text-slate-400">
    Designed by Mert Uçan & Emre Demirkaya
  </footer>
);

export const Layout = ({ children, isLogin }) => (
  <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101922] font-sans text-slate-900 dark:text-white">
      <div className="layout-container flex h-full grow flex-col">
          <Header isLogin={isLogin} />
          <main className="flex flex-1 items-center justify-center p-4">
              <div className="w-full max-w-sm">
                  {children}
              </div>
          </main>
          <Footer />
      </div>
  </div>
);
