export interface StrapiImage {
  id: number;
  url: string;
  name: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  products?: Product[];
}

export interface ProductAttribute {
  id: number;
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  description: string;
  image: string; // Mapped URL
  category?: Category | string;
  rating: number;
  stock: number;
  attributes?: ProductAttribute[];
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string; // Mapped URL
  link?: string;
  position: 'hero' | 'catalog_top' | 'catalog_bottom' | 'sidebar';
  isActive: boolean;
  sortOrder: number;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  totalPrice: number;
  promoCode?: string;
  discount: number;
  status: 'yangi' | 'tasdiqlangan' | 'yetkazilmoqda' | 'yetkazildi' | 'bekor_qilindi';
  paymentMethod: 'payme' | 'click' | 'naqd';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'admin';
  messageType: 'text' | 'image' | 'product';
  sessionId: string;
  image?: string; // Mapped URL
  product?: Product;
  isRead: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string;
  image: string; // Mapped URL
  tag?: string;
  link?: string;
}

export interface PromoCode {
  id: number;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expirationDate?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'Общее' | 'Оплата' | 'Доставка' | 'Гарантия' | 'Возврат';
}
