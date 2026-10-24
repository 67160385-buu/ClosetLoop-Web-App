import { useState } from "react";
import { X, Check, Upload, QrCode, CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, Copy } from "lucide-react";
import { money } from "./UI";
import { api, shrinkImage } from "../api";

export default function CheckoutModalPage({
  isOpen,
  onClose,
  cart,
  subtotal,
  shippingFee,
  grandTotal,
  onSuccess,
  user,
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment & Review
  const [shipping, setShipping] = useState({
    name: user?.display_name || user?.username || "",
    phone: "089-123-4567",
    address: "555/8 อาคารพรีเมียมทาวเวอร์ ชั้น 12 ถนนสุขุมวิท 21",
    district: "วัฒนา",
    province: "กรุงเทพมหานคร",
    postal_code: "10110",
  });

  const [paymentMethod, setPaymentMethod] = useState("promptpay"); // promptpay, bank, cod
  const [slipImage, setSlipImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  const handleCopyAccount = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlip(true);
    try {
      const dataUrl = await shrinkImage(file, 800, 0.85);
      setSlipImage(dataUrl);
    } catch (err) {
      console.error("Slip upload error:", err);
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.postal_code) {
      alert("กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน");
      return;
    }
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    if ((paymentMethod === "promptpay" || paymentMethod === "bank") && !slipImage) {
      if (!confirm("คุณยังไม่ได้แนบสลิปโอนเงิน ต้องการดำเนินการสั่งซื้อต่อหรือไม่?")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullAddressString = `${shipping.address} เขต/อำเภอ ${shipping.district} จ.${shipping.province} ${shipping.postal_code}`;
      const order = await api.createOrderFromCart({
        items: cart,
        shippingAddress: {
          ...shipping,
          full_address: fullAddressString,
        },
        paymentMethod,
        slipUrl: slipImage,
        subtotal,
        shippingFee,
        grandTotal,
      });

      onSuccess(order);
    } catch (err) {
      alert(err.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e7e3dc] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#eee9df] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#888]">ClosetLoop Checkout</span>
              <span className="text-xs bg-[#151515] text-white px-2 py-0.5 rounded-full font-medium">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#151515] mt-0.5">
              {step === 1 ? "ข้อมูลการจัดส่งสินค้า" : "ชำระเงินและตรวจสอบรายการ"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f4f2ee] hover:bg-[#eae6de] flex items-center justify-center transition-colors text-[#555]"
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {step === 1 ? (
            /* STEP 1: Shipping Address Form */
            <form id="shipping-form" onSubmit={handleNextStep} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#444] mb-1.5">ชื่อ-นามสกุล ผู้รับ *</label>
                  <input
                    type="text"
                    required
                    value={shipping.name}
                    onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                    placeholder="เช่น ปภัสสร วงศ์วิจิตร"
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#444] mb-1.5">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444] mb-1.5">ที่อยู่จัดส่ง (บ้านเลขที่, หมู่บ้าน, ถนน, ซอย) *</label>
                <textarea
                  required
                  rows={2}
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="ระบุที่อยู่จัดส่งให้ชัดเจน"
                  className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#444] mb-1.5">เขต / อำเภอ *</label>
                  <input
                    type="text"
                    required
                    value={shipping.district}
                    onChange={(e) => setShipping({ ...shipping, district: e.target.value })}
                    placeholder="วัฒนา"
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#444] mb-1.5">จังหวัด *</label>
                  <input
                    type="text"
                    required
                    value={shipping.province}
                    onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                    placeholder="กรุงเทพมหานคร"
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#444] mb-1.5">รหัสไปรษณีย์ *</label>
                  <input
                    type="text"
                    required
                    value={shipping.postal_code}
                    onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                    placeholder="10110"
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-[#e2ded6] rounded-xl text-sm focus:outline-none focus:border-[#151515] transition"
                  />
                </div>
              </div>

              {/* Order Quick Summary Preview */}
              <div className="bg-[#f7f6f2] p-4 rounded-2xl border border-[#ece8e0] mt-6">
                <div className="flex justify-between items-center text-xs text-[#666] mb-2">
                  <span>รายการสินค้า ({cart.length} รายการ)</span>
                  <span className="font-semibold text-[#151515]">{money(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#666] mb-2">
                  <span>ค่าจัดส่ง (Standard Express)</span>
                  <span className="font-semibold text-[#151515]">{shippingFee === 0 ? "ฟรี" : money(shippingFee)}</span>
                </div>
                <div className="border-t border-[#e2ded6] pt-2 flex justify-between items-center text-sm font-bold text-[#151515]">
                  <span>ยอดสุทธิทั้งหมด</span>
                  <span className="text-base text-black">{money(grandTotal)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#151515] text-white px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#333] transition shadow-lg shadow-black/10"
                >
                  ไปขั้นตอนชำระเงิน <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Payment Method, QR Code, Slip Upload & Review */
            <div className="space-y-6">
              {/* Shipping Recap */}
              <div className="bg-[#f8f7f4] p-4 rounded-2xl border border-[#eae6de] flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-[#888] uppercase tracking-wider">จัดส่งถึง</div>
                  <div className="text-sm font-bold text-[#151515]">{shipping.name} ({shipping.phone})</div>
                  <div className="text-xs text-[#666] mt-0.5">
                    {shipping.address} {shipping.district} {shipping.province} {shipping.postal_code}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#151515] underline hover:text-[#555]"
                >
                  แก้ไขที่อยู่
                </button>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-3">เลือกช่องทางชำระเงิน</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("promptpay")}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                      paymentMethod === "promptpay"
                        ? "border-[#151515] bg-[#151515] text-white shadow-md"
                        : "border-[#e5e1d8] bg-white text-[#444] hover:border-[#aaa]"
                    }`}
                  >
                    <QrCode size={22} />
                    <span className="text-xs font-bold">PromptPay QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                      paymentMethod === "bank"
                        ? "border-[#151515] bg-[#151515] text-white shadow-md"
                        : "border-[#e5e1d8] bg-white text-[#444] hover:border-[#aaa]"
                    }`}
                  >
                    <CreditCard size={22} />
                    <span className="text-xs font-bold">โอนเงินธนาคาร</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                      paymentMethod === "cod"
                        ? "border-[#151515] bg-[#151515] text-white shadow-md"
                        : "border-[#e5e1d8] bg-white text-[#444] hover:border-[#aaa]"
                    }`}
                  >
                    <Truck size={22} />
                    <span className="text-xs font-bold">เก็บเงินปลายทาง</span>
                  </button>
                </div>
              </div>

              {/* PromptPay QR Code Display */}
              {paymentMethod === "promptpay" && (
                <div className="bg-[#faf9f6] p-5 rounded-2xl border border-[#e5e0d5] text-center space-y-3">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-sm border border-[#e0dad0]">
                    {/* Stylized QR Code Graphic */}
                    <div className="w-48 h-48 bg-white border border-[#eee] rounded-xl flex flex-col items-center justify-center p-2 mx-auto relative overflow-hidden">
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[10px] text-gray-500 font-bold border-b pb-1">
                        <span>THAI QR PAYMENT</span>
                        <span className="text-[#003b71]">PromptPay</span>
                      </div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=00020101021129370016A000000677010111011300668912345675802TH5303764540${grandTotal}.005802TH6304`}
                        alt="PromptPay QR Code"
                        className="w-36 h-36 mt-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center w-36 h-36 bg-[#f0eee9] rounded text-[#444] text-xs font-mono">
                        <QrCode size={40} className="mb-1 text-[#151515]" />
                        <span>089-123-4567</span>
                        <span className="text-[10px] text-gray-500">ยอด {money(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#777]">ยอดเงินที่ต้องชำระ</div>
                    <div className="text-2xl font-black text-[#151515] tracking-tight">{money(grandTotal)}</div>
                    <div className="text-xs text-[#555] mt-1 flex items-center justify-center gap-2">
                      <span>พร้อมเพย์: <strong>089-123-4567</strong> (ClosetLoop Co., Ltd.)</span>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount("0891234567")}
                        className="text-[11px] bg-white border border-[#ccc] px-2 py-0.5 rounded hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Copy size={11} /> {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === "bank" && (
                <div className="bg-[#faf9f6] p-5 rounded-2xl border border-[#e5e0d5] space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[#e2ddd3] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[#151515]">ธนาคารกสิกรไทย (Kasikornbank)</div>
                      <div className="text-sm font-mono font-bold text-[#006f3c] mt-0.5">092-8-39182-4</div>
                      <div className="text-xs text-[#777]">ชื่อบัญชี: บจก. โคลเซ็ทลูป (ไทยแลนด์)</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount("0928391824")}
                      className="px-3 py-1.5 bg-[#f5f4ef] hover:bg-[#e8e4db] rounded-lg text-xs font-bold flex items-center gap-1 text-[#222]"
                    >
                      <Copy size={13} /> {copied ? "คัดลอกแล้ว" : "คัดลอกเลขบัญชี"}
                    </button>
                  </div>
                  <div className="text-center text-xs text-[#666]">
                    ยอดที่ต้องโอนสุทธิ: <strong className="text-base text-[#151515]">{money(grandTotal)}</strong>
                  </div>
                </div>
              )}

              {/* Cash On Delivery Note */}
              {paymentMethod === "cod" && (
                <div className="bg-[#faf9f6] p-5 rounded-2xl border border-[#e5e0d5] text-center space-y-2">
                  <div className="w-12 h-12 bg-[#eee9df] rounded-full flex items-center justify-center mx-auto text-[#151515]">
                    <Truck size={24} />
                  </div>
                  <div className="text-sm font-bold text-[#151515]">ชำระเงินสดเมื่อได้รับสินค้า</div>
                  <p className="text-xs text-[#666] max-w-sm mx-auto">
                    พนักงานขนส่งจะเรียกเก็บเงินปลายทางจำนวน {money(grandTotal)} เมื่อนำส่งพัสดุถึงที่อยู่ของคุณ
                  </p>
                </div>
              )}

              {/* Payment Slip Upload Box (For PromptPay & Bank) */}
              {paymentMethod !== "cod" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#333]">แนบหลักฐานสลิปการโอนเงิน (Image Preview)</label>
                    {slipImage && (
                      <button
                        type="button"
                        onClick={() => setSlipImage("")}
                        className="text-xs text-red-500 hover:underline"
                      >
                        ลบรูปสลิป
                      </button>
                    )}
                  </div>

                  {slipImage ? (
                    <div className="relative border-2 border-emerald-500/40 bg-emerald-50/20 p-3 rounded-2xl flex items-center gap-4">
                      <img
                        src={slipImage}
                        alt="สลิปโอนเงิน"
                        className="w-16 h-20 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                          <Check size={14} /> แนบสลิปเรียบร้อยแล้ว
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">พร้อมตรวจสอบและยืนยันคำสั่งซื้อได้ทันที</p>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#dcd7cb] hover:border-[#151515] bg-[#faf9f6] p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                      <Upload size={24} className="text-[#888] group-hover:text-[#151515] transition mb-2" />
                      <span className="text-xs font-bold text-[#151515]">
                        {uploadingSlip ? "กำลังประมวลผลรูปภาพ..." : "คลิกเพื่ออัปโหลดสลิป หรือลากไฟล์มาวางที่นี่"}
                      </span>
                      <span className="text-[10px] text-[#888] mt-1">รองรับ JPG, PNG (รูปจะถูกบีบอัดให้พอเหมาะอัตโนมัติ)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlipUpload}
                        className="hidden"
                        disabled={uploadingSlip}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#eee]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-[#555] hover:text-black transition"
                >
                  ← ย้อนกลับ
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="bg-[#151515] hover:bg-[#333] text-white px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl shadow-black/15 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> กำลังบันทึกคำสั่งซื้อ...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> ยืนยันคำสั่งซื้อ ({money(grandTotal)})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
