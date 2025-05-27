import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';

// ปุ่มล้างข้อมูลและรีเฟรชแอปทั้งหมด
const ClearAndRefreshButton = () => {
  const handleResetApp = () => {
    Alert.alert(
      'ล้างข้อมูลและรีเฟรช',
      'คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมดและออกจากระบบ?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ล้างและรีเฟรช', 
          style: 'destructive',
          onPress: async () => {
            console.log('Starting complete app reset...');
            
            try {
              // ล้าง AsyncStorage ทั้งหมด
              await AsyncStorage.clear();
              console.log('AsyncStorage cleared completely');
              
              // พยายามออกจากระบบ
              const auth = getAuth();
              if (auth.currentUser) {
                await signOut(auth);
                console.log('User signed out');
              }
              
              Alert.alert(
                'การดำเนินการเสร็จสิ้น',
                'ข้อมูลถูกล้างแล้ว แอปจะรีเฟรชเมื่อคุณกด OK',
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      // รีโหลดแอป
                      if (Platform.OS === 'web') {
                        // บน web สามารถรีโหลดได้โดยตรง
                        window.location.reload();
                      } else {
                        // บน mobile ให้แจ้งผู้ใช้ว่าต้องปิด-เปิดแอปใหม่
                        Alert.alert(
                          'การรีเฟรชเสร็จสิ้น',
                          'กรุณาปิดแอปและเปิดใหม่เพื่อให้การเปลี่ยนแปลงมีผล'
                        );
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error during app reset:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถล้างข้อมูลได้: ' + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleResetApp}
    >
      <Text style={styles.text}>ล้างข้อมูลและรีสตาร์ทแอป</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7B1FA2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ClearAndRefreshButton;
