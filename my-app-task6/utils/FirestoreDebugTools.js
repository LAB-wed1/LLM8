import { testFirestoreConnection, db } from '../api/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * ตรวจสอบการเชื่อมต่อ Firestore แบบปกติ (ไม่ใช่ realtime)
 * @returns {Promise<Object>} ผลการทดสอบการเชื่อมต่อ
 */
export const testFirestoreConnectionStatus = async () => {
  try {
    const testResult = await testFirestoreConnection();
    console.log('Firestore connection test result:', testResult);
    return testResult;
  } catch (err) {
    console.error('Firestore connection test error:', err);
    return { 
      success: false, 
      error: err.message,
      details: 'Failed to connect to Firestore. Check network connection and Firestore rules.'
    };
  }
};

/**
 * ทดสอบการเชื่อมต่อแบบ Realtime Listener
 * @param {Function} onSuccess ฟังก์ชันที่จะเรียกเมื่อการเชื่อมต่อสำเร็จ
 * @param {Function} onError ฟังก์ชันที่จะเรียกเมื่อเกิดข้อผิดพลาด
 * @returns {Function} ฟังก์ชันสำหรับยกเลิกการติดตาม
 */
export const testRealtimeListener = (onSuccess, onError) => {
  try {
    // เริ่มการ listen
    const testRef = doc(db, 'system', 'status');
    
    const unsub = onSnapshot(
      testRef,
      (docSnap) => {
        console.log('Realtime data received:', docSnap.data());
        if (onSuccess) onSuccess(docSnap.data());
      },
      (err) => {
        console.error('Realtime listener error:', err);
        if (onError) onError(err);
      }
    );
    
    return unsub;
  } catch (err) {
    console.error('Realtime listener setup error:', err);
    if (onError) onError(err);
    return () => {}; // Empty function as fallback
  }
};

/**
 * แสดงคำแนะนำในการแก้ไขปัญหา Firestore ใน console
 */
export const showFirestoreDebugTips = () => {
  console.log('\n=== FIRESTORE DEBUG TIPS ===');
  console.log('1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
  console.log('2. ตรวจสอบ Firestore Rules ว่าอนุญาตให้อ่านและเขียนข้อมูลหรือไม่');
  console.log('3. ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหากมีการกำหนดสิทธิ์แบบ request.auth != null');
  console.log('4. ตรวจสอบการเปิดใช้งาน Firestore ในโปรเจคของคุณ');
  console.log('5. ตัวอย่าง Firestore Rules ที่แนะนำ:');
  console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
  `);
  console.log('=== END FIRESTORE DEBUG TIPS ===\n');
};

/**
 * เริ่มเก็บข้อมูลการเชื่อมต่อ Firestore ในพื้นหลัง (ไม่มี UI)
 * ข้อมูลจะถูกแสดงใน console เท่านั้น
 */
export const startFirestoreConnectionMonitoring = () => {
  // ทดสอบการเชื่อมต่อแบบปกติทุก 5 นาที
  const intervalId = setInterval(async () => {
    await testFirestoreConnectionStatus();
  }, 5 * 60 * 1000);
  
  // ทดสอบการเชื่อมต่อแบบ realtime
  const unsubscribe = testRealtimeListener(
    (data) => console.log('Realtime connection active, received data:', data),
    (error) => {
      console.error('Realtime connection error:', error);
      showFirestoreDebugTips();
    }
  );
  
  // ทำการทดสอบครั้งแรกทันที
  testFirestoreConnectionStatus().then((result) => {
    if (!result.success) {
      showFirestoreDebugTips();
    }
  });
  
  // คืนค่าฟังก์ชันสำหรับหยุดการติดตาม
  return () => {
    clearInterval(intervalId);
    unsubscribe();
  };
};

export default {
  testFirestoreConnectionStatus,
  testRealtimeListener,
  showFirestoreDebugTips,
  startFirestoreConnectionMonitoring
}; 