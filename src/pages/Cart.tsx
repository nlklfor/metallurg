import { ArrowLeft, MoveRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import CartItemCard from "@/components/CartItemCard";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);

  // TOOD: maybe add loading and skeletons for cart items, and also add some error handling for edge cases (e.g. if the cart is empty, if the product is out of stock, etc.)

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white hover:shadow-md rounded-full transition-all border border-gray-100 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Your Cart
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              // ITEMS IN BAG: {cartItems.length}
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center shadow-sm">
            <p className="text-gray-400 font-medium text-lg mb-8 uppercase tracking-widest">
              // empty_state
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-black text-white px-12 py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <CartItemCard
                  key={`${item.id}-${item.selectedSize}`}
                  item={item}
                />
              ))}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-2xl font-bold mb-8 tracking-tight text-gray-900 italic">
                  Summary
                </h2>

                <div className="space-y-5 mb-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span className="text-sm uppercase tracking-tighter">
                      // subtotal
                    </span>
                    <span className="text-gray-900">
                      {totalPrice().toLocaleString()} UAH
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span className="text-sm uppercase tracking-tighter">
                      // shipping
                    </span>
                    <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-1 rounded">
                      Free
                    </span>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex justify-between">
                    <span className="text-xl font-bold">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 font-mono italic">
                        {totalPrice().toLocaleString()} UAH
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promo */}
                <div className="relative mb-8">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    className="w-full bg-gray-50 border border-transparent px-5 py-4 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-200 outline-none transition-all placeholder:text-gray-300"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase hover:text-black text-gray-400 transition-colors">
                    Apply
                  </button>
                </div>

                <button className="w-full bg-black text-white py-6 rounded-[24px] font-bold flex items-center justify-center gap-4 hover:bg-gray-800 transition-all transform active:scale-[0.98] shadow-2xl shadow-black/20 group">
                  <span className="uppercase tracking-tighter italic">
                    Checkout Now
                  </span>
                  <MoveRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-tight">
                    Secure
                    <br />
                    Payments
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-tight text-right">
                    Express
                    <br />
                    Shipping
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
