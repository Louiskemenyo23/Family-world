
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings as SettingsIcon, Trash2, Moon, Sun, Info, CheckCircle, AlertTriangle, RefreshCw, Save, Building, FileText, DollarSign, Clock, Power } from 'lucide-react';
import { SystemSettings } from '../types';

const Settings: React.FC = () => {
  const { resetSystem, resetMenu, theme, toggleTheme, settings, updateSettings } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMenuConfirm, setShowMenuConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [menuResetSuccess, setMenuResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for form inputs
  const [formData, setFormData] = useState<SystemSettings>(settings);

  useEffect(() => {
      setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: (name === 'taxRate' || name === 'standbyMinutes') ? parseFloat(value) : value
      }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
      e.preventDefault();
      updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = async () => {
      setLoading(true);
      await resetSystem();
      setLoading(false);
      setShowConfirm(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleMenuReset = async () => {
      setLoading(true);
      await resetMenu();
      setLoading(false);
      setShowMenuConfirm(false);
      setMenuResetSuccess(true);
      setTimeout(() => setMenuResetSuccess(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-indigo-500/20 p-3 rounded-2xl">
            <SettingsIcon size={32} className="text-indigo-400" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Manage system preferences and data</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* General Information Form */}
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building size={20} className="text-blue-400" /> 
                    Restaurant Profile
                </h2>
                {saveSuccess && (
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <CheckCircle size={16} /> Saved Successfully
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Restaurant Name</label>
                    <input 
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Address</label>
                    <input 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                    <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pt-2 border-t border-slate-800 mt-6">
                <FileText size={20} className="text-purple-400" /> 
                Receipt & Financials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Currency Symbol</label>
                    <input 
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Tax Rate (%)</label>
                    <input 
                        type="number"
                        step="0.1"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm text-slate-400 mb-1">Receipt Footer Message</label>
                    <input 
                        name="receiptFooter"
                        value={formData.receiptFooter}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Thank you for visiting!"
                    />
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pt-2 border-t border-slate-800 mt-6">
                <Power size={20} className="text-orange-400" /> 
                Security
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Standby Timer (Auto-Logout)</label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                name="standbyMinutes"
                                value={formData.standbyMinutes}
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value={0}>Disabled (Never)</option>
                                <option value={1}>1 Minute</option>
                                <option value={5}>5 Minutes</option>
                                <option value={10}>10 Minutes</option>
                                <option value={15}>15 Minutes</option>
                                <option value={30}>30 Minutes</option>
                                <option value={60}>1 Hour</option>
                            </select>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formData.standbyMinutes > 0 ? `Logs out after ${formData.standbyMinutes} min idle` : 'System stays logged in'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20">
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </form>

        {/* Appearance Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sun size={20} className="text-amber-400" /> 
                Appearance
            </h2>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-200">App Theme</h3>
                    <p className="text-sm text-slate-400">Toggle between dark and light mode interface</p>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${theme === 'light' ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${theme === 'light' ? 'translate-x-8' : 'translate-x-0'}`}>
                        {theme === 'light' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-500" />}
                    </div>
                </button>
            </div>
            {theme === 'light' && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm flex items-center gap-2">
                    <Info size={16} /> Note: Light mode is in beta. Some components may retain dark styles.
                </div>
            )}
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 text-rose-500">
                <AlertTriangle size={20} /> 
                Danger Zone
            </h2>

            <div className="space-y-6 divide-y divide-slate-800">
                {/* System Data Reset */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                    <div>
                        <h3 className="font-semibold text-slate-200">Factory Reset</h3>
                        <p className="text-sm text-slate-400">Clears all orders, customers, and reservations. Preserves Menu & Staff.</p>
                    </div>
                    {showConfirm ? (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReset}
                                disabled={loading}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                Confirm Reset
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowConfirm(true)}
                            className="px-4 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Reset System Data
                        </button>
                    )}
                </div>

                {resetSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle size={16} /> System data has been successfully reset.
                    </div>
                )}

                {/* Menu Catalog Reset */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
                    <div>
                        <h3 className="font-semibold text-slate-200">Reset Menu Catalog</h3>
                        <p className="text-sm text-slate-400">Deletes current menu and re-seeds with default items (Pizza, Jollof, etc).</p>
                    </div>
                    {showMenuConfirm ? (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                            <button 
                                onClick={() => setShowMenuConfirm(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMenuReset}
                                disabled={loading}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-orange-600/20 flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                Confirm Reset
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowMenuConfirm(true)}
                            className="px-4 py-2 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Reset Menu Catalog
                        </button>
                    )}
                </div>

                {menuResetSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle size={16} /> Menu has been re-seeded successfully.
                    </div>
                )}
            </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-slate-600 text-xs mt-8">
            <p>Family World Manager v1.3.0</p>
            <p>Build 2025.10.25 • React 19 • Tailwind CSS • Supabase</p>
            <p> Developed By Louis Kemenyo</p> 
        </div>
      </div>
    </div>
  );
};

export default Settings;
