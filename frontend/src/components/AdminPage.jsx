import React, { useState, useMemo } from "react";
import {
  Users,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Download,
  AlertTriangle,
  UserCheck,
  Ban,
  Check,
  X,
  ChevronDown,
  Layers,
  FileText,
  BadgeCheck,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import { money } from "./UI";

// ==========================================
// Initial Mock Data
// ==========================================
const INITIAL_LISTINGS = [
  {
    id: "LST-8901",
    title: "Vintage Wool Trench Coat in Camel",
    category: "Outerwear",
    seller: { name: "Elena Vance", username: "elena_v", avatar: "E", rating: 4.9 },
    price: 3450,
    originalPrice: 8900,
    condition: "Like New (9.5/10)",
    listingType: "sell",
    size: "M",
    brand: "Burberry Vintage",
    submittedAt: "24 ต.ค. 2026, 17:15",
    status: "pending", // "pending" | "approved" | "rejected"
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80",
    description: "Authentic pure wool trench coat in timeless camel tone. Dry cleaned, zero flaws, original horn buttons intact.",
    flagReason: null,
  },
  {
    id: "LST-8902",
    title: "Chunky Lug-Sole Leather Chelsea Boots",
    category: "Shoes",
    seller: { name: "Somchai Style", username: "somchai_s", avatar: "S", rating: 4.8 },
    price: 2290,
    originalPrice: 4500,
    condition: "Gently Used (9/10)",
    listingType: "sell",
    size: "42 EU",
    brand: "Studio Nicholson",
    submittedAt: "24 ต.ค. 2026, 16:40",
    status: "pending",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    description: "Italian calfskin leather Chelsea boots with lightweight vibram lug sole. Worn twice indoors only.",
    flagReason: null,
  },
  {
    id: "LST-8903",
    title: "Minimalist Oversized Silk Knit Sweater",
    category: "Tops",
    seller: { name: "Maneerat Chic", username: "maneerat_chic", avatar: "M", rating: 5.0 },
    price: 1650,
    originalPrice: 3200,
    condition: "Brand New with Tags",
    listingType: "exchange",
    size: "Free Size",
    brand: "Lemaire Inspired",
    submittedAt: "24 ต.ค. 2026, 15:20",
    status: "pending",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    description: "Mulberry silk blend knit, drape cut, warm oatmeal tone. Looking to exchange for tailored trousers or structured bag.",
    flagReason: null,
  },
  {
    id: "LST-8904",
    title: "Designer Structured Crossbody Bag",
    category: "Bags",
    seller: { name: "Kittisak K.", username: "kitti_k", avatar: "K", rating: 4.7 },
    price: 4800,
    originalPrice: 12500,
    condition: "Gently Used (8.5/10)",
    listingType: "sell",
    size: "Medium",
    brand: "A.P.C. Atelier",
    submittedAt: "23 ต.ค. 2026, 20:10",
    status: "approved",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    description: "Smooth saddle leather shoulder bag with gold hardware. Minor patina on corner, overall immaculate.",
    flagReason: null,
  },
  {
    id: "LST-8905",
    title: "Pleated High-Waisted Wide Leg Trousers",
    category: "Bottoms",
    seller: { name: "Napasorn P.", username: "napasorn_mode", avatar: "N", rating: 4.9 },
    price: 1190,
    originalPrice: 2800,
    condition: "Like New (9.8/10)",
    listingType: "sell",
    size: "S (Waist 25-26)",
    brand: "Cos Archive",
    submittedAt: "23 ต.ค. 2026, 14:05",
    status: "approved",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
    description: "Draped wool-poly blend tailored trousers in rich charcoal. Flattering high-rise waist with front pleats.",
    flagReason: null,
  },
  {
    id: "LST-8906",
    title: "Replica Hype Graphic Tee 1:1 Mirror",
    category: "Tops",
    seller: { name: "Bot Discount", username: "bot_discount", avatar: "B", rating: 2.1 },
    price: 450,
    originalPrice: 3500,
    condition: "Brand New",
    listingType: "sell",
    size: "XL",
    brand: "Supreme Fake",
    submittedAt: "22 ต.ค. 2026, 11:00",
    status: "rejected",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
    description: "1:1 Mirror quality replica, cheap deal dm line @xyz.",
    flagReason: "Counterfeit goods violate ClosetLoop authentic luxury policies",
  },
];

const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "Elena Vance",
    username: "elena_v",
    email: "elena@vance.studio",
    avatar: "E",
    role: "admin",
    status: "active", // "active" | "banned"
    ordersCount: 42,
    listingsCount: 18,
    joined: "15 ม.ค. 2026",
    totalSpent: 68400,
    verified: true,
  },
  {
    id: "USR-002",
    name: "Somchai Style",
    username: "somchai_s",
    email: "somchai.s@closetloop.th",
    avatar: "S",
    role: "seller",
    status: "active",
    ordersCount: 128,
    listingsCount: 64,
    joined: "02 ก.พ. 2026",
    totalSpent: 145200,
    verified: true,
  },
  {
    id: "USR-003",
    name: "Maneerat Vintage",
    username: "maneerat_chic",
    email: "maneerat@fashionlab.co",
    avatar: "M",
    role: "seller",
    status: "active",
    ordersCount: 85,
    listingsCount: 45,
    joined: "18 มี.ค. 2026",
    totalSpent: 94100,
    verified: true,
  },
  {
    id: "USR-004",
    name: "Alex Walker",
    username: "alexw",
    email: "alex.walker@gmail.com",
    avatar: "A",
    role: "buyer",
    status: "active",
    ordersCount: 14,
    listingsCount: 0,
    joined: "10 เม.ย. 2026",
    totalSpent: 18900,
    verified: false,
  },
  {
    id: "USR-005",
    name: "Kittisak K.",
    username: "kitti_k",
    email: "kitti.art@studio.net",
    avatar: "K",
    role: "curator",
    status: "active",
    ordersCount: 33,
    listingsCount: 12,
    joined: "28 พ.ค. 2026",
    totalSpent: 42600,
    verified: true,
  },
  {
    id: "USR-006",
    name: "Bot Discount 99",
    username: "bot_discount",
    email: "promo99@spammail.xyz",
    avatar: "B",
    role: "buyer",
    status: "banned",
    ordersCount: 0,
    listingsCount: 3,
    joined: "22 ต.ค. 2026",
    totalSpent: 0,
    verified: false,
  },
  {
    id: "USR-007",
    name: "Napasorn P.",
    username: "napasorn_mode",
    email: "napasorn.p@icloud.com",
    avatar: "N",
    role: "buyer",
    status: "active",
    ordersCount: 22,
    listingsCount: 5,
    joined: "05 ก.ค. 2026",
    totalSpent: 31200,
    verified: true,
  },
  {
    id: "USR-008",
    name: "Tanawat Minimal",
    username: "tanawat_m",
    email: "tana.minimal@outlook.com",
    avatar: "T",
    role: "seller",
    status: "active",
    ordersCount: 56,
    listingsCount: 29,
    joined: "14 ส.ค. 2026",
    totalSpent: 73800,
    verified: true,
  },
];

