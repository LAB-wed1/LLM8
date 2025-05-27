# แอปพลิเคชัน Shopping App with Firebase

แอปพลิเคชัน React Native ที่พัฒนาด้วย Expo และ Firebase สำหรับการซื้อขายสินค้าออนไลน์

## ฟีเจอร์หลัก

### 🔐 Authentication (การยืนยันตัวตน)
- **เข้าสู่ระบบ** - ใช้ Email และ Password
- **สมัครสมาชิก** - ลงทะเบียนด้วย Email, Password และชื่อผู้ใช้
- **ลืมรหัสผ่าน** - รีเซ็ตรหัสผ่านผ่าน Email
- **ออกจากระบบ** - Logout และล้างข้อมูล Local Storage

### 🏠 หน้าหลัก (Home Screen)
- ดึงข้อมูลสินค้าจาก **Firebase Firestore** (แทนที่ API เดิม)
- ระบบกรองสินค้า: ทั้งหมด / มีสินค้าในสต็อก
- เพิ่มสินค้าลงตะกร้าด้วยการแตะ
- Pull to refresh สำหรับอัพเดทข้อมูล
- แสดงจำนวนสินค้าในตะกร้าที่ header

### 🛒 ตะกร้าสินค้า (Cart Screen)
- แสดงรายการสินค้าที่เลือก
- ลบสินค้าออกจากตะกร้า (รายการเดียวหรือทั้งหมด)
- คำนวณราคารวมอัตโนมัติ
- ข้อมูลถูกเก็บใน **AsyncStorage** (Local Storage)
- ป้องกันการเลือกสินค้าซ้ำ

### 👤 โปรไฟล์ (Profile Screen)
- แสดงข้อมูลผู้ใช้ (Email, ชื่อ, วันที่สมัคร)
- แก้ไขชื่อผู้ใช้
- เปลี่ยนรหัสผ่าน
- ออกจากระบบ
- ลบบัญชีผู้ใช้

## โครงสร้าง Navigation

```
📱 App
├── 🔐 Authentication Stack (ก่อนเข้าสู่ระบบ)
│   ├── Login Screen
│   ├── Register Screen  
│   └── Forgot Password Screen
│
└── 🏠 Main Tab Navigator (หลังเข้าสู่ระบบ)
    ├── Home Screen (รายการสินค้า)
    ├── Cart Screen (ตะกร้าสินค้า)
    └── Profile Screen (โปรไฟล์)
```

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Firebase
1. ปฏิบัติตามคำแนะนำใน `FIREBASE_SETUP_GUIDE.md`
2. อัพเดทไฟล์ `firebaseConfig.js` ด้วยข้อมูลโปรเจกต์ Firebase ของคุณ
3. เพิ่มข้อมูลสินค้าใน Firestore จากไฟล์ `sample-products.json`

### 3. รันแอปพลิเคชัน
```bash
npm start
```

## โครงสร้างไฟล์

```
📁 Project Root
├── 📄 App.js                    # Component หลัก
├── 📄 firebaseConfig.js         # การตั้งค่า Firebase
├── 📄 sample-products.json      # ข้อมูลตัวอย่างสินค้า
├── 📁 navigation/
│   └── 📄 AppNavigator.js       # Navigation setup
├── 📁 screens/
│   ├── 📄 LoginScreen.js        # หน้าเข้าสู่ระบบ
│   ├── 📄 RegisterScreen.js     # หน้าสมัครสมาชิก
│   ├── 📄 ForgotPasswordScreen.js # หน้าลืมรหัสผ่าน
│   ├── 📄 HomeScreen.js         # หน้าหลัก
│   ├── 📄 CartScreen.js         # หน้าตะกร้า
│   └── 📄 ProfileScreen.js      # หน้าโปรไฟล์
└── 📁 assets/                   # รูปภาพและไฟล์ static
```

## เทคโนโลยีที่ใช้

- **React Native** - Framework หลัก
- **Expo** - Development platform
- **Firebase Authentication** - ระบบยืนยันตัวตน
- **Firebase Firestore** - ฐานข้อมูลสินค้า
- **React Navigation** - ระบบนำทาง
- **AsyncStorage** - Local storage สำหรับตะกร้าสินค้า
- **Expo Vector Icons** - ไอคอน

## ข้อกำหนดระบบ

- Node.js 16+
- Expo CLI
- โปรเจกต์ Firebase ที่ตั้งค่าแล้ว
- อุปกรณ์หรือ Emulator สำหรับทดสอบ

## การใช้งานหลัก

1. **เริ่มต้นใช้งาน**: สมัครสมาชิกหรือเข้าสู่ระบบ
2. **เลือกซื้อสินค้า**: ดูรายการสินค้าในหน้า Home และเพิ่มลงตะกร้า
3. **จัดการตะกร้า**: ดูและแก้ไขสินค้าในตะกร้า
4. **จัดการบัญชี**: แก้ไขข้อมูลส่วนตัวในหน้า Profile

## หมายเหตุสำคัญ

- แอปจะทำงานได้เฉพาะเมื่อผู้ใช้เข้าสู่ระบบแล้วเท่านั้น
- ข้อมูลตะกร้าสินค้าจะถูกเก็บไว้ใน Local Storage
- การออกจากระบบจะลบข้อมูลตะกร้าทั้งหมด
- ต้องมีการเชื่อมต่ออินเทอร์เน็ตในการใช้งาน Firebase

---

พัฒนาตามโจทย์ปฏิบัติการครั้งที่ 7 เรื่อง Firebase 📱✨
