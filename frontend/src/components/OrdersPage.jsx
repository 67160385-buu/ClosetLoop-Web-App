import { useState, useEffect } from "react";
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../api";
import { money } from "./UI";

export default function OrdersPage({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCopyTracking = (tracking, orderId) => {
    if (!tracking) return;
    navigator.clipboard?.writeText(tracking);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // กรองตามสถานะ
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "all") return true;
    return (o.status || "").toLowerCase() === filterStatus.toLowerCase();
  });

  // สถานะ Badge Config
  const getStatusBadge = (status) => {
    const s = (status || "paid").toLowerCase();
    switch (s) {
      case "pending":
        return {
          label: "รอการยืนยัน",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          stepIndex: 1,
        };
      case "paid":
        return {
          label: "ชำระเงินแล้ว / เตรียมจัดส่ง",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: ShieldCheck,
          stepIndex: 2,
        };
      case "shipped":
        return {
          label: "กำลังจัดส่ง",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Truck,
          stepIndex: 3,
        };
      case "completed":
        return {
          label: "จัดส่งสำเร็จ",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          stepIndex: 4,
        };
      default:
        return {
          label: status,
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          icon: PackageCheck,
          stepIndex: 2,
        };
    }
  };

  const statusTabs = [
    { key: "all", label: "ทั้งหมด", count: orders.length },
    { key: "pending", label: "รอยืนยัน", count: orders.filter((o) => o.status === "pending").length },
    { key: "paid", label: "เตรียมจัดส่ง", count: orders.filter((o) => o.status === "paid").length },
    { key: "shipped", label: "กำลังจัดส่ง", count: orders.filter((o) => o.status === "shipped").length },
    { key: "completed", label: "สำเร็จแล้ว", count: orders.filter((o) => o.status === "completed").length },
  ];

  return (
    <section className="page max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow text-xs tracking-widest text-[#888]">YOUR PURCHASES & HISTORY</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
            คำสั่งซื้อของฉัน
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">
            ติดตามสถานะคำสั่งซื้อ ตรวจสอบเลขพัสดุ และประวัติการช้อปปิ้งทั้งหมด
          </p>
        </div>

        {setPage && (
          <button
            onClick={() => setPage("market")}
            className="btn btn-dark px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <ShoppingBag size={16} /> ช้อปปิ้งต่อ
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#eee9df]">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === tab.key
                ? "bg-[#151515] text-white shadow-sm"
                : "bg-white text-[#666] hover:bg-[#eee9df] border border-[#e7e3dc]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.key ? "bg-white/20 text-white" : "bg-[#eee9df] text-[#666]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e7e3dc] text-center space-y-3">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#666]">กำลังโหลดรายการสั่งซื้อ...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-[#e7e3dc] text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[#eee9df] rounded-full flex items-center justify-center mx-auto text-[#151515]">
            <PackageCheck size={38} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-[#151515]">ไม่พบรายการคำสั่งซื้อในหมวดนี้</h3>
          <p className="text-xs text-[#777] max-w-sm mx-auto leading-relaxed">
            {filterStatus === "all"
              ? "คุณยังไม่มีคำสั่งซื้อ เลือกช้อปปิ้งเสื้อผ้าชิ้นโปรดใน Marketplace ได้เลย"
              : `ไม่มีคำสั่งซื้อที่มีสถานะ "${statusTabs.find((t) => t.key === filterStatus)?.label}"`}
          </p>
          {setPage && (
            <button
              onClick={() => setPage("market")}
              className="btn btn-dark px-7 py-3 rounded-full text-xs font-bold inline-flex items-center gap-2 mt-2 shadow-md"
            >
              ไปที่ Marketplace <ArrowRight size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;
            const items = order.items || [
              {
                id: order.product_id || 1,
                title: order.product_title || "เสื้อผ้าแฟชั่น ClosetLoop",
                price: order.total_price || 0,
                quantity: order.quantity || 1,
                size: "M",
                color: "Original",
                image_url: "",
              },
            ];
            const isExpanded = !!expandedOrders[order.id];
            const formattedDate = order.created_at
              ? new Date(order.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "เมื่อสักครู่";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#e7e3dc] shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:p-6 border-b border-[#eee9df] flex flex-wrap items-center justify-between gap-4 bg-[#faf9f6]/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#eee9df] flex items-center justify-center text-[#151515] font-black text-sm">
                      CL
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#151515]">Order #{order.id}</span>
                        <span className="text-xs text-[#888]">· {formattedDate}</span>
                      </div>
                      <div className="text-xs text-[#666] mt-0.5">
                        ช่องทาง: {order.payment_method === "promptpay" ? "PromptPay QR" : order.payment_method === "bank" ? "โอนเงินธนาคาร" : "เก็บเงินปลายทาง"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}
                    >
                      <StatusIcon size={14} />
                      <span>{statusConfig.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 text-[#888] hover:text-[#151515] hover:bg-[#eee] rounded-lg transition"
                      title={isExpanded ? "ย่อรายละเอียด" : "ขยายรายละเอียด"}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="px-6 py-4 bg-white border-b border-[#f3efe6]">
                  <div className="max-w-2xl mx-auto">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { title: "สั่งซื้อแล้ว", icon: ShoppingBag, step: 1 },
                        { title: "ชำระเงินแล้ว", icon: ShieldCheck, step: 2 },
                        { title: "กำลังจัดส่ง", icon: Truck, step: 3 },
                        { title: "จัดส่งสำเร็จ", icon: CheckCircle2, step: 4 },
                      ].map((st) => {
                        const isDone = statusConfig.stepIndex >= st.step;
                        const isCurrent = statusConfig.stepIndex === st.step;
                        const StepIcon = st.icon;
                        return (
                          <div key={st.step} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition mb-1 ${
                                isDone
                                  ? "bg-[#151515] text-white shadow-sm"
                                  : "bg-[#eee9df] text-[#888]"
                              } ${isCurrent ? "ring-4 ring-[#151515]/10" : ""}`}
                            >
                              <StepIcon size={14} />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                isDone ? "text-[#151515]" : "text-[#aaa]"
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tracking Code Banner (If Shipped or Completed) */}
                {order.tracking_number && (
                  <div className="bg-[#f7f5ee] px-6 py-3 border-b border-[#ece7dc] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-[#151515]" />
                      <span className="text-[#666]">
                        ขนส่งโดย: <strong className="text-[#151515]">{order.carrier || "Kerry Express"}</strong>
                      </span>
                      <span className="text-[#aaa]">|</span>
                      <span className="text-[#666]">
                        เลขพัสดุ:{" "}
                        <code className="bg-white px-2 py-0.5 rounded border border-[#ddd] font-mono font-bold text-[#151515]">
                          {order.tracking_number}
                        </code>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyTracking(order.tracking_number, order.id)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-[#ccc] rounded-lg text-xs font-bold text-[#333] flex items-center gap-1 transition shadow-2xl"
                    >
                      {copiedId === order.id ? (
                        <>
                          <Check size={12} className="text-emerald-600" /> คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> คัดลอกเลขพัสดุ
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  <div className="divide-y divide-[#f2efe9]">
                    {items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 bg-[#eee9df] rounded-xl overflow-hidden flex items-center justify-center border border-[#e3ded4] flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">👗</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-[#151515] truncate">
                              {item.title}
                            </h4>
                            <div className="text-[11px] text-[#777] mt-0.5">
                              {item.size && <span>ไซส์: {item.size} · </span>}
                              {item.color && <span>สี: {item.color} · </span>}
                              <span>จำนวน: {item.quantity} ชิ้น</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold text-[#151515]">
                            {money(item.price * item.quantity)}
                          </div>
                          <div className="text-[10px] text-[#888]">
                            ({money(item.price)} / ชิ้น)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Order Details (Address, Slip, Detailed Summary) */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-[#f0ece5] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
                      {/* Shipping Address Box */}
                      <div className="bg-[#faf9f6] p-4 rounded-2xl border border-[#ece7dc]">
                        <div className="font-bold text-[#151515] mb-1">ที่อยู่สำหรับจัดส่ง</div>
                        <div className="text-[#555] space-y-0.5">
                          <div>ผู้รับ: {order.shipping_address?.name || order.buyer_name || "คุณลูกค้า"}</div>
                          <div>โทร: {order.shipping_address?.phone || "08X-XXX-XXXX"}</div>
                          <div>
                            {order.shipping_address?.full_address ||
                              order.shipping_address?.address ||
                              "555/8 อาคารพรีเมียมทาวเวอร์ ชั้น 12 ถนนสุขุมวิท 21 วัฒนา กทม. 10110"}
                          </div>
                        </div>
                      </div>

                      {/* Payment & Slip Preview */}
                      <div className="bg-[#faf9f6] p-4 rounded-2xl border border-[#ece7dc]">
                        <div className="font-bold text-[#151515] mb-1">หลักฐานการชำระเงิน</div>
                        {order.slip_url ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={order.slip_url}
                              alt="สลิปโอนเงิน"
                              className="w-12 h-16 object-cover rounded-lg border shadow-sm"
                            />
                            <div>
                              <div className="font-semibold text-emerald-700">แนบสลิปเรียบร้อยแล้ว</div>
                              <a
                                href={order.slip_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#666] hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                ดูรูปขนาดเต็ม <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#888]">
                            {order.payment_method === "cod"
                              ? "ชำระเงินสดปลายทางเมื่อได้รับสินค้า"
                              : "ไม่ได้แนบสลิป (ตรวจสอบผ่านระบบอัตโนมัติ)"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total summary footer */}
                  <div className="pt-4 border-t border-[#eee9df] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="text-xs font-bold text-[#666] hover:text-[#151515] inline-flex items-center gap-1"
                    >
                      {isExpanded ? "ซ่อนรายละเอียด" : "ดูข้อมูลการจัดส่งและสลิป"}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <div className="text-right">
                      <span className="text-xs text-[#888] mr-2">ราคารวมทั้งสิ้น:</span>
                      <span className="text-base sm:text-lg font-black text-[#151515]">
                        {money(order.total_price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}