import { useState } from "react";
import { Eye, EyeOff, X, Plus } from "lucide-react";

export const categories = [
  { key: "top", label: "Tops", icon: "👕" },
  { key: "bottom", label: "Bottoms", icon: "👖" },
  { key: "dress", label: "Dresses", icon: "👗" },
  { key: "shoes", label: "Shoes", icon: "👟" },
  { key: "bag", label: "Bags", icon: "👜" },
  { key: "accessory", label: "Accessories", icon: "🕶️" },
];

export function money(n) { 
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n) + " ฿"; 
}

export function Field({label, value, onChange, type="text", placeholder, required, labelRight, disabled}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <label className="field">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span>{label}</span>
        {labelRight && labelRight}
      </div>
      <div style={{ position: 'relative' }}>
        <input type={inputType} value={value} onChange={e=>onChange && onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={{ width: '100%', boxSizing: 'border-box', paddingRight: isPassword ? '40px' : '12px' }} />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', padding: 0 }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => {
          const [val, lbl] = Array.isArray(opt) ? opt : [opt, opt];
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </label>
  );
}

export function Modal({ title, close, children }) {
  return (
    <div className="modal-overlay" onClick={close} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative' }}>
        <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
          <button className="icon-btn" onClick={close} type="button"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({text,action,onClick}) { 
  return <div className="empty"><div className="empty-icon">◒</div><p>{text}</p>{action&&<button className="btn btn-outline" onClick={onClick}><Plus size={16}/>{action}</button>}</div> 
}