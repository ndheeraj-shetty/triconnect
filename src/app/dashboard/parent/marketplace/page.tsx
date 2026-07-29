'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  Trash2, 
  Sparkles, 
  Info,
  Tag,
  Loader2,
  X
} from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  category: 'tickets' | 'stationary' | 'books' | 'uniforms';
  price: number;
  image: string;
  description: string;
  stock: number;
}

const mockMarketItems: MarketItem[] = [
  { id: 'm1', name: 'Annual Science Fair Entry Ticket', category: 'tickets', price: 15.00, image: '🎟️', description: 'Entry ticket for parents to attend the Westside Academy High science showcase exhibitions.', stock: 240 },
  { id: 'm2', name: 'Advanced Calculus Textbook v2', category: 'books', price: 45.00, image: '📚', description: 'Curriculum textbook aligned with Term 4 calculus derivatives modules.', stock: 18 },
  { id: 'm3', name: 'Westside High Science Lab Coat', category: 'uniforms', price: 25.00, image: '🥼', description: 'Official chemistry/physics laboratory protective coat with school emblem.', stock: 35 },
  { id: 'm4', name: 'Graphing Calculator & Stylus set', category: 'stationary', price: 85.00, image: '🧮', description: 'Algebraic calculation set recommended for Calculus and Physics modules.', stock: 12 }
];

export default function ParentMarketplacePage() {
  const [items] = useState<MarketItem[]>(mockMarketItems);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ item: MarketItem; quantity: number }[]>([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const filteredItems = items.filter(i => 
    activeCategory === 'all' || i.category === activeCategory
  );

  const addToCart = (item: MarketItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.item.id !== id));
  };

  const cartTotal = cart.reduce((acc, c) => acc + (c.item.price * c.quantity), 0);

  const handleCheckout = () => {
    setCheckoutModalOpen(true);
    setPaying(true);
    setPaymentSuccess(false);

    // Simulate payment transaction
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setCart([]); // Clear cart
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">School Marketplace</h1>
        <p className="text-xs text-slate-505 mt-1 font-light">Purchase event entry tickets, stationary supplies, textbooks, and uniforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Product Catalog (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Product Catalog</h3>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {['all', 'tickets', 'books', 'uniforms', 'stationary'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border capitalize cursor-pointer transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 border-blue-500 text-white font-extrabold shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4 text-left shadow-sm animate-fade-in"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">{item.image}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-650 border border-blue-200 text-[8px] font-bold uppercase tracking-wider">{item.category}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal font-light">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-black text-slate-900">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Shopping Cart Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between h-[500px] shadow-sm text-left">
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5"><ShoppingCart className="h-4.5 w-4.5 text-blue-605" /> Shopping Cart</h3>
              <span className="text-[9px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">{cart.length} items</span>
            </div>

            <div className="space-y-3 pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold">Your cart is empty</p>
                  <p className="text-[10px] mt-0.5 font-light">Add stationary or tickets to start checkout.</p>
                </div>
              ) : (
                cart.map((c) => (
                  <div key={c.item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs text-slate-700 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-800 truncate">{c.item.name}</h5>
                      <p className="text-[9px] text-slate-450 mt-0.5 font-mono">${c.item.price.toFixed(2)} x {c.quantity}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(c.item.id)}
                      className="p-1.5 rounded bg-white border border-slate-200 text-red-500 hover:bg-red-50 cursor-pointer shrink-0 ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Total Price:</span>
              <span className="text-slate-900 text-base font-black">${cartTotal.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="h-4 w-4" /> Proceed to Checkout
            </button>
          </div>
        </div>

      </div>

      {/* Credit Card Processing Checkout Modal */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutModalOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden z-10 text-center space-y-6"
            >
              {paying ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Processing Transaction...</h4>
                    <p className="text-[10px] text-slate-450 mt-1 font-mono">Securing gateway handshake (Stripe Mock)</p>
                  </div>
                </div>
              ) : paymentSuccess ? (
                <div className="space-y-5 text-left">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-700">
                      <CheckCircle className="h-8 w-8 animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-slate-900">Payment Confirmed!</h4>
                    <p className="text-[11px] text-slate-505 mt-1 leading-relaxed font-light">
                      Your purchase invoice has been cleared. Event entrance ticket passes have been dispatched to your email.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[9px] text-slate-550 shadow-inner">
                    <p className="flex justify-between"><span>STATUS:</span> <span className="text-emerald-705 font-bold">PAID</span></p>
                    <p className="flex justify-between"><span>TRANSACTION ID:</span> <span className="text-slate-800 font-bold">ST-9984-TC</span></p>
                    <p className="flex justify-between"><span>CURRICULUM GATE:</span> <span className="text-slate-800 font-bold">WESTSIDE-AC-FEE</span></p>
                  </div>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Finish Checkout
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
