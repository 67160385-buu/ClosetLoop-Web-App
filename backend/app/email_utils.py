import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(to_email: str, token_or_url: str, otp: str = "") -> bool:
    """
    ส่งอีเมลสำหรับรีเซ็ตรหัสผ่านผ่าน SMTP
    - ส่งทั้งรหัสยืนยัน OTP (6 หลัก) และลิงก์ตั้งรหัสผ่านใหม่
    - ดึงค่าการตั้งค่าจาก Environment Variables
    - รองรับทั้ง SMTP SSL (พอร์ต 465) และ STARTTLS (พอร์ต 587)
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    sender_email = os.getenv("EMAIL_SENDER", "ammy111249@gmail.com")
    sender_password = os.getenv("EMAIL_PASSWORD", "lidluplhdknkrhgt")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    # ตรวจสอบว่าพารามิเตอร์ที่ส่งมาเป็น URL แล้วหรือเป็นเพียง Token
    if token_or_url.startswith("http://") or token_or_url.startswith("https://"):
        reset_link = token_or_url
    else:
        reset_link = f"{frontend_url}/reset-password?token={token_or_url}"

    # แสดงผลใน Console Log เสมอ เพื่อความสะดวกรวดเร็วในการตรวจสอบ
    print("\n" + "=" * 65, flush=True)
    print("🔑 [CLOSETLOOP - RESET PASSWORD REQUEST]", flush=True)
    print(f"📧 ส่งถึง: {to_email}", flush=True)
    if otp:
        print(f"🔢 รหัสยืนยัน OTP (6 หลัก): {otp}", flush=True)
    print(f"🔗 ลิงก์รีเซ็ตรหัสผ่าน: {reset_link}", flush=True)
    print("=" * 65 + "\n", flush=True)

    try:
        print(f"⏳ กำลังส่งอีเมลรีเซ็ตรหัสผ่านไปยัง: {to_email} ...", flush=True)

        msg = MIMEMultipart("alternative")
        msg["From"] = f"ClosetLoop Security <{sender_email}>"
        msg["To"] = to_email
        msg["Subject"] = f"[{otp}] รหัสยืนยันรีเซ็ตรหัสผ่าน ClosetLoop" if otp else "ตั้งรหัสผ่านใหม่สำหรับ ClosetLoop (Password Reset)"

        # เนื้อหาแบบข้อความธรรมดา (Plain Text)
        text_content = f"""สวัสดีค่ะ,

เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชี ClosetLoop ของคุณ ({to_email})

{'🔢 รหัสยืนยัน OTP ของคุณคือ: ' + otp if otp else ''}

หรือคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
{reset_link}

⚠️ รหัสนี้และลิงก์มีอายุการใช้งาน 15 นาที เพื่อความปลอดภัยของบัญชีคุณ
หากคุณไม่ได้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้เลยค่ะ

ขอบคุณค่ะ,
ทีมงาน ClosetLoop
"""

        # กล่องแสดง OTP แบบ HTML
        otp_html_block = f"""
        <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 13px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
            รหัสยืนยันตัวตน (OTP)
          </span>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #111827; font-family: monospace;">
            {otp}
          </div>
          <span style="font-size: 12px; color: #6b7280; display: block; margin-top: 8px;">
            (รหัสนี้มีอายุการใช้งาน 15 นาที)
          </span>
        </div>
        """ if otp else ""

        # เนื้อหาแบบ HTML ดีไซน์สวยงาม
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f6f8fa;
      color: #24292f;
      margin: 0;
      padding: 24px;
    }}
    .container {{
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e1e4e8;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: #151515;
      padding: 30px 24px;
      text-align: center;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .content {{
      padding: 32px 28px;
      line-height: 1.6;
      font-size: 15px;
    }}
    .btn-container {{
      text-align: center;
      margin: 28px 0;
    }}
    .btn {{
      background-color: #151515;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }}
    .warning {{
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 13px;
      color: #92400e;
      margin: 20px 0;
    }}
    .footer {{
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6e7781;
      border-top: 1px solid #f0f2f5;
      background-color: #fafbfc;
    }}
    .raw-link {{
      word-break: break-all;
      font-size: 12px;
      color: #2563eb;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ClosetLoop</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; color: #c7b99b;">คำขอตั้งรหัสผ่านใหม่ (Password Reset)</p>
    </div>
    <div class="content">
      <p>สวัสดีค่ะ,</p>
      <p>เราได้รับคำขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชี <strong>{to_email}</strong></p>
      
      {otp_html_block}

      <div class="btn-container">
        <a href="{reset_link}" class="btn" target="_blank">คลิกเพื่อตั้งรหัสผ่านใหม่</a>
      </div>

      <div class="warning">
        ⏳ <strong>คำเตือน:</strong> รหัสและลิงก์นี้จะหมดอายุภายใน <strong>15 นาที</strong>
      </div>

      <p style="font-size: 13px; color: #57606a;">
        หากคลิกปุ่มไม่ได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้โดยตรง:<br>
        <a href="{reset_link}" class="raw-link">{reset_link}</a>
      </p>

      <p style="font-size: 13px; color: #57606a; margin-top: 24px;">
        หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้อย่างปลอดภัย บัญชีของคุณยังคงปลอดภัยค่ะ
      </p>
    </div>
    <div class="footer">
      © ClosetLoop - Virtual Closet & Fashion Marketplace
    </div>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
            server.starttls()

        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        print(f"✅ ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง {to_email} สำเร็จเรียบร้อย!", flush=True)
        return True

    except Exception as e:
        print(f"❌ ไม่สามารถส่งอีเมลไปยัง {to_email} ได้! สาเหตุ: {e}", flush=True)
        return False