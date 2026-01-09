
import React from 'react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import { DRINK_CATEGORIES } from '../constants';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react';

const Kitchen: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const activeOrders = orders.filter(o => 
    o.status !== OrderStatus.SERVED && 
    o.status !== OrderStatus.PAID && 
    o.status !== OrderStatus.CANCELLED &&
    // Ensure the order has at least one item that is NOT a drink
    o.items.some(item => !DRINK_CATEGORIES.includes(item.category))
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case OrderStatus.PREPARING: return 'border-blue-500 bg-blue-500/10 text-blue-400';
      case OrderStatus.READY: return 'border-green-500 bg-green-500/10 text-green-400';
      default: return 'border-slate-700';
    }
  };

  const advanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (currentStatus === OrderStatus.PENDING) updateOrderStatus(orderId, OrderStatus.PREPARING);
    else if (currentStatus === OrderStatus.PREPARING) updateOrderStatus(orderId, OrderStatus.READY);
    else if (currentStatus === OrderStatus.READY) updateOrderStatus(orderId, OrderStatus.SERVED);
  };

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-lg"><Clock size={24} /></span>
            Kitchen Display System
        </h1>
        <div className="text-xl font-mono text-indigo-400">{new Date().toLocaleTimeString()}</div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full">
            {activeOrders.length === 0 && (
                <div className="w-full flex items-center justify-center text-slate-500 flex-col gap-4 border-2 border-dashed border-slate-800 rounded-2xl">
                    <CheckCircle size={48} />
                    <span className="text-xl">All caught up! No active food orders.</span>
                </div>
            )}
            
            {activeOrders.map(order => (
                <div key={order.id} className={`w-80 flex-shrink-0 flex flex-col bg-slate-900 border-t-4 rounded-xl shadow-xl ${getStatusColor(order.status)} border-x border-b border-slate-800`}>
                    <div className="p-4 border-b border-slate-800/50">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white">#{order.id.slice(0, 4)}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>{order.tableId === 'TAKEAWAY' ? 'Takeaway' : `Table ${order.tableId.replace('t-','')}`}</span>
                            <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
                        {order.items
                            .filter(item => !DRINK_CATEGORIES.includes(item.category)) // Filter out drinks from view
                            .map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-800 rounded-full text-white font-bold">{item.quantity}</span>
                                    <span className="text-slate-200 font-medium leading-tight">{item.name}</span>
                                </div>
                                {item.notes && (
                                    <div className="ml-11 text-xs text-amber-400 italic bg-amber-500/10 p-1.5 rounded border border-amber-500/20 flex items-start gap-1">
                                        <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                                        <span>{item.notes}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 mt-auto">
                        <button 
                            onClick={() => advanceStatus(order.id, order.status)}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {order.status === OrderStatus.PENDING && "Start Cooking"}
                            {order.status === OrderStatus.PREPARING && "Mark Ready"}
                            {order.status === OrderStatus.READY && "Mark Served"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