const INITIAL_LOGS = [
  {
    id: 1,
    time: "10 นาทีที่แล้ว",
    action: "Listing Approved",
    detail: "อนุมัติรายการ LST-8904 (A.P.C. Crossbody Bag)",
    admin: "Admin Elena",
    type: "approve",
  },
  {
    id: 2,
    time: "45 นาทีที่แล้ว",
    action: "User Banned",
    detail: "ระงับบัญชี @bot_discount เนื่องจากละเมิดข้อกำหนดสินค้าลอกเลียนแบบ",
    admin: "Automated Sentinel",
    type: "ban",
  },
  {
    id: 3,
    time: "2 ชั่วโมงที่แล้ว",
    action: "Seller Verified",
    detail: "อนุมัติสถานะ Verified Seller สำหรับ @somchai_s",
    admin: "Admin Elena",
    type: "verify",
  },
  {
    id: 4,
    time: "4 ชั่วโมงที่แล้ว",
    action: "Payout Processed",
    detail: "โอนเงินส่วนแบ่งยอดขายให้ผู้ขายรอบประจำสัปดาห์ (฿42,500)",
    admin: "Finance Bot",
    type: "payout",
  },
];

export default function AdminPage({ user, setToast, setPage }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "moderation" | "users" | "logs"
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Moderation filters
  const [listingSearch, setListingSearch] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [listingCategoryFilter, setListingCategoryFilter] = useState("all");

  // User filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all"); // "all" | "admin" | "seller" | "buyer" | "curator"
  const [userStatusFilter, setUserStatusFilter] = useState("all"); // "all" | "active" | "banned"

  // Modals state
  const [inspectListing, setInspectListing] = useState(null);
  const [rejectingListing, setRejectingListing] = useState(null);
  const [rejectReason, setRejectReason] = useState("Counterfeit / Unauthorized replica");
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats computation
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const approvedCount = listings.filter((l) => l.status === "approved").length;
  const rejectedCount = listings.filter((l) => l.status === "rejected").length;
  const activeUsersCount = users.filter((u) => u.status === "active").length;
  const bannedUsersCount = users.filter((u) => u.status === "banned").length;

  // Moderation Actions
  const handleApproveListing = (id) => {
    const item = listings.find((l) => l.id === id);
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "approved", flagReason: null } : l))
    );
    if (inspectListing && inspectListing.id === id) {
      setInspectListing((prev) => ({ ...prev, status: "approved", flagReason: null }));
    }
    const logItem = {
      id: Date.now(),
      time: "เมื่อสักครู่",
      action: "Listing Approved",
      detail: `อนุมัติรายการ ${id} (${item?.title || ""})`,
      admin: user?.display_name || user?.username || "Admin",
      type: "approve",
    };
    setLogs((prev) => [logItem, ...prev]);
    if (setToast) {
      setToast(`อนุมัติสินค้า "${item?.title || id}" เรียบร้อยแล้ว ✨`, "success");
    }
  };

  const handleOpenRejectModal = (item) => {
    setRejectingListing(item);
    setRejectReason("Counterfeit / Unauthorized replica");
    setCustomRejectNote("");
  };

  const handleConfirmReject = () => {
    if (!rejectingListing) return;
    const finalReason = customRejectNote
      ? `${rejectReason}: ${customRejectNote}`
      : rejectReason;

    setListings((prev) =>
      prev.map((l) =>
        l.id === rejectingListing.id
          ? { ...l, status: "rejected", flagReason: finalReason }
          : l
      )
    );
    if (inspectListing && inspectListing.id === rejectingListing.id) {
      setInspectListing((prev) => ({
        ...prev,
        status: "rejected",
        flagReason: finalReason,
      }));
    }
    const logItem = {
      id: Date.now(),
      time: "เมื่อสักครู่",
      action: "Listing Rejected",
      detail: `ปฏิเสธ ${rejectingListing.id} (${finalReason})`,
      admin: user?.display_name || user?.username || "Admin",
      type: "reject",
    };
    setLogs((prev) => [logItem, ...prev]);
    if (setToast) {
      setToast(`ปฏิเสธรายการ "${rejectingListing.title}" เรียบร้อย 🚫`, "info");
    }
    setRejectingListing(null);
  };

  const handleBatchApprovePending = () => {
    const pendingListings = listings.filter((l) => l.status === "pending");
    if (pendingListings.length === 0) {
      if (setToast) setToast("ไม่มีรายการที่รอดำเนินการตรวจสอบ", "info");
      return;
    }
    setListings((prev) =>
      prev.map((l) => (l.status === "pending" ? { ...l, status: "approved" } : l))
    );
    const logItem = {
      id: Date.now(),
      time: "เมื่อสักครู่",
      action: "Batch Approval",
      detail: `อนุมัติสินค้าที่รอการตรวจสอบทั้งหมด (${pendingListings.length} รายการ)`,
      admin: user?.display_name || user?.username || "Admin",
      type: "approve",
    };
    setLogs((prev) => [logItem, ...prev]);
    if (setToast) {
      setToast(
        `อนุมัติสินค้าที่รอดำเนินการทั้งหมด ${pendingListings.length} รายการเรียบร้อย 🎉`,
        "success"
      );
    }
  };

  // User Actions
  const handleToggleUserBan = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === "active" ? "banned" : "active";

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    const logItem = {
      id: Date.now(),
      time: "เมื่อสักครู่",
      action: newStatus === "banned" ? "User Banned" : "User Restored",
      detail: `${newStatus === "banned" ? "ระงับการใช้งาน" : "เปิดใช้งานบัญชี"} @${targetUser.username}`,
      admin: user?.display_name || user?.username || "Admin",
      type: newStatus === "banned" ? "ban" : "verify",
    };
    setLogs((prev) => [logItem, ...prev]);

    if (setToast) {
      if (newStatus === "banned") {
        setToast(`ระงับบัญชีผู้ใช้ @${targetUser.username} เรียบร้อย 🚫`, "info");
      } else {
        setToast(`ปลดการระงับบัญชี @${targetUser.username} สำเร็จ ✅`, "success");
      }
    }
  };

  const handleChangeUserRole = (userId, newRole) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const logItem = {
      id: Date.now(),
      time: "เมื่อสักครู่",
      action: "Role Updated",
      detail: `เปลี่ยนสิทธิ์ของ @${targetUser.username} เป็น ${newRole.toUpperCase()}`,
      admin: user?.display_name || user?.username || "Admin",
      type: "role",
    };
    setLogs((prev) => [logItem, ...prev]);

    if (setToast) {
      setToast(`อัปเดตสิทธิ์ของ @${targetUser.username} เป็น ${newRole.toUpperCase()} แล้ว 🛡️`, "success");
    }
  };

  // Refresh data simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (setToast) setToast("รีเฟรชข้อมูลแดชบอร์ดแอดมินเรียบร้อย 🔄", "success");
    }, 500);
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    setListings(INITIAL_LISTINGS);
    setUsers(INITIAL_USERS);
    setLogs(INITIAL_LOGS);
    if (setToast) setToast("รีเซ็ตข้อมูลจำลองสำหรับนำเสนอเรียบร้อย ⚡", "info");
  };

  // Export report simulation
  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            reportGeneratedAt: new Date().toISOString(),
            metrics: {
              totalUsers: 1428,
              platformRevenue: 384500,
              totalOrders: 862,
              activeListings: 342 + approvedCount,
            },
            listings,
            users,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `closetloop-admin-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (setToast) setToast("ส่งออกรายงานข้อมูลแอดมินเรียบร้อย 📥", "success");
  };

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
        item.seller.name.toLowerCase().includes(listingSearch.toLowerCase()) ||
        item.seller.username.toLowerCase().includes(listingSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(listingSearch.toLowerCase()) ||
        item.brand.toLowerCase().includes(listingSearch.toLowerCase());
      const matchStatus =
        listingStatusFilter === "all" || item.status === listingStatusFilter;
      const matchCategory =
        listingCategoryFilter === "all" ||
        item.category.toLowerCase() === listingCategoryFilter.toLowerCase();
      return matchSearch && matchStatus && matchCategory;
    });
  }, [listings, listingSearch, listingStatusFilter, listingCategoryFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchStatus =
        userStatusFilter === "all" || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  return (
    <div className="page admin-dashboard animate-fade-in pb-20">
      {/* 1. Header & Live Status Bar */}
      <div className="page-hero flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="eyebrow flex items-center gap-1.5 text-[#b45309] font-bold">
              <ShieldCheck size={14} className="text-[#c7b99b]" />
              ADMINISTRATIVE GOVERNANCE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Moderation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Admin Management Console
          </h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
            ภาพรวมตัวชี้วัดแพลตฟอร์ม, ตรวจสอบและอนุมัติสินค้าใน Marketplace, และจัดการสิทธิ์ผู้ใช้งาน ClosetLoop
          </p>
        </div>

        {/* Global Admin Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="btn btn-outline text-xs px-3.5 py-2 rounded-full border-neutral-300 hover:bg-neutral-100 transition flex items-center gap-1.5"
            title="รีเซ็ตข้อมูล Mock สำหรับการสาธิตใหม่"
          >
            <RefreshCw size={13} />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="btn btn-outline text-xs px-3.5 py-2 rounded-full border-neutral-300 hover:bg-neutral-100 transition flex items-center gap-1.5"
            title="ส่งออกรายงาน JSON"
          >
            <Download size={13} />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className={`btn btn-dark text-xs px-4 py-2 rounded-full flex items-center gap-1.5 ${
              isRefreshing ? "opacity-75" : ""
            }`}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Overview: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Total Users */}
        <div className="group hover:-translate-y-0.5 transition-all duration-200 bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[146px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase block truncate">
                Total Users
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                1,428
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#eee9df] text-[#151515] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-xs gap-2">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5 flex-shrink-0">
              <ArrowUpRight size={14} /> +14.2%
            </span>
            <span className="text-neutral-500 text-[11px] sm:text-xs truncate">
              1,180 Buyers • 248 Sellers
            </span>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="group hover:-translate-y-0.5 transition-all duration-200 bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[146px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase block truncate">
                Platform GMV / Rev
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                ฿384,500
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#eee9df] text-[#151515] flex items-center justify-center flex-shrink-0 shadow-xs">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-xs gap-2">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5 flex-shrink-0">
              <ArrowUpRight size={14} /> +22.8%
            </span>
            <span className="text-neutral-500 text-[11px] sm:text-xs truncate">
              Take (5%): ฿19,225
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="group hover:-translate-y-0.5 transition-all duration-200 bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[146px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase block truncate">
                Total Orders
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                862
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#eee9df] text-[#151515] flex items-center justify-center flex-shrink-0 shadow-xs">
              <PackageCheck size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-xs gap-2">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5 flex-shrink-0">
              <ArrowUpRight size={14} /> 98.4%
            </span>
            <span className="text-neutral-500 text-[11px] sm:text-xs truncate">
              Fulfilled & Verified
            </span>
          </div>
        </div>

        {/* Active Marketplace Listings */}
        <div className="group hover:-translate-y-0.5 transition-all duration-200 bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col justify-between min-h-[146px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase block truncate">
                Active Listings
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 tracking-tight">
                {342 + approvedCount}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-xs gap-2">
            {pendingCount > 0 ? (
              <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] flex-shrink-0">
                <Clock size={11} /> {pendingCount} Pending
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] flex-shrink-0">
                <CheckCircle2 size={11} /> All Clean
              </span>
            )}
            <span className="text-neutral-500 text-[11px] sm:text-xs truncate">
              {listings.length} in Moderation
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 mb-6 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[#151515] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <Layers size={16} />
            <span>Overview & Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moderation")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 relative ${
              activeTab === "moderation"
                ? "bg-[#151515] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <ShieldAlert size={16} />
            <span>Listing Moderation</span>
            {pendingCount > 0 && (
              <span
                className={`ml-1 text-[11px] font-extrabold px-2 py-0.2 rounded-full ${
                  activeTab === "moderation"
                    ? "bg-[#c7b99b] text-[#151515]"
                    : "bg-amber-500 text-white"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-[#151515] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <Users size={16} />
            <span>User Management</span>
            <span className="text-xs opacity-75 font-normal">({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "logs"
                ? "bg-[#151515] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <FileText size={16} />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Quick hint for presenter */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-neutral-500 bg-[#eee9df]/50 px-3 py-1.5 rounded-full border border-[#ded8cb]">
          <Sparkles size={13} className="text-[#c7b99b]" />
          <span>Interactive Demo Mode: All Approve, Reject & Ban actions update live</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW & SUMMARY
         ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Action Callout for Pending Moderation */}
          {pendingCount > 0 && (
            <div className="bg-gradient-to-r from-[#171717] to-[#252525] text-white p-6 rounded-3xl shadow-lg border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    มีสินค้าใหม่ {pendingCount} รายการที่รอการตรวจสอบอนุมัติ
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    ตรวจสอบความถูกต้อง ลิขสิทธิ์สินค้า และภาพถ่ายก่อนเผยแพร่สู่ Marketplace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleBatchApprovePending}
                  className="btn bg-[#c7b99b] hover:bg-[#d8cbb0] text-[#151515] font-bold text-xs px-4 py-2.5 rounded-full transition flex-1 md:flex-initial flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve All ({pendingCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("moderation")}
                  className="btn bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2.5 rounded-full transition flex-1 md:flex-initial flex items-center justify-center gap-1.5"
                >
                  <span>Review Queue</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Dual Split: Recent Moderation Queue & Top Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pending / Recent Listings preview */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="eyebrow">QUEUE PREVIEW</span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                    Marketplace Moderation Queue
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("moderation")}
                  className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1"
                >
                  View All ({listings.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {listings.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100 transition border border-neutral-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-neutral-900">
                            {money(item.price)}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-neutral-900 truncate mt-0.5 max-w-[200px] sm:max-w-xs">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-neutral-500">
                          by @{item.seller.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {item.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveListing(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(item)}
                            className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : item.status === "approved" ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Rejected
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setInspectListing(item)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 transition"
                        title="Inspect Details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: User Directory preview */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="eyebrow">GOVERNANCE</span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                    User Accounts & Roles
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1"
                >
                  Manage Users ({users.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {users.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100 transition border border-neutral-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#eee9df] text-[#151515] font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {u.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <b className="text-xs font-bold text-neutral-900 truncate">
                            {u.name}
                          </b>
                          {u.verified && (
                            <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-500 block truncate">
                          @{u.username} • {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-[#c7b99b]/30 text-amber-900 border border-[#c7b99b]"
                            : u.role === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "curator"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {u.role}
                      </span>

                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={u.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Audit Timeline Strip */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="eyebrow">AUDIT TRAIL</span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Recent Platform Events
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1"
              >
                Full Trail <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {logs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span className="font-semibold text-neutral-800">{log.action}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {log.detail}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-500 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-[#c7b99b]" />
                    <span>by {log.admin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: LISTING MODERATION TABLE
         ======================================================== */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          {/* Moderation Toolbar */}
          <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า, แบรนด์, รหัส หรือผู้ขาย..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-neutral-800 transition"
              />
              {listingSearch && (
                <button
                  type="button"
                  onClick={() => setListingSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Pills */}
              <div className="inline-flex bg-neutral-100 p-1 rounded-full text-xs">
                <button
                  type="button"
                  onClick={() => setListingStatusFilter("all")}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    listingStatusFilter === "all"
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  All ({listings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingStatusFilter("pending")}
                  className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
                    listingStatusFilter === "pending"
                      ? "bg-amber-400 text-neutral-900 shadow-xs font-bold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  <span>Pending</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                </button>
                <button
                  type="button"
                  onClick={() => setListingStatusFilter("approved")}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    listingStatusFilter === "approved"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  Approved ({approvedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setListingStatusFilter("rejected")}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    listingStatusFilter === "rejected"
                      ? "bg-rose-600 text-white shadow-xs font-bold"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  Rejected ({rejectedCount})
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={listingCategoryFilter}
                onChange={(e) => setListingCategoryFilter(e.target.value)}
                className="text-xs bg-neutral-100 border-0 rounded-full px-3 py-1.5 font-medium text-neutral-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
              </select>

              {/* Batch Approve Button */}
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleBatchApprovePending}
                  className="btn bg-[#151515] text-[#c7b99b] text-xs font-bold px-4 py-2 rounded-full hover:bg-neutral-800 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve All Pending ({pendingCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Moderation Listings Table */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold tracking-wider uppercase text-[10px]">
                    <th className="py-3.5 px-4">Item Details</th>
                    <th className="py-3.5 px-4">Category / Brand</th>
                    <th className="py-3.5 px-4">Seller Info</th>
                    <th className="py-3.5 px-4">Price / Type</th>
                    <th className="py-3.5 px-4">Submitted At</th>
                    <th className="py-3.5 px-4">Moderation Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <ShieldAlert size={36} className="mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm font-semibold text-neutral-600">
                          ไม่พบรายการสินค้าที่ตรงกับเงื่อนไขการค้นหา
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setListingSearch("");
                            setListingStatusFilter("all");
                            setListingCategoryFilter("all");
                          }}
                          className="mt-2 text-xs font-bold text-neutral-900 underline"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-neutral-50/60 transition group"
                      >
                        {/* Item Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative group/img cursor-pointer" onClick={() => setInspectListing(item)}>
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-14 h-14 rounded-xl object-cover bg-neutral-100 border border-neutral-200"
                              />
                              <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                                <Eye size={16} />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono text-neutral-400 block">
                                #{item.id}
                              </span>
                              <h4
                                className="font-bold text-neutral-900 text-xs hover:underline cursor-pointer max-w-xs truncate"
                                onClick={() => setInspectListing(item)}
                              >
                                {item.title}
                              </h4>
                              <span className="text-[11px] text-neutral-500">
                                {item.condition} • Size {item.size}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase mb-1">
                            {item.category}
                          </span>
                          <div className="font-semibold text-neutral-800 text-[11px]">
                            {item.brand}
                          </div>
                        </td>

                        {/* Seller Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#eee9df] text-[#151515] font-bold flex items-center justify-center text-xs">
                              {item.seller.avatar}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900 text-[11px]">
                                {item.seller.name}
                              </div>
                              <span className="text-[10px] text-neutral-500">
                                @{item.seller.username} • ★ {item.seller.rating}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price & Type */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-neutral-900 text-xs">
                            {money(item.price)}
                          </div>
                          <span className="text-[10px] text-neutral-500 capitalize">
                            Type: {item.listingType}
                          </span>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                          {item.submittedAt}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          {item.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <Clock size={11} className="text-amber-600" />
                              <span>PENDING</span>
                            </span>
                          )}
                          {item.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                <XCircle size={11} className="text-rose-600" />
                                <span>REJECTED</span>
                              </span>
                              {item.flagReason && (
                                <p className="text-[9px] text-rose-600 mt-1 max-w-[140px] truncate" title={item.flagReason}>
                                  {item.flagReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Details */}
                            <button
                              type="button"
                              onClick={() => setInspectListing(item)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition flex items-center gap-1"
                              title="Inspect Listing"
                            >
                              <Eye size={13} />
                              <span className="hidden sm:inline">Preview</span>
                            </button>

                            {/* Approve button */}
                            <button
                              type="button"
                              onClick={() => handleApproveListing(item.id)}
                              disabled={item.status === "approved"}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                item.status === "approved"
                                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                  : "bg-[#151515] text-[#c7b99b] hover:bg-neutral-800 shadow-xs"
                              }`}
                              title="Approve Listing"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>

                            {/* Reject button */}
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(item)}
                              disabled={item.status === "rejected"}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                item.status === "rejected"
                                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                  : "border border-rose-300 text-rose-700 hover:bg-rose-50"
                              }`}
                              title="Reject Listing"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: USER MANAGEMENT TABLE
         ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Management Toolbar */}
          <div className="bg-white p-5 rounded-3xl border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ใช้, username, email หรือ ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-neutral-800 transition"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <div className="inline-flex bg-neutral-100 p-1 rounded-full text-xs">
                {["all", "buyer", "seller", "curator", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-full font-medium uppercase tracking-tight transition text-[11px] ${
                      userRoleFilter === r
                        ? "bg-white text-black shadow-xs font-bold"
                        : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="text-xs bg-neutral-100 border-0 rounded-full px-3 py-1.5 font-medium text-neutral-700 focus:outline-none"
              >
                <option value="all">All Status ({users.length})</option>
                <option value="active">Active Only ({activeUsersCount})</option>
                <option value="banned">Banned Only ({bannedUsersCount})</option>
              </select>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold tracking-wider uppercase text-[10px]">
                    <th className="py-3.5 px-4">User Account</th>
                    <th className="py-3.5 px-4">Role Permission</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        <Users size={36} className="mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm font-semibold text-neutral-600">
                          ไม่พบรายชื่อผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUserSearch("");
                            setUserRoleFilter("all");
                            setUserStatusFilter("all");
                          }}
                          className="mt-2 text-xs font-bold text-neutral-900 underline"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className={`hover:bg-neutral-50/60 transition ${
                          u.status === "banned" ? "bg-rose-50/30" : ""
                        }`}
                      >
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm flex-shrink-0 ${
                                u.role === "admin"
                                  ? "bg-[#151515] text-[#c7b99b]"
                                  : "bg-[#eee9df] text-[#151515]"
                              }`}
                            >
                              {u.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <b className="text-xs font-bold text-neutral-900">
                                  {u.name}
                                </b>
                                {u.verified && (
                                  <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" title="Verified Member" />
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-500 block">
                                @{u.username} • {u.email}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                #{u.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Permission Dropdown */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer border transition ${
                                u.role === "admin"
                                  ? "bg-[#151515] text-[#c7b99b] border-[#c7b99b]/40"
                                  : u.role === "seller"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : u.role === "curator"
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : "bg-neutral-100 text-neutral-700 border-neutral-200"
                              }`}
                            >
                              <option value="buyer">BUYER</option>
                              <option value="seller">SELLER</option>
                              <option value="curator">CURATOR</option>
                              <option value="admin">ADMIN</option>
                            </select>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {u.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                              <Ban size={11} className="text-rose-600" />
                              <span>BANNED</span>
                            </span>
                          )}
                        </td>

                        {/* Activity Stats */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-neutral-800 font-semibold">
                            {u.ordersCount} Orders • {u.listingsCount} Listings
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            Vol: {money(u.totalSpent)}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                          {u.joined}
                        </td>

                        {/* Governance Actions (Ban/Unban) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status === "active" ? (
                              <button
                                type="button"
                                onClick={() => handleToggleUserBan(u.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 transition flex items-center gap-1"
                                title="Ban User Account"
                              >
                                <Ban size={13} />
                                <span>Ban User</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserBan(u.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1"
                                title="Unban / Restore Account"
                              >
                                <UserCheck size={13} />
                                <span>Activate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: AUDIT LOGS & PLATFORM INTEGRITY
         ======================================================== */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="eyebrow">AUDIT INTEGRITY</span>
                <h3 className="text-xl font-bold text-neutral-900 mt-0.5">
                  Platform System Event Logs
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  ประวัติการดำเนินการของแอดมินและการตรวจสอบอัตโนมัติแบบ Real-time
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="btn btn-outline text-xs px-3.5 py-1.5 rounded-full"
              >
                <Download size={13} /> Download Audit CSV
              </button>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        log.type === "approve"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.type === "reject" || log.type === "ban"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {log.type === "approve" ? (
                        <CheckCircle2 size={16} />
                      ) : log.type === "ban" ? (
                        <Ban size={16} />
                      ) : log.type === "reject" ? (
                        <XCircle size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-neutral-400">• {log.time}</span>
                      </div>
                      <p className="text-xs text-neutral-700 mt-0.5">{log.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center text-xs font-mono text-neutral-500 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                    <ShieldCheck size={12} className="text-[#c7b99b]" />
                    <span>{log.admin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: INSPECT / PREVIEW LISTING DETAILS
         ======================================================== */}
      {inspectListing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setInspectListing(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 p-6 md:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  LISTING INSPECTION • #{inspectListing.id}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1">
                  {inspectListing.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <img
                  src={inspectListing.image}
                  alt={inspectListing.title}
                  className="w-full h-72 rounded-2xl object-cover bg-neutral-100 border border-neutral-200"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <span>Submitted: {inspectListing.submittedAt}</span>
                  <span className="font-semibold text-neutral-800">
                    Condition: {inspectListing.condition}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      Category & Brand
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                        {inspectListing.category}
                      </span>
                      <span className="text-xs font-semibold text-neutral-600">
                        Brand: {inspectListing.brand}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      Pricing & Type
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <b className="text-2xl font-extrabold text-neutral-900">
                        {money(inspectListing.price)}
                      </b>
                      {inspectListing.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {money(inspectListing.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 capitalize">
                      Listing Type: {inspectListing.listingType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      Seller Details
                    </span>
                    <div className="flex items-center gap-3 mt-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="w-9 h-9 rounded-lg bg-[#eee9df] text-[#151515] font-bold flex items-center justify-center text-sm">
                        {inspectListing.seller.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">
                          {inspectListing.seller.name}
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          @{inspectListing.seller.username} • Rating ★ {inspectListing.seller.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      Item Description
                    </span>
                    <p className="text-xs text-neutral-700 leading-relaxed mt-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      {inspectListing.description}
                    </p>
                  </div>
                </div>

                {/* Current Status banner */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Current Status:</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      inspectListing.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : inspectListing.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {inspectListing.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="btn btn-outline text-xs px-4 py-2 rounded-full"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleOpenRejectModal(inspectListing)}
                disabled={inspectListing.status === "rejected"}
                className={`btn text-xs px-4 py-2 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 ${
                  inspectListing.status === "rejected" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <XCircle size={15} />
                <span>Reject Item</span>
              </button>

              <button
                type="button"
                onClick={() => handleApproveListing(inspectListing.id)}
                disabled={inspectListing.status === "approved"}
                className={`btn text-xs px-5 py-2 rounded-full bg-[#151515] text-[#c7b99b] hover:bg-neutral-800 font-bold flex items-center gap-1.5 ${
                  inspectListing.status === "approved" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <CheckCircle2 size={15} />
                <span>{inspectListing.status === "approved" ? "Approved" : "Approve Listing"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REJECT LISTING WITH REASON
         ======================================================== */}
      {rejectingListing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRejectingListing(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-white/20 p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  ระบุเหตุผลในการปฏิเสธสินค้า
                </h3>
                <span className="text-xs text-neutral-500">
                  {rejectingListing.title} (#{rejectingListing.id})
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                หมวดหมู่เหตุผล:
              </label>
              {[
                "Counterfeit / Unauthorized replica",
                "Inappropriate or blurry photos",
                "Misleading pricing or description",
                "Prohibited luxury materials",
                "Suspected spam / prohibited seller",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    rejectReason === reason
                      ? "bg-rose-50/60 border-rose-400 font-semibold text-rose-900"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  หมายเหตุเพิ่มเติมถึงผู้ขาย (Optional):
                </label>
                <textarea
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  placeholder="เช่น กรุณาแนบภาพป้าย Tag ด้านในหรือใบเสร็จรับเงินเพื่อยืนยัน..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingListing(null)}
                className="btn btn-outline text-xs px-4 py-2 rounded-full"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="btn bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-full transition flex items-center gap-1.5"
              >
                <XCircle size={15} />
                <span>ยืนยันปฏิเสธ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
