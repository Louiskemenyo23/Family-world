
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserCheck, Plus, Pencil, Trash2, Shield, Phone, Mail, X, User, KeyRound, Lock } from 'lucide-react';
import { Staff } from '../types';
import { v4 as uuidv4 } from 'uuid';

const StaffPage: React.FC = () => {
    const { staff, addStaff, updateStaff, deleteStaff, currentUser } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Form state
    const [loginId, setLoginId] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'MANAGER' | 'ADMIN' | 'WAITER' | 'CHEF' | 'BARTENDER'>('WAITER');
    const [status, setStatus] = useState<'ACTIVE' | 'OFF_DUTY'>('ACTIVE');
    const [passcode, setPasscode] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const isAdmin = currentUser?.role?.trim().toUpperCase() === 'ADMIN';

    const openModal = (staffMember?: Staff) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setLoginId(staffMember.id);
            setName(staffMember.name);
            setRole(staffMember.role);
            setStatus(staffMember.status);
            setPasscode(staffMember.passcode);
            setEmail(staffMember.email || '');
            setPhone(staffMember.phone || '');
        } else {
            setEditingStaff(null);
            setLoginId('');
            setName('');
            setRole('WAITER');
            setStatus('ACTIVE');
            setPasscode('');
            setEmail('');
            setPhone('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use provided Login ID or generate one if empty (only for new)
        const finalId = editingStaff ? editingStaff.id : (loginId.trim() || uuidv4());

        const staffData: Staff = {
            id: finalId,
            name,
            role,
            status,
            passcode,
            email,
            phone
        };

        if (editingStaff) {
            updateStaff(staffData);
        } else {
            // Check if ID already exists
            if (staff.some(s => s.id === finalId)) {
                alert("This Login ID is already in use. Please choose another.");
                return;
            }
            addStaff(staffData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Staff Management</h1>
                    <p className="text-slate-400 mt-1">
                        {isAdmin ? 'Manage employees, roles, and access controls' : 'Staff Directory'}
                    </p>
                </div>
                {isAdmin ? (
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} /> Add New Staff
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-400 text-sm border border-slate-700">
                        <Lock size={16} /> Admin Access Only
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(s => (
                    <div key={s.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative group hover:border-indigo-500/50 transition-colors">
                        {isAdmin && (
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(s)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-blue-400">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => deleteStaff(s.id)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-rose-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {s.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{s.name}</h3>
                                <div className="text-sm text-indigo-400 font-semibold">{s.role}</div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <KeyRound size={14} className="text-slate-500" />
                                <span className="font-mono text-slate-300">Login ID: <span className="text-white font-bold">{s.id}</span></span>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-slate-500" /> 
                                    <span className="font-mono bg-slate-800 px-2 rounded text-xs">Passcode: {s.passcode}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-800 my-2 pt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserCheck size={14} className={s.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'} />
                                    <span className="text-slate-500">{s.status}</span>
                                </div>
                                {s.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} /> {s.phone}
                                    </div>
                                )}
                                {s.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} /> {s.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Login ID (Username)</label>
                                    <input 
                                        required
                                        value={loginId}
                                        onChange={e => setLoginId(e.target.value)}
                                        readOnly={!!editingStaff}
                                        className={`w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 ${editingStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="e.g. JOHN01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                                    <input 
                                        required
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Role</label>
                                    <select 
                                        value={role}
                                        onChange={e => setRole(e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        {isAdmin && <option value="ADMIN">Admin</option>}
                                        <option value="MANAGER">Manager</option>
                                        <option value="WAITER">Waiter</option>
                                        <option value="CHEF">Chef</option>
                                        <option value="BARTENDER">Bartender</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                                    <select 
                                        value={status}
                                        onChange={e => setStatus(e.target.value as any)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="OFF_DUTY">Off Duty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Phone</label>
                                    <input 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="024..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Passcode (Login)</label>
                                    <input 
                                        required
                                        value={passcode} 
                                        onChange={e => setPasscode(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="4-digit code"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Email (Optional)</label>
                                <input 
                                    type="email"
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="staff@familyworld.com"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-600/20">
                                    {editingStaff ? 'Update Staff' : 'Create Login ID'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default StaffPage;
