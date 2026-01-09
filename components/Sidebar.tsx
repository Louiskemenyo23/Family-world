
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Wine, 
  ChefHat, 
  Grid3X3, 
  Users, 
  LogOut,
  ClipboardList,
  Box,
  FileText,
  Coffee,
  UserCircle,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
    isActive 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

  const userRole = currentUser?.role;
  const isManager = userRole === 'MANAGER' || userRole === 'ADMIN';
  const isChef = userRole === 'CHEF';
  const canAccessKitchen = isManager || isChef;

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 overflow-y-auto print:hidden z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Family World
        </h1>
        <p className="text-xs text-slate-500 mt-1">Management Suite</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <NavLink to="/dashboard" className={navClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <div className="pt-4 pb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider px-4">
          Operations
        </div>

        {!isChef && (
          <NavLink to="/pos" className={navClass}>
            <UtensilsCrossed size={20} />
            <span>POS & Billing</span>
          </NavLink>
        )}
        
        {canAccessKitchen && (
          <NavLink to="/kitchen" className={navClass}>
            <ChefHat size={20} />
            <span>Kitchen Display</span>
          </NavLink>
        )}

        <NavLink to="/tables" className={navClass}>
          <Grid3X3 size={20} />
          <span>Tables & Reserve</span>
        </NavLink>
        <NavLink to="/orders" className={navClass}>
          <ClipboardList size={20} />
          <span>Order History</span>
        </NavLink>

        {isManager && (
            <>
                <div className="pt-4 pb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider px-4">
                    Management
                </div>

                <NavLink to="/food-menu" className={navClass}>
                    <Coffee size={20} />
                    <span>Food Menu</span>
                </NavLink>
                <NavLink to="/bar-menu" className={navClass}>
                    <Wine size={20} />
                    <span>Bar Management</span>
                </NavLink>
                <NavLink to="/inventory" className={navClass}>
                    <Box size={20} />
                    <span>Full Inventory</span>
                </NavLink>
                <NavLink to="/customers" className={navClass}>
                    <UserCircle size={20} />
                    <span>Customers</span>
                </NavLink>
                <NavLink to="/staff" className={navClass}>
                    <Users size={20} />
                    <span>Staff Management</span>
                </NavLink>
                <NavLink to="/reports" className={navClass}>
                    <FileText size={20} />
                    <span>Reports</span>
                </NavLink>
                
                <div className="pt-4 pb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider px-4">
                    System
                </div>
                <NavLink to="/settings" className={navClass}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{currentUser?.name || 'User'}</div>
                <div className="text-xs text-indigo-400 font-semibold truncate">{currentUser?.role || 'Staff'}</div>
            </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
