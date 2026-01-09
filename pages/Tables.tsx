
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { TableStatus, Reservation, Table } from '../types';
import { Users, Calendar, Clock, Phone, MoreVertical, Plus, Edit, Trash2, X, CheckCircle, RotateCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Tables: React.FC = () => {
  const { tables, updateTableStatus, reservations, addReservation, updateReservation, removeReservation, addTable, deleteTable } = useStore();
  
  // State for modals
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  // Add Table Modal State
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);

  // Helper to open reservation form
  const openReservationForm = (reservation?: Reservation, tableId?: string) => {
    setEditingReservation(reservation || {
      id: '',
      tableId: tableId || tables[0].id,
      customerName: '',
      contact: '',
      guests: 2,
      time: new Date().toISOString().slice(0, 16), // Current time for datetime-local
      status: 'CONFIRMED',
      notes: ''
    });
    setIsReservationModalOpen(true);
  };

  const handleAddTable = (e: React.FormEvent) => {
      e.preventDefault();
      addTable({
          id: uuidv4(),
          label: newTableLabel,
          seats: newTableSeats,
          status: TableStatus.AVAILABLE
      });
      setIsAddTableModalOpen(false);
      setNewTableLabel('');
      setNewTableSeats(4);
  };

  const getStatusColor = (status: TableStatus) => {
    switch(status) {
        case TableStatus.AVAILABLE: return 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-100';
        case TableStatus.OCCUPIED: return 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-100';
        case TableStatus.DIRTY: return 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-100';
        case TableStatus.RESERVED: return 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 text-blue-100';
        default: return 'bg-slate-800 text-slate-200';
    }
  };

  // Sort reservations by time
  const sortedReservations = useMemo(() => {
    return [...reservations]
      .filter(r => r.status !== 'CANCELLED') // Optional: hide cancelled
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [reservations]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-950">
      {/* LEFT: Floor Plan */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Floor Plan</h1>
            <p className="text-slate-400 mt-1">Manage tables and real-time status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <Legend color="bg-emerald-500" label="Available" />
                <Legend color="bg-rose-500" label="Occupied" />
                <Legend color="bg-blue-500" label="Reserved" />
                <Legend color="bg-yellow-500" label="Dirty" />
            </div>
            <button 
                onClick={() => setIsAddTableModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
                <Plus size={20} /> Add Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => {
            // Check if reserved soon (within 2 hours)
            const upcomingRes = reservations.find(r => 
                r.tableId === table.id && 
                r.status === 'CONFIRMED' &&
                new Date(r.time) > new Date() &&
                new Date(r.time).getTime() - new Date().getTime() < 7200000 // 2 hours
            );

            return (
                <div 
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group ${getStatusColor(table.status)}`}
                >
                    <div className="text-3xl font-bold mb-2">{table.label}</div>
                    <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm">
                        <Users size={14} />
                        <span>{table.seats}</span>
                    </div>
                    
                    {upcomingRes && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="Upcoming Reservation"></div>
                    )}

                    <div className="mt-4 text-xs uppercase font-bold tracking-widest opacity-75">
                        {table.status}
                    </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Reservations Sidebar */}
      <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-indigo-400" size={20} />
                    Reservations
                </h2>
                <button 
                    onClick={() => openReservationForm()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
                    title="New Reservation"
                >
                    <Plus size={20} />
                </button>
            </div>
            
            <div className="flex gap-2 text-xs font-semibold text-slate-500 bg-slate-800 p-1 rounded-lg">
                <button className="flex-1 py-1 px-2 bg-slate-700 text-white rounded shadow">Upcoming</button>
                <button className="flex-1 py-1 px-2 hover:bg-slate-700 hover:text-white rounded transition-colors">History</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedReservations.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">
                    <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No upcoming reservations.</p>
                </div>
            ) : (
                sortedReservations.map(res => (
                    <div key={res.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white text-lg">{res.customerName}</h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openReservationForm(res)} className="p-1 hover:bg-slate-700 rounded text-blue-400"><Edit size={14} /></button>
                                <button onClick={() => removeReservation(res.id)} className="p-1 hover:bg-slate-700 rounded text-rose-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-indigo-400" />
                                <span>{new Date(res.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-indigo-400" />
                                    <span>{res.guests} Guests</span>
                                </div>
                                <span className="text-indigo-300 font-mono font-bold bg-indigo-500/10 px-2 rounded">
                                    {tables.find(t => t.id === res.tableId)?.label || 'Unknown Table'}
                                </span>
                            </div>
                            {res.contact && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Phone size={12} /> {res.contact}
                                </div>
                            )}
                            <div className={`text-xs inline-block px-2 py-0.5 rounded uppercase font-bold ${
                                res.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 
                                res.status === 'CHECKED_IN' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'
                            }`}>
                                {res.status}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* MODAL: Table Details */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTable(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{selectedTable.label}</h2>
                        <p className="text-slate-400">{selectedTable.seats} Seater</p>
                    </div>
                    <button onClick={() => setSelectedTable(null)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Change Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <StatusButton 
                                active={selectedTable.status === TableStatus.AVAILABLE} 
                                onClick={() => { updateTableStatus(selectedTable.id, TableStatus.AVAILABLE); setSelectedTable(null); }}
                                color="emerald"
                                label="Available"
                                icon={<CheckCircle size={18} />}
                            />
                            <StatusButton 
                                active={selectedTable.status === TableStatus.OCCUPIED} 
                                onClick={() => { updateTableStatus(selectedTable.id, TableStatus.OCCUPIED); setSelectedTable(null); }}
                                color="rose"
                                label="Occupied"
                                icon={<Users size={18} />}
                            />
                            <StatusButton 
                                active={selectedTable.status === TableStatus.DIRTY} 
                                onClick={() => { updateTableStatus(selectedTable.id, TableStatus.DIRTY); setSelectedTable(null); }}
                                color="yellow"
                                label="Dirty"
                                icon={<RotateCw size={18} />}
                            />
                             <StatusButton 
                                active={selectedTable.status === TableStatus.RESERVED} 
                                onClick={() => { updateTableStatus(selectedTable.id, TableStatus.RESERVED); setSelectedTable(null); }}
                                color="blue"
                                label="Reserved"
                                icon={<Calendar size={18} />}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    setSelectedTable(null);
                                    openReservationForm(undefined, selectedTable.id);
                                }}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                <Calendar size={18} />
                                Add Reservation
                            </button>
                             <button 
                                onClick={() => {
                                    if(confirm(`Are you sure you want to delete ${selectedTable.label}?`)) {
                                        deleteTable(selectedTable.id);
                                        setSelectedTable(null);
                                    }
                                }}
                                className="w-full py-3 bg-slate-800 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 border border-slate-700 hover:border-rose-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: Add Table */}
      {isAddTableModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Add New Table</h2>
                <form onSubmit={handleAddTable} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Table Label</label>
                        <input 
                            required
                            value={newTableLabel} 
                            onChange={e => setNewTableLabel(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="e.g. Table 15, VIP 2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Seats</label>
                        <input 
                            type="number"
                            min="1"
                            required
                            value={newTableSeats} 
                            onChange={e => setNewTableSeats(parseInt(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setIsAddTableModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-600/20">
                            Create Table
                        </button>
                    </div>
                </form>
              </div>
          </div>
      )}

      {/* MODAL: Reservation Form */}
      {isReservationModalOpen && editingReservation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                    {editingReservation.id ? 'Edit Reservation' : 'New Reservation'}
                </h2>
                
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (editingReservation.id) {
                            updateReservation(editingReservation);
                        } else {
                            addReservation({ ...editingReservation, id: uuidv4() });
                        }
                        setIsReservationModalOpen(false);
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
                            <input 
                                required
                                value={editingReservation.customerName} 
                                onChange={e => setEditingReservation({...editingReservation, customerName: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Contact Info</label>
                            <input 
                                value={editingReservation.contact} 
                                onChange={e => setEditingReservation({...editingReservation, contact: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                placeholder="+233..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Date & Time</label>
                            <input 
                                type="datetime-local"
                                required
                                value={editingReservation.time}
                                onChange={e => setEditingReservation({...editingReservation, time: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm text-slate-400 mb-1">Guests</label>
                            <input 
                                type="number"
                                min="1"
                                required
                                value={editingReservation.guests} 
                                onChange={e => setEditingReservation({...editingReservation, guests: parseInt(e.target.value)})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Select Table</label>
                        <select 
                            value={editingReservation.tableId}
                            onChange={e => setEditingReservation({...editingReservation, tableId: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            {tables.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.label} ({t.seats} Seats) - {t.status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                         <label className="block text-sm text-slate-400 mb-1">Notes</label>
                         <textarea 
                            value={editingReservation.notes}
                            onChange={e => setEditingReservation({...editingReservation, notes: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white h-20 focus:outline-none focus:border-indigo-500"
                            placeholder="Allergies, special occasion..."
                         />
                    </div>

                    {editingReservation.id && (
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Status</label>
                            <select 
                                value={editingReservation.status}
                                onChange={e => setEditingReservation({...editingReservation, status: e.target.value as any})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CHECKED_IN">Checked In (Occupies Table)</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setIsReservationModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-600/20">
                            Save Reservation
                        </button>
                    </div>
                </form>
              </div>
          </div>
      )}
    </div>
  );
};

const Legend = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm text-slate-400">{label}</span>
    </div>
);

const StatusButton = ({ active, onClick, color, label, icon }: any) => {
    const colorClasses: Record<string, string> = {
        emerald: active ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400',
        rose: active ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-rose-500/50 hover:text-rose-400',
        yellow: active ? 'bg-yellow-500 text-white border-yellow-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-yellow-500/50 hover:text-yellow-400',
        blue: active ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500/50 hover:text-blue-400',
    };

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${colorClasses[color]}`}
        >
            <div className="mb-1">{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    )
}

export default Tables;
