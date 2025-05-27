// components/LogoutButton.js
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            // วิธีที่เรียบง่ายและตรงไปตรงมาที่สุด
            signOut(auth)
              .then(() => {
                console.log('Firebase sign out successful');
                // ทำการล้าง AsyncStorage
                return AsyncStorage.clear();
              })
              .then(() => {
                console.log('All AsyncStorage data cleared');
                // นำทางผู้ใช้กลับไปยังหน้าล็อกอิน
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }]
                });
              })
              .catch(error => {
                console.error('Error signing out:', error);
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้');
                setLoading(false);
              });
          }
        }
      ]
    );
  };
  const directLogout = () => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        console.log("Direct sign out successful");
        // ล้าง AsyncStorage
        return AsyncStorage.clear();
      })
      .then(() => {
        console.log("Storage cleared directly");
      })
      .catch(error => {
        console.error("Direct logout error:", error);
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogout}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>ออกจากระบบ (แบบมี Alert)</Text>
        )}
      </TouchableOpacity>
      
      {/* ปุ่มออกจากระบบแบบตรงไปตรงมาที่สุด ไม่มี Alert */}
      <TouchableOpacity 
        style={[styles.button, {backgroundColor: '#dc3545', marginTop: 8}]}
        onPress={directLogout}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>ออกจากระบบทันที</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff6b35',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LogoutButton;
