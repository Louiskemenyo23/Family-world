import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
    User, Plus, Search, Pencil, Trash2, Mail, Phone, Calendar, 
    X, Star, Award, TrendingUp, Users, Filter, CheckCircle 
} from 'lucide-react';

const CustomersPage: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'VIP' | 'NEW'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        phone: '',
        email: '',
        notes: '',
        loyaltyPoints: 0
    });

    // --- DERIVED DATA ---
    const vipThreshold = 100;

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
            
            if (!matchesSearch) return false;

            if (filterType === 'VIP') return c.loyaltyPoints >= vipThreshold;
            if (filterType === 'NEW') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                // Assuming new customers are those visited recently if creation date isn't tracked, 
                // or we could assume the ID implies recency in a real DB, but here we'll use lastVisit for "Active"
                return new Date(c.lastVisit) > oneMonthAgo; 
            }
            return true;
        }).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints); // Sort by loyalty points by default
    }, [customers, searchTerm, filterType]);

    // Stats
    const totalCustomers = customers.length;
    const vipCount = customers.filter(c => c.loyaltyPoints >= vipThreshold).length;
    const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

    // --- HANDLERS ---
    const openModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                phone: customer.phone,
                email: customer.email || '',
                notes: customer.notes || '',
                loyaltyPoints: customer.loyaltyPoints
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                notes: '',
                loyaltyPoints: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customerData: Customer = {
            id: editingCustomer ? editingCustomer.id : uuidv4(),
            name: formData.name!,
            phone: formData.phone!,
            email: formData.email,
            notes: formData.notes,
            loyaltyPoints: formData.loyaltyPoints || 0,
            lastVisit: editingCustomer ? editingCustomer.lastVisit : new Date()
        };

        if (editingCustomer) {
            updateCustomer(customerData);
        } else {
            addCustomer(customerData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 h-full flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customer Database</h1>
                    <p className="text-slate-400 mt-1">Manage profiles, loyalty, and history</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 hover:scale-105"
                >
                    <Plus size={20} /> Add New Customer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalCustomers}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Profiles</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Award size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{vipCount}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">VIP Members</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><TrendingUp size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Loyalty Points</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-500"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => setFilterType('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilterType('VIP')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${filterType === 'VIP' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-amber-400'}`}
                        >
                            <Award size={16} /> VIPs
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase font-bold sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-5 border-b border-slate-800">Customer Profile</th>
                                <th className="p-5 border-b border-slate-800">Contact Details</th>
                                <th className="p-5 border-b border-slate-800">Loyalty Status</th>
                                <th className="p-5 border-b border-slate-800">Last Activity</th>
                                <th className="p-5 border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-800 rounded-full"><Users size={32} className="opacity-50" /></div>
                                            <p>No customers found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(c => {
                                    const isVip = c.loyaltyPoints >= vipThreshold;
                                    return (
                                        <tr key={c.id} className={`hover:bg-slate-800/40 transition-colors group ${isVip ? 'bg-amber-500/5' : ''}`}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md relative ${isVip ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-slate-700'}`}>
                                                        {c.name.charAt(0)}
                                                        {isVip && (
                                                            <div className="absolute -top-1 -right-1 bg-white text-amber-600 rounded-full p-0.5 shadow-sm border border-amber-200">
                                                                <Star size={10} fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-base">{c.name}</div>
                                                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{c.notes}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="space-y-1">
                                                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors">
                                                        <Phone size={14} /> {c.phone}
                                                    </a>
                                                    {c.email && (
                                                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
                                                            <Mail size={14} /> {c.email}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className={`flex items-center gap-1.5 font-bold ${isVip ? 'text-amber-400' : 'text-slate-300'}`}>
                                                        <Award size={16} />
                                                        {c.loyaltyPoints} Points
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${isVip ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                                                            style={{ width: `${Math.min(100, (c.loyaltyPoints / vipThreshold) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-400">
                                                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit border border-slate-800">
                                                    <Calendar size={14} />
                                                    {new Date(c.lastVisit).toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openModal(c)} 
                                                        className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-slate-400 transition-colors" 
                                                        title="Edit Profile"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { if(confirm('Delete customer?')) deleteCustomer(c.id) }} 
                                                        className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg text-slate-400 transition-colors" 
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-0 overflow-hidden transform transition-all animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingCustomer ? 'Edit Profile' : 'New Customer'}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {editingCustomer ? 'Update details and loyalty points' : 'Create a new customer account'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                        <User size={14} /> Personal Information
                                    </h3>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Full Name <span className="text-rose-500">*</span></label>
                                        <input 
                                            required
                                            value={formData.name} 
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g. Kwame Mensah"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Phone Number <span className="text-rose-500">*</span></label>
                                        <input 
                                            required
                                            value={formData.phone} 
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g. 024 123 4567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Email Address</label>
                                        <input 
                                            type="email"
                                            value={formData.email} 
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="customer@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Loyalty & Notes */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                        <Star size={14} /> Loyalty Program
                                    </h3>
                                    
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <label className="block text-sm text-slate-300 mb-2">Loyalty Points Balance</label>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({...prev, loyaltyPoints: Math.max(0, (prev.loyaltyPoints || 0) - 10)}))}
                                                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-xl transition-colors"
                                            >-</button>
                                            <input 
                                                type="number"
                                                value={formData.loyaltyPoints} 
                                                onChange={e => setFormData({...formData, loyaltyPoints: parseInt(e.target.value) || 0})}
                                                className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-center text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({...prev, loyaltyPoints: (prev.loyaltyPoints || 0) + 10}))}
                                                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-xl transition-colors"
                                            >+</button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Adjust points manually for corrections or bonuses.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Notes / Preferences</label>
                                        <textarea 
                                            value={formData.notes} 
                                            onChange={e => setFormData({...formData, notes: e.target.value})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none transition-colors"
                                            placeholder="Allergies, favorite table, VIP preferences..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    {editingCustomer ? 'Update Profile' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomersPage;