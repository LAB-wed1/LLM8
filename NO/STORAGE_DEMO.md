# การใช้งาน Local Storage ในแอปพลิเคชัน

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. การบันทึกสินค้าที่เลือกลง Local Storage
- ใช้ AsyncStorage เพื่อบันทึกข้อมูลสินค้าที่ผู้ใช้เลือก
- ข้อมูลจะถูกเก็บไว้แม้หลังจากปิดแอปแล้วเปิดใหม่

### 2. การทำงานของระบบ

#### การเลือกสินค้า:
- แตะที่การ์ดสินค้าเพื่อเลือก/ยกเลิกการเลือก
- สินค้าที่เลือกแล้วจะมีขอบสีเขียวและป้าย "✓ เลือกแล้ว"
- จะมี Alert แจ้งเตือนเมื่อเลือกหรือยกเลิกการเลือกสินค้า

#### การแสดงรายการที่เลือก:
- แสดงจำนวนสินค้าที่เลือกไว้ด้านบนของหน้าจอ
- มีปุ่ม "ล้างทั้งหมด" เพื่อลบรายการที่เลือกทั้งหมด

#### การเก็บข้อมูล:
- ข้อมูลสินค้าที่เลือกจะถูกบันทึกใน AsyncStorage ทันที
- เมื่อเปิดแอปใหม่ ข้อมูลที่เลือกไว้จะยังคงอยู่

### 3. ข้อมูลที่เก็บ
ระบบจะเก็บข้อมูลดังนี้:
```json
[
  {
    "id": "product_id",
    "name": "ชื่อสินค้า"
  }
]
```

### 4. Key ที่ใช้ใน AsyncStorage
- Key: `@selected_products`
- ข้อมูลจะถูกเก็บในรูปแบบ JSON string

### 5. ฟังก์ชันหลักที่เพิ่มเข้ามา

#### `saveSelectedProducts(selectedProducts)`
- บันทึกรายการสินค้าที่เลือกลง AsyncStorage

#### `loadSelectedProducts()`
- โหลดรายการสินค้าที่เลือกจาก AsyncStorage

#### `handleProductPress(productId, productName)`
- จัดการการเลือก/ยกเลิกการเลือกสินค้า
- บันทึกข้อมูลลง AsyncStorage ทันที

### 6. วิธีการทดสอบ
1. เปิดแอป
2. แตะที่สินค้าเพื่อเลือก
3. ปิดแอป
4. เปิดแอปใหม่
5. สินค้าที่เลือกไว้จะยังคงมีสถานะ "เลือกแล้ว"

### 7. ความปลอดภัย
- ข้อมูลจะถูกเก็บไว้ใน Local Storage ของอุปกรณ์
- ข้อมูลจะหายไปเมื่อลบแอป หรือล้าง Storage ของแอป
