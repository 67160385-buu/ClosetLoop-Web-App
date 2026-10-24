import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from "lucide-react";
import { money } from "./UI";

export default function CartPage({ cart, setCart, setPage, setToast, onOpenCheckout }) {
  const [couponInput, setCouponInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  // รับประกันว่าสินค้าในตะกร้ามีจำนวน 1 ชิ้นเสมอ (สินค้ามือสองมีเพียงชิ้นเดียว)
  useEffect(() => {
    const hasMultiple = cart.some((item) => (Number(item.qty || item.quantity) || 1) !== 1);
    if (hasMultiple) {
      setCart((prev) => prev.map((item) => ({ ...item, qty: 1, quantity: 1 })));
    }
  }, [cart, setCart]);

  // คำนวณยอดสินค้า (สินค้ามือสองมีเพียง 1 ชิ้นต่อรายการ)
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price;
  }, 0);

  // โปรโมชั่นส่งฟรีเมื่อช้อปครบ 1,500 บาท
  const freeShippingThreshold = 1500;
  const rawShippingFee = cart.length > 0 ? 50 : 0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : rawShippingFee;

  // ส่วนลดจากคูปอง
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // ปรับจำนวนสินค้า (ปิดการเพิ่มจำนวน เพราะเป็นสินค้ามือสองมีชิ้นเดียว)
  const handleUpdateQty = (id, delta) => {
    if (delta > 0) {
      if (setToast) {
        setToast("สินค้ามือสองมีเพียง 1 ชิ้นเท่านั้น ไม่สามารถเพิ่มจำนวนได้ 🛍️", "info");
      }
      return;
    }
    if (delta < 0) {
      if (setToast) {
        setToast("สินค้ามี 1 ชิ้น หากต้องการนำออก กรุณากดปุ่มลบ (ถังขยะ) 🗑️", "info");
      }
      return;
    }
  };

  // ลบสินค้าออกจากตะกร้า
  const handleRemoveItem = (id, title) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (setToast) {
      setToast(`ลบ "${title || 'สินค้า'}" ออกจากตะกร้าแล้ว`);
    }
  };

  // ใช้คูปองส่วนลด
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === "CLOSET10" || code === "LOOP10") {
      setDiscountPercent(10);
      setCouponCode(code);
      setCouponInput("");
      if (setToast) setToast("ใช้โค้ดส่วนลด 10% สำเร็จแล้ว! 🎉");
    } else if (code === "FREESHIP") {
      setDiscountPercent(0);
      setCouponCode(code);
      setCouponInput("");
      if (setToast) setToast("ใช้โค้ดส่งฟรีสำเร็จ! 🚚");
    } else {
      if (setToast) setToast("โค้ดส่วนลดไม่ถูกต้อง (ลองใช้ CLOSET10)");
    }
  };

  // Empty State เมื่อไม่มีสินค้า
  if (!cart || cart.length === 0) {
    return (
      <section className="page max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#eee9df] text-[#151515] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag size={44} strokeWidth={1.5} />
        </div>
        <span className="eyebrow text-xs tracking-widest text-[#888]">YOUR SHOPPING BAG</span>
        <h1 className="text-3xl font-extrabold text-[#151515] mt-2 mb-3">ตะกร้าสินค้าว่างเปล่า</h1>
        <p className="text-[#77746f] max-w-md mx-auto mb-8 text-sm leading-relaxed">
          คุณยังไม่มีสินค้าในตะกร้า ลองแวะไปดูเสื้อผ้าชิ้นโปรด หรือไอเท็มแฟชั่นมือสองสภาพดีใน Marketplace ได้เลย
        </p>
        <button
          onClick={() => setPage("market")}
          className="btn btn-dark px-8 py-3.5 rounded-full inline-flex items-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl transition"
        >
          ไปเลือกซื้อสินค้าใน Marketplace <ArrowRight size={16} />
        </button>
      </section>
    );
  }

  return (
    <section className="page max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow text-xs tracking-widest text-[#888]">YOUR CURATED SELECTION</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#151515] tracking-tight mt-1">
            ตะกร้าสินค้าของฉัน
          </h1>
          <p className="text-[#77746f] text-sm mt-1">
            มีสินค้าทั้งหมด {cart.length} ชิ้นในตะกร้า (สินค้ามือสองชิ้นเดียวต่อรายการ)
          </p>
        </div>

        <button
          onClick={() => setPage("market")}
          className="text-xs font-bold text-[#666] hover:text-[#151515] inline-flex items-center gap-1.5 transition underline-offset-4 hover:underline"
        >
          ← เลือกซื้อสินค้าเพิ่มเติม
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-[#e7e3dc] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#f3efe6] flex items-center justify-center text-[#151515]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#151515]">
              {isFreeShipping ? (
                <span className="text-emerald-700">ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรี 🚚</span>
              ) : (
                `ช้อปเพิ่มอีก ${money(freeShippingThreshold - subtotal)} เพื่อรับสิทธิ์จัดส่งฟรี!`
              )}
            </div>
            <div className="text-[11px] text-[#888]">จัดส่งฟรีทั่วประเทศ เมื่อยอดสั่งซื้อครบ 1,500 บาทขึ้นไป</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 bg-[#eee9df] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#151515] h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const qty = 1;
            const price = Number(item.price) || 0;
            const itemTotal = price;
            const imgSrc = item.image_url || item.imageUrl || "";

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e7e3dc] shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Item Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#eee9df] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#e2ddd3]">
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.title || item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">👗</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-[#151515] truncate">
                      {item.title || item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.size && (
                        <span className="text-[11px] bg-[#f5f4ef] text-[#555] px-2 py-0.5 rounded-md font-medium">
                          ไซส์: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[11px] bg-[#f5f4ef] text-[#555] px-2 py-0.5 rounded-md font-medium">
                          สี: {item.color}
                        </span>
                      )}
                      {item.condition && (
                        <span className="text-[11px] text-[#888] font-medium">
                          {item.condition}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#888] mt-1">
                      ราคาชิ้นละ: <span className="font-semibold text-[#151515]">{money(price)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total & Delete */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0ece5]">
                  {/* Quantity Indicator (Fixed at 1 for one-of-a-kind second-hand item) */}
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <div className="flex items-center border border-[#d8d3c8] rounded-full overflow-hidden bg-[#faf9f6]">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#c5c0b5] hover:text-[#888] cursor-not-allowed transition"
                        title="สินค้ามือสองมีเพียง 1 ชิ้นเท่านั้น"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#151515]">
                        1
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#c5c0b5] hover:text-amber-700 hover:bg-amber-50 cursor-not-allowed bg-[#f3efe8]/60 transition"
                        title="สินค้ามือสองมีเพียง 1 ชิ้นเท่านั้น (ปิดการเพิ่มจำนวน)"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-[10px] font-semibold text-[#888] bg-[#f5f3ee] px-2 py-0.5 rounded-full border border-[#e8e4db] whitespace-nowrap">
                      สินค้ามือสอง มีชิ้นเดียว
                    </span>
                  </div>

                  {/* Subtotal for item */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm sm:text-base font-bold text-[#151515]">
                      {money(itemTotal)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id, item.title || item.name)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#999] hover:text-red-500 hover:bg-red-50 transition"
                    title="ลบออกจากตะกร้า"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("ต้องการล้างสินค้าทั้งหมดในตะกร้าใช่หรือไม่?")) {
                  setCart([]);
                  if (setToast) setToast("ล้างตะกร้าสินค้าเรียบร้อย");
                }
              }}
              className="text-xs text-[#888] hover:text-red-500 transition"
            >
              ล้างตะกร้าสินค้าทั้งหมด
            </button>
          </div>
        </div>

        {/* Right: Order Summary Sticky Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#e7e3dc] shadow-sm sticky top-24 space-y-6">
          <h2 className="text-lg font-bold text-[#151515] border-b border-[#eee9df] pb-3">
            สรุปคำสั่งซื้อ
          </h2>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-[#555] block">โค้ดส่วนลด (Promo Code)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                  type="text"
                  placeholder="เช่น CLOSET10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#faf9f6] border border-[#dcd7cb] rounded-xl text-xs uppercase font-medium focus:outline-none focus:border-[#151515]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#151515] text-white rounded-xl text-xs font-bold hover:bg-[#333] transition"
              >
                ใช้โค้ด
              </button>
            </div>
            {couponCode && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                <span>ใช้โค้ด: <strong>{couponCode}</strong> (-{discountPercent}%)</span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponCode("");
                    setDiscountPercent(0);
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-3 text-xs border-b border-[#eee9df] pb-4 text-[#555]">
            <div className="flex justify-between">
              <span>ยอดรวมสินค้า (Subtotal)</span>
              <span className="font-semibold text-[#151515]">{money(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ส่วนลดพิเศษ ({couponCode})</span>
                <span>-{money(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>ค่าจัดส่ง (Standard Express)</span>
              <span className="font-semibold text-[#151515]">
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">ฟรี</span>
                ) : (
                  money(shippingFee)
                )}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline">
            <div>
              <div className="text-xs text-[#888]">ยอดรวมสุทธิ</div>
              <div className="text-sm font-bold text-[#151515]">Grand Total</div>
            </div>
            <div className="text-2xl font-black text-[#151515] tracking-tight">
              {money(grandTotal)}
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              if (onOpenCheckout) {
                onOpenCheckout({
                  cart,
                  subtotal,
                  shippingFee,
                  grandTotal,
                });
              }
            }}
            className="w-full bg-[#151515] hover:bg-[#333] text-white py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/15 transition group"
          >
            <span>ดำเนินการชำระเงิน</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Trust badges */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#888]">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>ชำระเงินปลอดภัย 100% · จัดส่งตรงเวลา</span>
          </div>
        </div>
      </div>
    </section>
  );
}