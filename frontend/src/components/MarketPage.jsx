import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Check,
  ShoppingBag,
  ArrowUpDown,
  Tag,
  Sparkles,
  Upload,
} from "lucide-react";
import { api, shrinkImage } from "../api";
import { money, EmptyState, Modal, Select, Field, categories } from "./UI";

export default function MarketPage({ user, setToast, addToCart, onProceedToCheckout }) {
  const [products, setProducts] = useState([]);
  const [closet, setCloset] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState(""); // "" (All), "sell", "exchange"
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price_asc", "price_desc"
  const [showSell, setShowSell] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    let params = `?q=${encodeURIComponent(q)}`;
    if (type) params += `&listing_type=${type}`;
    if (category) params += `&category=${category}`;

    api
      .products(params)
      .then((d) => {
        setProducts(Array.isArray(d) ? d : []);
      })
      .catch((e) => setToast && setToast(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api
      .closet()
      .then((d) => setCloset(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [q, type, category]);

  // ฟังก์ชันลบสินค้าที่ตนเองลงขาย
  const del = async (id) => {
    if (!confirm("ต้องการยกเลิกการขายสินค้านี้ใช่หรือไม่?")) return;
    try {
      if (api.deleteProduct) {
        await api.deleteProduct(id);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (setToast) setToast("ยกเลิกรายการขายเรียบร้อย 🗑️");
    } catch (e) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (setToast) setToast("ลบรายการเรียบร้อย 🗑️");
    }
  };

  // ดำเนินการซื้อทันที (Buy Now)
  const handleBuyNow = (product) => {
    if (product.listing_type === "exchange") {
      if (setToast) setToast("ส่งคำขอแลกเปลี่ยนชุดเรียบร้อยแล้ว ✨");
      return;
    }
    // เพิ่มลงตะกร้าก่อน
    if (addToCart) {
      addToCart(product);
    }
  };

  // Sorting products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <section className="page max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow text-xs tracking-widest text-[#888]">PRE-LOVED, RE-IMAGINED</span>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">
            Marketplace
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">
            ซื้อ ขาย และส่งต่อชิ้นโปรดให้กับคนใหม่ในคอมมูนิตี้ ClosetLoop
          </p>
        </div>

        <button
          className="btn btn-dark px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition"
          onClick={() => setShowSell(true)}
        >
          <Plus size={16} /> ลงขายเสื้อผ้า (Sell a piece)
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#e7e3dc] shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              placeholder="ค้นหาเสื้อผ้า แบรนด์ สไตล์ หรือสี..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-[#dcd7cb] rounded-full text-xs focus:outline-none focus:border-[#151515] transition"
            />
          </div>

          {/* Right Toolbar Controls: Type filter & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Listing Type Toggle */}
            <div className="flex items-center bg-[#faf9f6] border border-[#dcd7cb] p-1 rounded-full text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded-full font-bold transition ${
                  !type ? "bg-[#151515] text-white shadow-xs" : "text-[#666] hover:text-[#151515]"
                }`}
                onClick={() => setType("")}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-full font-bold transition ${
                  type === "sell" ? "bg-[#151515] text-white shadow-xs" : "text-[#666] hover:text-[#151515]"
                }`}
                onClick={() => setType("sell")}
              >
                ขายเท่านั้น
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-full font-bold transition ${
                  type === "exchange" ? "bg-[#151515] text-white shadow-xs" : "text-[#666] hover:text-[#151515]"
                }`}
                onClick={() => setType("exchange")}
              >
                แลกเปลี่ยน
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs bg-[#faf9f6] border border-[#dcd7cb] px-3 py-1.5 rounded-full">
              <ArrowUpDown size={13} className="text-[#888]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#333] focus:outline-none cursor-pointer"
              >
                <option value="newest">มาใหม่ล่าสุด</option>
                <option value="price_asc">ราคา: ต่ำไปสูง</option>
                <option value="price_desc">ราคา: สูงไปต่ำ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#f0ece5]">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !category
                ? "bg-[#151515] text-white"
                : "bg-[#f5f4ef] text-[#666] hover:bg-[#e8e4db]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(category === cat.key ? "" : cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                category === cat.key
                  ? "bg-[#151515] text-white"
                  : "bg-[#f5f4ef] text-[#666] hover:bg-[#e8e4db]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e7e3dc] text-center space-y-3">
          <div className="w-9 h-9 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#666]">กำลังค้นหาสินค้าในตู้เสื้อผ้า...</p>
        </div>
      ) : sortedProducts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onBuy={() => handleBuyNow(p)}
              onDelete={() => del(p.id)}
              currentUser={user}
              onAddToCart={() => addToCart && addToCart(p)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-3xl border border-[#e7e3dc] text-center space-y-4">
          <div className="w-16 h-16 bg-[#eee9df] rounded-full flex items-center justify-center mx-auto text-2xl">
            🛍️
          </div>
          <h3 className="text-lg font-bold text-[#151515]">ไม่พบสินค้าที่ตรงกับการค้นหา</h3>
          <p className="text-xs text-[#777] max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะ หรือเป็นคนแรกที่ลงขายเสื้อผ้าชิ้นนี้เลย!
          </p>
          <button
            onClick={() => setShowSell(true)}
            className="btn btn-dark px-6 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> ลงขายชิ้นแรก
          </button>
        </div>
      )}

      {/* Modal ลงขายสินค้า */}
      {showSell && (
        <SellModal
          close={() => setShowSell(false)}
          closet={closet}
          save={async (data) => {
            try {
              await api.createProduct(data);
              setShowSell(false);
              if (setToast) setToast("ลงขายสินค้าสำเร็จเรียบร้อย ✨");
              load();
            } catch (e) {
              if (setToast) setToast(e.message);
            }
          }}
        />
      )}
    </section>
  );
}

// -------------------------------------------------------------
// ProductCard Component
// -------------------------------------------------------------
export function ProductCard({ product, onBuy, onDelete, demo, currentUser, onAddToCart }) {
  const isOwner =
    currentUser &&
    product.seller_id &&
    String(product.seller_id) === String(currentUser.id);

  const isSell = product.listing_type === "sell";

  return (
    <article className="product-card group bg-white rounded-3xl border border-[#e7e3dc] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Product Image Art */}
        <div className="relative w-full aspect-[4/5] bg-[#ece8df] overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              👕
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span
              className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm ${
                isSell
                  ? "bg-[#151515] text-white"
                  : "bg-white text-[#151515] border border-[#ddd]"
              }`}
            >
              {isSell ? "สำหรับขาย" : "แลกเปลี่ยน"}
            </span>

            {product.condition && (
              <span className="text-[10px] bg-white/90 backdrop-blur text-[#444] px-2 py-0.5 rounded-full font-medium shadow-xs">
                {product.condition}
              </span>
            )}
          </div>

          {/* Size Pill */}
          {product.size && (
            <span className="absolute top-3 right-3 text-[10px] bg-black/60 backdrop-blur text-white px-2 py-0.5 rounded-full font-bold">
              Size {product.size}
            </span>
          )}

          {/* Owner Delete Button */}
          {isOwner && !demo && (
            <button
              type="button"
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/95 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition shadow-md"
              onClick={onDelete}
              title="ยกเลิกการขายสินค้านี้"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-[#151515] leading-snug line-clamp-1">
              {product.title}
            </h3>
          </div>

          <p className="text-xs text-[#77746f] line-clamp-2 leading-relaxed">
            {product.description || "ไอเท็มสภาพดีพร้อมส่งต่อ เข้ากับหลากหลายสไตล์"}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="text-sm sm:text-base font-black text-[#151515]">
              {isSell ? money(product.price) : "พร้อมส่งต่อ"}
            </div>
            {product.seller_name && (
              <span className="text-[10px] text-[#888] truncate max-w-[120px]">
                by {product.seller_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 pt-0">
        {isOwner ? (
          <div className="bg-[#f7f5ee] py-2 px-3 rounded-xl text-center text-xs font-semibold text-[#888]">
            สินค้าที่คุณลงขายไว้
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isSell ? (
              <>
                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="flex-1 bg-[#f5f3ec] hover:bg-[#e9e4d8] text-[#151515] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#dfdad0]"
                  title="ใส่ตะกร้า"
                >
                  <ShoppingBag size={14} />
                  <span>ใส่ตะกร้า</span>
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={onBuy}
                  className="bg-[#151515] hover:bg-[#333] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  ซื้อทันที
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onBuy}
                className="w-full bg-[#151515] hover:bg-[#333] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>ขอแลกเปลี่ยนชุด</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// -------------------------------------------------------------
// SellModal Component (ลงขายสินค้าพร้อมอัปโหลดรูป)
// -------------------------------------------------------------
function SellModal({ close, closet, save }) {
  const [form, setForm] = useState({
    title: "",
    price: 490,
    listing_type: "sell",
    category: "top",
    condition: "สภาพดี 90%",
    size: "M",
    description: "",
    image_url: "",
    closet_item_id: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await shrinkImage(file, 800, 0.8);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title="ลงขาย / ส่งต่อเสื้อผ้าชิ้นโปรด" close={close}>
      <form
        className="form space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(form);
        }}
      >
        {closet.length > 0 && (
          <Select
            label="เลือกดึงข้อมูลจาก My Closet ของคุณ (ทางเลือก)"
            value={String(form.closet_item_id || "")}
            onChange={(id) => {
              const item = closet.find((x) => String(x.id) === String(id));
              if (item) {
                setForm({
                  ...form,
                  closet_item_id: item.id,
                  title: item.name,
                  category: item.category || "top",
                  size: item.size || "M",
                  image_url: item.image_url || "",
                });
              }
            }}
            options={[["", "-- เลือกชุดจากตู้เสื้อผ้า --"], ...closet.map((c) => [c.id, c.name])]}
          />
        )}

        <Field
          label="ชื่อสินค้าแฟชั่น *"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="เช่น Vintage Leather Biker Jacket"
          required
        />

        <div className="two-col">
          <Select
            label="หมวดหมู่สินค้า"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={categories.map((c) => [c.key, `${c.icon} ${c.label}`])}
          />

          <Select
            label="ประเภทการลงขาย"
            value={form.listing_type}
            onChange={(v) => setForm({ ...form, listing_type: v })}
            options={[
              ["sell", "ขาย (For Sell)"],
              ["exchange", "แลกเปลี่ยน (Exchange)"],
            ]}
          />
        </div>

        <div className="two-col">
          {form.listing_type === "sell" ? (
            <Field
              label="ราคาขาย (บาท) *"
              type="number"
              value={form.price}
              onChange={(v) => setForm({ ...form, price: Number(v) })}
              placeholder="เช่น 790"
              required
            />
          ) : (
            <div className="field">
              <span className="text-xs font-semibold text-[#555]">ราคา</span>
              <input
                type="text"
                disabled
                value="ฟรีสำหรับการแลกเปลี่ยน"
                className="bg-[#eee] text-[#777]"
              />
            </div>
          )}

          <Select
            label="ไซส์ (Size)"
            value={form.size}
            onChange={(v) => setForm({ ...form, size: v })}
            options={["XS", "S", "M", "L", "XL", "Free Size"].map((s) => [s, s])}
          />
        </div>

        <Select
          label="สภาพของสินค้า"
          value={form.condition}
          onChange={(v) => setForm({ ...form, condition: v })}
          options={[
            "มือหนึ่งแกะป้าย",
            "สภาพเหมือนใหม่ 98%",
            "สภาพดีเยี่ยม 95%",
            "สภาพดี 90%",
            "มีร่องรอยการใช้งานตามกาลเวลา",
          ].map((c) => [c, c])}
        />

        <div className="field">
          <label className="text-xs font-bold text-[#444] mb-1 block">แนบรูปภาพสินค้า</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            className="w-full text-xs text-[#555] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#151515] file:text-white hover:file:bg-[#333] cursor-pointer"
          />
        </div>

        {uploading && <p className="text-xs text-[#888]">กำลังประมวลผลรูปภาพ...</p>}

        {form.image_url && (
          <div className="text-center my-2">
            <img
              src={form.image_url}
              alt="Preview"
              className="h-28 mx-auto rounded-xl object-cover border"
            />
          </div>
        )}

        <Field
          label="หรือใส่ Image URL (ทางเลือก)"
          value={form.image_url.startsWith("data:") ? "" : form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          placeholder="https://..."
        />

        <Field
          label="รายละเอียดเพิ่มเติม"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
          placeholder="บอกเล่าขนาด อก เอว หรือเรื่องราวของชุด..."
        />

        <button className="btn btn-dark full py-3.5 rounded-full mt-4 font-bold text-xs flex items-center justify-center gap-2">
          ยืนยันการลงขาย <Check size={16} />
        </button>
      </form>
    </Modal>
  );
}