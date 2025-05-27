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
    // Step 1: Sign out from Firebase first
    console.log('Signing out from Firebase...');
    if (auth) {
      await signOut(auth);
      console.log('Firebase sign out successful');
    } else {
      console.warn('Firebase auth is not available');
      throw new Error('Firebase auth is not available');
    }

    // Step 2: Clear all AsyncStorage data after signout
    console.log('Clearing AsyncStorage...');
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared successfully');
    } catch (storageError) {
      console.warn('AsyncStorage clear warning:', storageError);
      // Continue despite AsyncStorage errors
    }
    
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
