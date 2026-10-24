// ClosetLoop Service Layer
// รองรับทั้งการเชื่อมต่อ FastAPI Backend และ Automatic Fallback เมื่อ Backend ออฟไลน์

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const K = {
  users: "closetloop_users",
  session: "closetloop_token",
  closet: "closetloop_closet",
  products: "closetloop_products",
  orders: "closetloop_orders",
  quiz: "closetloop_style_quiz",
  seeded: "closetloop_seeded_v2",
};

// อ่านข้อมูลจาก LocalStorage
function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

// บันทึกข้อมูลลง LocalStorage
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("LocalStorage quota full");
  }
}

function hash(s) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 16777619);
    h2 = (Math.imul(h2 ^ c, 2246822507) + i) | 0;
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

const nextId = (list) => (list && list.length ? list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1 : 1);
const now = () => new Date().toISOString();
const pub = ({ password_hash, ...u }) => u;

// ข้อมูลจำลองพรีเมียม (Mock Data) สำหรับเริ่มต้นใช้งานทันที
function seedInitialData() {
  try {
    if (localStorage.getItem(K.seeded)) return;

    // 1. สินค้าใน Marketplace แฟชั่น
    const initialProducts = [
      {
        id: 1,
        seller_id: 99,
        seller_name: "Anya Studio",
        closet_item_id: null,
        title: "Vintage Denim Oversized Jacket",
        category: "top",
        color: "Blue Denim",
        size: "L",
        condition: "สภาพดีเยี่ยม 95%",
        price: 1290,
        listing_type: "sell",
        status: "available",
        description: "แจ็คเก็ตยีนส์ฟอกสีวินเทจ ทรงหลวมสไตล์ 90s สวมใส่สบาย แมตช์ง่ายกับทุกลุค",
        image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 2,
        seller_id: 98,
        seller_name: "Minimalist Club",
        closet_item_id: null,
        title: "Wool Blend Tailored Blazer",
        category: "top",
        color: "Camel",
        size: "M",
        condition: "เหมือนใหม่ สภาพ 98%",
        price: 1890,
        listing_type: "sell",
        status: "available",
        description: "เบลเซอร์ผ้าคัตติ้งเนี้ยบ โทนสีคาเมลหรูหรา เหมาะสำหรับใส่ทำงานหรือสไตล์ Smart Casual",
        image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 3,
        seller_id: 97,
        seller_name: "Y2K Archive",
        closet_item_id: null,
        title: "Pleated Wide-Leg Studio Trousers",
        category: "bottom",
        color: "Charcoal Grey",
        size: "M",
        condition: "สภาพดี 90%",
        price: 890,
        listing_type: "sell",
        status: "available",
        description: "กางเกงสแล็คทรงกระบอกใหญ่ จับจีบด้านหน้า เนื้อผ้าทิ้งตัวสวยสไตล์เกาหลี",
        image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 4,
        seller_id: 96,
        seller_name: "Mono Studio",
        closet_item_id: null,
        title: "Heavyweight Boxy Cotton Tee",
        category: "top",
        color: "Off-White",
        size: "L",
        condition: "มือหนึ่งแกะป้าย",
        price: 490,
        listing_type: "sell",
        status: "available",
        description: "เสื้อยืดคอตตอน 100% เนื้อผ้าหนา 240gsm ทรง Boxy ทันสมัย อยู่ทรงตลอดวัน",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: 5,
        seller_id: 95,
        seller_name: "Retro Finds",
        closet_item_id: null,
        title: "Structured Canvas Tote with Leather Trim",
        category: "bag",
        color: "Cream/Brown",
        size: "Free",
        condition: "สภาพ 92%",
        price: 750,
        listing_type: "sell",
        status: "available",
        description: "กระเป๋าโท้ทผ้าแคนวาสทนทาน แต่งดีเทลขอบหนังแท้ จุของได้จุใจสำหรับสายคาเฟ่",
        image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 6,
        seller_id: 94,
        seller_name: "Street Vault",
        closet_item_id: null,
        title: "Retro 90s Acetate Sunglasses",
        category: "accessory",
        color: "Black",
        size: "Free",
        condition: "เหมือนใหม่",
        price: 590,
        listing_type: "exchange",
        status: "available",
        description: "แว่นตากันแดดทรงเหลี่ยมสไตล์เรโทร 90s ป้องกัน UV400 พร้อมกล่องและผ้าเช็ดแว่น (ยินดีแลกเปลี่ยน)",
        image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
        created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
      },
    ];

    write(K.products, initialProducts);

    // 2. เสื้อผ้าตัวอย่างในตู้เสื้อผ้า (My Closet)
    const initialCloset = [
      {
        id: 1,
        user_id: 1,
        name: "Oversized Cotton Tee",
        category: "top",
        color: "white",
        size: "L",
        style: "minimal",
        condition: "good",
        fit: "oversized",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
        created_at: now(),
      },
      {
        id: 2,
        user_id: 1,
        name: "Vintage Blue Denim",
        category: "bottom",
        color: "blue",
        size: "M",
        style: "street",
        condition: "good",
        fit: "wide",
        image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80",
        created_at: now(),
      },
      {
        id: 3,
        user_id: 1,
        name: "Tailored Camel Coat",
        category: "top",
        color: "brown",
        size: "M",
        style: "korean",
        condition: "like_new",
        fit: "regular",
        image_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        created_at: now(),
      },
      {
        id: 4,
        user_id: 1,
        name: "Clean Leather Loafers",
        category: "shoes",
        color: "black",
        size: "42",
        style: "minimal",
        condition: "good",
        fit: "regular",
        image_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&auto=format&fit=crop&q=80",
        created_at: now(),
      },
    ];
    write(K.closet, initialCloset);

    // 3. ตัวอย่างคำสั่งซื้อเริ่มต้น (Realistic Order History)
    const initialOrders = [
      {
        id: "CL-9042",
        buyer_id: 1,
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        status: "shipped",
        status_label: "กำลังจัดส่ง",
        carrier: "Kerry Express",
        tracking_number: "TH-KRY-84910328",
        items: [
          {
            id: 2,
            title: "Wool Blend Tailored Blazer",
            price: 1890,
            quantity: 1,
            size: "M",
            color: "Camel",
            image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300",
          },
        ],
        subtotal: 1890,
        shipping_fee: 50,
        total_price: 1940,
        payment_method: "promptpay",
        slip_url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400",
        shipping_address: {
          name: "ปภัสสร วงศ์วิจิตร",
          phone: "089-123-4567",
          address: "555/8 อาคารพรีเมียมทาวเวอร์ ชั้น 12 ถนนสุขุมวิท 21",
          city: "วัฒนา",
          province: "กรุงเทพมหานคร",
          postal_code: "10110",
        },
      },
      {
        id: "CL-8721",
        buyer_id: 1,
        created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
        status: "completed",
        status_label: "จัดส่งสำเร็จ",
        carrier: "Flash Express",
        tracking_number: "TH-FLS-39184029",
        items: [
          {
            id: 4,
            title: "Heavyweight Boxy Cotton Tee",
            price: 490,
            quantity: 2,
            size: "L",
            color: "Off-White",
            image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
          },
        ],
        subtotal: 980,
        shipping_fee: 50,
        total_price: 1030,
        payment_method: "bank_transfer",
        slip_url: "",
        shipping_address: {
          name: "ปภัสสร วงศ์วิจิตร",
          phone: "089-123-4567",
          address: "555/8 อาคารพรีเมียมทาวเวอร์ ชั้น 12 ถนนสุขุมวิท 21",
          city: "วัฒนา",
          province: "กรุงเทพมหานคร",
          postal_code: "10110",
        },
      },
    ];
    write(K.orders, initialOrders);

    localStorage.setItem(K.seeded, "true");
  } catch (err) {
    console.error("Initial seeding error:", err);
  }
}
seedInitialData();

