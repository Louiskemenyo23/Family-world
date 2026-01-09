import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, ShoppingBag, Users, Activity, Sparkles, 
  UtensilsCrossed, ChefHat, Grid3X3, ClipboardList, Clock, Wallet
} from 'lucide-react';
import { getManagerInsights } from '../services/geminiService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { orders, tables, currentUser } = useStore();
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- STAFF DASHBOARD LOGIC (Non-Managers) ---
  // Ensure strict check: Only explicitly MANAGER or ADMIN sees the full dashboard
  const userRole = currentUser?.role?.trim().toUpperCase();
  const isManagerOrAdmin = userRole === 'MANAGER' || userRole === 'ADMIN';

  if (!isManagerOrAdmin) {
    const isChef = userRole === 'CHEF';
    
    // Calculate Personal Metrics
    const myOrders = orders.filter(order => order.staffId === currentUser?.id);
    const myTotalRevenue = myOrders.reduce((sum, order) => sum + order.total, 0);
    const myPendingOrders = myOrders.filter(order => order.status === 'PENDING').length;
    
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Workspace</h1>
                    <p className="text-slate-400 mt-1">
                        Logged in as: <span className="font-semibold text-indigo-400">{currentUser?.name}</span> 
                        <span className="px-2 py-0.5 ml-2 rounded text-xs font-bold bg-slate-800 border border-slate-700 uppercase tracking-wider">
                            {currentUser?.role}
                        </span>
                    </p>
                </div>
                <div className="text-right hidden md:block bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-2xl font-bold text-white font-mono">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* POS - Hidden for Chefs */}
                {!isChef && (
                    <Link to="/pos" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500 hover:bg-slate-800/80 transition-all group shadow-lg relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-indigo-500/10">
                            <UtensilsCrossed size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">POS System</h3>
                        <p className="text-slate-400 text-sm">Take orders & process billing</p>
                    </Link>
                )}

                {/* Kitchen Display - Visible ONLY to Chefs in this view */}
                {isChef && (
                    <Link to="/kitchen" className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-orange-500 hover:bg-slate-800/80 transition-all group shadow-lg relative overflow-hidden ${isChef ? 'col-span-1 md:col-span-2 border-orange-500/30 bg-orange-500/5' : ''}`}>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-orange-500/10">
                            <ChefHat size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Kitchen Display</h3>
                        <p className="text-slate-400 text-sm">View and manage active food orders</p>
                    </Link>
                )}

                {/* Tables - Hidden for Chefs */}
                {!isChef && (
                    <Link to="/tables" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500 hover:bg-slate-800/80 transition-all group shadow-lg relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-emerald-500/10">
                            <Grid3X3 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Table Status</h3>
                        <p className="text-slate-400 text-sm">Manage reservations & seating</p>
                    </Link>
                )}

                {/* Order History - All Staff */}
                <Link to="/orders" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 hover:bg-slate-800/80 transition-all group shadow-lg relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform shadow-inner shadow-blue-500/10">
                        <ClipboardList size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Order History</h3>
                    <p className="text-slate-400 text-sm">View past transactions</p>
                </Link>
            </div>

            {/* Personal Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white font-mono">₵{myTotalRevenue.toFixed(2)}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">My Total Sales</div>
                    </div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{myOrders.length}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">My Total Orders</div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-orange-500/30 transition-colors">
                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-full">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{myPendingOrders}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">My Pending Orders</div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- MANAGER DASHBOARD LOGIC (Existing) ---
  
  // Calculate Start of Day (00:00:00)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Calculate Today's Revenue (Excluding Cancelled)
  const todaysRevenue = orders
    .filter(o => {
        const orderDate = new Date(o.timestamp);
        return o.status !== 'CANCELLED' && orderDate >= todayStart;
    })
    .reduce((sum, order) => sum + order.total, 0);

  // 2. Calculate Today's Orders
  const todaysOrdersCount = orders.filter(o => {
      const orderDate = new Date(o.timestamp);
      return orderDate >= todayStart;
  }).length;

  const activeTables = tables.filter(t => t.status === 'OCCUPIED').length;

  // 3. Calculate Weekly Revenue Data (Real Time)
  const weeklyRevenueData = useMemo(() => {
    // Generate last 7 days array
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    return last7Days.map(date => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toDateString(); // "Fri Oct 25 2024"

        // Sum revenue for this specific day
        const dailyRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate.toDateString() === dateStr && order.status !== 'CANCELLED';
            })
            .reduce((sum, order) => sum + order.total, 0);

        return { name: dayName, revenue: dailyRevenue };
    });
  }, [orders]);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const metrics = {
        revenueToday: todaysRevenue,
        ordersToday: todaysOrdersCount,
        activeTables,
        popularItem: "Classic Burger", // Mocked for now, implies need for item analytics
        staffOnDuty: 5
    };
    const text = await getManagerInsights(metrics);
    setInsight(text);
    setLoadingInsight(false);
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-slate-400 mt-1">Welcome back, <span className="text-indigo-400 font-semibold">{currentUser?.name}</span> (Manager)</p>
        </div>
        <div className="flex gap-2">
            <Link to="/reports" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                View Reports
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={`₵${todaysRevenue.toFixed(2)}`} icon={<DollarSign size={24} className="text-emerald-400" />} color="bg-emerald-500/10" />
        <StatCard title="Today's Orders" value={todaysOrdersCount.toString()} icon={<ShoppingBag size={24} className="text-indigo-400" />} color="bg-indigo-500/10" />
        <StatCard title="Active Tables" value={activeTables.toString()} icon={<Users size={24} className="text-blue-400" />} color="bg-blue-500/10" />
        <StatCard title="Efficiency" value="94%" icon={<Activity size={24} className="text-rose-400" />} color="bg-rose-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-6">Weekly Revenue (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(value: number) => [`₵${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Widget */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-500 rounded-lg">
                <Sparkles size={20} className="text-white" />
             </div>
             <h3 className="text-xl font-bold text-white">AI Manager Insight</h3>
          </div>
          
          <div className="flex-1 bg-slate-950/50 rounded-xl p-4 mb-4 text-slate-300 text-sm leading-relaxed overflow-y-auto min-h-[150px]">
            {loadingInsight ? (
                <div className="flex items-center justify-center h-full gap-2 text-indigo-400 animate-pulse">
                    <Sparkles size={16} /> Analyzing Data...
                </div>
            ) : insight ? (
                <div className="whitespace-pre-line">{insight}</div>
            ) : (
                <div className="text-slate-500 text-center h-full flex items-center justify-center">
                    Click analyze to get AI-powered business recommendations based on current metrics.
                </div>
            )}
          </div>

          <button 
            onClick={handleGetInsight}
            disabled={loadingInsight}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
          >
            Analyze Performance
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center text-xs text-emerald-400 font-medium">
        +2.5% from yesterday
    </div>
  </div>
);

export default Dashboard;