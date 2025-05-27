import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  connectFirestoreEmulator,
  deleteDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Your web app's Firebase configuration - ปรับตามคำแนะนำใน Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBhZQo8liQDUXZNYnB7vudZ4IGl885zC4U",
  authDomain: "lab-5-a5b9b.firebaseapp.com",
  projectId: "lab-5-a5b9b",
  storageBucket: "lab-5-a5b9b.appspot.com",
  messagingSenderId: "514574867779",
  appId: "1:514574867779:web:24677e3a4994a568f6e3f6",
  measurementId: "G-KR769DVPF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ต้องเปิดใช้งาน Authentication ใน Firebase Console ก่อน!
const auth = getAuth(app);

// Initialize Firestore with settings to improve performance and reliability
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Initialize Storage
const storage = getStorage(app);

// ตั้งค่า persistence เพื่อให้แอพสามารถทำงานได้แม้ไม่มีอินเทอร์เน็ต (เฉพาะ web)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // แสดงว่ามีแท็บหลายแท็บเปิดอยู่
      console.warn('Persistence could not be enabled: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // แสดงว่าเบราว์เซอร์ไม่รองรับ
      console.warn('Persistence is not available in this browser');
    }
  });
} catch (error) {
  console.warn('Firestore persistence initialization error:', error);
}

console.log("Firebase initialized with:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  authInitialized: !!auth,
  firestoreInitialized: !!db,
  storageInitialized: !!storage
});

// User registration function with Firestore
export const registerUser = async (email, password, userData = {}) => {
  try {
    // สร้างบัญชีผู้ใช้ด้วย Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // บันทึกข้อมูลเพิ่มเติมของผู้ใช้ลงใน Firestore
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        ...userData
      });
    }
    
    return { user: userCredential.user };
  } catch (error) {
    console.error("Firebase Registration Error:", error.code, error.message);
    let errorMessage = "Registration failed. Please try again.";
    
    // แปลข้อความข้อผิดพลาดให้เป็นภาษาที่เข้าใจง่าย
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "รหัสผ่านไม่ปลอดภัยเพียงพอ กรุณาใช้รหัสผ่านที่ซับซ้อนกว่านี้";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "มีปัญหาการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    }
    
    return { error: errorMessage };
  }
};

// ฟังก์ชันทดสอบการเชื่อมต่อ Firestore
export const testFirestoreConnection = async () => {
  try {
    // ทดสอบการเรียกดูเอกสาร
    const testRef = doc(db, 'system', 'status');
    const testSnap = await getDoc(testRef);
    
    if (!testSnap.exists()) {
      // สร้างเอกสารทดสอบถ้ายังไม่มี
      await setDoc(testRef, {
        lastChecked: new Date(),
        status: 'online'
      });
      console.log('Created test document successfully');
    } else {
      // อัปเดตเอกสารทดสอบถ้ามีอยู่แล้ว
      await updateDoc(testRef, {
        lastChecked: new Date()
      });
      console.log('Updated test document successfully');
    }
    
    return { success: true, message: 'Firestore connection successful' };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      details: 'ตรวจสอบว่าได้ตั้งค่า Firestore Rules ให้อนุญาตการอ่าน/เขียนข้อมูลหรือไม่'
    };
  }
};

// User login function
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    console.error("Firebase Login Error:", error.code, error.message);
    let errorMessage = "Login failed. Please try again.";
    
    // แปลข้อความข้อผิดพลาดให้เป็นภาษาที่เข้าใจง่าย
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "มีการพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "มีปัญหาการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    }
    
    return { error: errorMessage };
  }
};

