// ไฟล์นี้เป็นตัวอย่างการใช้งานฟังก์ชันต่างๆ ของ Firebase
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { 
  registerUser,
  loginUser, 
  resetPassword,
  logoutUser,
  getCurrentUser,
  onAuthStateChange,
  saveUserData,
  getUserData,
  addDocument,
  setDocument,
  updateDocument,
  getDocument,
  getCollection,
  queryDocuments,
  uploadFile,
  getFileURL
} from './firebase';

// ตัวอย่างการตั้งค่า Firebase Config
// คุณได้ตั้งค่าใน firebase.js แล้ว ไม่จำเป็นต้องทำซ้ำอีก

// ตัวอย่างการสมัครบัญชีและบันทึกข้อมูลผู้ใช้ลงใน Firestore
export const exampleRegister = async (email, password, name) => {
  try {
    const userData = {
      name: name,
      role: 'user',
      createdAt: new Date()
    };
    
    const { user, error } = await registerUser(email, password, userData);
    
    if (error) {
      return { error };
    }
    
    // ข้อมูลผู้ใช้จะถูกบันทึกลงใน Firestore แล้วโดยอัตโนมัติใน registerUser
    return { success: true, user };
  } catch (error) {
    return { error: error.message };
  }
};

// ตัวอย่างการเข้าสู่ระบบ
export const exampleLogin = async (email, password) => {
  try {
    const { user, error } = await loginUser(email, password);
    
    if (error) {
      return { error };
    }
    
    // ดึงข้อมูลผู้ใช้จาก Firestore
    if (user) {
      const { data, error: userDataError } = await getUserData(user.uid);
      
      if (userDataError) {
        return { error: userDataError };
      }
      
      return { success: true, user, userData: data };
    }
    
    return { success: true, user };
  } catch (error) {
    return { error: error.message };
  }
};

// ตัวอย่างการรีเซ็ตรหัสผ่าน
export const exampleResetPassword = async (email) => {
  return await resetPassword(email);
};

// ตัวอย่างการลงชื่อออกจากระบบ
export const exampleLogout = async () => {
  return await logoutUser();
};

// ตรวจสอบสถานะการเข้าสู่ระบบและติดตามการเปลี่ยนแปลง
export const exampleAuthStateObserver = (callback) => {
  return onAuthStateChange((user) => {
    if (user) {
      // ผู้ใช้เข้าสู่ระบบแล้ว
      // ดึงข้อมูลผู้ใช้จาก Firestore
      getUserData(user.uid).then(({ data, error }) => {
        if (error) {
          callback(null, error);
        } else {
          callback({ user, userData: data });
        }
      });
    } else {
      // ผู้ใช้ไม่ได้เข้าสู่ระบบ
      callback(null);
    }
  });
};

// ตัวอย่างการเพิ่มหรือบันทึกข้อมูลลง Firestore
export const exampleSaveData = async (data, collectionName, documentId = null) => {
  if (documentId) {
    // บันทึกข้อมูลด้วย ID ที่กำหนด (จะทับข้อมูลเดิมถ้ามี)
    return await setDocument(collectionName, documentId, data);
  } else {
    // เพิ่มเอกสารใหม่ด้วย ID อัตโนมัติ
    return await addDocument(collectionName, data);
  }
};

// ตัวอย่างการอัปเดตข้อมูลใน Firestore
export const exampleUpdateData = async (collectionName, documentId, data) => {
  return await updateDocument(collectionName, documentId, data);
};

// ตัวอย่างการดึงข้อมูลจาก Firestore
export const exampleGetData = async (collectionName, documentId = null) => {
  if (documentId) {
    // ดึงข้อมูลเอกสารเดียว
    return await getDocument(collectionName, documentId);
  } else {
    // ดึงข้อมูลทั้งหมดใน collection
    return await getCollection(collectionName);
  }
};

