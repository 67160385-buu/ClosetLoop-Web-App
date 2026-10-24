import { ChevronRight, Search, ShoppingCart, User } from "lucide-react";
import RoleSwitcher from "./RoleSwitcher";

export default function Topbar({
  page,
  user,
  setPage,
  cart = [],
  role = "buyer",
  onRoleChange,
}) {
  const titles = {
    home: "Home",
    dashboard: "Overview",
    closet: "My Closet",
    ai: "AI Outfit",
    market: "Marketplace",
    cart: "My Cart",
    orders: "Orders",
    "seller-orders": "Seller Orders",
    profile: "Profile",
    admin: "Admin Dashboard",
  };

  const cartCount = cart.length;
  const displayName = user?.display_name || user?.username || "Curator";
  const avatarInitial = displayName.slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      <div className="mobile-brand" onClick={() => setPage("dashboard")} role="button">
        ClosetLoop<span>®</span>
      </div>

      <div className="breadcrumb text-sm font-medium text-gray-500 flex items-center gap-2">
        <span
          className="hover:text-gray-900 transition-colors cursor-pointer"
          onClick={() => setPage("dashboard")}
        >
          ClosetLoop
        </span>
        <ChevronRight size={15} className="text-gray-400" />
        <span className="font-semibold text-gray-900">{titles[page] || "Overview"}</span>
      </div>

      <div className="top-actions flex items-center gap-2.5">
        {/* Role Switcher Widget (Segmented Pill) */}
        {onRoleChange && (
          <RoleSwitcher
            role={role}
            onRoleChange={onRoleChange}
            variant="segmented"
          />
        )}

        {/* Search quick button */}
        <button
          type="button"
          className="icon-btn"
          onClick={() => setPage("market")}
          title="ค้นหาสินค้าใน Marketplace"
        >
          <Search size={17} />
        </button>

        {/* Quick Cart Access Button with Badge */}
        <button
          type="button"
          className="icon-btn relative"
          onClick={() => setPage("cart")}
          title="ดูตะกร้าสินค้า"
        >
          <ShoppingCart size={17} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#151515] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scale-in">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        {/* User Profile Chip */}
        <button
          type="button"
          className="user-chip hover:bg-[#eee9df]/50 transition-colors p-1 pr-3 rounded-full"
          onClick={() => setPage("profile")}
          title="ดูข้อมูลโปรไฟล์"
        >
          <div className="mini-avatar">{avatarInitial}</div>
          <span className="font-semibold text-xs text-[#222]">{displayName}</span>
        </button>
      </div>
    </header>
  );
}