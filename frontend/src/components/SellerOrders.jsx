import React, { useState } from 'react';
import {
    Package,
    MapPin,
    CreditCard,
    Eye,
    Truck,
    CheckCircle2,
    Clock,
    X,
    Search,
    ExternalLink
} from 'lucide-react';

// ตัวอย่างข้อมูลจำลองคำสั่งซื้อของลูกค้า (Mock Data)
const initialOrders = [
    {
        id: "ORD-20261010-001",
        createdAt: "10 ต.ค. 2026 - 14:30 น.",
        customer: {
            name: "สมชาย สายช้อป",
            phone: "081-234-5678",
            address: "123/45 หมู่บ้านสุขสันต์ ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
        },
        items: [
            { id: 1, name: "Vintage Denim Jacket", size: "L", price: 1290, qty: 1, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200" }
        ],
        totalAmount: 1340, // รวมค่าส่ง 50
        status: "PAID", // PENDING, PAID, SHIPPED, COMPLETED, CANCELLED
        slipUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600", // ตัวอย่างรูปสลิป
        trackingNumber: ""
    },
    {
        id: "ORD-20261009-002",
        createdAt: "9 ต.ค. 2026 - 18:15 น.",
        customer: {
            name: "มณีรัตน์ แฟชั่นนิสต้า",
            phone: "089-987-6543",
            address: "99/9 คอนโดวิวสวย ชั้น 12 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900"
        },
        items: [
            { id: 2, name: "Oversized Cotton Tee", size: "M", price: 590, qty: 2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200" }
        ],
        totalAmount: 1230,
        status: "PENDING",
        slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
        trackingNumber: ""
    }
];

export default function SellerOrders({ setToast }) {
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null); // สำหรับแสดง Pop-up ดูรายละเอียด
    const [showSlipModal, setShowSlipModal] = useState(false); // ขยายรูปสลิป
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [tempTracking, setTempTracking] = useState("");

    // 1. ฟังก์ชันอัปเดตสถานะและเลข พัสดุ
    const handleUpdateOrder = (orderId, newStatus, trackingNum) => {
        setOrders(prev =>
            prev.map(ord =>
                ord.id === orderId
                    ? { ...ord, status: newStatus, trackingNumber: trackingNum || ord.trackingNumber }
                    : ord
            )
        );

        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus, trackingNumber: trackingNum || prev.trackingNumber }));
        }

        if (setToast) setToast(`อัปเดตสถานะออเดอร์ ${orderId} เรียบร้อย ✨`);
    };

    // 2. กรองข้อมูลคำสั่งซื้อ
    const filteredOrders = orders.filter(ord => {
        const matchesStatus = filterStatus === "ALL" || ord.status === filterStatus;
        const matchesSearch = ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ord.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // สีของ Badge แต่ละสถานะ
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><Clock size={13} /> รอตรวจสอบ</span>;
            case 'PAID':
                return <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><CreditCard size={13} /> ชำระเงินแล้ว</span>;
            case 'SHIPPED':
                return <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><Truck size={13} /> จัดส่งแล้ว</span>;
            case 'COMPLETED':
                return <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><CheckCircle2 size={13} /> สำเร็จ</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">จัดการคำสั่งซื้อลูกค้า 📦</h1>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">ตรวจสอบการชำระเงิน จัดส่งพัสดุ และอัปเดตสถานะให้ผู้ซื้อ</p>
                </div>

                {/* ช่องค้นหา & ตัวกรอง */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาตามรหัส/ชื่อลูกค้า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="ALL">ทุกสถานะ</option>
                        <option value="PENDING">รอตรวจสอบ</option>
                        <option value="PAID">ชำระเงินแล้ว</option>
                        <option value="SHIPPED">จัดส่งแล้ว</option>
                        <option value="COMPLETED">สำเร็จ</option>
                    </select>
                </div>
            </div>

            {/* ตารางแสดงรายการคำสั่งซื้อ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="p-4">รหัสออเดอร์ / เวลา</th>
                                <th className="p-4">ลูกค้า</th>
                                <th className="p-4">ยอดรวม</th>
                                <th className="p-4">สถานะ</th>
                                <th className="p-4">เลขพัสดุ</th>
                                <th className="p-4 text-center">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-400">
                                        ไม่พบคำสั่งซื้อที่ตรงตามเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((ord) => (
                                    <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-900">{ord.id}</p>
                                            <p className="text-xs text-gray-400">{ord.createdAt}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800">{ord.customer.name}</p>
                                            <p className="text-xs text-gray-500">{ord.customer.phone}</p>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">
                                            ฿{ord.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(ord.status)}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-gray-600">
                                            {ord.trackingNumber || <span className="text-gray-300">- ยังไม่ระบุ -</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(ord);
                                                    setTempTracking(ord.trackingNumber || "");
                                                }}
                                                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition flex items-center gap-1 mx-auto"
                                            >
                                                <Eye size={14} /> ดูรายละเอียด
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ----------------- MODAL รายละเอียดคำสั่งซื้อ ----------------- */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <Package size={28} className="text-black" />
                            <div>
                                <h2 className="text-xl font-bold">รายละเอียดคำสั่งซื้อ {selectedOrder.id}</h2>
                                <p className="text-xs text-gray-400">สั่งซื้อเมื่อ: {selectedOrder.createdAt}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                            {/* ข้อมูลลูกค้าและที่อยู่จัดส่ง */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2 border-b pb-2">
                                    <MapPin size={16} className="text-red-500" /> ที่อยู่จัดส่ง
                                </h3>
                                <p className="font-bold text-gray-900">{selectedOrder.customer.name}</p>
                                <p className="text-xs text-gray-600">โทร: {selectedOrder.customer.phone}</p>
                                <p className="text-xs text-gray-600 leading-relaxed bg-white p-2 rounded border border-gray-100 mt-2">
                                    {selectedOrder.customer.address}
                                </p>
                            </div>

                            {/* หลักฐานการชำระเงิน (สลิปโอนเงิน) */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2 border-b pb-2">
                                    <CreditCard size={16} className="text-blue-500" /> หลักฐานการโอนเงิน (สลิป)
                                </h3>
                                {selectedOrder.slipUrl ? (
                                    <div className="relative group cursor-pointer" onClick={() => setShowSlipModal(true)}>
                                        <img
                                            src={selectedOrder.slipUrl}
                                            alt="สลิปโอนเงิน"
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center text-white text-xs font-semibold gap-1">
                                            <ExternalLink size={14} /> คลิกเพื่อขยายรูปสลิป
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-8 text-center">ยังไม่ได้แนบสลิปการโอนเงิน</p>
                                )}
                            </div>

                        </div>

                        {/* รายการสินค้าที่สั่ง */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-sm text-gray-700 mb-3">รายการสินค้าที่สั่งซื้อ</h3>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-400">ไซส์: {item.size} x {item.qty} ชิ้น</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm text-gray-900">฿{(item.price * item.qty).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ส่วนอัปเดตสถานะและใส่เลขพัสดุ */}
                        <div className="border-t pt-4 space-y-4">
                            <h3 className="font-semibold text-sm text-gray-700">อัปเดตสถานะและเลขพัสดุ</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">สถานะคำสั่งซื้อ</label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateOrder(selectedOrder.id, e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black"
                                    >
                                        <option value="PENDING">รอตรวจสอบ (Pending)</option>
                                        <option value="PAID">ชำระเงินแล้ว (Paid)</option>
                                        <option value="SHIPPED">จัดส่งแล้ว (Shipped)</option>
                                        <option value="COMPLETED">สำเร็จ (Completed)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">เลขติดตามพัสดุ (Tracking Number)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="เช่น TH123456789"
                                            value={tempTracking}
                                            onChange={(e) => setTempTracking(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-black"
                                        />
                                        <button
                                            onClick={() => handleUpdateOrder(selectedOrder.id, "SHIPPED", tempTracking)}
                                            className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 shrink-0"
                                        >
                                            บันทึก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ----------------- MODAL ขยายรูปสลิปโอนเงิน ----------------- */}
            {showSlipModal && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setShowSlipModal(false)}
                >
                    <div className="max-w-md w-full relative bg-white p-2 rounded-2xl">
                        <img
                            src={selectedOrder.slipUrl}
                            alt="สลิปโอนเงินขนาดใหญ่"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                        />
                        <p className="text-center text-xs text-gray-500 py-2">คลิกตรงไหนก็ได้เพื่อปิดหน้าต่าง</p>
                    </div>
                </div>
            )}

        </div>
    );
}