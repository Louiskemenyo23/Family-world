import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Calendar, Download, Printer, TrendingUp, DollarSign, 
  ShoppingBag, Users, Clock, AlertCircle, Award, Filter, Search
} from 'lucide-react';
import { ItemCategory, OrderStatus } from '../types';

const Reports: React.FC = () => {
  const { orders, staff, menu } = useStore();
  
  // Date Filter State - Default to current month/week
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'MANAGER' | 'WAITER' | 'CHEF' | 'BARTENDER'>('ALL');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  
  // --- DATA PROCESSING ---

  // 1. Filter Orders by Date Range & Valid Status
  const filteredOrders = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return orderDate >= start && orderDate <= end && o.status !== OrderStatus.CANCELLED;
    });
  }, [orders, startDate, endDate]);

  // 2. Revenue Trend (Daily)
  const revenueTrendData = useMemo(() => {
      const dataMap = new Map<string, { revenue: number, orders: number }>();
      
      // Initialize all days in range with 0
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dataMap.set(d.toDateString(), { revenue: 0, orders: 0 });
      }

      filteredOrders.forEach(order => {
          const dateKey = new Date(order.timestamp).toDateString();
          if (dataMap.has(dateKey)) {
              const current = dataMap.get(dateKey)!;
              current.revenue += order.total;
              current.orders += 1;
          }
      });

      return Array.from(dataMap.entries()).map(([dateStr, data]) => ({
          name: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          revenue: data.revenue,
          orders: data.orders
      }));
  }, [filteredOrders, startDate, endDate]);

  // 3. Category Performance
  const categoryPerformance = useMemo(() => {
      const catMap = new Map<string, number>();
      
      filteredOrders.forEach(order => {
          order.items.forEach(item => {
              const totalLinePrice = item.price * item.quantity;
              const catName = item.category.replace('_', ' '); // 'SOFT_DRINK' -> 'SOFT DRINK'
              catMap.set(catName, (catMap.get(catName) || 0) + totalLinePrice);
          });
      });

      // Colors for chart
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
      
      return Array.from(catMap.entries())
        .map(([name, value], index) => ({ 
            name, 
            value, 
            color: colors[index % colors.length] 
        }))
        .sort((a, b) => b.value - a.value); // Sort highest sales first
  }, [filteredOrders]);

  // 4. Hourly Traffic (Peak Hours)
  const hourlyTrafficData = useMemo(() => {
      const hourMap = new Array(24).fill(0);
      
      filteredOrders.forEach(order => {
          const hour = new Date(order.timestamp).getHours();
          hourMap[hour] += 1;
      });

      // Filter to show mainly active hours (e.g., 8am to 11pm) if strictly needed, or just show all
      return hourMap.map((count, hour) => ({
          time: `${hour}:00`,
          orders: count
      })).filter((_, i) => i >= 8); // Showing from 8 AM onwards
  }, [filteredOrders]);

  // 5. Order Sources (Dine-in vs Takeaway)
  const orderSources = useMemo(() => {
      let dineIn = 0;
      let takeaway = 0;

      filteredOrders.forEach(o => {
          if (o.tableId === 'TAKEAWAY') takeaway++;
          else dineIn++;
      });

      const total = dineIn + takeaway;
      if (total === 0) return [];

      return [
          { name: 'Dine In', value: Math.round((dineIn / total) * 100), color: '#10b981' },
          { name: 'Takeaway', value: Math.round((takeaway / total) * 100), color: '#f59e0b' }
      ];
  }, [filteredOrders]);

  // 6. Staff Performance (Real Data)
  const staffPerformanceData = useMemo(() => {
      // Map to store aggregates: StaffID -> { revenue, orders }
      const stats = new Map<string, { revenue: number, orders: number }>();

      filteredOrders.forEach(order => {
          if (order.staffId) {
              const current = stats.get(order.staffId) || { revenue: 0, orders: 0 };
              current.revenue += order.total;
              current.orders += 1;
              stats.set(order.staffId, current);
          }
      });

      // Merge with Staff List to get Names/Roles
      return staff.map(s => {
          const stat = stats.get(s.id) || { revenue: 0, orders: 0 };
          
          // Simple Efficiency Rating Calculation: Avg Order Value * Conversion Factor (Mock logic for demo)
          const avgOrderVal = stat.orders > 0 ? stat.revenue / stat.orders : 0;
          const rating = Math.min(5, Math.max(1, (avgOrderVal / 50) + 2.5)).toFixed(1); // Normalized 1-5

          return {
              ...s,
              ordersHandled: stat.orders,
              salesGenerated: stat.revenue,
              rating: stat.orders > 0 ? rating : '-'
          };
      }).filter(s => 
        (selectedRole === 'ALL' || s.role === selectedRole) &&
        s.name.toLowerCase().includes(staffSearchTerm.toLowerCase())
      ).sort((a, b) => b.salesGenerated - a.salesGenerated);

  }, [filteredOrders, staff, selectedRole, staffSearchTerm]);


  // --- SUMMARY METRICS ---
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  // Unique customers based on name (approximation)
  const uniqueGuests = new Set(filteredOrders.map(o => o.customerName)).size;


  // --- HANDLERS ---
  const handlePrint = () => window.print();

  const handleExport = () => {
    const headers = "Date,Revenue,Orders\n";
    const rows = revenueTrendData.map(d => `${d.name},${d.revenue},${d.orders}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStaffExport = () => {
    const headers = "Staff Member,Role,Orders Handled,Revenue Generated,Efficiency Rating\n";
    const rows = staffPerformanceData.map(s => 
      `"${s.name}",${s.role},${s.ordersHandled},${s.salesGenerated},${s.rating}`
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_performance_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen print:bg-white print:text-black print:p-0 print:min-h-0 print:block print:overflow-visible">
      
      {/* HEADER: Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Reports</h1>
          <p className="text-slate-400">Real-time financial insights and performance analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 px-2">
             <Calendar size={16} className="text-slate-400" />
             <input 
               type="date" 
               value={startDate} 
               onChange={e => setStartDate(e.target.value)}
               className="bg-transparent text-white text-sm focus:outline-none" 
             />
             <span className="text-slate-600">-</span>
             <input 
               type="date" 
               value={endDate} 
               onChange={e => setEndDate(e.target.value)}
               className="bg-transparent text-white text-sm focus:outline-none" 
             />
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Report Title for Print */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-black">Business Report</h1>
        <p className="text-gray-500 text-sm mt-1">Generated Period: {startDate} to {endDate}</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`₵${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend="in selected period" 
          icon={<DollarSign size={24} className="text-emerald-400 print:text-black" />} 
          color="bg-emerald-500/10 print:bg-gray-100 print:border print:border-gray-200"
        />
        <KPICard 
          title="Total Orders" 
          value={totalOrdersCount.toLocaleString()} 
          trend="completed orders" 
          icon={<ShoppingBag size={24} className="text-blue-400 print:text-black" />} 
          color="bg-blue-500/10 print:bg-gray-100 print:border print:border-gray-200"
        />
        <KPICard 
          title="Avg. Order Value" 
          value={`₵${avgOrderValue.toFixed(2)}`} 
          trend="per transaction" 
          icon={<TrendingUp size={24} className="text-indigo-400 print:text-black" />} 
          color="bg-indigo-500/10 print:bg-gray-100 print:border print:border-gray-200"
        />
        <KPICard 
          title="Unique Guests" 
          value={uniqueGuests.toLocaleString()} 
          trend="approximate" 
          icon={<Users size={24} className="text-rose-400 print:text-black" />} 
          color="bg-rose-500/10 print:bg-gray-100 print:border print:border-gray-200"
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
          <h3 className="text-lg font-bold text-white print:text-black mb-6">Revenue Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000' }}
                  formatter={(value: number) => [`₵${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
           <h3 className="text-lg font-bold text-white mb-6 print:text-black">Top Categories</h3>
           {categoryPerformance.length === 0 ? (
               <div className="h-64 flex items-center justify-center text-slate-500">No sales data for this period</div>
           ) : (
               <>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={categoryPerformance}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', color: '#000', borderColor: '#e2e8f0' }} formatter={(value: number) => `₵${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white print:text-black">₵{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span className="text-xs text-slate-400 print:text-gray-500">Total Sales</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {categoryPerformance.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-slate-300 print:text-gray-700 truncate max-w-[100px]">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-white print:text-black">₵{cat.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
               </>
           )}
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
         {/* Hourly Activity */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 print:text-black">
                <Clock size={20} className="text-indigo-400 print:text-black" /> 
                Hourly Activity (Orders)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyTrafficData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000' }} />
                        <Line type="monotone" dataKey="orders" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Order Sources */}
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 print:text-black">
                <Users size={20} className="text-blue-400 print:text-black" />
                Order Sources
            </h3>
            <div className="flex flex-row items-center justify-around h-64">
                {orderSources.length === 0 ? (
                    <div className="text-slate-500">No data</div>
                ) : (
                    <>
                        <div className="w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={orderSources}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {orderSources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-4">
                            {orderSources.map((source, idx) => (
                                <div key={idx} className="bg-slate-800 p-4 rounded-xl border-l-4 print:bg-gray-100 print:border-gray-300" style={{ borderColor: source.color }}>
                                    <div className="text-slate-400 text-sm mb-1 print:text-gray-600">{source.name}</div>
                                    <div className="text-2xl font-bold text-white print:text-black">{source.value}%</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
         </div>
      </div>

      {/* STAFF PERFORMANCE (Manager Only) */}
      <div className="print:break-before-page">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800/30 gap-4 print:bg-white print:border-gray-300">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
                        <Award size={20} className="text-amber-400 print:text-black" />
                        Staff Performance
                        <span className="hidden sm:inline-block ml-2 text-xs font-normal bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wider print:border-gray-300 print:text-black print:bg-gray-100">
                            Real-Time Data
                        </span>
                    </h3>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    {/* Search by Name */}
                    <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                        <Search size={16} className="text-slate-400 ml-1" />
                        <input 
                            type="text"
                            placeholder="Search name..."
                            value={staffSearchTerm}
                            onChange={(e) => setStaffSearchTerm(e.target.value)}
                            className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-32 focus:text-indigo-400"
                        />
                    </div>

                    {/* Filter Role */}
                    <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                        <Filter size={16} className="text-slate-400 ml-1" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as any)}
                            className="bg-transparent text-white text-xs font-semibold focus:outline-none focus:text-indigo-400 print:hidden cursor-pointer"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="MANAGER">Manager</option>
                            <option value="WAITER">Waiter</option>
                            <option value="CHEF">Chef</option>
                            <option value="BARTENDER">Bartender</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleStaffExport}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        title="Export Staff Data"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto pb-2">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-800 text-slate-400 text-sm font-semibold uppercase tracking-wider print:bg-gray-100 print:text-black">
                        <tr>
                            <th className="p-4">Staff Member</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-center">Orders Handled</th>
                            <th className="p-4 text-right">Revenue Generated</th>
                            <th className="p-4 text-center">Efficiency Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                        {staffPerformanceData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    No staff members found matching your search.
                                </td>
                            </tr>
                        ) : (
                            staffPerformanceData.map((s, idx) => (
                                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors text-sm print:hover:bg-transparent">
                                    <td className="p-4 font-medium text-white flex items-center gap-3 print:text-black">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 print:bg-gray-200 print:text-black">
                                            {s.name.charAt(0)}
                                        </div>
                                        {s.name}
                                    </td>
                                    <td className="p-4 text-slate-400 print:text-black">{s.role}</td>
                                    <td className="p-4 text-center text-white print:text-black">{s.ordersHandled}</td>
                                    <td className="p-4 text-right text-emerald-400 font-mono print:text-black">₵{s.salesGenerated.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        {s.rating !== '-' && (
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                parseFloat(s.rating as string) >= 4.5 ? 'bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black print:border print:border-black' : 'bg-blue-500/20 text-blue-400 print:bg-transparent print:text-black print:border print:border-black'
                                            }`}>
                                                {s.rating} / 5.0
                                            </span>
                                        )}
                                        {s.rating === '-' && <span className="text-slate-500">-</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block text-center text-xs text-gray-500 mt-8 border-t pt-4">
         Report Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} • Family World Management Suite
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, icon, color }: any) => {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border print:border-gray-300 print:bg-white print:text-black">
            <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1 print:text-gray-600">{title}</p>
                <h3 className="text-3xl font-bold text-white print:text-black">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} print:bg-gray-100`}>
                {icon}
            </div>
            </div>
            <div className="flex items-center text-xs font-medium text-slate-500 print:text-gray-600">
                {trend}
            </div>
        </div>
    );
}

export default Reports;