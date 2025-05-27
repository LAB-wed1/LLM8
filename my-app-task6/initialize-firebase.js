// initialize-firebase.js
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc
} = require('firebase/firestore');

// Firebase configuration
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
const db = getFirestore(app);

// ข้อมูลสินค้าตัวอย่าง
const sampleProducts = [
  {
    "id": "1",
    "name": "Pantene แพนทีน มิราเคิล คริสตัล สมูท แชมพู+ครีมนวดผม 500 มล.",
    "price": "599",
    "stock": "2",
    "cate": "ผลิตภัณฑ์ดูแลผม",
    "pic": "http://it2.sut.ac.th/labexample/pics/pantene.jpg"
  },
  {
    "id": "2",
    "name": "ลอรีอัล ปารีส เอลแซฟ เอ็กซ์ตรอว์ดินารี่ ออยล์ 100 มล. (Extraordinary, บำรุงผม, น้ำมันใส่ผม, เซรั่มบำ",
    "price": "259",
    "stock": "0",
    "cate": "ผลิตภัณฑ์ดูแลผม",
    "pic": "http://it2.sut.ac.th/labexample/pics/elseve.jpg"
  },
  {
    "id": "3",
    "name": "Microsoft Surface Pro 7 Laptop with Type Cover",
    "price": "38900",
    "stock": "5",
    "cate": "Computer",
    "pic": "http://it2.sut.ac.th/labexample/pics/surface.jpg"
  },
  {
    "id": "4",
    "name": "Desktop PC DELL Optiplex 3080SFF-SNS38SF001",
    "price": "14400",
    "stock": "3",
    "cate": "Computer",
    "pic": "http://it2.sut.ac.th/labexample/pics/dell.jpg"
  },
  {
    "id": "5",
    "name": "ซัมซุง ตู้เย็น 2 ประตู รุ่น RT20HAR1DSA/ST ขนาด 7.4 คิว",
    "price": "6990",
    "stock": "10",
    "cate": "เครื่องใช้ไฟฟ้า",
    "pic": "http://it2.sut.ac.th/labexample/pics/fridge.jpg"
  }
];

// ฟังก์ชันเพิ่มข้อมูลสินค้าเข้า Firebase
async function initializeProducts() {
  try {
    console.log(`กำลังเพิ่มข้อมูลสินค้า ${sampleProducts.length} รายการเข้า Firestore collection "products1"...`);
    
    for (const product of sampleProducts) {
      const productRef = doc(db, 'products1', product.id);
      await setDoc(productRef, product);
      console.log(`เพิ่มสินค้า "${product.name}" สำเร็จ`);
    }
    
    console.log('✅ เพิ่มข้อมูลสินค้าทั้งหมดเข้า Firebase สำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
  }
}

// เรียกใช้ฟังก์ชัน
initializeProducts(); 