// utils/authHelpers.js
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ฟังก์ชันสำหรับออกจากระบบที่มีการจัดการ error และ cleanup ที่ครบถ้วน
 */
export const performLogout = async () => {
  console.log('Starting logout process...');
  
  try {
    // Step 1: Clear all AsyncStorage data
    console.log('Clearing AsyncStorage...');
    const keys = await AsyncStorage.getAllKeys();
    console.log('Found AsyncStorage keys:', keys);
    
    await AsyncStorage.multiRemove([
      '@selected_products',
      '@user_data',
      '@cart_items',
      '@user_preferences'
    ]);
    console.log('AsyncStorage cleared successfully');
    
    // Step 2: Sign out from Firebase
    console.log('Signing out from Firebase...');
    await signOut(auth);
    console.log('Firebase sign out successful');
    
    return { success: true };
    
  } catch (error) {
    console.error('Logout error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return { 
      success: false, 
      error: error.message || 'เกิดข้อผิดพลาดในการออกจากระบบ' 
    };
  }
};

/**
 * ฟังก์ชันตรวจสอบสถานะการเชื่อมต่อกับ Firebase
 */
export const checkFirebaseConnection = () => {
  try {
    const currentUser = auth.currentUser;
    console.log('Firebase connection check:', {
      isConnected: !!auth,
      currentUser: currentUser ? currentUser.email : 'No user',
      authState: auth.currentUser ? 'authenticated' : 'not authenticated'
    });
    
    return {
      isConnected: !!auth,
      hasUser: !!currentUser,
      userEmail: currentUser?.email
    };
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return {
      isConnected: false,
      error: error.message
    };
  }
};
