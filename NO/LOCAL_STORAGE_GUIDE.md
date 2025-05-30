# แอปพลิเคชันบันทึกสินค้าลง Local Storage

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. การบันทึกสินค้าลง AsyncStorage 💾
- ใช้ **AsyncStorage** สำหรับบันทึกข้อมูลใน Local Storage
- เมื่อผู้ใช้เลือกสินค้า จะบันทึกชื่อสินค้าลง Local Storage ทันที
- ข้อมูลจะยังคงอยู่แม้ปิดแอปแล้วเปิดใหม่

### 2. การแสดง Alert + บันทึกข้อมูล
- เมื่อแตะสินค้า จะแสดง `window.alert("คุณเลือกสินค้า: [ชื่อสินค้า]")`
- หลังจากนั้นจะบันทึกชื่อสินค้าลง AsyncStorage
- แสดงรายการสินค้าที่เลือกด้านบนของหน้าจอ

### 3. การจัดการรายการสินค้าที่เลือก
- แสดงจำนวนสินค้าที่เลือกแล้ว
- มีปุ่ม "ล้างทั้งหมด" เพื่อลบรายการทั้งหมด
- ข้อมูลจะถูกโหลดกลับมาเมื่อเปิดแอปใหม่

## โครงสร้างข้อมูลใน AsyncStorage

### Key ที่ใช้:
```javascript
const SELECTED_PRODUCTS_KEY = '@selected_products';
```

### รูปแบบข้อมูล:
```json
[
  {
    "id": "product_id_1",
    "name": "ชื่อสินค้า 1"
  },
  {
    "id": "product_id_2", 
    "name": "ชื่อสินค้า 2"
  }
]
```

## ฟังก์ชันหลัก

### 1. `saveSelectedProducts(selectedProducts)`
- บันทึกรายการสินค้าที่เลือกลง AsyncStorage
- แปลงข้อมูลเป็น JSON string ก่อนบันทึก

### 2. `loadSelectedProducts()`
- โหลดรายการสินค้าที่เลือกจาก AsyncStorage
- แปลงข้อมูลจาก JSON string กลับเป็น Object

### 3. `handleProductSelect(productId, productName)`
- เพิ่มสินค้าใหม่เข้าไปในรายการที่เลือก
- บันทึกข้อมูลลง AsyncStorage ทันที

## การทำงานของ UI

### ProductCard Component
- รับ prop `onProductSelect` เพื่อเรียกใช้เมื่อเลือกสินค้า
- แสดง Alert และบันทึกข้อมูลพร้อมกัน

### Selected Products Display
- แสดงเฉพาะเมื่อมีสินค้าที่เลือกแล้ว
- แสดงจำนวนสินค้าที่เลือก
- มีปุ่มล้างรายการพร้อม confirmation

## วิธีการทดสอบ

### ทดสอบการบันทึก:
1. เปิดแอป
2. แตะเลือกสินค้า
3. ดูรายการที่เลือกด้านบน

### ทดสอบ Local Storage:
1. เลือกสินค้าหลายรายการ
2. ปิดแอป
3. เปิดแอปใหม่
4. รายการที่เลือกจะยังคงอยู่

### ทดสอบการล้างข้อมูล:
1. แตะปุ่ม "ล้างทั้งหมด"
2. ยืนยันการล้าง
3. รายการจะหายไปและข้อมูลใน AsyncStorage จะถูกล้าง

## ความปลอดภัย
- ข้อมูลถูกเก็บใน Local Storage ของอุปกรณ์
- ข้อมูลจะหายไปเมื่อ:
  - ลบแอปพลิเคชัน
  - ล้าง Storage ของแอป
  - ใช้ฟังก์ชันล้างรายการ

## Log Console
ระบบจะแสดง log ใน console:
- `บันทึกสินค้าที่เลือกลง AsyncStorage สำเร็จ`
- `โหลดสินค้าที่เลือกจาก AsyncStorage สำเร็จ`
- `บันทึก "[ชื่อสินค้า]" ลง Local Storage แล้ว`