// ตัวอย่างการค้นหาข้อมูลใน Firestore
export const exampleQueryData = async (collectionName, field, operator, value) => {
  return await queryDocuments(collectionName, field, operator, value);
};

// ตัวอย่างการเลือกรูปภาพจากเครื่องและอัปโหลดไป Storage
export const examplePickAndUploadImage = async (userId) => {
  try {
    // ขออนุญาตเข้าถึงแกลเลอรี่
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to upload images');
      return { error: 'Permission denied' };
    }
    
    // เปิดแกลเลอรี่ให้ผู้ใช้เลือกรูปภาพ
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (pickerResult.canceled) {
      return { canceled: true };
    }
    
    // อ่าน URI ของรูปภาพ
    const imageUri = pickerResult.assets[0].uri;
    
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const filename = `${userId}_${new Date().getTime()}.jpg`;
    
    // อัปโหลดไฟล์ไปยัง Firebase Storage
    const { success, url, error, fullPath } = await uploadFile(imageUri, `users/${userId}/images`, filename);
    
    if (error) {
      return { error };
    }
    
    // บันทึกข้อมูล URL ของรูปภาพลงใน Firestore
    if (userId) {
      await updateDocument('users', userId, {
        profilePicture: url,
        profilePicturePath: fullPath
      });
    }
    
    return { success, url, fullPath };
  } catch (error) {
    return { error: error.message };
  }
};

// ตัวอย่างการดึง URL ของรูปภาพจาก Storage
export const exampleGetImageURL = async (path) => {
  return await getFileURL(path);
};

// ตัวอย่างการใช้งานทั้งหมดรวมกัน (ฟังก์ชันนี้เป็นแค่ตัวอย่างลำดับการทำงาน)
export const completeExample = async () => {
  try {
    // 1. สมัครบัญชี
    const { user, error: registerError } = await exampleRegister(
      'user@example.com', 
      'password123', 
      'Example User'
    );
    
    if (registerError) {
      console.error("Registration Error:", registerError);
      return;
    }
    
    // 2. เข้าสู่ระบบ
    const { user: loggedInUser, userData, error: loginError } = await exampleLogin(
      'user@example.com',
      'password123'
    );
    
    if (loginError) {
      console.error("Login Error:", loginError);
      return;
    }
    
    // 3. บันทึกข้อมูลเพิ่มเติม
    await exampleUpdateData('users', loggedInUser.uid, {
      lastLogin: new Date(),
      status: 'active'
    });
    
    // 4. อัปโหลดรูปภาพ
    const { url: imageUrl, error: uploadError } = await examplePickAndUploadImage(loggedInUser.uid);
    
    if (uploadError) {
      console.error("Upload Error:", uploadError);
    }
    
    // 5. สร้าง collection ใหม่ เช่น บันทึกประจำวัน
    const { id: noteId, error: addError } = await exampleSaveData(
      {
        title: 'บันทึกประจำวัน',
        content: 'นี่คือตัวอย่างบันทึกประจำวัน',
        userId: loggedInUser.uid
      },
      'notes'
    );
    
    if (addError) {
      console.error("Add Document Error:", addError);
    }
    
    // 6. ดึงข้อมูลบันทึกทั้งหมดของผู้ใช้
    const { data: userNotes, error: queryError } = await exampleQueryData(
      'notes',
      'userId',
      '==',
      loggedInUser.uid
    );
    
    if (queryError) {
      console.error("Query Error:", queryError);
    } else {
      console.log("User Notes:", userNotes);
    }
    
    // 7. ออกจากระบบ
    await exampleLogout();
    
  } catch (error) {
    console.error("Complete Example Error:", error);
  }
};

export default {
  exampleRegister,
  exampleLogin,
  exampleResetPassword,
  exampleLogout,
  exampleAuthStateObserver,
  exampleSaveData,
  exampleUpdateData,
  exampleGetData,
  exampleQueryData,
  examplePickAndUploadImage,
  exampleGetImageURL,
  completeExample
}; 