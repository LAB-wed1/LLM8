import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_PRODUCTS_KEY = '@selected_products';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    loadSelectedProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filterMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productList);
      console.log(`Loaded ${productList.length} products from Firebase`);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    if (filterMode === 'all') {
      setFilteredProducts(products);
    } else if (filterMode === 'instock') {
      const inStockProducts = products.filter(product => product.stock > 0);
      setFilteredProducts(inStockProducts);
    }
  };

  const loadSelectedProducts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SELECTED_PRODUCTS_KEY);
      if (jsonValue != null) {
        setSelectedProducts(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading selected products:', error);
    }
  };

  const saveSelectedProducts = async (products) => {
    try {
      const jsonValue = JSON.stringify(products);
      await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving selected products:', error);
    }
  };

  const handleProductSelect = async (product) => {
    // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบแล้วหรือไม่
    if (!auth.currentUser) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      return;
    }
    
    // ใช้ alert ธรรมดาแทน Alert.alert เพื่อให้แน่ใจว่าจะแสดงผล
    alert(`คุณเลือกสินค้า: ${product.name}`);
    
    // เพิ่มสินค้าเข้าตะกร้า
    try {
      const userId = auth.currentUser.uid;
      const cartRef = collection(db, "cart");
      
      // บันทึกข้อมูลลง Firestore
      await addDoc(cartRef, {
        userId: userId,
        product: {
          ...product,
          quantity: 1
        },
        addedAt: new Date()
      });
      
      // อัพเดตสถานะและ AsyncStorage
      const newProduct = { ...product, quantity: 1 };
      const newSelectedProducts = [...selectedProducts, newProduct];
      setSelectedProducts(newSelectedProducts);
      await saveSelectedProducts(newSelectedProducts);
      
      alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
      
      // รีเฟรชหน้า (อาจช่วยให้เห็นการเปลี่ยนแปลงทันที)
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('ข้อผิดพลาด: ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
    }
  };
  
  // ฟังก์ชั่นสำหรับเพิ่มจำนวนสินค้าที่มีอยู่แล้ว
  const increaseProductQuantity = async (product) => {
    try {
      const userId = auth.currentUser.uid;
      const cartQuery = query(
        collection(db, "cart"), 
        where("userId", "==", userId),
        where("product.id", "==", product.id)
      );
      
      const querySnapshot = await getDocs(cartQuery);
      
      if (!querySnapshot.empty) {
        // มีรายการสินค้าอยู่แล้ว ทำการอัพเดตจำนวน
        const cartItem = querySnapshot.docs[0];
        const cartData = cartItem.data();
        const currentQuantity = cartData.product.quantity || 1;
        
        // อัพเดตข้อมูลใน Firestore เพิ่มจำนวนขึ้น 1
        const cartRef = doc(db, "cart", cartItem.id);
        await updateDoc(cartRef, {
          "product.quantity": currentQuantity + 1
        });
        
        // อัพเดตสถานะและ AsyncStorage
        const updatedProducts = selectedProducts.map(p => {
          if (p.id === product.id) {
            return { ...p, quantity: (p.quantity || 1) + 1 };
          }
          return p;
        });
        
        setSelectedProducts(updatedProducts);
        await saveSelectedProducts(updatedProducts);
        
        Alert.alert('สำเร็จ', `เพิ่มจำนวน "${product.name}" เป็น ${currentQuantity + 1} ชิ้น`);
      }
    } catch (error) {
      console.error('Error increasing product quantity:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มจำนวนสินค้าได้');
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductSelect(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.pic || 'https://via.placeholder.com/150' }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.cate}</Text>
        <Text style={styles.productPrice}>฿{item.price}</Text>
        <Text style={[
          styles.productStock,
          item.stock > 0 ? styles.inStock : styles.outOfStock
        ]}>
          {item.stock > 0 ? `คงเหลือ: ${item.stock} ชิ้น` : 'หมด'}
        </Text>
      </View>
      <View style={styles.addButton}>
        <Ionicons name="add-circle" size={32} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลจาก Firebase...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>สวัสดี, {auth.currentUser?.displayName || 'ผู้ใช้'}</Text>
          <Text style={styles.headerSubtitle}>รายการสินค้าจาก Firebase</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#007AFF" />
          {selectedProducts.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{selectedProducts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMode === 'all' && styles.activeFilterButton
          ]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filterMode === 'all' && styles.activeFilterButtonText
          ]}>
            ทั้งหมด ({products.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMode === 'instock' && styles.activeFilterButton
          ]}
          onPress={() => setFilterMode('instock')}
        >
          <Text style={[
            styles.filterButtonText,
            filterMode === 'instock' && styles.activeFilterButtonText
          ]}>
            มีสินค้า ({products.filter(p => p.stock > 0).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>ไม่มีสินค้า</Text>
            <Text style={styles.emptySubtext}>ลากลงเพื่อรีเฟรช</Text>
          </View>
        }
      />
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
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
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
  },
  inStock: {
    color: '#28a745',
  },
  outOfStock: {
    color: '#dc3545',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default HomeScreen;
