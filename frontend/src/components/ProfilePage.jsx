import { useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { api } from "../api";
import { Field } from "./UI";

export default function ProfilePage({ user, setUser, setToast, logout, quiz, onRetake }) {
  const [displayName, setDisplayName] = useState(user?.display_name || "");

  const updateProfile = async () => {
    try {
      const u = await api.updateUser(user.id, { display_name: displayName });
      setUser(u);
      setToast("อัปเดตข้อมูลส่วนตัวเรียบร้อย ✨");
    } catch (e) { setToast(e.message); }
  };

  return (
    <section className="page">
      <div className="page-hero">
        <div>
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">Profile</h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">จัดการข้อมูลบัญชีผู้ใช้ของคุณ</p>
        </div>
      </div>
      <div className="profile-grid">
        <div className="panel">
          <Field label="Username" value={user?.username || ""} disabled />
          <Field label="Email" value={user?.email || ""} disabled />
          <Field label="Display Name" value={displayName} onChange={setDisplayName} placeholder="ชื่อที่ต้องการให้แสดง" />
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button className="btn btn-dark" onClick={updateProfile}>บันทึกการเปลี่ยนแปลง</button>
            <button className="btn btn-outline" onClick={logout} style={{ color: "#ef4444", borderColor: "#fca5a5" }}>
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </div>
        <div className="panel">
          <span className="eyebrow">STYLE PROFILE</span><h3>สไตล์ของคุณ</h3>
          {quiz ? <>
            <p className="muted" style={{ marginBottom: "6px" }}>Vibe: <b>{quiz.vibe}</b></p>
            <p className="muted" style={{ marginBottom: "6px" }}>โทนสี: <b>{quiz.colors.join(", ")}</b></p>
            <p className="muted">ทรง: <b>{quiz.fit}</b></p>
          </> : <p className="muted">ยังไม่ได้ตอบแบบสอบถามสไตล์</p>}
          <button className="btn btn-outline" onClick={onRetake}><RefreshCw size={16} /> ทำแบบสอบถามใหม่</button>
        </div>
      </div>
    </section>
  );
}