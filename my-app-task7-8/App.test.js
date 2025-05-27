import { initializeProductsInFirebase } from './api/productAPI';

// ทดสอบเพิ่มข้อมูลสินค้าเข้า Firebase
const testInitializeProducts = async () => {
  console.log('กำลังเพิ่มข้อมูลสินค้าตัวอย่างเข้า Firebase collection "products1"...');
  
  try {
    const result = await initializeProductsInFirebase();
    
    if (result) {
      console.log('✅ เพิ่มข้อมูลสินค้าเข้า Firebase สำเร็จ');
      console.log('ตรวจสอบข้อมูลได้ที่ Firebase Console > Firestore > Collection "products1"');
    } else {
      console.error('❌ เพิ่มข้อมูลสินค้าเข้า Firebase ไม่สำเร็จ');
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
  }
};

// เรียกใช้ฟังก์ชันทดสอบ
testInitializeProducts(); 