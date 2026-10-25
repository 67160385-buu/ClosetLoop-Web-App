# 👗 ClosetLoop - Sustainable Fashion & AI Wardrobe Platform

**ClosetLoop** แพลตฟอร์มจัดการตู้เสื้อผ้าดิจิทัล (Digital Wardrobe) และตลาดกลางซื้อขายเสื้อผ้ามือสอง (Second-hand Marketplace) พร้อมระบบ **AI Outfit Curator** ช่วยคิวเรตและจับคู่ลุคการแต่งตัวตามสไตล์ สภาพอากาศ และโอกาสใช้งาน

---

## 👥 ผู้จัดทำโครงการ (Team Members)

* **67160385** นางสาวอัญชิสา นิยมชัย
* **67160354** นางสาวปาณิศา วงศ์รัตนสังวร

---

## ✨ ฟีเจอร์หลักของระบบ (Key Features)

* 📊 **Overview Dashboard:** สรุปภาพรวมตู้เสื้อผ้า สถิติการใช้งาน และรายการสินค้าใหม่ในตลาด
* 👔 **My Closet:** ตู้เสื้อผ้าดิจิทัลส่วนตัว รองรับการเพิ่ม ลบ และจัดหมวดหมู่เสื้อผ้า (Tops, Bottoms, Dresses, Shoes, Accessories)
* ✨ **AI Outfit Curator:** ระบบ AI สไตลิสต์ คิวเรตการแต่งตัวให้อัตโนมัติโดยคำนวณจาก Style DNA, โอกาสที่ใส่ (Occasion) และสภาพอากาศ (Weather)
* 🛍️ **Marketplace:** ตลาดซื้อขายเสื้อผ้ามือสองแบบ Unique Single-Item System (สินค้าชิ้นเดียวในโลก ล็อกสต็อก 1 ชิ้น)
* 🛒 **Cart & Orders Management:** ระบบตะกร้าสินค้า พร้อมติดตามสถานะคำสั่งซื้อฝั่งผู้ซื้อ (My Orders) และระบบจัดการพัสดุฝั่งผู้ขาย (Seller Orders)
* 🔑 **Multi-Role & Admin System:** รองรับการใช้งานบทบาท Buyer, Seller และหน้าจอ Admin Dashboard สำหรับบริหารจัดการระบบ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** React (Vite), Tailwind CSS, Lucide Icons
* **Backend:** Node.js / Express
* **Database:** PostgreSQL
* **Containerization:** Docker & Docker Compose
* **Deployment:** Render.com (Monorepo Setup)

---

## 🚀 วิธีเปิดใช้งานโปรเจกต์ในเครื่อง (Local Development Setup)

### ข้อกำหนดก่อนเริ่มงาน (Prerequisites)
* ติดตั้ง [Docker Desktop](https://www.docker.com/) และเปิดโปรแกรมให้พร้อมใช้งาน
* ติดตั้ง [Git](https://git-scm.com/)

### ขั้นตอนการรันระบบ
1. **Clone Repository:**
   ```bash
   git clone [https://github.com/67160385-buu/ClosetLoop-Web-App.git](https://github.com/67160385-buu/ClosetLoop-Web-App.git)
   cd ClosetLoop-Web-App


สั่งรันบริการทั้งหมดผ่าน Docker Compose:
docker compose up -d
เข้าใช้งานผ่าน Web Browser:
Frontend: http://localhost:5173
Backend API: http://localhost:8000


คำสั่งหยุดการทำงาน:
docker compose down

🌐 การนำขึ้นระบบจริง (Deployment on Render)
โปรเจกต์นี้ตั้งค่าโครงสร้างแบบ Monorepo รองรับการ Deploy บน Render.com:
Frontend: Deploy เป็น Static Site (Root Directory: frontend | Build Command: npm run build | Output: dist)
Backend: Deploy เป็น Web Service (Root Directory: backend | Start Command: npm start)
Database: Managed PostgreSQL บน Render
