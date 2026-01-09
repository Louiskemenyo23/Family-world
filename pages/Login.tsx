import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, AlertCircle, Database } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, staff, loading: storeLoading } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [staffId, setStaffId] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const success = await login(staffId.trim(), passcode.trim());
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid Staff ID or Passcode. Please try again.');
        }
    } catch (err) {
        setError('Login failed. Please check connection.');
    } finally {
        setLoading(false);
    }
  };

  // Check for DB connection issue (RLS or Empty DB)
  const isDbError = !storeLoading && staff.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ChefHat size={32} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-center text-slate-400 mb-8">Sign in to Family World Manager</p>

        {isDbError && (
             <div className="bg-amber-500/10 border border-amber-500/50 text-amber-400 p-4 rounded-lg flex flex-col gap-2 mb-6 text-sm">
                <div className="flex items-center gap-2 font-bold">
                    <Database size={16} />
                    <span>Database Connection Issue</span>
                </div>
                <p>Unable to load staff data. This usually happens if Row Level Security (RLS) is enabled in Supabase but no policies are set.</p>
                <p className="text-xs text-amber-500/70 mt-1">Fix: Run <code>ALTER TABLE staff DISABLE ROW LEVEL SECURITY;</code> in Supabase SQL Editor.</p>
            </div>
        )}

        {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Staff ID</label>
            <input 
              type="text" 
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your ID"
              disabled={isDbError}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Passcode</label>
            <input 
              type="password" 
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              disabled={isDbError}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || isDbError}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
          >
            {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;