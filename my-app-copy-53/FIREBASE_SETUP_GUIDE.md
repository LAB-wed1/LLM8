# คำแนะนำในการตั้งค่า Firebase สำหรับแอปพลิเคชัน

## ขั้นตอนการตั้งค่า Firebase

### 1. สร้างโปรเจกต์ Firebase
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" หรือ "เพิ่มโปรเจกต์"
3. ตั้งชื่อโปรเจกต์ (เช่น "my-shopping-app")
4. เลือกการตั้งค่าที่ต้องการและสร้างโปรเจกต์

### 2. เพิ่มแอป Web ลงในโปรเจกต์
1. ในหน้าโปรเจกต์ Firebase คลิกไอคอน Web (</>)
2. ตั้งชื่อแอป (เช่น "My Shopping App")
3. คัดลอก Firebase Configuration Object ที่ได้

### 3. อัพเดทไฟล์ firebaseConfig.js
แทนที่ข้อมูลใน `firebaseConfig.js` ด้วยข้อมูลที่ได้จาก Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

### 4. เปิดใช้งาน Firebase Authentication
1. ไปที่ "Authentication" ในเมนูซ้าย
2. คลิก "Get started"
3. ไปที่แท็บ "Sign-in method"
4. เปิดใช้งาน "Email/Password"

### 5. สร้าง Firestore Database
1. ไปที่ "Firestore Database" ในเมนูซ้าย
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับการพัฒนา)
4. เลือกตำแหน่งที่ต้องการ

### 6. เพิ่มข้อมูลสินค้าใน Firestore
สร้าง Collection ชื่อ "products" และเพิ่มข้อมูลสินค้า เช่น:

```json
{
  "name": "สินค้าตัวอย่าง",
  "price": "100",
  "stock": 10,
  "cate": "อิเล็กทรอนิกส์",
  "pic": "https://example.com/image.jpg"
}
```

### 7. กำหนดกฎการเข้าถึง Firestore (Security Rules)
ในแท็บ "Rules" ของ Firestore Database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // อนุญาตให้ผู้ใช้ที่เข้าสู่ระบบแล้วอ่านข้อมูลสินค้าได้
    match /products/{document} {
      allow read: if request.auth != null;
    }
    
    // กฎอื่นๆ สำหรับข้อมูลผู้ใช้
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## การรันแอปพลิเคชัน

หลังจากตั้งค่า Firebase เรียบร้อยแล้ว:

1. ติดตั้ง dependencies:
```bash
npm install
```

2. รันแอป:
```bash
npm start
```

## ฟีเจอร์ที่พร้อมใช้งาน

✅ **Authentication (การยืนยันตัวตน)**
- เข้าสู่ระบบด้วย Email/Password
- สมัครสมาชิกใหม่
- รีเซ็ตรหัสผ่าน
- ออกจากระบบ

✅ **Navigation (การนำทาง)**
- Stack Navigator สำหรับ Auth (Login, Register, Forgot)
- Tab Navigator สำหรับหน้าหลัก (Home, Cart, Profile)
- Auto-redirect ตามสถานะการเข้าสู่ระบบ

✅ **Home Screen**
- ดึงข้อมูลสินค้าจาก Firebase Firestore
- ระบบกรองสินค้า (ทั้งหมด/มีสินค้า)
- เพิ่มสินค้าลงตะกร้า
- Pull to refresh

✅ **Cart Screen**
- แสดงรายการสินค้าที่เลือก
- ลบสินค้าออกจากตะกร้า
- คำนวณราคารวม
- Local Storage สำหรับเก็บข้อมูลตะกร้า

✅ **Profile Screen**
- แสดงข้อมูลผู้ใช้
- แก้ไขชื่อผู้ใช้
- เปลี่ยนรหัสผ่าน
- ออกจากระบบ
- ลบบัญชี

## หมายเหตุสำคัญ

- ตรวจสอบให้แน่ใจว่าได้อัพเดทไฟล์ `firebaseConfig.js` ด้วยข้อมูลที่ถูกต้อง
- เพิ่มข้อมูลสินค้าใน Firestore Collection "products"
- กำหนด Security Rules ให้เหมาะสมกับการใช้งานจริง
- แอปจะทำงานได้เฉพาะเมื่อผู้ใช้เข้าสู่ระบบแล้วเท่านั้น
