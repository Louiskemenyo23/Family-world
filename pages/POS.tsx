
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ItemCategory, MenuItem, Order, OrderStatus } from '../types';
import { DRINK_CATEGORIES } from '../constants';
import { Search, ShoppingCart, Trash2, CreditCard, User, Tag, CheckCircle, MessageSquare, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const POS: React.FC = () => {
  const { menu, addOrder, tables, currentUser, settings } = useStore();
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes?: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL' | 'DRINK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('TAKEAWAY');
  const [customerName, setCustomerName] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Note Modal State
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Filter definitions
  const filterOptions = [
    { value: 'ALL', label: 'All' },
    { value: ItemCategory.FOOD, label: 'Food' },
    { value: 'DRINK', label: 'Drinks Only' },
    { value: ItemCategory.DESSERT, label: 'Dessert' }
  ];

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      // Exclude Cooking Essentials from POS
      if (item.category === ItemCategory.COOKING_ESSENTIAL) return false;

      let matchesCategory = false;
      if (selectedCategory === 'ALL') {
          matchesCategory = true;
      } else if (selectedCategory === 'DRINK') {
          matchesCategory = DRINK_CATEGORIES.includes(item.category);
      } else {
          matchesCategory = item.category === selectedCategory;
      }

      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      // Check for existing item WITHOUT notes (items with notes are treated as unique lines)
      const existingIndex = prev.findIndex(i => i.item.id === item.id && !i.notes);
      
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((line, i) => {
      if (i === index) {
        const newQty = Math.max(1, line.quantity + delta);
        return { ...line, quantity: newQty };
      }
      return line;
    }));
  };

  const openNoteModal = (index: number) => {
    setEditingNoteIndex(index);
    setNoteInput(cart[index].notes || '');
  };

  const saveNote = () => {
    if (editingNoteIndex !== null) {
      setCart(prev => prev.map((line, i) => {
        if (i === editingNoteIndex) {
          return { ...line, notes: noteInput };
        }
        return line;
      }));
      setEditingNoteIndex(null);
      setNoteInput('');
    }
  };

  // Calculations using dynamic settings
  const subtotal = cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const taxRate = settings.taxRate / 100; 
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Check if the order is purely drinks
    const isAllDrinks = cart.every(i => DRINK_CATEGORIES.includes(i.item.category));
    
    // Drink-only orders are immediately "SERVED" as they don't go to kitchen.
    // Mixed or Food orders are "PENDING" for kitchen processing.
    const initialStatus = isAllDrinks ? OrderStatus.SERVED : OrderStatus.PENDING;

    const newOrder: Order = {
      id: uuidv4(),
      tableId: selectedTable,
      items: cart.map(i => ({
        itemId: i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.quantity,
        category: i.item.category,
        notes: i.notes
      })),
      status: initialStatus,
      timestamp: new Date(),
      total: finalTotal, // Save the final inclusive total
      customerName: customerName || 'Guest',
      staffId: currentUser?.id,
      staffName: currentUser?.name
    };

    addOrder(newOrder);
    setCart([]);
    setCustomerName('');
    
    // Show success message
    setOrderSuccess(true);
    setTimeout(() => {
        setOrderSuccess(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-950 relative">
      
      {/* Success Modal Overlay */}
      {orderSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-emerald-500/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center transform scale-100 animate-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                      <CheckCircle size={48} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Order Placed!</h2>
                  <p className="text-emerald-400 font-medium">Successfully sent to kitchen/bar</p>
              </div>
          </div>
      )}

      {/* Note Edit Modal */}
      {editingNoteIndex !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add Note to Item</h3>
              <button onClick={() => setEditingNoteIndex(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              For: <span className="text-indigo-400 font-semibold">{cart[editingNoteIndex].item.name}</span>
            </p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none mb-4"
              placeholder="e.g. No onions, extra spicy..."
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingNoteIndex(null)}
                className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={saveNote}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium shadow-lg shadow-indigo-600/20"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Area */}
      <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
        {/* Header/Filters */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md mb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedCategory(option.value as any)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === option.value 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 lg:pb-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => (
              <div 
                key={item.id} 
                onClick={() => addToCart(item)}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-0 right-0 bg-slate-900/80 px-2 py-1 m-2 rounded text-xs font-bold text-white backdrop-blur-md">
                    {settings.currency}{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-200 truncate">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart/Sidebar Area */}
      <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} className="text-indigo-400" /> 
            Current Order
          </h2>
        </div>

        <div className="p-4 space-y-3 bg-slate-800/50">
            <div className="flex gap-2">
                 <div className="flex-1 bg-slate-800 rounded-lg flex items-center px-3 border border-slate-700">
                    <User size={16} className="text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-transparent border-none w-full text-sm text-white focus:outline-none py-2"
                    />
                 </div>
                 <select 
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                 >
                    <option value="TAKEAWAY">Takeaway</option>
                    {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                 </select>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <div className="mb-2 flex justify-center"><Tag size={32} className="opacity-20" /></div>
              Cart is empty
            </div>
          ) : (
            cart.map((line, idx) => (
              <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center flex-1 min-w-0">
                        <img 
                            src={line.item.image} 
                            alt={line.item.name} 
                            className="w-12 h-12 rounded-lg object-cover mr-3 bg-slate-700 flex-shrink-0" 
                        />
                        <div className="min-w-0">
                            <div className="font-medium text-sm text-white truncate">{line.item.name}</div>
                            <div className="text-xs text-slate-400">{settings.currency}{line.item.price.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                        <div className="flex items-center gap-1 bg-slate-900 rounded-lg px-1">
                            <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white">-</button>
                            <span className="text-sm font-semibold w-4 text-center">{line.quantity}</span>
                            <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white">+</button>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-rose-400 hover:text-rose-300 ml-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="flex items-start gap-2 mt-2">
                    <button 
                        onClick={() => openNoteModal(idx)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${line.notes ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                    >
                        <MessageSquare size={12} />
                        {line.notes ? 'Edit Note' : 'Add Note'}
                    </button>
                    {line.notes && (
                        <p className="text-xs text-slate-400 italic flex-1 truncate py-1">
                            "{line.notes}"
                        </p>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Subtotal</span>
            <span>{settings.currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Tax ({settings.taxRate}%)</span>
            <span>{settings.currency}{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-slate-800">
            <span>Total</span>
            <span>{settings.currency}{finalTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <CreditCard size={20} />
            Process Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
