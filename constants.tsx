
import { ItemCategory, MenuItem, Staff, Table, TableStatus, Customer } from "./types";

export const DRINK_CATEGORIES = [
  ItemCategory.ALCOHOLIC,
  ItemCategory.SOFT_DRINK,
  ItemCategory.WATER,
  ItemCategory.SPIRIT,
  ItemCategory.WHISKY,
  ItemCategory.SMOOTHIE
];

export const INITIAL_MENU: MenuItem[] = [
  { 
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    name: 'Pepperoni Pizza', 
    description: 'Classic cheese pizza topped with spicy pepperoni slices and fresh basil.', 
    price: 250.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', 
    stock: 20, 
    isAvailable: true,
    unit: 'Large Box',
    costPrice: 120.00
  },
  { 
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    name: 'Jollof Rice & Chicken', 
    description: 'Smoky party jollof rice served with seasoned fried chicken and coleslaw.', 
    price: 150.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1000&auto=format&fit=crop', 
    stock: 50, 
    isAvailable: true,
    unit: 'Plate',
    costPrice: 65.00
  },
  { 
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
    name: 'White Rice & Stew', 
    description: 'Steamed white rice served with savory red tomato stew and beef.', 
    price: 100.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000&auto=format&fit=crop', 
    stock: 40, 
    isAvailable: true,
    unit: 'Plate',
    costPrice: 45.00
  },
  { 
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
    name: 'Spring Rolls', 
    description: 'Golden crispy pastry rolls filled with vegetables and minced meat.', 
    price: 60.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1544025162-d76690b6d029?q=80&w=1000&auto=format&fit=crop', 
    stock: 100, 
    isAvailable: true,
    unit: 'Portion (3pcs)',
    costPrice: 20.00
  },
  { 
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 
    name: 'Greek Salad', 
    description: 'Fresh cucumbers, cherry tomatoes, feta cheese, and olives.', 
    price: 80.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop', 
    stock: 25, 
    isAvailable: true,
    unit: 'Bowl',
    costPrice: 35.00
  },
  { 
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 
    name: 'Club Sandwich', 
    description: 'Triple-decker toasted sandwich with chicken, bacon, lettuce, and fries.', 
    price: 110.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000&auto=format&fit=crop', 
    stock: 30, 
    isAvailable: true,
    unit: 'Pack',
    costPrice: 50.00
  },
  { 
    id: 'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 
    name: 'Fruit Parfait', 
    description: 'Fresh seasonal berries and fruits topped with creamy yogurt.', 
    price: 75.00, 
    category: ItemCategory.DESSERT, 
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop', 
    stock: 20, 
    isAvailable: true,
    unit: 'Cup',
    costPrice: 30.00
  },
  { 
    id: 'h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 
    name: 'Goat Meat Pepper Soup', 
    description: 'Traditional hot and spicy broth with tender goat meat cuts.', 
    price: 130.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1000&auto=format&fit=crop', 
    stock: 15, 
    isAvailable: true,
    unit: 'Bowl',
    costPrice: 70.00
  },
  { 
    id: 'i8eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 
    name: 'Beef Suya', 
    description: 'Spicy grilled beef skewers served with sliced onions and dried pepper.', 
    price: 100.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1000&auto=format&fit=crop', 
    stock: 40, 
    isAvailable: true,
    unit: 'Portion',
    costPrice: 55.00
  },
  { 
    id: 'j9eebc99-9c0b-4ef8-bb6d-6bb9bd380b00', 
    name: 'Fried Rice Special', 
    description: 'Rich stir-fried rice with mixed vegetables, shrimp, and liver.', 
    price: 120.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1603133872878-684f108fd1f2?q=80&w=1000&auto=format&fit=crop', 
    stock: 45, 
    isAvailable: true,
    unit: 'Plate',
    costPrice: 60.00
  },
  { 
    id: 'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 
    name: 'Spicy Chicken Wings', 
    description: 'Grilled chicken wings tossed in a hot and tangy pepper sauce.', 
    price: 90.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1000&auto=format&fit=crop', 
    stock: 60, 
    isAvailable: true,
    unit: 'Basket (6pcs)',
    costPrice: 40.00
  },
  { 
    id: 'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 
    name: 'Tea & Biscuits', 
    description: 'Hot creamy milk tea served with a side of crunchy biscuits.', 
    price: 45.00, 
    category: ItemCategory.SOFT_DRINK, 
    image: 'https://images.unsplash.com/photo-1578859942637-2591636c7a6e?q=80&w=1000&auto=format&fit=crop', 
    stock: 100, 
    isAvailable: true,
    unit: 'Cup',
    costPrice: 15.00
  },
  { 
    id: 'm2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 
    name: 'Kebab Skewers', 
    description: 'Seasoned meatballs and vegetables grilled on a skewer.', 
    price: 95.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1000&auto=format&fit=crop', 
    stock: 30, 
    isAvailable: true,
    unit: 'Stick',
    costPrice: 45.00
  },
  { 
    id: 'n3eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 
    name: 'Pounded Yam & Egusi', 
    description: 'Soft pounded yam served with rich melon soup and assorted meat.', 
    price: 180.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1643656113645-31c379f64267?q=80&w=1000&auto=format&fit=crop', 
    stock: 20, 
    isAvailable: true,
    unit: 'Bowl',
    costPrice: 90.00
  },
  { 
    id: 'o4eebc99-9c0b-4ef8-bb6d-6bb9bd380b55', 
    name: 'Grilled Fish', 
    description: 'Whole grilled tilapia served with roasted plantain and pepper sauce.', 
    price: 220.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1534939561126-855f86b12801?q=80&w=1000&auto=format&fit=crop', 
    stock: 10, 
    isAvailable: true,
    unit: 'Whole',
    costPrice: 130.00
  },
  { 
    id: 'p5eebc99-9c0b-4ef8-bb6d-6bb9bd380b66', 
    name: 'Crispy Chicken Burger', 
    description: 'Crunchy fried chicken breast in a brioche bun with fresh lettuce.', 
    price: 120.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?q=80&w=1000&auto=format&fit=crop', 
    stock: 40, 
    isAvailable: true,
    unit: 'Piece',
    costPrice: 65.00
  },
  { 
    id: 'q6eebc99-9c0b-4ef8-bb6d-6bb9bd380b77', 
    name: 'Seafood Okra', 
    description: 'Fresh chopped okra soup loaded with crabs, fish, and prawns.', 
    price: 190.00, 
    category: ItemCategory.FOOD, 
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=1000&auto=format&fit=crop', 
    stock: 15, 
    isAvailable: true,
    unit: 'Bowl',
    costPrice: 100.00
  },
  // INVENTORY ESSENTIALS
  {
    id: 'r7eebc99-9c0b-4ef8-bb6d-6bb9bd380b88',
    name: 'Rice (50kg Bag)',
    description: 'Premium Long Grain Jasmine Rice',
    price: 0, // Essentials don't have a selling price usually
    costPrice: 850.00,
    category: ItemCategory.COOKING_ESSENTIAL,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1000&auto=format&fit=crop',
    stock: 10,
    isAvailable: true,
    unit: 'Bag (50kg)',
    supplier: 'Global Grains Ltd'
  },
  {
    id: 's8eebc99-9c0b-4ef8-bb6d-6bb9bd380b99',
    name: 'Vegetable Oil (25L)',
    description: 'Pure refined vegetable cooking oil',
    price: 0,
    costPrice: 450.00,
    category: ItemCategory.COOKING_ESSENTIAL,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1000&auto=format&fit=crop',
    stock: 5,
    isAvailable: true,
    unit: 'Jerrycan (25L)',
    supplier: 'Oils & More'
  },
  {
    id: 't9eebc99-9c0b-4ef8-bb6d-6bb9bd380c00',
    name: 'Frozen Chicken Carton',
    description: '10kg Imported Frozen Chicken Backs',
    price: 0,
    costPrice: 320.00,
    category: ItemCategory.COOKING_ESSENTIAL,
    image: 'https://images.unsplash.com/photo-1615486367564-b58cb69668d2?q=80&w=1000&auto=format&fit=crop',
    stock: 12,
    isAvailable: true,
    unit: 'Carton (10kg)',
    supplier: 'Cold Chain Logistics'
  }
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t-${i + 1}`,
  label: `Table ${i + 1}`,
  seats: i % 2 === 0 ? 4 : 2,
  status: TableStatus.AVAILABLE,
}));

export const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: 'John Doe', role: 'MANAGER', status: 'ACTIVE', passcode: '1234', email: 'john@familyworld.com', phone: '0200000001' },
  { id: 'admin', name: 'Super Admin', role: 'ADMIN', status: 'ACTIVE', passcode: '0000', email: 'admin@familyworld.com', phone: '0200000000' },
  { id: 's2', name: 'Jane Smith', role: 'CHEF', status: 'ACTIVE', passcode: '1111', email: 'jane@familyworld.com', phone: '0200000002' },
  { id: 's3', name: 'Mike Johnson', role: 'WAITER', status: 'ACTIVE', passcode: '2222', email: 'mike@familyworld.com', phone: '0200000003' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
    { id: 'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', name: 'Alice Frempong', phone: '0244123456', email: 'alice@example.com', loyaltyPoints: 150, lastVisit: new Date('2023-10-15'), notes: 'Loves spicy food' },
    { id: 'v1eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', name: 'Kwame Mensah', phone: '0501239876', email: 'kwame@example.com', loyaltyPoints: 50, lastVisit: new Date('2023-11-01'), notes: 'Allergic to peanuts' },
    { id: 'w2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', name: 'Sarah Osei', phone: '0555678901', loyaltyPoints: 320, lastVisit: new Date('2023-11-20'), notes: 'VIP customer' },
];
