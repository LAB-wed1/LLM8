// api/productAPI.js
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  getDocument,
  setDocument
} from './firebase';

// ฟังก์ชันดึงข้อมูลสินค้าจาก API ภายนอก (ไม่ใช้แล้ว แต่เก็บไว้เป็นประวัติ)
export const fetchProducts = async (pageNo) => {
  try {
    const url = `http://it2.sut.ac.th/labexample/product.php?pageno=${pageNo}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API returns data in format { products: [...] }
    if (data && Array.isArray(data.products)) {
      console.log(`Page ${pageNo} data: ${data.products.length} products`);
      return data.products;
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

// ฟังก์ชันดึงข้อมูลสินค้าทั้งหมดจาก Firebase
export const fetchAllProducts = async () => {
  try {
    // ดึงข้อมูลจาก Firebase
    const firebaseProducts = await getProductsFromFirebase();
    
    // ถ้ามีข้อมูลใน Firebase แล้ว ให้คืนค่าจาก Firebase
    if (firebaseProducts && firebaseProducts.length > 0) {
      console.log('Retrieved products from Firebase:', firebaseProducts.length);
      return firebaseProducts;
    }
    
    // ถ้าไม่มีข้อมูลใน Firebase ให้เริ่มต้นด้วยข้อมูลตัวอย่าง
    console.log('No products in Firebase, initializing with sample data');
    await initializeProductsInFirebase();
    
    // ดึงข้อมูลอีกครั้งหลังจากเริ่มต้น
    const initializedProducts = await getProductsFromFirebase();
    return initializedProducts;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

// ฟังก์ชันเริ่มต้นข้อมูลสินค้าใน Firebase ด้วยข้อมูลตัวอย่าง
export const initializeProductsInFirebase = async () => {
  try {
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
    
    console.log(`Initializing Firebase with ${sampleProducts.length} sample products...`);
    
    // บันทึกข้อมูลสินค้าลง Firebase โดยใช้ ID ที่กำหนดไว้
    for (const product of sampleProducts) {
      await setDocument('products1', product.id, product);
    }
    
    console.log('Sample products saved to Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error initializing products in Firebase:', error);
    return false;
  }
};

// ฟังก์ชันบันทึกข้อมูลสินค้าลง Firebase
export const saveProductsToFirebase = async (products) => {
  try {
    // ตรวจสอบว่ามีสินค้าหรือไม่
    if (!products || products.length === 0) {
      console.warn('No products to save to Firebase');
      return false;
    }
    
    console.log(`Saving ${products.length} products to Firebase...`);
    
    // บันทึกข้อมูลสินค้าลง Firebase
    for (const product of products) {
      // ใช้ ID ที่มีอยู่หรือสร้างใหม่ถ้าไม่มี
      const productId = product.id || `product_${Date.now()}`;
      await setDocument('products1', productId, product);
    }
    
    console.log('Products saved to Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error saving products to Firebase:', error);
    return false;
  }
};

// ฟังก์ชันดึงข้อมูลสินค้าจาก Firebase
export const getProductsFromFirebase = async () => {
  try {
    const response = await getCollection('products1');
    
    // ตรวจสอบว่ามี error หรือไม่
    if (response.error) {
      console.error('Error getting products from Firebase:', response.error);
      return [];
    }
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!response.data) {
      console.log('No products data returned from Firebase');
      return [];
    }
    
    console.log('Products retrieved from Firebase:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error getting products from Firebase:', error);
    return [];
  }
};

// ฟังก์ชันค้นหาสินค้าตาม ID
export const getProductById = async (productId) => {
  try {
    const product = await getDocument('products1', productId);
    return product;
  } catch (error) {
    console.error(`Error getting product with ID ${productId}:`, error);
    return null;
  }
};

// ฟังก์ชันอัปเดตข้อมูลสินค้า
export const updateProduct = async (productId, productData) => {
  try {
    await updateDocument('products1', productId, productData);
    return true;
  } catch (error) {
    console.error(`Error updating product with ID ${productId}:`, error);
    return false;
  }
};
