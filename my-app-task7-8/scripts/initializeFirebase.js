import { initializeProductsInFirebase } from '../api/productAPI';

// ฟังก์ชันสำหรับเพิ่มข้อมูลสินค้าเข้า Firebase
const initializeData = async () => {
  console.log('เริ่มต้นเพิ่มข้อมูลสินค้าเข้า Firebase...');
  
  try {
    const result = await initializeProductsInFirebase();
    
    if (result) {
      console.log('✅ เพิ่มข้อมูลสินค้าเข้า Firebase สำเร็จ');
    } else {
      console.error('❌ เพิ่มข้อมูลสินค้าเข้า Firebase ไม่สำเร็จ');
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
  }
};

// เรียกใช้ฟังก์ชัน
initializeData(); 