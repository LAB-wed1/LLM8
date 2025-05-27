// utils/CartDebugger.js
import { getCollection, deleteDocument, getCurrentUser } from '../api/firebase';

/**
 * A utility for debugging and fixing cart deletion issues
 */
export const debugCartDeletion = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log("ไม่พบข้อมูลผู้ใช้ที่เข้าสู่ระบบ");
      return { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ" };
    }

    // Get all cart items for the current user
    console.log(`กำลังโหลดข้อมูลตะกร้าสินค้าของผู้ใช้ ${user.uid}...`);
    const { data: cartItems, error } = await getCollection('cart');

    if (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้าสินค้า:", error);
      return { success: false, message: "ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้" };
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("ไม่พบรายการในตะกร้าสินค้า");
      return { success: false, message: "ตะกร้าสินค้าว่างเปล่า" };
    }

    // Filter cart items for current user
    const userCartItems = cartItems.filter(item => item.userId === user.uid);

    if (userCartItems.length === 0) {
      console.log(`ไม่พบรายการในตะกร้าสินค้าสำหรับผู้ใช้ ${user.email}`);
      return { success: false, message: "ไม่พบรายการสินค้าในตะกร้า" };
    }

    console.log(`พบ ${userCartItems.length} รายการในตะกร้าสินค้า`);
    console.log("ข้อมูลสินค้าในตะกร้า:");
    userCartItems.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Document ID: ${item.id}, ชื่อ: ${item.name}, จำนวน: ${item.quantity}`);
    });

    return {
      success: true, 
      message: `พบ ${userCartItems.length} รายการในตะกร้าสินค้า`,
      cartItems: userCartItems
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบตะกร้าสินค้า:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบตะกร้า" };
  }
};

/**
 * Function to forcibly delete an item from cart by ID
 */
export const forceDeleteCartItem = async (docId) => {
  try {
    if (!docId) {
      console.error("ไม่ได้ระบุ Document ID");
      return { success: false, message: "ไม่ได้ระบุ Document ID" };
    }

    console.log(`กำลังลบรายการหมายเลข ${docId}...`);
    const result = await deleteDocument('cart', docId);

    if (result) {
      console.log(`ลบรายการ ${docId} สำเร็จ`);
      return { success: true, message: `ลบรายการสำเร็จ` };
    } else {
      console.error(`ไม่สามารถลบรายการ ${docId} ได้`);
      return { success: false, message: "ไม่สามารถลบรายการได้" };
    }
  } catch (error) {
    console.error(`เกิดข้อผิดพลาดในการลบรายการ ${docId}:`, error);
    return { success: false, message: "เกิดข้อผิดพลาดในการลบรายการ" };
  }
};

/**
 * Function to delete all cart items for the current user
 */
export const clearAllCartItems = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log("ไม่พบข้อมูลผู้ใช้ที่เข้าสู่ระบบ");
      return { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ" };
    }

    // Get all cart items for the current user
    const { data: cartItems, error } = await getCollection('cart');

    if (error || !cartItems) {
      return { success: false, message: "ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้" };
    }

    const userCartItems = cartItems.filter(item => item.userId === user.uid);
    if (userCartItems.length === 0) {
      return { success: true, message: "ไม่พบรายการสินค้าในตะกร้า" };
    }

    console.log(`เริ่มลบสินค้าทั้งหมด ${userCartItems.length} รายการ...`);
    let successCount = 0;
    let failCount = 0;

    for (const item of userCartItems) {
      try {
        const result = await deleteDocument('cart', item.id);
        if (result) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`เกิดข้อผิดพลาดในการลบรายการ ${item.id}:`, err);
        failCount++;
      }
    }

    return { 
      success: true, 
      message: `ลบสินค้าสำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`
    };
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบสินค้าทั้งหมด:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการลบสินค้าทั้งหมด" };
  }
};
