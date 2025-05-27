import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';

// คอมโพเนนต์ปุ่มออกจากระบบฉุกเฉินที่ทำงานอิสระจากระบบนำทาง
const EmergencyLogoutButton = () => {
  const [processing, setProcessing] = useState(false);

  const handleEmergencyLogout = () => {
    if (processing) return;
    setProcessing(true);
    
    // แจ้งผู้ใช้ว่ากำลังดำเนินการ
    console.log('Emergency logout in progress...');
    Alert.alert('กำลังออกจากระบบ', 'โปรดรอสักครู่...');
    
    try {      // ล้าง AsyncStorage ก่อน
      AsyncStorage.clear().then(() => {
        console.log('AsyncStorage cleared');
        
        // ใช้ auth instance ที่มีอยู่แล้ว
        const currentAuth = getAuth();
        
        console.log('Current auth state before emergency logout:', 
          currentAuth.currentUser ? `Logged in as ${currentAuth.currentUser.email}` : 'Not logged in');
        
        // พยายามออกจากระบบ
        signOut(currentAuth).then(() => {
          console.log('Firebase sign out successful');
          Alert.alert('สำเร็จ', 'ออกจากระบบเรียบร้อยแล้ว กรุณารีเฟรชหน้าจอ');
          
          // รีโหลดหน้าเว็บ (เฉพาะบน web)
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }).catch(error => {
          console.error('Sign out error:', error);
          Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้: ' + error.message);
        }).finally(() => {
          setProcessing(false);
        });
      }).catch(error => {
        console.error('AsyncStorage clear error:', error);
        setProcessing(false);
      });
    } catch (error) {
      console.error('Emergency logout failed:', error);
      Alert.alert('เกิดข้อผิดพลาดร้ายแรง', 'กรุณาปิดและเปิดแอปใหม่');
      setProcessing(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleEmergencyLogout}
      disabled={processing}
    >
      <Text style={styles.text}>ออกจากระบบฉุกเฉิน</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: 'red',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default EmergencyLogoutButton;
