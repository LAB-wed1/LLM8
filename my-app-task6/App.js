import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { startFirestoreConnectionMonitoring } from './utils/FirestoreDebugTools';

export default function App() {
  // ตรวจสอบการเชื่อมต่อ Firestore ในพื้นหลัง (ไม่แสดงใน UI)
  useEffect(() => {
    // เริ่มตรวจสอบการเชื่อมต่อ Firestore ในพื้นหลัง
    const stopMonitoring = startFirestoreConnectionMonitoring();
    
    // ทำความสะอาดเมื่อคอมโพเนนต์ถูกยกเลิก
    return () => {
      stopMonitoring();
    };
  }, []);

  // หน้าหลักของแอป
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
