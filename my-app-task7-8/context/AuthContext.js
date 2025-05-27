import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword, 
  getCurrentUser,
  onAuthStateChange,
  getUserData
} from '../api/firebase';

// สร้าง Context
const AuthContext = createContext();

// สร้าง Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ติดตามการเปลี่ยนแปลงสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setUser(user);
        // ดึงข้อมูลผู้ใช้จาก Firestore
        const { data } = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // ทำการ cleanup เมื่อ component unmount
    return () => unsubscribe();
  }, []);

  // ฟังก์ชันสำหรับการเข้าสู่ระบบ
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.error) {
        setLoading(false);
        return { error: result.error };
      }
      // จะได้ user จาก onAuthStateChange อัตโนมัติ
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { error: error.message };
    }
  };

  // ฟังก์ชันสำหรับการสมัครบัญชี
  const register = async (email, password, userData) => {
    setLoading(true);
    try {
      const result = await registerUser(email, password, userData);
      if (result.error) {
        setLoading(false);
        return { error: result.error };
      }
      // จะได้ user จาก onAuthStateChange อัตโนมัติ
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { error: error.message };
    }
  };

  // ฟังก์ชันสำหรับการออกจากระบบ
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      // จะเคลียร์ user จาก onAuthStateChange อัตโนมัติ
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { error: error.message };
    }
  };

  // ฟังก์ชันสำหรับการรีเซ็ตรหัสผ่าน
  const forgotPassword = async (email) => {
    try {
      return await resetPassword(email);
    } catch (error) {
      return { error: error.message };
    }
  };

  // ค่าที่จะส่งไปยัง Context
  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook สำหรับการใช้งาน Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 