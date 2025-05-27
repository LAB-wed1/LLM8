import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { resetPassword } from '../api/firebase';

const ForgotScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('กรุณากรอกอีเมล', 'โปรดกรอกอีเมลที่คุณใช้ในการลงทะเบียน');
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'โปรดตรวจสอบรูปแบบอีเมลของคุณและลองอีกครั้ง');
      return;
    }

    setLoading(true);
    try {
      console.log("กำลังส่งอีเมลรีเซ็ตรหัสผ่านไปที่:", email);
      const { success, error } = await resetPassword(email);
      
      if (error) {
        console.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน:", error);
        Alert.alert(
          'ไม่สามารถรีเซ็ตรหัสผ่านได้', 
          error,
          [{ text: "ตกลง" }]
        );
        setLoading(false);
        return;
      }
      
      if (success) {
        console.log("ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ");
        Alert.alert(
          "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
          "เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว โปรดตรวจสอบกล่องจดหมายของคุณและทำตามคำแนะนำ",
          [{ text: "ตกลง", onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      console.error("ข้อผิดพลาดที่ไม่ได้จัดการ:", error);
      Alert.alert(
        'เกิดข้อผิดพลาด', 
        `ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ โปรดลองอีกครั้งในภายหลัง\n\nรายละเอียดข้อผิดพลาด: ${error.message || 'ไม่ทราบสาเหตุ'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ลืมรหัสผ่าน</Text>
      
      <Text style={styles.description}>
        กรอกอีเมลที่คุณใช้ในการลงทะเบียน เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณ
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอกอีเมลของคุณ"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>รีเซ็ตรหัสผ่าน</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>กลับไปยังหน้าเข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default ForgotScreen;
