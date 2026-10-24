import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { api } from "../api";
import { Field } from "./UI";

export default function AuthScreen({ mode, setMode, onSuccess }) {
  const [form, setForm] = useState({ username:"", display_name:"", email:"", password:"" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "forgot-password") {
        await api.resetPassword({ email: form.email });
        alert("ระบบได้รับคำขอแล้ว กรุณาเช็คอีเมลเพื่อตั้งรหัสผ่านใหม่");
        setMode("login");
      } else if (mode === "login") {
        const data = await api.login({ email: form.email, password: form.password });
        onSuccess(data);
      } else {
        const data = await api.register(form);
        onSuccess(data);
      }
    } catch (err) { 
      let msg = err.message;
      if (msg === "[object Object]") msg = "ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้องค่ะ";
      setError(msg); 
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="auth-brand">ClosetLoop<span>®</span></div>
        <div className="auth-copy">
          <span className="eyebrow">YOUR WARDROBE, REIMAGINED</span>
          <h1>Wear it.<br/><i>Loop it.</i></h1>
          <p>ตู้เสื้อผ้าดิจิทัลที่ช่วยจัดลุคให้คุณ และเปลี่ยนเสื้อผ้าที่ไม่ได้ใส่ ให้กลับมามีคุณค่าอีกครั้ง</p>
        </div>
        <div className="floating-card card-a"><span>✦</span><b>AI MATCH</b><small>your style, your way</small></div>
        <div className="floating-card card-b"><span>↻</span><b>RE-LOOP</b><small>sell • exchange • discover</small></div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-logo">ClosetLoop<span>®</span></div>
          <div className="auth-heading">
            <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : mode === "register" ? "JOIN THE LOOP" : "RESET PASSWORD"}</span>
            <h2>{mode === "login" ? "เข้าสู่ ClosetLoop" : mode === "register" ? "สร้างบัญชีใหม่" : "ลืมรหัสผ่าน"}</h2>
            <p>{mode === "login" ? "กลับมาสนุกกับตู้เสื้อผ้าของคุณต่อ" : mode === "register" ? "เริ่มต้น wardrobe journey ของคุณวันนี้" : "กรอกอีเมลที่สมัครไว้ แล้วรับลิงก์ตั้งรหัสผ่านใหม่"}</p>
          </div>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={submit} className="form">
            
            {mode === "forgot-password" && (
              <>
                <Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="you@example.com" required />
              </>
            )}

            {mode !== "forgot-password" && (
              <>
                {mode === "register" && <>
                  <Field label="Username" value={form.username} onChange={v=>setForm({...form,username:v})} placeholder="yourname" required />
                  <Field label="Display name" value={form.display_name} onChange={v=>setForm({...form,display_name:v})} placeholder="August" />
                </>}
                <Field 
                  label={mode === "login" ? "Email or Username" : "Email"} 
                  type={mode === "login" ? "text" : "email"} 
                  value={form.email} 
                  onChange={v=>setForm({...form,email:v})} 
                  placeholder={mode === "login" ? "you@example.com หรือชื่อผู้ใช้" : "you@example.com"} 
                  required 
                />
                <Field 
                  label="Password" 
                  type="password" 
                  value={form.password} 
                  onChange={v=>setForm({...form,password:v})} 
                  placeholder="••••••••" 
                  required 
                  labelRight={
                    mode === "login" ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); setMode("forgot-password"); }} style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>ลืมรหัสผ่าน?</a>
                    ) : null
                  }
                />
              </>
            )}

            <button className="btn btn-dark full" disabled={busy}>
              {busy ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : mode === "register" ? "สมัครสมาชิก" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"} 
              <ArrowRight size={18}/>
            </button>
          </form>
          
          <div className="auth-switch">
            {mode === "forgot-password" ? (
              <>จำรหัสผ่านได้แล้ว? <button type="button" onClick={() => setMode("login")}>กลับไปเข้าสู่ระบบ</button></>
            ) : (
              <>
                {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
                <button type="button" onClick={()=>{setMode(mode==="login"?"register":"login")}}> {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</button>
              </>
            )}
          </div>
          <div className="auth-note"><LockKeyhole size={14}/> ข้อมูลของคุณเก็บอยู่ในเบราว์เซอร์เครื่องนี้ ไม่ต้องใช้เซิร์ฟเวอร์</div>
        </div>
      </div>
    </div>
  );
}