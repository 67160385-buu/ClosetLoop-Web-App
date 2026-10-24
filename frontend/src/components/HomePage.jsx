import { ArrowRight, Sparkles, Users } from "lucide-react";

export default function HomePage({ setPage, user }) {
  return (
    <section className="landing">
      <div className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">THE SMARTER WAY TO DRESS</span>
          <h1>Your closet.<br/><em>On repeat.</em></h1>
          <p>จัดตู้เสื้อผ้าในชีวิตจริงให้เป็นดิจิทัล ให้ AI ช่วยแมตช์ลุค และส่งต่อชิ้นที่ไม่ใช่ให้คนที่ใช่</p>
          <div className="hero-actions">
            <button className="btn btn-dark" onClick={() => setPage("closet")}>
              Build my closet <ArrowRight size={18}/>
            </button>
            <button className="btn btn-ghost" onClick={() => setPage("ai")}>
              Try AI Outfit <Sparkles size={17}/>
            </button>
          </div>
        </div>

        {/* ส่วน Hero Art ที่อัปเกรดดีไซน์ใหม่ */}
        <div className="hero-art">
          <div className="glow-bg"></div>
          <div className="art-ring ring-1"></div>
          <div className="art-ring ring-2"></div>

          {/* การ์ดใบหลังสร้างมิติซ้อน (Stacked Card) */}
          <div className="look-card card-back"></div>

          {/* การ์ดหลัก (Main Card) */}
          <div className="look-card card-main">
            <div className="card-header">
              <span className="look-tag">TODAY'S LOOK</span>
              <span className="ai-badge"><Sparkles size={11}/> AI Selected</span>
            </div>
            <div className="fashion-shape">🧥</div>
            <div className="card-info">
              <b>Clean Y2K</b>
              <small>4 pieces • 96% match</small>
            </div>
          </div>

          {/* Floating Glass Chips ลอยรอบๆ */}
          <div className="float-chip chip-match">
            <Sparkles size={14} className="chip-sparkle"/>
            <span><strong>96%</strong> Match Score</span>
          </div>

          <div className="float-chip chip-stat">
            <div className="stat-icon-bg">
              <Users size={15}/>
            </div>
            <div className="stat-text">
              <b>128+</b>
              <span>community pieces</span>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-strip">
        <span>VIRTUAL CLOSET</span><span>✦</span>
        <span>AI OUTFIT MATCHING</span><span>✦</span>
        <span>SELL & EXCHANGE</span><span>✦</span>
        <span>SHOP PRE-LOVED</span>
      </div>

      <div className="section-head">
        <div>
          <span className="eyebrow">ONE LOOP, MANY WAYS</span>
          <h2>Everything your wardrobe needs.</h2>
        </div>
        <button className="text-btn" onClick={() => setPage("dashboard")}>
          Explore dashboard <ArrowRight size={16}/>
        </button>
      </div>

      <div className="feature-grid">
        <Feature num="01" icon="◒" title="Virtual Closet" onClick={() => setPage("closet")} text="เก็บทุกไอเท็มไว้ที่เดียว ค้นง่าย และรู้ว่าคุณมีอะไรอยู่แล้ว"/>
        <Feature num="02" icon="✦" title="AI Outfit" onClick={() => setPage("ai")} text="เลือกโอกาสและสไตล์ แล้วให้ ClosetLoop ช่วยจับคู่ลุค"/>
        <Feature num="03" icon="↻" title="Re-loop" onClick={() => setPage("market")} text="ขาย แลก และค้นพบแฟชั่นมือสองที่เหมาะกับคุณ"/>
      </div>
    </section>
  );
}

function Feature({ num, icon, title, text, onClick }) { 
  return (
    <button type="button" className="feature-card" onClick={onClick} aria-label={`ไปที่ ${title}`}>
      <div className="feature-top">
        <span>{num}</span>
        <strong>{icon}</strong>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ArrowRight size={18}/>
    </button> 
  );
}
