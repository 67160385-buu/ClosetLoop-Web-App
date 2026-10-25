import smtplib

# ใช้ข้อมูลจริงของเอมมี่ที่ตั้งไว้
sender_email = "ammy111249@gmail.com"
sender_password = "lidluplhdknkrhgt" 
receiver_email = "67160354@go.buu.ac.th"

try:
    print("⏳ กำลังเชื่อมต่อเซิร์ฟเวอร์ Gmail (พอร์ต 465)...")
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    
    print("⏳ กำลังล็อกอิน...")
    server.login(sender_email, sender_password)
    
    print("⏳ ล็อกอินสำเร็จ! กำลังส่งข้อความ...")
    msg = "Subject: Test ClosetLoop\n\nHello from Python!"
    server.sendmail(sender_email, receiver_email, msg)
    server.quit()
    
    print("🎉 ส่งอีเมลสำเร็จแล้ว! ลองเช็คกล่องจดหมายดูนะ")
except Exception as e:
    print(f"❌ ส่งไม่ได้! สาเหตุคือ: {e}")