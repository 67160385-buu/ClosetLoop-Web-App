import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ChevronRight, PackageCheck } from "lucide-react";
import { api } from "../api";
import { categories, EmptyState } from "./UI";
import { ProductCard } from "./MarketPage";

export default function Dashboard({ setPage, user, addToCart }) {
  const [closet, setCloset] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.closet().then((d) => setCloset(Array.isArray(d) ? d : [])).catch(() => {});
    api.products().then((d) => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    api.orders().then((d) => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <section className="page animate-fade-in">
      <div className="page-hero">
        <div>
          <span className="eyebrow">GOOD TO SEE YOU</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">Hi, {user?.display_name || user?.username}.</h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">พร้อมแต่งตัวและจัดการตู้เสื้อผ้าให้สนุกกว่าเดิมหรือยัง?</p>
        </div>
        <button className="btn btn-dark text-sm px-5 py-2.5 rounded-full" onClick={() => setPage("ai")}>
          <Sparkles size={17} /> Generate a look
        </button>
      </div>

      <div className="stat-grid">
        <Stat label="Pieces in closet" value={closet.length} icon="◒" onClick={() => setPage("closet")} />
        <Stat label="AI looks" value="∞" icon="✦" onClick={() => setPage("ai")} />
        <Stat label="Live listings" value={products.length} icon="↗" onClick={() => setPage("market")} />
        <Stat label="My orders" value={orders.length} icon="✓" onClick={() => setPage("orders")} />
      </div>

      <div className="split-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">YOUR CLOSET</span>
              <h3>Recent pieces</h3>
            </div>
            <button className="text-btn" onClick={() => setPage("closet")}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          {closet.length ? (
            <div className="mini-items">
              {closet.slice(0, 4).map((x) => (
                <MiniItem key={x.id} item={x} />
              ))}
            </div>
          ) : (
            <EmptyState text="ยังไม่มีเสื้อผ้าในตู้" action="Add your first piece" onClick={() => setPage("closet")} />
          )}
        </div>

        <div className="panel dark-panel">
          <div className="eyebrow light">STYLE TIP</div>
          <h3>
            Build a closet<br />that works for you.
          </h3>
          <p>เริ่มจาก 5–10 ชิ้นที่ใส่บ่อย แล้วให้ AI เรียนรู้สไตล์ของคุณเพื่อจัดชุดที่ใช่ในทุกวัน</p>
          <button className="btn btn-light" onClick={() => setPage("closet")}>
            Start building <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="section-head compact">
        <div>
          <span className="eyebrow">MARKETPLACE</span>
          <h2>Fresh from the loop.</h2>
        </div>
        <button className="text-btn" onClick={() => setPage("market")}>
          Shop all <ArrowRight size={16} />
        </button>
      </div>

      <div className="product-grid">
        {products.slice(0, 4).map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            currentUser={user}
            onBuy={() => setPage("market")}
            onAddToCart={() => (addToCart ? addToCart(p) : setPage("cart"))}
          />
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, icon, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <span className="text-2xl text-[#9b8e76]">{icon}</span>
      <div>
        <b className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{value}</b>
        <small className="text-xs font-semibold text-gray-500 block mt-1 leading-normal">{label}</small>
      </div>
    </div>
  );
}

function MiniItem({ item }) {
  const [imgError, setImgError] = useState(false);
  const cat = categories.find((c) => c.key === item.category);

  return (
    <div className="mini-item">
      <div className="item-thumb">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xl leading-none">{cat?.icon || "◒"}</span>
        )}
      </div>
      <div>
        <b>{item.name}</b>
        <small>
          {item.color} · {item.style}
        </small>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}