// Password reset function
export const resetPassword = async (email) => {
  try {
    console.log(`กำลังส่งคำขอรีเซ็ตรหัสผ่านไปที่ ${email}`);
    
    // เพิ่มตัวเลือกสำหรับอีเมลรีเซ็ตรหัสผ่าน
    const actionCodeSettings = {
      // URL ที่จะเปิดหลังจากรีเซ็ตรหัสผ่านสำเร็จ (อาจไม่ทำงานในบางกรณี ขึ้นอยู่กับการตั้งค่า Firebase)
      url: 'https://lab-5-a5b9b.firebaseapp.com',
      handleCodeInApp: false
    };

    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log("ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ");
    return { success: true };
  } catch (error) {
    console.error("Firebase Reset Password Error:", error.code, error.message);
    let errorMessage = "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ โปรดลองอีกครั้ง";
    
    // แปลข้อความข้อผิดพลาดให้เป็นภาษาที่เข้าใจง่าย
    if (error.code === 'auth/invalid-email') {
      errorMessage = "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลของคุณ";
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = "ไม่พบบัญชีผู้ใช้ที่ตรงกับอีเมลนี้ กรุณาตรวจสอบว่าคุณใช้อีเมลที่ถูกต้อง";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "มีปัญหาการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณและลองอีกครั้ง";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "คุณได้ส่งคำขอรีเซ็ตรหัสผ่านหลายครั้งเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง";
    } else if (error.code === 'auth/missing-android-pkg-name') {
      errorMessage = "เกิดข้อผิดพลาดในการตั้งค่าแอปพลิเคชัน กรุณาติดต่อผู้ดูแลระบบ";
    } else if (error.code === 'auth/missing-continue-uri') {
      errorMessage = "เกิดข้อผิดพลาดในการตั้งค่า URL สำหรับการรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ";
    } else if (error.code === 'auth/missing-ios-bundle-id') {
      errorMessage = "เกิดข้อผิดพลาดในการตั้งค่าแอปพลิเคชัน iOS กรุณาติดต่อผู้ดูแลระบบ";
    } else if (error.code === 'auth/invalid-continue-uri') {
      errorMessage = "URL สำหรับการรีเซ็ตรหัสผ่านไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ";
    } else if (error.code === 'auth/unauthorized-continue-uri') {
      errorMessage = "URL สำหรับการรีเซ็ตรหัสผ่านไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ";
    }
    
    return { 
      error: errorMessage,
      errorCode: error.code,
      originalError: error.message
    };
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Get current user with enhanced error handling
export const getCurrentUser = () => {
  try {
    console.log('Getting current user from auth...');
    const user = auth.currentUser;
    console.log('Current user:', user ? `${user.uid} (${user.email})` : 'No user logged in');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is logged in and set an observer for auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// ฟังก์ชันสำหรับ Firestore

// บันทึกหรืออัพเดทข้อมูลผู้ใช้ใน Firestore
export const saveUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Firestore Save Error:", error);
    return { error: error.message };
  }
};

// ดึงข้อมูลผู้ใช้จาก Firestore
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { data: userSnap.data() };
    } else {
      return { data: null };
    }
  } catch (error) {
    console.error("Firestore Get User Error:", error);
    return { error: error.message };
  }
};

// เพิ่มเอกสารใหม่ใน collection
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date()
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Firestore Add Document Error:", error);
    return { error: error.message };
  }
};

// บันทึกเอกสารด้วย ID ที่กำหนดเอง (จะทับข้อมูลเดิมถ้ามีอยู่แล้ว)
export const setDocument = async (collectionName, docId, data, merge = true) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date()
    }, { merge });
    return { success: true };
  } catch (error) {
    console.error("Firestore Set Document Error:", error);
    return { error: error.message };
  }
};

// อัพเดทเอกสารที่มีอยู่แล้ว
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Firestore Update Document Error:", error);
    return { error: error.message };
  }
};

// ดึงเอกสารด้วย ID
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }};
    } else {
      return { data: null };
    }
  } catch (error) {
    console.error("Firestore Get Document Error:", error);
    return { error: error.message };
  }
};

// ดึงเอกสารทั้งหมดใน collection
export const getCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: documents };
  } catch (error) {
    console.error("Firestore Get Collection Error:", error);
    return { error: error.message };
  }
};

// ค้นหาเอกสารด้วยเงื่อนไข
export const queryDocuments = async (collectionName, field, operator, value) => {
  try {
    const q = query(
      collection(db, collectionName), 
      where(field, operator, value)
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: documents };
  } catch (error) {
    console.error("Firestore Query Error:", error);
    return { error: error.message };
  }
};

// ฟังก์ชันสำหรับ Storage

// อัพโหลดไฟล์ไปยัง Firebase Storage
export const uploadFile = async (uri, path, filename) => {
  try {
    // แปลง URI เป็น blob (สำหรับเว็บและโมบาย)
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // กำหนดตำแหน่งที่จะเก็บไฟล์ใน Storage
    const fileRef = storageRef(storage, `${path}/${filename}`);
    
    // อัพโหลดไฟล์
    const snapshot = await uploadBytes(fileRef, blob);
    
    // ดึง URL สำหรับเข้าถึงไฟล์
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true, 
      url: downloadURL,
      fullPath: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    return { error: error.message };
  }
};

// ดึง URL ของไฟล์จาก Storage path
export const getFileURL = async (path) => {
  try {
    const fileRef = storageRef(storage, path);
    const url = await getDownloadURL(fileRef);
    return { success: true, url };
  } catch (error) {
    console.error("Firebase Storage Get URL Error:", error);
    return { error: error.message };
  }
};

// นำเข้า updateProfile เพื่อให้ไฟล์อื่นสามารถใช้ได้โดยตรง
export { 
  auth, 
  updateProfile,
  db,
  storage
};

// ฟังก์ชันสำหรับลบเอกสารจาก Firestore
export const deleteDocument = async (collectionName, docId) => {
  try {
    if (!docId) {
      console.error('Document ID is required for deletion');
      return false;
    }

    console.log(`Attempting to delete document from ${collectionName} with ID: ${docId}`);
    
    // First check if the document exists
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn(`Document not found in ${collectionName} with ID: ${docId}`);
      return false;
    }
    
    // Document exists, proceed with deletion
    await deleteDoc(docRef);
    
    // Verify deletion was successful
    const verifySnap = await getDoc(docRef);
    if (!verifySnap.exists()) {
      console.log(`Document successfully deleted from ${collectionName}: ${docId}`);
      return true;
    } else {
      console.error(`Deletion verification failed for ${collectionName}: ${docId}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return false;
  }
}; 