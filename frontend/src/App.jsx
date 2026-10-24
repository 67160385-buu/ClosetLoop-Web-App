import { useState, useEffect } from "react";
import { Check, ShoppingBag, AlertCircle, Info, Sparkles } from "lucide-react";
import { api } from "./api";
import StyleQuiz from "./components/StyleQuiz";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import ClosetPage from "./components/ClosetPage";
import AIPage from "./components/AIPage";
import MarketPage from "./components/MarketPage";
import CartPage from "./components/CartPage";
import CheckoutModalPage from "./components/CheckoutModalPage";
import OrdersPage from "./components/OrdersPage";
import ProfilePage from "./components/ProfilePage";
import SellerOrders from "./components/SellerOrders";
import AdminPage from "./components/AdminPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(() => api.getQuiz());
  const [showQuiz, setShowQuiz] = useState(() => !api.getQuiz());
  const [page, setPage] = useState("dashboard"); // default to dashboard or home
  const [auth, setAuth] = useState("login");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  // Multi-Role State (buyer | seller | admin)
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem("closetloop_role") || "buyer";
    } catch {
      return "buyer";
    }
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    try {
      localStorage.setItem("closetloop_role", newRole);
    } catch (e) {
      console.warn("Failed to persist role:", e);
    }

    if (newRole === "admin") {
      notify("สลับเป็นโหมด Admin เรียบร้อย 🛡️ (เข้าถึง Admin Dashboard ได้แล้ว)", "info");
    } else if (newRole === "seller") {
      notify("สลับเป็นโหมด Seller เรียบร้อย 🏷️", "info");
    } else {
      notify("สลับเป็นโหมด Buyer เรียบร้อย 🛍️", "info");
    }

    // Redirect away from admin page if role changed to non-admin
    if (page === "admin" && newRole !== "admin") {
      setPage("dashboard");
    }
  };

  // 1. State ตะกร้าสินค้า เชื่อมต่อกับ localStorage (สินค้ามือสองมีเพียง 1 ชิ้นต่อรายการ)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("closetloop_cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({ ...item, qty: 1, quantity: 1 }))
        : [];
    } catch {
      return [];
    }
  });

  // บันทึกตะกร้าลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem("closetloop_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to persist cart to localStorage:", e);
    }
  }, [cart]);

  // ตรวจสอบเซสชันผู้ใช้เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const token = localStorage.getItem("closetloop_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((u) => {
        setUser(u);
        if (u.style_preferences) {
          setQuiz(u.style_preferences);
          setShowQuiz(false);
        }
        setPage("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("closetloop_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // ตัวจัดการ Toast timeout
  useEffect(() => {
    if (!toast.message) return;
    const t = setTimeout(() => setToast({ message: "", type: "success" }), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // ฟังก์ชันแสดง Toast แจ้งเตือน
  const notify = (msg, type = "success") => {
    if (typeof msg === "string") {
      setToast({ message: msg, type });
    } else if (msg && msg.message) {
      setToast({ message: msg.message, type: msg.type || "success" });
    }
  };

  // 2. ฟังก์ชันเพิ่มสินค้าลงตะกร้า (Add to Cart - สินค้ามือสองมีเพียง 1 ชิ้น)
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => String(item.id) === String(product.id));
      if (exists) {
        notify(`สินค้า "${product.title || product.name}" อยู่ในตะกร้าแล้ว (สินค้ามือสองมีเพียง 1 ชิ้นเท่านั้น) 🛍️`, "info");
        return prev;
      }
      notify(`เพิ่ม "${product.title || product.name}" ลงในตะกร้าแล้ว 🛍️`, "success");
      return [...prev, { ...product, qty: 1, quantity: 1 }];
    });
  };

  // ดำเนินการเปิดหน้าชำระเงิน
  const handleOpenCheckout = (data) => {
    if (!cart || cart.length === 0) {
      notify("กรุณาเพิ่มสินค้าลงในตะกร้าก่อนดำเนินการชำระเงิน", "error");
      return;
    }
    setCheckoutData(data);
    setShowCheckout(true);
  };

  // ชำระเงินสำเร็จ
  const handleCheckoutSuccess = (order) => {
    setCart([]);
    localStorage.removeItem("closetloop_cart");
    setShowCheckout(false);
    setCheckoutData(null);
    setPage("orders");
    notify(`คำสั่งซื้อ #${order.id} สำเร็จเรียบร้อยแล้ว! 🎉 ขอบคุณที่ร่วม Loop`, "success");
  };

  // Quiz เสร็จสิ้น
  const completeQuiz = (prefs) => {
    try {
      api.saveQuiz(prefs);
    } catch (e) {
      notify(e.message, "error");
    }
    setQuiz(prefs);
    setShowQuiz(false);
    setUser((u) => (u ? { ...u, style_preferences: prefs } : u));
    setPage("dashboard");
    notify("บันทึกสไตล์การแต่งตัวของคุณเรียบร้อย ✨", "success");
  };

  // เข้าสู่ระบบสำเร็จ
  const loginSuccess = (data) => {
    setUser(data.user);
    if (data.user?.style_preferences) setQuiz(data.user.style_preferences);
    setPage("dashboard");
    notify(`ยินดีต้อนรับกลับ ${data.user?.display_name || data.user?.username || ""} ✨`, "success");
  };

  // ออกจากระบบ
  const logout = async () => {
    try {
      await api.logout();
    } catch { }
    setUser(null);
    setPage("dashboard");
    notify("ออกจากระบบเรียบร้อยแล้ว", "info");
  };

  // จำนวนสินค้าในตะกร้า (สินค้ามือสองมี 1 ชิ้นต่อรายการ)
  const cartCount = cart.length;

  // คำนวณยอดเงินรวมสำหรับ Modal
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * 1,
    0
  );
  const shippingFee = subtotal >= 1500 ? 0 : cart.length > 0 ? 50 : 0;
  const grandTotal = subtotal + shippingFee;

  // Loading Screen
  if (loading) {
    return (
      <div className="splash flex flex-col items-center justify-center min-h-screen bg-[#111] text-white">
        <div className="logo-mark w-14 h-14 border border-white rounded-full flex items-center justify-center font-bold tracking-tighter text-xl mb-3">
          CL
        </div>
        <p className="text-xs uppercase tracking-widest text-[#aaa]">Loading Your Loop...</p>
      </div>
    );
  }

  // First-time Style Quiz
  if (showQuiz) {
    return (
      <StyleQuiz
        initial={quiz}
        onComplete={completeQuiz}
        onCancel={quiz ? () => setShowQuiz(false) : undefined}
      />
    );
  }

  // Auth Screen if unauthenticated
  if (!user) {
    return (
      <AuthScreen
        mode={auth}
        setMode={setAuth}
        onSuccess={loginSuccess}
        toast={toast.message}
      />
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[#f7f6f2] text-[#151515]">
      {/* 1. Left Sidebar with Cart Badge & Role Switcher */}
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        logout={logout}
        cartCount={cartCount}
        role={role}
        onRoleChange={handleRoleChange}
      />

      <main className="main flex flex-col flex-1 min-w-0">
        {/* 2. Sticky Topbar with Search, Profile, Quick Cart Access & Role Switcher */}
        <Topbar
          page={page}
          user={user}
          setPage={setPage}
          cart={cart}
          role={role}
          onRoleChange={handleRoleChange}
        />

        {/* 3. Page Router based on `page` state */}
        <div className="flex-1">
          {page === "home" && <HomePage setPage={setPage} user={user} />}

          {page === "seller-orders" && <SellerOrders setToast={setToast} />}

          {page === "admin" && (
            <AdminPage
              user={user}
              setToast={notify}
              setPage={setPage}
            />
          )}

          {(page === "dashboard" || page === "overview") && <Dashboard setPage={setPage} user={user} addToCart={addToCart} />}

          {page === "closet" && <ClosetPage setToast={notify} />}

          {page === "ai" && (
            <AIPage
              setToast={notify}
              quiz={quiz}
              onRetake={() => setShowQuiz(true)}
              setPage={setPage}
            />
          )}

          {page === "market" && (
            <MarketPage
              user={user}
              setToast={notify}
              addToCart={addToCart}
              onProceedToCheckout={handleOpenCheckout}
            />
          )}

          {page === "cart" && (
            <CartPage
              cart={cart}
              setCart={setCart}
              setPage={setPage}
              setToast={notify}
              onOpenCheckout={handleOpenCheckout}
            />
          )}

          {page === "orders" && <OrdersPage setPage={setPage} />}

          {page === "profile" && (
            <ProfilePage
              user={user}
              setUser={setUser}
              setToast={notify}
              logout={logout}
              quiz={quiz}
              onRetake={() => setShowQuiz(true)}
            />
          )}
        </div>
      </main>

      {/* 4. Checkout Modal Page */}
      {showCheckout && (
        <CheckoutModalPage
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cart={cart}
          subtotal={checkoutData?.subtotal || subtotal}
          shippingFee={checkoutData?.shippingFee !== undefined ? checkoutData.shippingFee : shippingFee}
          grandTotal={checkoutData?.grandTotal || grandTotal}
          onSuccess={handleCheckoutSuccess}
          user={user}
        />
      )}

      {/* 5. Modern Bottom Toast Notification */}
      {toast.message && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#151515] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold animate-fade-in"
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          ) : toast.type === "info" ? (
            <Info size={18} className="text-blue-400 flex-shrink-0" />
          ) : (
            <Check size={18} className="text-emerald-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}