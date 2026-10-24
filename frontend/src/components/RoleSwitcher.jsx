import React from "react";
import { ShoppingBag, PackageSearch, ShieldCheck, ChevronDown, Check } from "lucide-react";

export const ROLES = [
  {
    id: "buyer",
    label: "Buyer",
    badgeLabel: "Buyer",
    icon: ShoppingBag,
    color: "#151515",
    accent: "#eee9df",
    desc: "Browse, AI styling, and personal closet",
  },
  {
    id: "seller",
    label: "Seller",
    badgeLabel: "Seller",
    icon: PackageSearch,
    color: "#2563eb",
    accent: "#dbeafe",
    desc: "Manage inventory and customer orders",
  },
  {
    id: "admin",
    label: "Admin",
    badgeLabel: "Admin",
    icon: ShieldCheck,
    color: "#b45309",
    accent: "#fef3c7",
    desc: "Platform oversight, moderation & user controls",
  },
];

export default function RoleSwitcher({
  role = "buyer",
  onRoleChange,
  variant = "segmented", // "segmented" | "sidebar" | "dropdown"
  className = "",
}) {
  const currentRoleObj = ROLES.find((r) => r.id === role) || ROLES[0];

  if (variant === "sidebar") {
    return (
      <div className={`role-switcher-sidebar bg-[#1c1c1c] rounded-2xl p-1.5 border border-white/5 ${className}`}>
        <div className="flex items-center justify-between px-1.5 py-0.5 mb-1">
          <span className="text-[10px] font-bold tracking-wider text-[#888] uppercase">
            Active Role
          </span>
          <span
            className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1 ${
              role === "admin"
                ? "bg-[#c7b99b]/20 text-[#c7b99b] border border-[#c7b99b]/40"
                : role === "seller"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-white/10 text-neutral-300"
            }`}
          >
            {role === "admin" && <span className="w-1.5 h-1.5 rounded-full bg-[#c7b99b] animate-ping" />}
            {role}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-xl">
          {ROLES.map(({ id, label, icon: Icon }) => {
            const isActive = role === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onRoleChange(id)}
                title={`Switch to ${label} mode`}
                className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? id === "admin"
                      ? "bg-[#c7b99b] text-[#151515] shadow-md font-bold"
                      : "bg-[#2e2e2e] text-white shadow-sm font-bold"
                    : "text-[#888] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={12} className={isActive && id === "admin" ? "text-[#151515]" : ""} />
                <span className="text-[10px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Segmented Pill (Default for Topbar)
  return (
    <div
      className={`role-switcher-pill inline-flex items-center bg-[#eee9df]/75 hover:bg-[#eee9df] p-1 rounded-full border border-[#ded8cb] shadow-inner transition-all duration-200 ${className}`}
      title="Multi-Role Switcher (Demo & Presentation)"
    >
      <div className="hidden md:flex items-center pl-2.5 pr-1.5 text-[10px] font-bold tracking-wider text-[#77746f] uppercase select-none">
        Role:
      </div>

      <div className="flex items-center gap-1">
        {ROLES.map(({ id, label, icon: Icon }) => {
          const isActive = role === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onRoleChange(id)}
              className={`group relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none ${
                isActive
                  ? id === "admin"
                    ? "bg-[#151515] text-[#e5d8b8] shadow-sm ring-1 ring-[#c7b99b]/60 font-bold"
                    : "bg-[#151515] text-white shadow-sm font-bold"
                  : "text-[#666] hover:text-[#151515] hover:bg-white/70"
              }`}
            >
              <Icon
                size={13}
                className={`transition-transform duration-200 ${
                  isActive
                    ? id === "admin"
                      ? "text-[#c7b99b] scale-110"
                      : "text-white scale-105"
                    : "text-[#888] group-hover:scale-110"
                }`}
              />
              <span className="tracking-tight">{label}</span>
              {isActive && id === "admin" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c7b99b] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
