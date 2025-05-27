// utils/firestoreHelpers.js
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

/**
 * ดึงข้อมูลผู้ใช้จาก Firestore
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Object>} ข้อมูลผู้ใช้
 */
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * บันทึกหรืออัพเดทข้อมูลผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการบันทึก
 * @param {boolean} merge - ถ้าเป็น true จะรวมข้อมูลเดิม, ถ้าเป็น false จะแทนที่ข้อมูลเดิม
 */
export const saveUserData = async (userId, userData, merge = true) => {
  try {
    const userDocRef = doc(db, "users", userId);
    
    if (merge) {
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: new Date()
      });
    } else {
      await setDoc(userDocRef, {
        ...userData,
        updatedAt: new Date()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * สร้างข้อมูลผู้ใช้ใหม่
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการบันทึก
 */
export const createUserData = async (userId, userData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ลบข้อมูลผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 */
export const deleteUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * อัพเดทเวลาเข้าสู่ระบบล่าสุด
 * @param {string} userId - ID ของผู้ใช้
 */
export const updateLastLogin = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      lastLogin: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false, error: error.message };
  }
};
