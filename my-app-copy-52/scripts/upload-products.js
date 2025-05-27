// Scripts to upload sample products to Firebase Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, setDoc } = require('firebase/firestore');

// Firebase configuration - matching the config in firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSyDj3hB39bR-vr8NCgRpkvtQWakW4Tf_oNc",
  authDomain: "w21-66bef.firebaseapp.com",
  projectId: "w21-66bef",
  storageBucket: "w21-66bef.firebasestorage.app",
  messagingSenderId: "123093618041",
  appId: "1:123093618041:web:326e9858b010643c9933a8",
  measurementId: "G-4K4Z9ZRYHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample products data
const sampleProducts = require('../sample-products.json');

// Function to check if products already exist
const checkProductsExist = async () => {
  const productsSnapshot = await getDocs(collection(db, 'products'));
  return !productsSnapshot.empty;
};

// Function to upload products to Firestore
const uploadProductsToFirestore = async () => {
  console.log('Starting product upload to Firestore...');
  
  try {
    // Check if products already exist
    const productsExist = await checkProductsExist();
    
    if (productsExist) {
      console.log('Products exist in Firestore. Overwriting with new data...');
      // Continue with upload to overwrite existing products
    }
    
    // Upload each product
    const productsCollection = collection(db, 'products');
    const uploadPromises = sampleProducts.products ? sampleProducts.products.map(async (product) => {
      // Use the id from the product if available, or let Firestore auto-generate
      if (product.id) {
        const docRef = doc(db, 'products', product.id);
        await setDoc(docRef, product);
        console.log(`Added product with ID ${product.id}: ${product.name}`);
      } else {
        await addDoc(productsCollection, product);
        console.log(`Added product: ${product.name}`);
      }
    }) : sampleProducts.map(async (product) => {
      // Use the id from the product if available, or let Firestore auto-generate
      if (product.id) {
        const docRef = doc(db, 'products', product.id);
        await setDoc(docRef, product);
        console.log(`Added product with ID ${product.id}: ${product.name}`);
      } else {
        await addDoc(productsCollection, product);
        console.log(`Added product: ${product.name}`);
      }
    });
    
    await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${sampleProducts.products ? sampleProducts.products.length : sampleProducts.length} products to Firestore.`);
  } catch (error) {
    console.error('Error uploading products:', error);
  }
};

// Execute the upload
uploadProductsToFirestore()
  .then(() => console.log('Product upload script completed.'))
  .catch((error) => console.error('Error running upload script:', error));
