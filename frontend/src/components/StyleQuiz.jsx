import React, { useState } from 'react';

const VIBES = ['Minimalist', 'Streetwear', 'Y2K / Vintage', 'Smart Casual', 'Chic & Old Money'];
const COLORS = ['Earth Tone', 'Monochrome (Black/White)', 'Pastel', 'Vibrant & Colorful'];
const FITS = ['Oversized / Loose', 'Regular Fit', 'Slim Fit'];

// สไตล์ของปุ่มตัวเลือก
const optionStyle = (selected, center = false) => ({
  padding: center ? '16px 12px' : '14px 20px',
  borderRadius: '16px',
  border: selected ? '1px solid #151515' : '1px solid #e7e3dc',
  backgroundColor: selected ? '#151515' : '#f9f8f5',
  color: selected ? '#ffffff' : '#333333',
  fontWeight: selected ? '700' : '600',
  fontSize: '14px',
  cursor: 'pointer',
  textAlign: center ? 'center' : 'left',
  transition: 'all 0.2s ease',
  boxShadow: selected ? '0 8px 20px rgba(0, 0, 0, 0.12)' : 'none'
});

export default function StyleQuiz({ onComplete, onCancel, initial }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vibe: initial?.vibe || '',
    colors: initial?.colors || [],
    fit: initial?.fit || ''
  });

  const toggleColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color]
    }));
  };

  const blocked =
    (step === 1 && !formData.vibe) ||
    (step === 2 && formData.colors.length === 0) ||
    (step === 3 && !formData.fit);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else if (onComplete) onComplete(formData);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      background: '#f7f6f2'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* หัวข้อด้านบนการ์ด */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-1px', color: '#151515' }}>
            ClosetLoop<span style={{ fontSize: '9px', verticalAlign: 'top', marginLeft: '2px' }}>®</span>
          </div>
          <p style={{ color: '#77746f', fontSize: '13px', margin: '8px 0 0', lineHeight: '1.5' }}>
            ตอบ 3 คำถามสั้นๆ ก่อนเริ่ม เพื่อให้ AI รู้สไตล์ของคุณแบบตรงตัว
          </p>
        </div>

        {/* ตัวการ์ดแบบสอบถาม (เปลี่ยนจากสีน้ำเงินเข้มเป็นสีขาวมินิมอล) */}
        <div style={{
          padding: '36px 32px',
          backgroundColor: '#ffffff',
          color: '#151515',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
          border: '1px solid #e7e3dc',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Step Indicator & Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#77746f', fontWeight: '700', letterSpacing: '1.5px' }}>
                STEP {step} OF 3
              </span>
              {step === 2 && <small style={{ color: '#888', fontSize: '11px' }}>เลือกได้มากกว่า 1 โทน</small>}
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '10px',
                  background: n <= step ? '#151515' : '#eee9df',
                  transition: 'background 0.3s ease'
                }} />
              ))}
            </div>

            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#151515', letterSpacing: '-0.5px' }}>
              {step === 1 && 'ค้นหา Vibe สไตล์แต่งตัวของคุณ'}
              {step === 2 && 'โทนสีที่คุณมั่นใจเวลาสวมใส่'}
              {step === 3 && 'ทรงเสื้อผ้าที่ชอบใส่เป็นประจำ'}
            </h2>
          </div>

          {/* Step 1: Vibe */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {VIBES.map((v) => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, vibe: v })} style={optionStyle(formData.vibe === v)}>
                  {v}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Colors */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => toggleColor(c)} style={optionStyle(formData.colors.includes(c), true)}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Fit */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FITS.map((f) => (
                <button key={f} type="button" onClick={() => setFormData({ ...formData, fit: f })} style={optionStyle(formData.fit === f)}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Footer ปุ่มกด ย้อนกลับ / ถัดไป */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)}
                style={{ padding: '10px 14px', backgroundColor: 'transparent', color: '#151515', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                ย้อนกลับ
              </button>
            ) : onCancel ? (
              <button type="button" onClick={onCancel}
                style={{ padding: '10px 14px', backgroundColor: 'transparent', color: '#888888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                ยกเลิก
              </button>
            ) : <div />}

            <button type="button" onClick={handleNext} disabled={blocked}
              style={{
                padding: '12px 28px',
                backgroundColor: '#151515',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                borderRadius: '50px',
                cursor: blocked ? 'not-allowed' : 'pointer',
                opacity: blocked ? 0.4 : 1,
                transition: 'all 0.2s ease',
                boxShadow: blocked ? 'none' : '0 6px 16px rgba(0, 0, 0, 0.12)'
              }}>
              {step === 3 ? 'เสร็จสิ้น' : 'ถัดไป'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}