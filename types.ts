
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  DIRTY = 'DIRTY'
}

export enum ItemCategory {
  FOOD = 'FOOD',
  DESSERT = 'DESSERT',
  ALCOHOLIC = 'ALCOHOLIC',
  SOFT_DRINK = 'SOFT_DRINK',
  WATER = 'WATER',
  SPIRIT = 'SPIRIT',
  WHISKY = 'WHISKY',
  SMOOTHIE = 'SMOOTHIE',
  COOKING_ESSENTIAL = 'COOKING_ESSENTIAL'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // Selling Price
  category: ItemCategory;
  image: string;
  stock: number; // For inventory tracking
  isAvailable: boolean;
  
  // New Inventory/Bar Fields
  unit?: string; // e.g., 'Plate', 'Bottle', 'Shot', 'Kg', 'Litre'
  costPrice?: number; // For profit calculation
  supplier?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  category: ItemCategory;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string | 'TAKEAWAY';
  items: OrderItem[];
  status: OrderStatus;
  timestamp: Date;
  total: number;
  notes?: string;
  customerName?: string;
  staffId?: string;
  staffName?: string;
}

export interface Table {
  id: string;
  label: string;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'MANAGER' | 'ADMIN' | 'WAITER' | 'CHEF' | 'BARTENDER';
  status: 'ACTIVE' | 'OFF_DUTY';
  passcode: string; // For login
  email?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  notes?: string;
  lastVisit: Date;
}

export interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  contact?: string;
  time: string; // ISO String for easier handling
  guests: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  notes?: string;
}

export interface SystemSettings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number; // Percentage (e.g., 10 for 10%)
  receiptFooter: string;
  standbyMinutes: number; // 0 = disabled
}
