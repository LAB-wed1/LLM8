import React, { createContext, useState, useContext, useEffect } from 'react';
import { addDocument, updateDocument, getCollection, getCurrentUser, deleteDocument } from '../api/firebase';
import { doc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../api/firebase';

// Create cart context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from Firebase on mount
  useEffect(() => {
    loadCartFromFirebase();
  }, []);
  // Load cart from Firebase with timeout protection
  const loadCartFromFirebase = async () => {
    // Set a timeout to prevent loading state getting stuck
    const loadingTimeout = setTimeout(() => {
      console.warn('Cart loading timed out after 10 seconds');
      setLoading(false);
      setError('การโหลดข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
    }, 10000); // 10 seconds timeout
    
    try {
      setLoading(true);
      console.log('Starting to load cart from Firebase');
      const user = getCurrentUser();
      
      if (!user) {
        console.log('No user logged in, skipping Firebase cart load');
        clearTimeout(loadingTimeout);
        setLoading(false);
        setCartItems([]); // Clear cart items for non-logged in users
        return;
      }
      
      console.log('User found, loading cart items for user ID:', user.uid);
      
      // Query documents directly using Firebase SDK
      try {
        console.log('Querying cart collection directly with Firebase SDK...');
        const querySnapshot = await getDocs(collection(db, 'cart'));
        const userCartItems = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter by current user's userId
          if (data.userId === user.uid) {
            // Store the document ID as docId
            userCartItems.push({ 
              ...data, 
              docId: doc.id // Store the actual Firestore document ID
            });
          }
        });
        
        console.log(`Found ${userCartItems.length} cart items for current user`);
        
        if (userCartItems.length > 0) {
          // Log each item for debugging
          userCartItems.forEach((item, index) => {
            console.log(`Cart item ${index + 1}:`, {
              id: item.id,
              cartId: item.cartId,
              docId: item.docId, // This should now be the actual Firestore document ID
              name: item.name,
              price: item.price,
              quantity: item.quantity
            });
          });
          
          setCartItems(userCartItems);
          console.log('Loaded cart items from Firebase:', userCartItems.length);
        } else {
          console.log('No cart items found for user');
          setCartItems([]);
        }
        
      } catch (firestoreError) {
        console.error('Error querying Firestore directly:', firestoreError);
        
        // Fallback to using the getCollection function if direct query fails
        console.log('Falling back to getCollection method...');
        const result = await getCollection('cart');
        
        console.log('Raw cart collection result:', result);
        
        if (result.error) {
          console.error('Error loading cart collection:', result.error);
          setError('Failed to load cart data');
          clearTimeout(loadingTimeout);
          setLoading(false);
          return;
        }
        
        const cartData = result.data || [];
        console.log('All cart items retrieved:', cartData.length);
        
        // Safeguard against undefined userId
        if (!user.uid) {
          console.error('User ID is undefined, cannot filter cart items');
          clearTimeout(loadingTimeout);
          setLoading(false);
          return;
        }
        
        // Filter cart items by the current user's userId
        const userCart = cartData.filter(item => {
          const matches = item.userId === user.uid;
          if (!matches) {
            console.log('Skipping item, userId mismatch:', item.id, item.userId, 'vs', user.uid);
          }
          return matches;
        });
        
        console.log('Filtered cart items for current user:', userCart.length);
        
        if (userCart.length > 0) {
          // Log each item for debugging
          userCart.forEach((item, index) => {
            console.log(`Cart item ${index + 1}:`, {
              id: item.id,
              cartId: item.cartId,
              docId: item.id, // Use the item.id as docId since it's the Firestore document ID
              name: item.name,
              price: item.price,
              quantity: item.quantity
            });
          });
          
          // Add docId to each item if not present
          const cartItemsWithDocId = userCart.map(item => ({
            ...item,
            docId: item.docId || item.id // Use existing docId or fallback to item.id
          }));
          
          setCartItems(cartItemsWithDocId);
          console.log('Loaded cart items from Firebase:', cartItemsWithDocId.length);
        } else {
          console.log('No cart items found for user');
          setCartItems([]);
        }
      }
      
      // Clear the error state if loading was successful
      setError(null);
    } catch (err) {
      console.error('Error loading cart from Firebase:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      clearTimeout(loadingTimeout);
      setLoading(false);
      console.log('Cart loading process completed');
    }
  };

  // Save cart to Firebase
  const saveCartToFirebase = async (items) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log('User not logged in, cart saved locally only');
        return false;
      }
      
      for (const item of items) {
        // Use the product ID as the document ID
        const cartItemData = {
          ...item,
          userId: user.uid,
          timestamp: new Date()
        };
        
        const result = await addDocument('cart', cartItemData);
        if (result.error) {
          console.error('Error adding cart item:', result.error);
          return false;
        }
      }
      
      console.log('Cart saved to Firebase successfully');
      return true;
    } catch (err) {
      console.error('Error saving cart to Firebase:', err);
      setError('Failed to save cart to database.');
      return false;
    }
  };

  // Add item to cart
  const addToCart = async (product) => {
    try {
      const user = getCurrentUser();
      
      setCartItems(prevItems => {
        // Check if the item already exists in the cart
        const existingItem = prevItems.find(item => item.id === product.id);
        
        let updatedItems;
        
        if (existingItem) {
          // If it exists, increase quantity
          updatedItems = prevItems.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
          
          // If user is logged in, update quantity in Firebase
          if (user && existingItem.docId) {
            updateDocument('cart', existingItem.docId, {
              ...existingItem,
              quantity: existingItem.quantity + 1,
              userId: user.uid,
              updatedAt: new Date()
            });
          }
        } else {
          // If it doesn't exist, add new item with quantity 1
          const newItem = { 
            ...product, 
            quantity: 1,
            cartId: `${product.id}_${Date.now()}` // Add unique cart ID
          };
          
          // Save new item to Firebase
          if (user) {
            // Add document and store the returned document ID
            addDocument('cart', {
              ...newItem,
              userId: user.uid,
              timestamp: new Date()
            }).then(result => {
              if (result && result.id) {
                // Update the local cart item with the Firebase document ID
                setCartItems(currentItems => 
                  currentItems.map(item => 
                    item.cartId === newItem.cartId 
                      ? { ...item, docId: result.id } 
                      : item
                  )
                );
              }
            });
          }
          
          updatedItems = [...prevItems, newItem];
        }
        
        return updatedItems;
      });
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Failed to add item to cart.');
    }
  };

  // Update item quantity
  const updateQuantity = (id, change) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null; // Will be filtered out below
          }
          
          // Update item in Firebase
          const user = getCurrentUser();
          if (user) {
            const cartItemToUpdate = { ...item, quantity: newQuantity };
            updateDocument('cart', item.cartId || item.id, cartItemToUpdate);
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean); // Remove null items
      
      return updatedItems;
    });
  };

  // Set direct quantity
  const setDirectQuantity = (id, quantity) => {
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) return;
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === id) {
          // Update item in Firebase
          const user = getCurrentUser();
          if (user) {
            const cartItemToUpdate = { ...item, quantity: parsedQuantity };
            updateDocument('cart', item.cartId || item.id, cartItemToUpdate);
          }
          
          return { ...item, quantity: parsedQuantity };
        }
        return item;
      });
      
      return updatedItems;
    });
  };
  // Remove item from cart (both local and Firebase)
  const removeFromCart = async (item) => {
    try {
      console.log('===== เริ่มกระบวนการลบสินค้า =====');
      console.log('ข้อมูลสินค้าที่จะลบ:', item);
      
      if (!item || !item.id) {
        console.error('ไม่สามารถลบสินค้าได้: ข้อมูลสินค้าไม่ถูกต้อง');
        return false;
      }
      
      // Remove from local state immediately for better UX
      console.log('ลบสินค้าออกจาก state ในแอพ');
      setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
      
      // Remove from Firebase
      const user = getCurrentUser();
      if (!user) {
        console.error('ไม่สามารถลบสินค้าได้: ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');
        return false;
      }
      
      console.log('รายละเอียดสินค้าที่จะลบ:', {
        id: item.id,
        docId: item.docId,
        cartId: item.cartId,
        name: item.name
      });
      
      let deleted = false;
      
      // Try to delete by document ID first (most reliable)
      if (item.docId) {
        console.log('พยายามลบโดยใช้ docId:', item.docId);
        try {
          const docRef = doc(db, 'cart', item.docId);
          await deleteDoc(docRef);
          console.log('✅ ลบสินค้าสำเร็จโดยใช้ docId');
          deleted = true;
        } catch (error) {
          console.error('❌ เกิดข้อผิดพลาดในการลบโดยใช้ docId:', error);
        }
      }
      
      // If direct deletion failed, search for matching items
      if (!deleted) {
        console.log('การลบโดยตรงไม่สำเร็จ กำลังค้นหาสินค้าที่ตรงกัน...');
        try {
          // Query for matching items by userId and product id
          console.log('กำลังค้นหาสินค้าในตะกร้าของผู้ใช้ userId:', user.uid);
          const querySnapshot = await getDocs(collection(db, 'cart'));
          let matchingItems = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId === user.uid && data.id === item.id) {
              matchingItems.push({ 
                docId: doc.id,  // Actual Firestore document ID
                ...data 
              });
              console.log('พบสินค้าที่ตรงกัน:', doc.id, data.name);
            }
          });
          
          console.log(`พบสินค้าที่ตรงกัน: ${matchingItems.length} รายการ`);
          
          // Delete all matching items
          for (const matchingItem of matchingItems) {
            console.log('พยายามลบสินค้าที่ตรงกัน docId:', matchingItem.docId);
            try {
              const docRef = doc(db, 'cart', matchingItem.docId);
              await deleteDoc(docRef);
              console.log('✅ ลบสินค้าที่ตรงกันสำเร็จ');
              deleted = true;
            } catch (error) {
              console.error(`❌ เกิดข้อผิดพลาดในการลบสินค้าที่ตรงกัน ${matchingItem.docId}:`, error);
            }
          }
        } catch (queryError) {
          console.error('❌ เกิดข้อผิดพลาดในการค้นหาสินค้า:', queryError);
        }
      }
      
      // Force a refresh of the cart data after deletion attempts
      console.log('กำลังรีเฟรชข้อมูลตะกร้าสินค้า...');
      await loadCartFromFirebase();
      
      if (deleted) {
        console.log('✅ กระบวนการลบสินค้าเสร็จสิ้น: สำเร็จ');
      } else {
        console.log('❌ กระบวนการลบสินค้าเสร็จสิ้น: ไม่สำเร็จ');
      }
      
      return deleted;
    } catch (error) {
      console.error('❌❌❌ เกิดข้อผิดพลาดในกระบวนการลบสินค้า:', error);
      setError('Failed to remove item from cart.');
      // Force a refresh of the cart data to ensure sync
      await loadCartFromFirebase();
      return false;
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  // Create order in Firebase
  const createOrder = async () => {
    try {
      console.log('===== เริ่มกระบวนการสร้างคำสั่งซื้อ =====');
      
      const user = getCurrentUser();
      if (!user || cartItems.length === 0) {
        console.error('ไม่สามารถสร้างคำสั่งซื้อได้: ผู้ใช้ยังไม่ได้เข้าสู่ระบบหรือตะกร้าว่างเปล่า');
        return false;
      }

      // Create order document with the required fields
      const orderData = {
        userId: user.uid,
        orderItems: cartItems,
        timestamp: new Date(),
        status: "pending"
      };

      console.log('ข้อมูลคำสั่งซื้อที่จะบันทึก:', {
        userId: orderData.userId,
        itemCount: orderData.orderItems.length,
        timestamp: orderData.timestamp,
        status: orderData.status
      });

      // Save order to Firebase in 'order' collection
      console.log('กำลังบันทึกคำสั่งซื้อลงใน Collection "order"...');
      const orderResult = await addDocument('order', orderData);
      
      if (orderResult.error) {
        console.error('❌ เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ:', orderResult.error);
        return false;
      }
      
      console.log('✅ บันทึกคำสั่งซื้อสำเร็จ ID:', orderResult.id);

      // Clear cart items in Firebase - using a more thorough approach
      console.log('===== เริ่มกระบวนการลบสินค้าในตะกร้าหลังการสั่งซื้อ =====');
      let allDeleted = true;
      
      try {
        // Get all cart items for this user to ensure we delete everything
        console.log('กำลังค้นหาสินค้าในตะกร้าของผู้ใช้ userId:', user.uid);
        const querySnapshot = await getDocs(collection(db, 'cart'));
        const userCartItems = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid) {
            userCartItems.push({ 
              docId: doc.id, // Store the actual Firestore document ID
              ...data 
            });
            console.log('พบสินค้าในตะกร้า:', doc.id, data.name || 'unknown item');
          }
        });
        
        console.log(`พบสินค้าในตะกร้าที่ต้องลบ: ${userCartItems.length} รายการ`);
        
        // Process each item
        let successCount = 0;
        let failCount = 0;
        
        // Perform deletions one by one and log results
        for (const item of userCartItems) {
          try {
            if (!item.docId) {
              console.error(`❌ ไม่สามารถลบสินค้าได้: ไม่มี docId สำหรับสินค้า ${item.name || 'unknown item'}`);
              failCount++;
              continue;
            }
            
            console.log(`กำลังลบสินค้า: ${item.docId} (${item.name || 'unknown item'})`);
            const docRef = doc(db, 'cart', item.docId);
            await deleteDoc(docRef);
            console.log(`✅ ลบสินค้าสำเร็จ: ${item.docId}`);
            successCount++;
          } catch (deleteError) {
            console.error(`❌ เกิดข้อผิดพลาดในการลบสินค้า ${item.docId}:`, deleteError);
            failCount++;
            allDeleted = false;
          }
        }
        
        console.log(`===== สรุปการลบสินค้าในตะกร้า: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ =====`);
      } catch (cleanupError) {
        console.error('❌❌❌ เกิดข้อผิดพลาดในกระบวนการลบสินค้าในตะกร้า:', cleanupError);
        allDeleted = false;
      }

      // Clear local cart immediately for better UX
      console.log('ลบสินค้าออกจาก state ในแอพ');
      setCartItems([]);
      
      // Force a refresh of the cart data to ensure UI is updated
      console.log('กำลังรีเฟรชข้อมูลตะกร้าสินค้า...');
      await loadCartFromFirebase();
      
      console.log('===== กระบวนการสร้างคำสั่งซื้อเสร็จสิ้น =====');
      return true;
    } catch (error) {
      console.error('❌❌❌ เกิดข้อผิดพลาดในกระบวนการสร้างคำสั่งซื้อ:', error);
      setError('Failed to create order.');
      return false;
    }
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    setDirectQuantity,
    removeFromCart,
    calculateTotal,
    saveCartToFirebase,
    createOrder,
    loadCartFromFirebase,
    loading,
    error
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 