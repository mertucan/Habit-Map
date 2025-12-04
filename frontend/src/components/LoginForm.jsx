import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Layout } from './AuthLayout';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const inputClass = "flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#137fec]/50 border border-slate-300 dark:border-[#324d67] bg-white dark:bg-[#192633] focus:border-[#137fec] dark:focus:border-[#137fec] h-12 placeholder:text-slate-400 dark:placeholder:text-[#92adc9] p-3 text-base font-normal leading-normal";

  return (
    <Layout isLogin={true}>
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Log In
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400">
                    Welcome back to your journey
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}
                
                <label className="flex flex-col w-full">
                    <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">
                        Username or Email
                    </p>
                    <input 
                        className={inputClass}
                        placeholder="Enter username or email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>

                <label className="flex flex-col w-full">
                    <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">Password</p>
                    <div className="relative flex w-full flex-1 items-stretch">
                        <input 
                            className={`${inputClass} pr-12`}
                            placeholder="Enter your password" 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-[#92adc9] hover:text-slate-600 dark:hover:text-white"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </label>

                <button type="submit" className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#137fec] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#137fec]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#f6f7f8] dark:focus:ring-offset-[#101922] focus:ring-[#137fec]">
                    <span className="truncate">Log In</span>
                </button>
            </form>
            
            <div className="flex flex-col gap-4">
                <p className="text-center text-sm text-slate-500 dark:text-[#92adc9]">
                    Don't have an account? 
                    <Link to="/register" className="font-medium text-[#137fec] hover:text-[#137fec]/80 underline ml-1">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    </Layout>
  );
};

export default LoginForm;
