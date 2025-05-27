import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const SELECTED_PRODUCTS_KEY = '@selected_products';

const CartScreen = ({ navigation }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCartFromFirebase();
    });

    return unsubscribe;
  }, [navigation]);
  // โหลดสินค้าจาก Firebase Cart collection
  const loadCartFromFirebase = async () => {
    if (!auth.currentUser) {
      console.log("User not authenticated");
      return;
    }
    
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
      const querySnapshot = await getDocs(cartQuery);
      
      const cartItems = [];
      querySnapshot.forEach((doc) => {
        cartItems.push({
          cartId: doc.id,
          ...doc.data().product
        });
      });
      
      // จัดการรวมสินค้าที่ซ้ำกัน (กรณีมีข้อมูลเก่า)
      const consolidatedItems = [];
      const itemMap = new Map();
      
      cartItems.forEach(item => {
        if (itemMap.has(item.id)) {
          // ถ้ามีสินค้านี้แล้ว เพิ่มจำนวน
          const existingItem = itemMap.get(item.id);
          existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
        } else {
          // ถ้ายังไม่มีสินค้านี้ เพิ่มใหม่และให้มั่นใจว่ามี quantity
          item.quantity = item.quantity || 1;
          itemMap.set(item.id, item);
          consolidatedItems.push(item);
        }
      });
      
      setSelectedProducts(consolidatedItems);
      
      // บันทึกลง AsyncStorage เพื่อให้ใช้งานได้แม้ไม่มีอินเทอร์เน็ต
      await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify(consolidatedItems));
    } catch (error) {
      console.error('Error loading cart from Firebase:', error);
      // หากไม่สามารถโหลดจาก Firebase ได้ ให้ใช้ข้อมูลจาก AsyncStorage แทน
      loadSelectedProducts();
    } finally {
      setLoading(false);
    }
  };
  
  // โหลดข้อมูลจาก AsyncStorage (สำรอง)
  const loadSelectedProducts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SELECTED_PRODUCTS_KEY);
      if (jsonValue != null) {
        setSelectedProducts(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading selected products from AsyncStorage:', error);
    }
  };
  // ลบสินค้าจากตะกร้า
  const removeProduct = async (productId) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const cartQuery = query(
          collection(db, "cart"), 
          where("userId", "==", userId),
          where("product.id", "==", productId)
        );
        
        const querySnapshot = await getDocs(cartQuery);
        
        if (!querySnapshot.empty) {
          // ใช้แค่เอกสารแรกที่พบ (ควรจะมีแค่หนึ่งเอกสารต่อสินค้า)
          const cartItem = querySnapshot.docs[0];
          await deleteDoc(doc(db, "cart", cartItem.id));
          
          // ถ้ามีเอกสารอื่นๆ ให้ลบออกทั้งหมด (เผื่อมีข้อมูลซ้ำในกรณีเก่า)
          if (querySnapshot.docs.length > 1) {
            for (let i = 1; i < querySnapshot.docs.length; i++) {
              await deleteDoc(doc(db, "cart", querySnapshot.docs[i].id));
            }
          }
        }
      }
      
      // อัพเดตสถานะและ AsyncStorage
      const updatedProducts = selectedProducts.filter(p => p.id !== productId);
      setSelectedProducts(updatedProducts);
      await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      Alert.alert('สำเร็จ', 'ลบสินค้าออกจากตะกร้าแล้ว');
    } catch (error) {
      console.error('Error removing product:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  // ล้างตะกร้าทั้งหมด
  const clearCart = async () => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการล้างตะกร้าสินค้าทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบทั้งหมด', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            
            try {
              if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const cartQuery = query(
                  collection(db, "cart"), 
                  where("userId", "==", userId)
                );
                
                const querySnapshot = await getDocs(cartQuery);
                
                // ลบทีละรายการ
                const deletePromises = querySnapshot.docs.map(doc => 
                  deleteDoc(doc.ref)
                );
                
                await Promise.all(deletePromises);
              }
              
              // อัพเดตสถานะและ AsyncStorage
              setSelectedProducts([]);
              await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify([]));
              Alert.alert('สำเร็จ', 'ล้างตะกร้าสินค้าแล้ว');
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถล้างตะกร้าได้');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  // คำนวณราคารวมทั้งหมด
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = product.quantity || 1;
      return total + (parseFloat(product.price || 0) * quantity);
    }, 0);
  };

  // คำนวณจำนวนชิ้นทั้งหมด
  const calculateTotalItems = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.quantity || 1);
    }, 0);
  };

  // เพิ่มจำนวนสินค้า
  const increaseQuantity = async (item) => {
    try {
      setLoading(true);
      
      if (auth.currentUser) {
        const cartQuery = query(
          collection(db, "cart"),
          where("userId", "==", auth.currentUser.uid),
          where("product.id", "==", item.id)
        );
        
        const querySnapshot = await getDocs(cartQuery);
        
        if (!querySnapshot.empty) {
          const cartItem = querySnapshot.docs[0];
          const cartData = cartItem.data();
          const currentQuantity = cartData.product.quantity || 1;
          
          // ตรวจสอบว่าสินค้ามีไม่เกินของในสต็อก
          if (item.stock && currentQuantity >= item.stock) {
            Alert.alert('แจ้งเตือน', `จำนวนสินค้ามีแค่ ${item.stock} ชิ้น`);
            setLoading(false);
            return;
          }
          
          // อัพเดตข้อมูลใน Firestore
          const cartRef = doc(db, "cart", cartItem.id);
          await updateDoc(cartRef, {
            "product.quantity": currentQuantity + 1
          });
          
          // อัพเดตสถานะและ AsyncStorage
          const updatedProducts = selectedProducts.map(p => {
            if (p.id === item.id) {
              return { ...p, quantity: (p.quantity || 1) + 1 };
            }
            return p;
          });
          
          setSelectedProducts(updatedProducts);
          await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify(updatedProducts));
        }
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มจำนวนสินค้าได้');
    } finally {
      setLoading(false);
    }
  };
  
  // ลดจำนวนสินค้า
  const decreaseQuantity = async (item) => {
    try {
      setLoading(true);
      
      if (auth.currentUser) {
        const cartQuery = query(
          collection(db, "cart"),
          where("userId", "==", auth.currentUser.uid),
          where("product.id", "==", item.id)
        );
        
        const querySnapshot = await getDocs(cartQuery);
        
        if (!querySnapshot.empty) {
          const cartItem = querySnapshot.docs[0];
          const cartData = cartItem.data();
          const currentQuantity = cartData.product.quantity || 1;
          
          // ถ้าเหลือชิ้นเดียวและกดลด ให้ลบออกเลย
          if (currentQuantity <= 1) {
            await removeProduct(item.id);
            return;
          }
          
          // อัพเดตข้อมูลใน Firestore
          const cartRef = doc(db, "cart", cartItem.id);
          await updateDoc(cartRef, {
            "product.quantity": currentQuantity - 1
          });
          
          // อัพเดตสถานะและ AsyncStorage
          const updatedProducts = selectedProducts.map(p => {
            if (p.id === item.id) {
              return { ...p, quantity: Math.max(1, (p.quantity || 1) - 1) };
            }
            return p;
          });
          
          setSelectedProducts(updatedProducts);
          await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify(updatedProducts));
        }
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลดจำนวนสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.pic || 'https://via.placeholder.com/150' }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.itemNumber}>{index + 1}.</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.cate}</Text>
          <Text style={styles.productPrice}>฿{item.price} x {item.quantity || 1} = ฿{(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => decreaseQuantity(item)}
        >
          <Ionicons name="remove" size={18} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity || 1}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => increaseQuantity(item)}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeProduct(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Show loading indicator when loading data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลตะกร้า...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตะกร้าสินค้า</Text>
        {selectedProducts.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>ล้างทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedProducts.length > 0 ? (
        <>
          <FlatList
            data={selectedProducts}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>รวมทั้งหมด:</Text>
              <Text style={styles.totalAmount}>฿{calculateTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {calculateTotalItems()} ชิ้น ({selectedProducts.length} รายการ)
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Ionicons name="card-outline" size={20} color="#fff" style={styles.checkoutIcon} />
              <Text style={styles.checkoutButtonText}>สั่งซื้อ</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#ccc" />
          <Text style={styles.emptyTitle}>ตะกร้าสินค้าว่าง</Text>
          <Text style={styles.emptySubtitle}>ยังไม่มีสินค้าในตะกร้า</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="storefront-outline" size={20} color="#fff" style={styles.shopIcon} />
            <Text style={styles.shopButtonText}>เลือกซื้อสินค้า</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 12,
    alignItems: 'center',
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
    minWidth: 24,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  shopButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopIcon: {
    marginRight: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default CartScreen;
