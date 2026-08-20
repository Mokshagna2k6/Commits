import { useState } from 'react';
import { ShoppingCart, CreditCard, Smartphone, Building2, Tag, Trash2 } from 'lucide-react';

const mockCart = [
  { id: 1, name: 'Website Development', qty: 1, price: 45000 },
  { id: 2, name: 'SEO Optimization', qty: 1, price: 15000 },
  { id: 3, name: 'Logo Design', qty: 2, price: 5000 },
];

export default function Checkout() {
  const [cart, setCart] = useState(mockCart);
  const [payment, setPayment] = useState('upi');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * 0.18);
  const total = taxable + gst;

  const removeItem = (id) => setCart(cart.filter(i => i.id !== id));
  const applyCoupon = () => { if (coupon.trim()) setCouponApplied(true); };

  return (
    <div className="min-h-screen bg-warm-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-warm-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="text-fox-500" /> Checkout
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-warm-200 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Order Summary</h2>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-warm-100 last:border-0">
                  <div>
                    <p className="font-medium text-warm-900">{item.name}</p>
                    <p className="text-sm text-warm-500">Qty: {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-warm-900">₹{(item.price * item.qty).toLocaleString()}</span>
                    <button onClick={() => removeItem(item.id)} className="text-warm-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-warm-200 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Billing Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {['Full Name', 'Email', 'Phone', 'Company', 'GST Number (Optional)', 'Address'].map(label => (
                  <input key={label} placeholder={label} className="border border-warm-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-warm-200 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Payment Method</h2>
              <div className="flex gap-4 flex-wrap">
                {[{ id: 'upi', label: 'UPI', icon: Smartphone }, { id: 'card', label: 'Card', icon: CreditCard }, { id: 'netbanking', label: 'Net Banking', icon: Building2 }].map(m => (
                  <button key={m.id} onClick={() => setPayment(m.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition ${payment === m.id ? 'border-fox-500 bg-fox-500/5 text-fox-500' : 'border-warm-200 text-warm-600'}`}>
                    <m.icon size={18} /> {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-2xl border border-warm-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-warm-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {couponApplied && <div className="flex justify-between text-green-600"><span>Discount (10%)</span><span>-₹{discount.toLocaleString()}</span></div>}
                <div className="flex justify-between text-warm-600"><span>GST (18%)</span><span>₹{gst.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-warm-900 text-base pt-3 border-t border-warm-200"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <div className="mt-5 flex gap-2">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
                <button onClick={applyCoupon} className="bg-warm-100 text-warm-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-warm-200"><Tag size={16} /></button>
              </div>
              <button className="w-full mt-5 bg-fox-500 text-white py-3 rounded-xl font-semibold hover:bg-fox-600 transition">Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
