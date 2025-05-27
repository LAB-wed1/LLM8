import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';

const DirectLogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log("DirectLogoutButton - Current auth state:", currentUser ? `Logged in as ${currentUser.email}` : "Not logged in");
  }, []);

  const handlePress = () => {
    setLoading(true);
    console.log("Direct logout initiated");
    
    // สร้าง auth instance ใหม่เพื่อให้แน่ใจว่าใช้อันล่าสุด
    const currentAuth = getAuth();
    console.log("Current auth user:", currentAuth.currentUser ? currentAuth.currentUser.email : "No user");
    
    // ล้าง AsyncStorage ก่อน
    AsyncStorage.clear()
      .then(() => {
        console.log("AsyncStorage cleared");
        // จากนั้นจึงทำการออกจากระบบ Firebase
        return signOut(currentAuth);
      })
      .then(() => {
        console.log("Successfully signed out from Firebase");
        
        // บังคับให้นำทางกลับไปยังหน้าล็อกอิน
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          })
        );
        
        // แสดงข้อความยืนยันการออกจากระบบ
        Alert.alert("สำเร็จ", "ออกจากระบบเรียบร้อยแล้ว");
      })
      .catch(error => {
        console.error("Error during direct logout:", error);
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถออกจากระบบได้: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.text}>ออกจากระบบโดยตรง</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default DirectLogoutButton;
