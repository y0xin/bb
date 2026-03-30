import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro M3 Max',
    slug: 'macbook-pro-m3-max',
    price: 3499,
    oldPrice: 3999,
    category: 'Ноутбуки',
    image: 'https://images.unsplash.com/photo-1517336714460-4c70d388656d?auto=format&fit=crop&q=80&w=800',
    description: 'Вершина производительности с чипом Apple M3 Max.',
    rating: 4.9,
    stock: 12,
    attributes: []
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    price: 399,
    oldPrice: 450,
    category: 'Аудио',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426ca472b?auto=format&fit=crop&q=80&w=800',
    description: 'Лидер шумоподавления для идеального прослушивания.',
    rating: 4.8,
    stock: 45,
    attributes: []
  },
  {
    id: 3,
    name: 'iPhone 15 Pro Titanium',
    slug: 'iphone-15-pro-titanium',
    price: 1199,
    category: 'Смартфоны',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    description: 'Легкий и прочный корпус из титана аэрокосмического класса.',
    rating: 4.7,
    stock: 32,
    attributes: []
  },
  {
    id: 4,
    name: 'Logitech G Pro X Superlight',
    slug: 'logitech-g-pro-x-superlight',
    price: 149,
    oldPrice: 179,
    category: 'Аксессуары',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
    description: 'Разработана с участием мировых звезд киберспорта.',
    rating: 4.9,
    stock: 100,
    attributes: []
  }
];
