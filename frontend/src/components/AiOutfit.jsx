import { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Shuffle,
  ChevronRight,
  Shirt,
  Calendar,
  Compass,
  Layers,
  Flame,
  CloudSun,
  PartyPopper,
  Briefcase,
  Coffee,
  Heart,
  ExternalLink,
} from "lucide-react";
import { api } from "../api";
import { buildOutfit, primaryStyle } from "../outfit";
import { categories } from "./UI";

export default function AiOutfit({ setToast, quiz, onRetake, setPage }) {
  const [closet, setCloset] = useState([]);
  const [loadingCloset, setLoadingCloset] = useState(true);
  const [form, setForm] = useState({
    occasion: "casual",
    style: primaryStyle(quiz),
    weather: "hot",
  });
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [savedLooks, setSavedLooks] = useState(() => {
    try {
      const saved = localStorage.getItem("closetloop_saved_looks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const occasions = [
    { key: "casual", label: "Casual Chill", icon: Coffee, desc: "วันสบายๆ ไม่เป็นทางการ" },
    { key: "business", label: "Business Minimal", icon: Briefcase, desc: "ประชุม ทำงาน เรียบหรู" },
    { key: "date", label: "Date Night", icon: Heart, desc: "ดินเนอร์ ออกเดต มั่นใจ" },
    { key: "street", label: "Streetwear", icon: Flame, desc: "สตรีทแฟชั่น ชิค คูล" },
    { key: "cafe", label: "Cafe Hopping", icon: Compass, desc: "ถ่ายรูปสวย คุมโทน" },
    { key: "party", label: "Party & Night", icon: PartyPopper, desc: "ปาร์ตี้ สังสรรค์ โดดเด่น" },
  ];

  const weathers = [
    { key: "hot", label: "Sunny & Warm", icon: "☀️", note: "ระบายอากาศดี" },
    { key: "cool", label: "Cool & Breezy", icon: "☁️", note: "เลเยอร์คลุมเบาๆ" },
    { key: "rain", label: "Rainy Day", icon: "🌧️", note: "คล่องตัว ไม่เปียกง่าย" },
    { key: "ac", label: "Air-con Indoors", icon: "❄️", note: "เลเยอร์สบายในห้องแอร์" },
  ];

  const styles = [
    { key: "minimal", label: "Minimalist" },
    { key: "korean", label: "Korean Clean" },
    { key: "street", label: "Streetwear" },
    { key: "preppy", label: "Smart Casual" },
    { key: "y2k", label: "Y2K / Vintage" },
    { key: "casual", label: "Relaxed" },
  ];

  useEffect(() => {
    api
      .closet()
      .then((d) => setCloset(Array.isArray(d) ? d : []))
      .catch(() => { })
      .finally(() => setLoadingCloset(false));
  }, []);

  // Sync default style when quiz updates
  useEffect(() => {
    if (quiz) {
      setForm((prev) => ({ ...prev, style: primaryStyle(quiz) }));
    }
  }, [quiz]);

  const scanStepsMessages = [
    "กำลังสแกนชิ้นเสื้อผ้าในตู้ของคุณ...",
    "วิเคราะห์พาเลตต์สีและ Silhouette...",
    "จับคู่สมดุลย์ Top, Bottom & Accessories...",
    "เสร็จสิ้น! AI คัดเลือกลุคที่ดีที่สุดสำหรับคุณ ✨",
  ];

  const generate = (isShuffle = false) => {
    if (!quiz && onRetake) {
      onRetake();
      return;
    }
    if (!closet.length) {
      if (setToast) setToast("กรุณาเพิ่มเสื้อผ้าใน My Closet ก่อนเริ่มให้ AI แมตช์ชุดนะ", "info");
      return;
    }

    setScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < scanStepsMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    setTimeout(() => {
      clearInterval(stepInterval);
      const outfit = buildOutfit(closet, form, quiz);
      setResult(outfit);
      setScanning(false);
      if (isShuffle && setToast) {
        setToast("สลับสไตล์และแมตช์ชุดใหม่เรียบร้อย ✨");
      }
    }, 1100);
  };

  const handleWearToday = () => {
    if (setToast) {
      setToast("บันทึกการแต่งกายของวันนี้เรียบร้อย! ขอให้เป็นวันที่มั่นใจและเปล่งประกาย ✨", "success");
    }
  };

  const handleSaveLook = () => {
    if (!result) return;
    const newLook = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      occasion: form.occasion,
      style: form.style,
      score: result.score,
      items: result.items,
      tip: result.tip,
    };
    const updated = [newLook, ...savedLooks.slice(0, 19)];
    setSavedLooks(updated);
    try {
      localStorage.setItem("closetloop_saved_looks", JSON.stringify(updated));
    } catch { }
    if (setToast) {
      setToast("บันทึกลุคนี้ลงในคอลเลกชันโปรดของคุณแล้ว 🔖", "success");
    }
  };

  return (
    <section className="page animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Luxury Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#e7e3dc] pb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515] text-[#eee9df] text-[11px] font-bold tracking-widest uppercase">
              <Sparkles size={13} className="text-[#c7b99b]" /> PERSONAL AI STYLIST
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {closet.length} Pieces Ready
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            AI Outfit Curator
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1.5 max-w-2xl">
            ออกแบบลุคที่สะท้อนตัวตนของคุณจากเสื้อผ้าในตู้ ด้วยระบบ AI วิเคราะห์สีและความเข้ากันของชิ้นโปรด
          </p>
        </div>

        {quiz && (
          <button
            type="button"
            onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 hover:border-gray-900 bg-white text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all shadow-sm"
          >
            <RefreshCw size={14} /> ปรับแบบสอบถามสไตล์
          </button>
        )}
      </div>

      {/* Main Grid Layout: Controls (Left) & Result Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context Selectors & Wardrobe Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Style DNA Card */}
          {quiz ? (
            <div className="bg-gradient-to-br from-white to-[#faf8f5] p-5 rounded-3xl border border-[#e8e4dc] shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
                YOUR STYLE PROFILE (DNA)
              </span>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1.5 rounded-full bg-[#151515] text-white text-xs font-semibold">
                  {quiz.vibe || "Minimal"}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white border border-[#e5e0d8] text-gray-800 text-xs font-semibold">
                  {quiz.fit || "Regular Fit"}
                </span>
                {(quiz.colors || []).map((col) => (
                  <span
                    key={col}
                    className="px-3 py-1.5 rounded-full bg-[#eee9df] text-gray-800 text-xs font-medium"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-sm text-center">
              <p className="text-sm text-gray-600 mb-3">
                ยังไม่ได้ระบุสไตล์หลัก ตอบแบบสอบถามเพื่อช่วยให้ AI แมตช์ชุดได้แม่นยำยิ่งขึ้น
              </p>
              <button
                type="button"
                onClick={onRetake}
                className="btn btn-dark text-xs px-5 py-2.5 rounded-full"
              >
                ทำแบบสอบถามสไตล์
              </button>
            </div>
          )}

          {/* Context Selector 1: Occasion */}
          <div className="bg-white p-6 rounded-3xl border border-[#e8e4dc] shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                01 · OCCASION (โอกาสการสวมใส่)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {occasions.map((occ) => {
                const Icon = occ.icon;
                const isSelected = form.occasion === occ.key;
                return (
                  <button
                    key={occ.key}
                    type="button"
                    onClick={() => setForm({ ...form, occasion: occ.key })}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left border transition-all ${isSelected
                      ? "bg-[#151515] text-white border-[#151515] shadow-md scale-[1.01]"
                      : "bg-[#faf9f6] text-gray-700 border-gray-200/80 hover:border-gray-400 hover:bg-white"
                      }`}
                  >
                    <Icon size={16} className={isSelected ? "text-[#c7b99b]" : "text-gray-500"} />
                    <div className="min-w-0 flex-1">
                      <b className="block text-xs font-semibold truncate leading-tight">
                        {occ.label}
                      </b>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Selector 2: Vibe & Weather */}
          <div className="bg-white p-6 rounded-3xl border border-[#e8e4dc] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3.5">
              02 · VIBE & WEATHER (สภาพอากาศ / สภาพแวดล้อม)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {weathers.map((w) => {
                const isSelected = form.weather === w.key;
                return (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => setForm({ ...form, weather: w.key })}
                    className={`p-3 rounded-2xl text-left border transition-all ${isSelected
                      ? "bg-[#151515] text-white border-[#151515] shadow-md scale-[1.01]"
                      : "bg-[#faf9f6] text-gray-700 border-gray-200/80 hover:border-gray-400 hover:bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{w.icon}</span>
                      <span className="text-xs font-semibold">{w.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Selector 3: Style Aesthetic */}
          <div className="bg-white p-6 rounded-3xl border border-[#e8e4dc] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3.5">
              03 · AESTHETIC MOOD (สไตล์ที่ต้องการเน้น)
            </span>
            <div className="flex flex-wrap gap-2">
              {styles.map((st) => {
                const isSelected = form.style === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setForm({ ...form, style: st.key })}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${isSelected
                      ? "bg-[#151515] text-white shadow-sm"
                      : "bg-[#f5f3ef] text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button with Pulse / Scanning Animation */}
          <button
            type="button"
            onClick={() => generate(false)}
            disabled={scanning || !closet.length}
            className={`w-full py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition-all ${scanning
              ? "bg-[#222] text-[#ccc] cursor-wait"
              : "bg-[#151515] hover:bg-[#333] text-white hover:scale-[1.01] active:scale-[0.99]"
              }`}
          >
            <Sparkles
              size={18}
              className={`${scanning ? "animate-spin text-[#c7b99b]" : "text-[#c7b99b]"}`}
            />
            {scanning ? "AI Stylist Analyzing..." : result ? "Generate New Match" : "Generate My Outfit"}
          </button>
        </div>

        {/* Right Column: AI Outfit Recommendation Display */}
        <div className="lg:col-span-7">
          {/* Scanning Animation State */}
          {scanning ? (
            <div className="bg-white rounded-3xl border border-[#e7e3dc] p-12 text-center shadow-lg min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#151515] to-[#444] text-[#c7b99b] flex items-center justify-center shadow-2xl relative mb-6 animate-pulse">
                <Sparkles size={38} className="animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-[#c7b99b]/40 animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Personal AI Stylist at Work
              </h3>
              <p className="text-sm font-medium text-gray-500 max-w-sm transition-all duration-300">
                {scanStepsMessages[scanStep]}
              </p>
            </div>
          ) : result ? (
            /* Rich Outfit Result Card */
            <div className="bg-white rounded-3xl border border-[#e7e3dc] shadow-xl overflow-hidden transition-all animate-scale-in">
              {/* Card Header Bar */}
              <div className="bg-gradient-to-r from-[#171717] via-[#222] to-[#171717] text-white p-6 md:p-8 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-[#c7b99b] uppercase block">
                    CURATED OUTFIT RECOMMENDATION
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 capitalize tracking-tight">
                    {form.occasion} · {form.style}
                  </h2>
                </div>

                {/* Match Score Badge */}
                <div className="flex flex-col items-end">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#c7b99b] text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-inner">
                    <Sparkles size={13} className="text-[#c7b99b]" />
                    {result.score}% Style Match
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Based on closet harmony</span>
                </div>
              </div>

              {/* Matched Pieces Grid */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    MATCHED PIECES FROM YOUR WARDROBE ({result.items.length})
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    Category Harmony
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-7">
                  {result.items.map((item, index) => {
                    const catObj = categories.find((c) => c.key === item.category);
                    return (
                      <div
                        key={item.id || index}
                        className="group bg-[#f9f8f5] rounded-2xl border border-[#e8e4dc] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Piece Image or Category Art */}
                        <div className="h-44 bg-[#eee9df] relative flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-5xl text-gray-400 select-none">
                              {catObj?.icon || "◒"}
                            </span>
                          )}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                            {catObj?.label || item.category}
                          </span>
                        </div>

                        {/* Piece Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <b className="text-xs md:text-sm font-bold text-gray-900 block truncate">
                              {item.name}
                            </b>
                            <span className="text-[11px] text-gray-500 block capitalize mt-0.5">
                              {item.color}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Stylist Note Box */}
                <div className="bg-[#f7f5ef] border border-[#e5dfd3] rounded-2xl p-5 mb-7 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#151515] text-[#c7b99b] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <b className="text-xs md:text-sm font-bold text-gray-900 block">
                      AI Stylist Note & Harmony Breakdown
                    </b>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-1">
                      {result.tip}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleWearToday}
                    className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#151515] hover:bg-[#333] text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Wear Today
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLook}
                    className="w-full sm:flex-1 py-3 px-5 rounded-full border border-gray-300 hover:border-gray-900 bg-white text-gray-800 font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Bookmark size={15} className="text-gray-600" />
                    Save Look
                  </button>

                  <button
                    type="button"
                    onClick={() => generate(true)}
                    className="w-full sm:w-auto py-3 px-5 rounded-full border border-gray-300 hover:border-gray-900 bg-white text-gray-700 hover:text-black font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                    title="สลับชิ้นส่วนในตู้เพื่อหาลุคอื่น"
                  >
                    <Shuffle size={15} />
                    Shuffle
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State: Ready to match */
            <div className="bg-white rounded-3xl border border-[#e7e3dc] p-12 text-center shadow-sm min-h-[520px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#f8f6f0] text-gray-400 flex items-center justify-center mb-5 text-3xl">
                ✦
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Your next look starts here.
              </h3>
              <p className="text-sm text-gray-600 max-w-md leading-relaxed mb-6">
                เลือกโอกาสและสภาพอากาศทางด้านซ้าย แล้วกดปุ่มเพื่อให้ AI ค้นหาและจับคู่ไอเท็มที่ลงตัวที่สุดจากตู้ของคุณ
              </p>

              {closet.length ? (
                <button
                  type="button"
                  onClick={() => generate(false)}
                  className="btn btn-dark text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Sparkles size={16} className="text-[#c7b99b]" />
                  Curate My Look
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPage && setPage("closet")}
                  className="btn btn-dark text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Shirt size={16} />
                  เพิ่มเสื้อผ้าในตู้ก่อนเริ่ม
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { AiOutfit };