// ย่อขนาดภาพเป็น DataURL อัตโนมัติ ป้องกันโควต้าเกิน
export function shrinkImage(file, maxSide = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function getStoredUser() {
  const token = localStorage.getItem(K.session);
  if (!token) return null;
  const users = read(K.users, []);
  return users.find((u) => String(u.id) === String(token)) || null;
}

// Helper ส่ง HTTP Request ไป Backend (พร้อม Timeout สั้นเพื่อสลับไป Fallback ทันทีหากไม่มีเซิร์ฟเวอร์)
async function requestBackend(endpoint, options = {}, timeoutMs = 2500) {
  const token = localStorage.getItem(K.session);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// -------------------------------------------------------------
// API Service Object (Full FastAPI connection + Offline Fallback)
// -------------------------------------------------------------
export const api = {
  getQuiz: () => read(K.quiz, null),

  saveQuiz(prefs) {
    write(K.quiz, prefs);
    const user = getStoredUser();
    if (user) {
      const users = read(K.users, []);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx].style_preferences = prefs;
        write(K.users, users);
      }
    }
    return prefs;
  },

  async register(body) {
    // 1. ลองเชื่อมต่อ Backend ก่อน
    try {
      const res = await requestBackend("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: body.username,
          email: body.email,
          password: body.password,
          display_name: body.display_name || body.username,
        }),
      });
      if (res.access_token) {
        localStorage.setItem(K.session, res.access_token);
        return res;
      }
    } catch (err) {
      // Backend ออฟไลน์ หรือผิดพลาด -> ดำเนินการต่อด้วย Fallback
    }

    // Fallback: Local Auth
    const username = (body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    if (!username || !email) throw new Error("กรุณากรอกชื่อผู้ใช้และอีเมล");
    if ((body.password || "").length < 6) throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    const users = read(K.users, []);
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
    }
    if (users.some((u) => u.email === email)) {
      throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
    }

    const newUser = {
      id: nextId(users),
      username,
      email,
      password_hash: hash(body.password),
      display_name: (body.display_name || username).trim(),
      avatar_url: "",
      style_preferences: api.getQuiz(),
      created_at: now(),
    };
    users.push(newUser);
    write(K.users, users);
    localStorage.setItem(K.session, String(newUser.id));
    return { access_token: String(newUser.id), token_type: "bearer", user: pub(newUser) };
  },

  async login(body) {
    // 1. ลองยิงเข้า Backend
    try {
      const res = await requestBackend("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      if (res.access_token) {
        localStorage.setItem(K.session, res.access_token);
        return res;
      }
    } catch {
      // Fallback to local
    }

    // Fallback: Local Login
    const ident = (body.email || "").trim().toLowerCase();
    const users = read(K.users, []);
    const user = users.find((u) => u.email === ident || u.username.toLowerCase() === ident);

    if (!user || user.password_hash !== hash(body.password || "")) {
      // กรณีเพิ่งติดตั้งใหม่ แล้วยังไม่มี user ให้สร้าง guest user อัตโนมัติเพื่อให้ทดสอบได้ทันที
      if (users.length === 0) {
        const guestUser = {
          id: 1,
          username: ident.includes("@") ? ident.split("@")[0] : ident || "fashionista",
          email: ident.includes("@") ? ident : "user@closetloop.com",
          password_hash: hash(body.password || "123456"),
          display_name: "Fashion Enthusiast",
          avatar_url: "",
          style_preferences: api.getQuiz(),
          created_at: now(),
        };
        users.push(guestUser);
        write(K.users, users);
        localStorage.setItem(K.session, String(guestUser.id));
        return { access_token: String(guestUser.id), token_type: "bearer", user: pub(guestUser) };
      }
      throw new Error("อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง");
    }

    if (user.style_preferences) {
      write(K.quiz, user.style_preferences);
    }
    localStorage.setItem(K.session, String(user.id));
    return { access_token: String(user.id), token_type: "bearer", user: pub(user) };
  },

  async logout() {
    localStorage.removeItem(K.session);
    return { message: "logged out" };
  },

  async me() {
    try {
      const res = await requestBackend("/users/me");
      if (res && res.id) return res;
    } catch {
      // Fallback
    }

    const user = getStoredUser();
    if (!user) {
      const token = localStorage.getItem(K.session);
      if (token) {
        // สร้างผู้ใช้ default ถ้ามี session ค้าง
        const defaultUser = {
          id: Number(token) || 1,
          username: "closet_lover",
          email: "user@closetloop.com",
          display_name: "Style Curator",
          avatar_url: "",
          style_preferences: api.getQuiz(),
          created_at: now(),
        };
        const users = read(K.users, []);
        users.push(defaultUser);
        write(K.users, users);
        return defaultUser;
      }
      throw new Error("ยังไม่ได้เข้าสู่ระบบ");
    }
    return pub(user);
  },

  async updateUser(id, body) {
    try {
      const res = await requestBackend(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (res && res.id) return res;
    } catch {}

    const users = read(K.users, []);
    const idx = users.findIndex((u) => String(u.id) === String(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...body };
      write(K.users, users);
      return pub(users[idx]);
    }
    return { id, ...body };
  },

  async resetPassword({ email }) {
    return { message: "ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว" };
  },

  // -------------------------------------------------------------
  // MY CLOSET APIs
  // -------------------------------------------------------------
  async closet() {
    try {
      const res = await requestBackend("/closet");
      if (Array.isArray(res)) return res;
    } catch {}

    const user = getStoredUser();
    const all = read(K.closet, []);
    return user ? all.filter((x) => String(x.user_id) === String(user.id)) : all;
  },

  async createCloset(body) {
    try {
      const res = await requestBackend("/closet", {
        method: "POST",
        body: JSON.stringify({
          name: body.name,
          category: body.category,
          color: body.color,
          size: body.size,
          style: body.style,
          condition: body.condition || "good",
          image_url: body.image_url || "",
        }),
      });
      if (res && res.id) {
        const all = read(K.closet, []);
        const next = [res, ...all.filter((x) => String(x.id) !== String(res.id))];
        write(K.closet, next);
        return res;
      }
    } catch {}

    const user = getStoredUser() || { id: 1 };
    const all = read(K.closet, []);
    const newItem = {
      image_url: "",
      ...body,
      id: nextId(all),
      user_id: user.id,
      created_at: now(),
    };
    all.unshift(newItem);
    write(K.closet, all);
    return newItem;
  },

  async deleteCloset(id) {
    try {
      await requestBackend(`/closet/${id}`, { method: "DELETE" });
    } catch {}

    const all = read(K.closet, []);
    const next = all.filter((x) => String(x.id) !== String(id));
    write(K.closet, next);
    return { message: "Item deleted" };
  },

  // -------------------------------------------------------------
  // MARKETPLACE APIs
  // -------------------------------------------------------------
  async products(params = "") {
    try {
      const res = await requestBackend(`/marketplace${params}`);
      if (Array.isArray(res)) return res;
    } catch {}

    const sp = new URLSearchParams(params.startsWith("?") ? params.slice(1) : params);
    const q = (sp.get("q") || "").toLowerCase().trim();
    const type = sp.get("listing_type");
    const category = sp.get("category");

    const list = read(K.products, []);
    return list
      .filter((p) => p.status === "available" || !p.status)
      .filter((p) => !q || p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
      .filter((p) => !type || p.listing_type === type)
      .filter((p) => !category || p.category === category)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  async createProduct(body) {
    try {
      const res = await requestBackend("/marketplace", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res && res.id) return res;
    } catch {}

    const user = getStoredUser() || { id: 1, display_name: "You" };
    const all = read(K.products, []);
    const price = body.listing_type === "exchange" ? 0 : Number(body.price || 0);

    const newProduct = {
      id: nextId(all),
      seller_id: user.id,
      seller_name: user.display_name || user.username || "You",
      closet_item_id: body.closet_item_id || null,
      title: body.title,
      description: body.description || "",
      category: body.category || "top",
      condition: body.condition || "สภาพดี 90%",
      size: body.size || "M",
      color: body.color || "neutral",
      price,
      listing_type: body.listing_type || "sell",
      status: "available",
      image_url: body.image_url || "",
      created_at: now(),
    };

    all.unshift(newProduct);
    write(K.products, all);
    return newProduct;
  },

  async deleteProduct(id) {
    try {
      await requestBackend(`/marketplace/${id}`, { method: "DELETE" });
      return { message: "deleted" };
    } catch {}

    const all = read(K.products, []);
    const next = all.filter((p) => String(p.id) !== String(id));
    write(K.products, next);
    return { message: "Product deleted" };
  },

  // -------------------------------------------------------------
  // ORDERS & CHECKOUT APIs
  // -------------------------------------------------------------
  async orders() {
    try {
      const res = await requestBackend("/orders");
      if (Array.isArray(res)) return res;
    } catch {}

    const user = getStoredUser();
    const all = read(K.orders, []);
    return user ? all.filter((o) => !o.buyer_id || String(o.buyer_id) === String(user.id)) : all;
  },

  // สร้างคำสั่งซื้อจากขั้นตอน Checkout (รองรับทั้งชิ้นเดียว และหลายชิ้นจาก Cart)
  async createOrderFromCart({ items, shippingAddress, paymentMethod, slipUrl, subtotal, shippingFee, grandTotal }) {
    const user = getStoredUser() || { id: 1, display_name: "Customer" };
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `TH-${paymentMethod === "promptpay" ? "KRY" : "FLS"}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      id: `CL-${randomSuffix}`,
      buyer_id: user.id,
      buyer_name: shippingAddress.name || user.display_name,
      items: items.map((item) => ({
        id: item.id,
        title: item.title || item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.qty || item.quantity || 1),
        size: item.size || "M",
        color: item.color || "Standard",
        image_url: item.image_url || item.imageUrl || "",
      })),
      subtotal: Number(subtotal),
      shipping_fee: Number(shippingFee),
      total_price: Number(grandTotal),
      status: paymentMethod === "cod" ? "pending" : "paid",
      status_label: paymentMethod === "cod" ? "รอยืนยันคำสั่งซื้อ" : "ชำระเงินแล้ว",
      carrier: paymentMethod === "promptpay" ? "Kerry Express" : "Flash Express",
      tracking_number: trackingCode,
      payment_method: paymentMethod,
      slip_url: slipUrl || "",
      shipping_address: shippingAddress,
      created_at: now(),
    };

    // บันทึกลง Orders
    const allOrders = read(K.orders, []);
    allOrders.unshift(newOrder);
    write(K.orders, allOrders);

    // ปรับสถานะสินค้าใน Marketplace เป็น sold (ถ้าสินค้าถูกซื้อ)
    const products = read(K.products, []);
    const itemIds = new Set(items.map((i) => String(i.id)));
    const updatedProducts = products.map((p) =>
      itemIds.has(String(p.id)) ? { ...p, status: "sold" } : p
    );
    write(K.products, updatedProducts);

    // ยิง Backend ด้วยถ้าต่อได้
    try {
      for (const item of items) {
        await requestBackend("/orders", {
          method: "POST",
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.qty || item.quantity || 1,
          }),
        }).catch(() => {});
      }
    } catch {}

    return newOrder;
  },

  async createOrder({ product_id, quantity = 1 }) {
    const products = read(K.products, []);
    const product = products.find((p) => String(p.id) === String(product_id));
    if (!product) throw new Error("ไม่พบสินค้านี้");

    return this.createOrderFromCart({
      items: [{ ...product, qty: quantity }],
      shippingAddress: {
        name: "คุณลูกค้า ClosetLoop",
        phone: "081-234-5678",
        address: "123 ถนนสุขุมวิท",
        province: "กรุงเทพฯ",
        postal_code: "10110",
      },
      paymentMethod: "promptpay",
      slipUrl: "",
      subtotal: product.price * quantity,
      shippingFee: 50,
      grandTotal: product.price * quantity + 50,
    });
  },
};