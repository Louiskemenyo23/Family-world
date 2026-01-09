
import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ItemCategory, MenuItem } from '../types';
import { DRINK_CATEGORIES } from '../constants';
import { Plus, Trash2, Wand2, Pencil, Upload, X, Filter, Tag, Box, DollarSign, CheckCircle, Ban, ShieldAlert, Package, Truck, Coins } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateMenuDescription } from '../services/geminiService';

interface MenuProps {
    viewType: 'food' | 'bar' | 'inventory';
}

const Menu: React.FC<MenuProps> = ({ viewType }) => {
  const { menu, addMenuItem, deleteMenuItem, updateMenuItem } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemIngredients, setNewItemIngredients] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>(ItemCategory.FOOD);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemStock, setNewItemStock] = useState('50'); 
  
  // New Inventory Fields
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCostPrice, setNewItemCostPrice] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  // Filter menu based on viewType
  const filteredMenu = useMemo(() => {
      if (viewType === 'inventory') {
          // Inventory View: Drinks and Cooking Essentials ONLY. Exclude Prepared Food.
          return menu.filter(item => 
              DRINK_CATEGORIES.includes(item.category) || 
              item.category === ItemCategory.COOKING_ESSENTIAL
          );
      }
      if (viewType === 'bar') {
          return menu.filter(item => DRINK_CATEGORIES.includes(item.category));
      }
      // Food View: Food and Dessert
      return menu.filter(item => item.category === ItemCategory.FOOD || item.category === ItemCategory.DESSERT);
  }, [menu, viewType]);

  const pageTitle = useMemo(() => {
      if (viewType === 'bar') return 'Bar Management';
      if (viewType === 'food') return 'Food Menu Management';
      return 'Stock Inventory (Admin)';
  }, [viewType]);

  const handleGenerateDescription = async () => {
    if (!newItemName) return alert("Please enter item name first");
    setLoadingAI(true);
    const desc = await generateMenuDescription(newItemName, newItemIngredients);
    setNewItemDescription(desc);
    setLoadingAI(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    resetForm();
    // Set default category based on viewType
    if (viewType === 'bar') setNewItemCategory(ItemCategory.ALCOHOLIC);
    else if (viewType === 'food') setNewItemCategory(ItemCategory.FOOD);
    else if (viewType === 'inventory') setNewItemCategory(ItemCategory.COOKING_ESSENTIAL);
    
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setViewingItem(null); // Close details view if open
    setEditingId(item.id);
    setNewItemName(item.name);
    setNewItemPrice(item.price.toString());
    setNewItemCategory(item.category);
    setNewItemDescription(item.description);
    setNewItemImage(item.image);
    setNewItemStock(item.stock.toString());
    setNewItemIngredients(''); 
    
    // Inventory fields
    setNewItemUnit(item.unit || '');
    setNewItemCostPrice(item.costPrice ? item.costPrice.toString() : '');
    setNewItemSupplier(item.supplier || '');

    setShowModal(true);
  };

  const handleDelete = (id: string) => {
      if(confirm('Are you sure you want to delete this item?')) {
          deleteMenuItem(id);
          setViewingItem(null);
      }
  }

  const toggleAvailability = (item: MenuItem) => {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      updateMenuItem(updatedItem);
      setViewingItem(updatedItem);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If editing, try to find existing item
    const existingItem = editingId ? menu.find(i => i.id === editingId) : null;
    const isAvailable = existingItem ? existingItem.isAvailable : true;
    
    // Use form stock value for inventory/bar items, or preserve existing for food if hidden
    const parsedStock = parseInt(newItemStock);
    const stock = viewType !== 'food' ? (isNaN(parsedStock) ? 0 : parsedStock) : (existingItem ? existingItem.stock : 50);

    const itemData: MenuItem = {
        id: editingId || uuidv4(),
        name: newItemName,
        description: newItemDescription,
        price: parseFloat(newItemPrice) || 0,
        category: newItemCategory,
        image: newItemImage || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
        stock: stock,
        isAvailable: isAvailable,
        unit: newItemUnit,
        costPrice: parseFloat(newItemCostPrice) || 0,
        supplier: newItemSupplier
    };

    if (editingId) {
        updateMenuItem(itemData);
    } else {
        addMenuItem(itemData);
    }
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItemName('');
    setNewItemIngredients('');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemImage('');
    setNewItemStock('50');
    setNewItemUnit('');
    setNewItemCostPrice('');
    setNewItemSupplier('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render Category Options based on viewType
  const renderCategoryOptions = () => {
      if (viewType === 'inventory') {
          // Inventory allows managing drinks and essentials
          return (
              <>
                <option value={ItemCategory.COOKING_ESSENTIAL}>Cooking Essential / Ingredient</option>
                <optgroup label="Bar Stock">
                    <option value={ItemCategory.ALCOHOLIC}>Alcoholic</option>
                    <option value={ItemCategory.SOFT_DRINK}>Soft Drink</option>
                    <option value={ItemCategory.WATER}>Water</option>
                    <option value={ItemCategory.SPIRIT}>Spirit</option>
                    <option value={ItemCategory.WHISKY}>Whisky</option>
                    <option value={ItemCategory.SMOOTHIE}>Smoothie</option>
                </optgroup>
              </>
          );
      }
      if (viewType === 'bar') {
          return (
            <>
                <option value={ItemCategory.ALCOHOLIC}>Alcoholic</option>
                <option value={ItemCategory.SOFT_DRINK}>Soft Drink</option>
                <option value={ItemCategory.WATER}>Water</option>
                <option value={ItemCategory.SPIRIT}>Spirit</option>
                <option value={ItemCategory.WHISKY}>Whisky</option>
                <option value={ItemCategory.SMOOTHIE}>Smoothie</option>
            </>
          );
      }
      if (viewType === 'food') {
          return (
              <>
                <option value={ItemCategory.FOOD}>Food</option>
                <option value={ItemCategory.DESSERT}>Dessert</option>
              </>
          );
      }
      return null;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {pageTitle}
                {viewType === 'inventory' && <ShieldAlert size={20} className="text-indigo-400" />}
            </h1>
            <p className="text-slate-400 mt-1">
                {viewType === 'inventory' 
                    ? 'Admin Only: Manage Bar Stock and Kitchen Cooking Essentials' 
                    : `Manage ${viewType} items, prices, and descriptions`}
            </p>
        </div>
        <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-600/20"
        >
            <Plus size={20} /> Add {viewType === 'bar' ? 'Drink' : viewType === 'food' ? 'Dish' : 'Stock Item'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm">
                <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / Cost</th>
                    {viewType !== 'food' && <th className="p-4">Stock Availability</th>}
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {filteredMenu.length === 0 ? (
                    <tr>
                        <td colSpan={viewType === 'food' ? 4 : 5} className="p-8 text-center text-slate-500">
                            <Filter size={32} className="mx-auto mb-2 opacity-20" />
                            No items found in this category.
                        </td>
                    </tr>
                ) : (
                    filteredMenu.map(item => (
                        <tr 
                            key={item.id} 
                            onClick={() => setViewingItem(item)}
                            className={`hover:bg-slate-800/30 transition-colors cursor-pointer group ${!item.isAvailable ? 'opacity-50 grayscale-[0.5]' : ''}`}
                        >
                            <td className="p-4 flex items-center gap-4">
                                <img src={item.image} className="w-24 h-24 rounded-lg object-cover bg-slate-800" alt="" />
                                <div>
                                    <div className="font-semibold text-white text-lg group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                        {item.name}
                                        {!item.isAvailable && (
                                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Unavailable</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500 max-w-xs truncate">{item.description}</div>
                                    {viewType === 'inventory' && item.supplier && (
                                        <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                                            <Truck size={10} /> {item.supplier}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    item.category === ItemCategory.COOKING_ESSENTIAL 
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : DRINK_CATEGORIES.includes(item.category) 
                                        ? 'bg-purple-500/10 text-purple-400' 
                                        : 'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {item.category.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="p-4 font-mono">
                                <div className="text-indigo-400 font-bold">
                                    {item.price > 0 ? `₵${item.price.toFixed(2)}` : '-'}
                                </div>
                                {viewType === 'inventory' && item.costPrice && (
                                    <div className="text-xs text-slate-500">Cost: ₵{item.costPrice.toFixed(2)}</div>
                                )}
                            </td>
                            {viewType !== 'food' && (
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock < 20 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                        {item.stock} {item.unit || 'units'}
                                    </span>
                                </td>
                            )}
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditModal(item); }} 
                                        className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition-colors" 
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                                        className="p-2 hover:bg-rose-500/20 rounded text-rose-400 transition-colors" 
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* VIEW ITEM MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingItem(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative h-64">
                    <img src={viewingItem.image} alt={viewingItem.name} className={`w-full h-full object-cover ${!viewingItem.isAvailable ? 'grayscale' : ''}`} />
                    <button 
                        onClick={() => setViewingItem(null)} 
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-10"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent pt-20">
                        <h2 className="text-3xl font-bold text-white shadow-sm">{viewingItem.name}</h2>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                                viewingItem.category === ItemCategory.COOKING_ESSENTIAL ? 'bg-blue-500/10 text-blue-400' :
                                DRINK_CATEGORIES.includes(viewingItem.category) ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
                            }`}>
                                <Tag size={14} />
                                {viewingItem.category.replace(/_/g, ' ')}
                            </div>
                            {viewType !== 'food' && (
                                <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 flex items-center gap-2">
                                    <Box size={14} />
                                    {viewingItem.stock} {viewingItem.unit}
                                </div>
                            )}
                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 flex items-center gap-2">
                                <DollarSign size={14} />
                                ₵{viewingItem.price.toFixed(2)}
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800 w-full sm:w-fit">
                            <span className="text-sm text-slate-400 font-medium">Availability:</span>
                            <button
                                onClick={() => toggleAvailability(viewingItem)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${viewingItem.isAvailable ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${viewingItem.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-sm font-bold flex items-center gap-1.5 ${viewingItem.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {viewingItem.isAvailable ? <><CheckCircle size={14}/> Available</> : <><Ban size={14}/> Unavailable</>}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</h3>
                        <p className="text-slate-200 leading-relaxed">
                            {viewingItem.description}
                        </p>
                    </div>

                    {/* Inventory Details Block */}
                    {viewType === 'inventory' && (
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Truck size={12} /> Supplier</div>
                                <div className="text-white font-medium">{viewingItem.supplier || 'N/A'}</div>
                             </div>
                             <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Coins size={12} /> Cost Price</div>
                                <div className="text-white font-medium">₵{viewingItem.costPrice?.toFixed(2) || '0.00'}</div>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button 
                            onClick={() => openEditModal(viewingItem)}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <Pencil size={18} /> Edit Item
                        </button>
                        <button 
                            onClick={() => handleDelete(viewingItem.id)}
                            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 border border-slate-700 hover:border-rose-800 py-3 rounded-xl font-semibold transition-colors"
                        >
                            <Trash2 size={18} /> Delete Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">
                    {editingId ? 'Edit Item' : 'Add New Item'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column: Image */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm text-slate-400 mb-2">Item Image</label>
                            <div className="relative group w-full aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg overflow-hidden flex flex-col items-center justify-center hover:border-indigo-500 transition-colors">
                                {newItemImage ? (
                                    <>
                                        <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button" 
                                                onClick={() => { setNewItemImage(''); if(fileInputRef.current) fileInputRef.current.value=''; }}
                                                className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={32} className="mx-auto text-slate-500 mb-2" />
                                        <p className="text-xs text-slate-400">Click to upload</p>
                                    </div>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="hidden" 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()} 
                                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 w-full text-center"
                            >
                                {newItemImage ? 'Change Image' : 'Select Image from Device'}
                            </button>
                        </div>

                        {/* Right Column: Details */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Name</label>
                                    <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g. Lobster Roll" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">
                                        {viewType === 'inventory' ? 'Selling Price (if applicable)' : 'Selling Price (₵)'}
                                    </label>
                                    <input required type="number" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                                </div>
                            </div>

                            {/* Inventory Specific Fields */}
                            {(viewType === 'inventory' || viewType === 'bar') && (
                                <div className="grid grid-cols-3 gap-4 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                                    <div className="col-span-1">
                                         <label className="block text-xs text-slate-400 mb-1">Unit</label>
                                         <input value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white" placeholder="e.g. Kg, Bottle" />
                                    </div>
                                    <div className="col-span-1">
                                         <label className="block text-xs text-slate-400 mb-1">Cost Price</label>
                                         <input type="number" step="0.01" value={newItemCostPrice} onChange={e => setNewItemCostPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white" placeholder="0.00" />
                                    </div>
                                    <div className="col-span-1">
                                         <label className="block text-xs text-slate-400 mb-1">Stock</label>
                                         <input type="number" value={newItemStock} onChange={e => setNewItemStock(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white" placeholder="0" />
                                    </div>
                                    <div className="col-span-3">
                                         <label className="block text-xs text-slate-400 mb-1">Supplier</label>
                                         <input value={newItemSupplier} onChange={e => setNewItemSupplier(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white" placeholder="Supplier Name" />
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Category</label>
                                <select 
                                    value={newItemCategory} 
                                    onChange={e => setNewItemCategory(e.target.value as any)} 
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                >
                                    {renderCategoryOptions()}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm text-slate-400">Description</label>
                                    <button type="button" onClick={handleGenerateDescription} disabled={loadingAI} className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                                        <Wand2 size={12} /> {loadingAI ? 'Generating...' : 'Auto-Generate'}
                                    </button>
                                </div>
                                <textarea required value={newItemDescription} onChange={e => setNewItemDescription(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none h-24" placeholder="Description..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-indigo-600/20">
                            {editingId ? 'Update Item' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
