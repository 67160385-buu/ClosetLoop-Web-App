import {
  Home,
  Shirt,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  PackageCheck,
  PackageSearch,
  CircleUserRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import RoleSwitcher from "./RoleSwitcher";

export default function Sidebar({
  page,
  setPage,
  user,
  logout,
  cartCount = 0,
  role = "buyer",
  onRoleChange,
}) {
  const nav = [
    { key: "dashboard", label: "Overview", icon: Home },
    { key: "closet", label: "My Closet", icon: Shirt },
    { key: "ai", label: "AI Outfit", icon: Sparkles },
    { key: "market", label: "Marketplace", icon: ShoppingBag },
    { key: "cart", label: "My Cart", icon: ShoppingCart, hasBadge: true },
    { key: "orders", label: "My Orders", icon: PackageCheck },
    { key: "seller-orders", label: "Seller Orders", icon: PackageSearch },
    // Only show Admin Dashboard when the Admin role is selected
    ...(role === "admin"
      ? [
          {
            key: "admin",
            label: "Admin Dashboard",
            icon: ShieldCheck,
            isAdmin: true,
          },
        ]
      : []),
    { key: "profile", label: "Profile", icon: CircleUserRound },
  ];

  const displayName = user?.display_name || user?.username || "Curator";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  return (
    <aside className="sidebar select-none flex flex-col justify-between">
      {/* 1. Header Section (Fixed Top) */}
      <div className="flex-shrink-0">
        {/* Brand Logo - Enlarged as requested ("เพิ่มขนาด") */}
        <div
          className="brand-heading cursor-pointer flex items-baseline gap-1.5 select-none hover:opacity-90 transition group pt-1 pb-2 mb-2 px-1"
          onClick={() => setPage("dashboard")}
          title="ClosetLoop Overview"
        >
          <span className="text-[28px] sm:text-[30px] font-black tracking-tight text-white group-hover:text-[#c7b99b] transition-colors leading-none">
            ClosetLoop
          </span>
          <span className="text-xs font-bold text-neutral-400 group-hover:text-[#c7b99b] transition-colors">
            ®
          </span>
        </div>

        {/* User Card - Compact & Clean */}
        <div
          className="sidebar-user cursor-pointer rounded-2xl hover:bg-[#222] transition-colors p-2.5 mb-2.5 flex items-center gap-2.5 bg-[#1e1e1e] border border-white/5"
          onClick={() => setPage("profile")}
          title="ดูโปรไฟล์"
        >
          <div className="avatar rounded-xl w-8 h-8 text-xs font-bold flex items-center justify-center bg-[#d9d1c1] text-[#191919] flex-shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <b className="truncate block text-xs font-bold text-white leading-tight">
              {displayName}
            </b>
            <small className="text-[#a3a3a3] text-[10px] truncate block font-medium mt-0.5">
              @{user?.username || "member"}
            </small>
          </div>
        </div>

        {/* Role Switcher Widget in Sidebar */}
        {onRoleChange && (
          <div className="mb-2.5">
            <RoleSwitcher
              role={role}
              onRoleChange={onRoleChange}
              variant="sidebar"
            />
          </div>
        )}

        {/* Menu Label */}
        <div className="nav-label text-[10px] font-bold tracking-wider text-[#777] px-2 mb-1.5 uppercase">
          MAIN NAVIGATION
        </div>
      </div>

      {/* 2. Flexible Scrollable Navigation Items (Fixes "ตกขอบ" / Bottom Cutoff) */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 my-1 pr-1 custom-sidebar-nav min-h-0">
        {nav.map(({ key, label, icon: Icon, hasBadge, isAdmin }) => {
          const isActive = page === key || (key === "dashboard" && page === "overview");
          return (
            <button
              key={key}
              type="button"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all ${
                isActive
                  ? isAdmin
                    ? "bg-[#292929] text-[#c7b99b] border border-[#c7b99b]/40 shadow-sm font-bold"
                    : "bg-[#292929] text-white shadow-sm font-semibold"
                  : isAdmin
                  ? "text-[#c7b99b]/90 hover:text-[#c7b99b] hover:bg-[#202020] font-semibold"
                  : "text-[#b3b3b3] hover:text-white hover:bg-[#202020]"
              }`}
              onClick={() => setPage(key)}
            >
              <Icon
                size={18}
                className={
                  isActive
                    ? isAdmin
                      ? "text-[#c7b99b]"
                      : "text-white"
                    : isAdmin
                    ? "text-[#c7b99b]/80"
                    : "text-[#999]"
                }
              />
              <span className="flex-1 text-left truncate">{label}</span>

              {/* Admin Tag */}
              {isAdmin && (
                <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#c7b99b] text-[#151515] uppercase tracking-wider">
                  ADMIN
                </span>
              )}

              {/* Cart Badge */}
              {hasBadge && cartCount > 0 && (
                <span
                  className={`ml-auto text-xs font-bold px-2 py-0.2 rounded-full transition-transform ${
                    isActive
                      ? "bg-white text-[#151515]"
                      : "bg-[#eee9df] text-[#151515]"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Footer Actions (Anchored cleanly at bottom, never cut off) */}
      <div className="sidebar-bottom pt-2.5 mt-auto border-t border-[#262626] flex-shrink-0">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#ef4444] hover:bg-red-500/10 transition rounded-xl"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}