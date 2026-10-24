// ตัวจัดลุค (rule-based) ที่ใช้คำตอบจาก Style Quiz ให้คะแนนเสื้อผ้าในตู้
// ทำงานในเบราว์เซอร์ล้วน ไม่ต้องเรียก backend

// คำตอบในแบบสอบถาม -> ค่าที่ใช้ในตู้เสื้อผ้า (ตรงกับตัวเลือกใน ClosetModal)
export const VIBE_TO_STYLES = {
  "Minimalist": ["minimal"],
  "Streetwear": ["street"],
  "Y2K / Vintage": ["y2k"],
  "Smart Casual": ["preppy", "casual"],
  "Chic & Old Money": ["preppy", "minimal"],
};

export const COLOR_GROUPS = {
  "Earth Tone": ["brown", "cream", "green"],
  "Monochrome (Black/White)": ["black", "white", "grey"],
  "Pastel": ["pink", "blue", "cream", "white"],
  "Vibrant & Colorful": ["red", "green", "blue", "pink"],
};

export const FIT_MAP = {
  "Oversized / Loose": "oversized",
  "Regular Fit": "regular",
  "Slim Fit": "slim",
};

export const FIT_OPTIONS = [["oversized", "Oversized / Loose"], ["regular", "Regular Fit"], ["slim", "Slim Fit"]];

// สไตล์เริ่มต้นในหน้า AI ให้ตรงกับ vibe ที่ผู้ใช้เลือก
export function primaryStyle(prefs) {
  const mapped = VIBE_TO_STYLES[prefs?.vibe];
  return mapped ? mapped[0] : "korean";
}

const WEATHER_TIP = {
  hot: "อากาศร้อน แนะนำเนื้อผ้าบางเบาระบายอากาศได้ดี ให้ความรู้สึกโปร่งสบายตลอดวัน",
  cool: "อากาศเย็นสบาย สามารถเลเยอร์เสื้อคลุมหรือแจ็กเก็ตเพื่อเพิ่มมิติของลุค",
  rain: "วันฝนตก เลือกรองเท้าและชุดที่คล่องตัว เลี่ยงผ้าที่ซับน้ำง่าย",
  ac: "อยู่ในห้องปรับอากาศตลอดวัน สวมใส่เลเยอร์บางเบาเพื่อความอบอุ่นที่ลงตัว",
};
const OCCASION_LABEL = {
  casual: "วันสบายๆ Casual",
  business: "Business Minimal / ประชุมงาน",
  date: "ดินเนอร์ & ออกเดตสุดพิเศษ",
  street: "สตรีทแฟชั่น & เดินเที่ยวในเมือง",
  party: "ปาร์ตี้ & อีเวนต์ยามค่ำคืน",
  cafe: "ถ่ายรูปที่คาเฟ่",
  uni: "ไปมหาวิทยาลัย",
};

function scoreItem(item, form, prefs) {
  const vibeStyles = VIBE_TO_STYLES[prefs?.vibe] || [];
  const colors = (prefs?.colors || []).flatMap((c) => COLOR_GROUPS[c] || []);
  let s = 0;
  if (vibeStyles.includes(item.style)) s += 3;
  if (item.style === form.style) s += 2;
  if (colors.includes(item.color)) s += 2;
  if (item.fit && item.fit === FIT_MAP[prefs?.fit]) s += 1;
  return s + Math.random() * 0.5; // สุ่มนิดหน่อย ให้กดสร้างซ้ำแล้วได้ลุคต่างกัน
}

function best(items, category, form, prefs) {
  const list = items
    .filter((i) => (Array.isArray(category) ? category.includes(i.category) : i.category === category))
    .map((item) => ({ item, score: scoreItem(item, form, prefs) }))
    .sort((a, b) => b.score - a.score);
  return list[0] || null;
}

export function buildOutfit(closet, form, prefs) {
  const top = best(closet, "top", form, prefs);
  const bottom = best(closet, "bottom", form, prefs);
  const dress = best(closet, "dress", form, prefs);

  let picks = [];
  if (dress && (!top || !bottom || dress.score > (top.score + bottom.score) / 2)) {
    picks.push(dress);
  } else {
    if (top) picks.push(top);
    if (bottom) picks.push(bottom);
  }
  for (const cat of ["shoes", "bag", "accessory"]) {
    const extra = best(closet, cat, form, prefs);
    if (extra) picks.push(extra);
  }
  if (!picks.length && closet.length) {
    const any = closet[Math.floor(Math.random() * closet.length)];
    picks = [{ item: any, score: scoreItem(any, form, prefs) }];
  }

  const avg = picks.reduce((sum, p) => sum + p.score, 0) / Math.max(1, picks.length);
  const score = prefs ? Math.min(99, Math.round(55 + 45 * (avg / 8))) : 70;

  const wantedColors = (prefs?.colors || []).flatMap((c) => COLOR_GROUPS[c] || []);
  const colorHit = picks.some((p) => wantedColors.includes(p.item.color));

  const parts = [];
  if (prefs) {
    parts.push(`ลุค ${prefs.vibe} โทน ${prefs.colors.join(", ")} ทรง ${prefs.fit}`);
  } else {
    parts.push(`ลุคสไตล์ ${form.style}`);
  }
  parts.push(`เหมาะกับการ${OCCASION_LABEL[form.occasion] || form.occasion}`);
  let tip = parts.join(" · ") + ". " + (WEATHER_TIP[form.weather] || "");
  if (prefs && !colorHit) tip += " (ตอนนี้ยังไม่มีชิ้นที่ตรงโทนสีที่เลือก ลองเพิ่มเสื้อผ้าโทนนั้นในตู้ดูนะ)";

  return {
    items: picks.map((p) => ({
      id: p.item.id, name: p.item.name, category: p.item.category,
      color: p.item.color, image_url: p.item.image_url,
    })),
    score,
    tip,
  };
}
