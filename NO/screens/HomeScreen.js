import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar, 
  View, 
  Text, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key สำหรับเก็บข้อมูลใน AsyncStorage
const SELECTED_PRODUCTS_KEY = '@selected_products';

// ฟังก์ชันสำหรับบันทึกรายการสินค้าที่เลือกลง AsyncStorage
const saveSelectedProducts = async (selectedProducts) => {
  try {
    const jsonValue = JSON.stringify(selectedProducts);
    await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, jsonValue);
    console.log('บันทึกสินค้าที่เลือกลง AsyncStorage สำเร็จ:', selectedProducts);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกสินค้าที่เลือก:', error);
  }
};

// ฟังก์ชันสำหรับโหลดรายการสินค้าที่เลือกจาก AsyncStorage
const loadSelectedProducts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SELECTED_PRODUCTS_KEY);
    if (jsonValue != null) {
      const selectedProducts = JSON.parse(jsonValue);
      console.log('โหลดสินค้าที่เลือกจาก AsyncStorage สำเร็จ:', selectedProducts);
      return selectedProducts;
    }
    return [];
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดสินค้าที่เลือก:', error);
    return [];
  }
};

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  useEffect(() => {
    fetchProducts();
    loadStoredSelectedProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filterMode]);
  
  // ฟังก์ชันสำหรับโหลดรายการสินค้าที่เลือกจาก AsyncStorage เมื่อเริ่มแอป
  const loadStoredSelectedProducts = async () => {
    const storedSelectedProducts = await loadSelectedProducts();
    setSelectedProducts(storedSelectedProducts);
  };  // ฟังก์ชันสำหรับดึงข้อมูลจาก API พร้อมการ pagination
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // เตรียมตัวแปรสำหรับเก็บสินค้าทั้งหมด
      const allProducts = [];
      let pageNo = 1;
      let hasMoreData = true;

      console.log('Starting to fetch products from API...');
      
      while (hasMoreData) {
        const url = `https://it2.sut.ac.th/labexample/product.php?pageno=${pageNo}`;
        console.log(`Fetching from URL: ${url} (Page ${pageNo})`);

        try {
          // ทำการเรียก API
          const response = await fetch(url);
          console.log(`Response received for page ${pageNo}:`, response.status);

          if (!response.ok) {
            console.log(`Response not OK for page ${pageNo}, status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const text = await response.text();
          console.log(`Raw response for page ${pageNo} (first 100 chars):`, text.substring(0, 100));
          
          if (!text || text.trim() === '') {
            console.log(`Empty response for page ${pageNo}`);
            hasMoreData = false;
            break;
          }
          
          let data;
          try {
            data = JSON.parse(text);
            console.log(`Parsed data for page ${pageNo}:`, data);
          } catch (parseError) {
            console.error(`JSON parse error for page ${pageNo}:`, parseError);
            console.log(`Failed to parse: ${text}`);
            hasMoreData = false;
            break;
          }
          
          // ตรวจสอบว่ามีข้อมูลสินค้าในหน้านี้หรือไม่
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`Found ${data.length} products on page ${pageNo}`);
            
            const formattedData = data.map((item) => ({
              id: item.id?.toString() || Math.random().toString(),
              name: item.title || item.name || "ไม่มีชื่อ",
              price: item.price || "0",
              stock: parseInt(item.stock || 0),
              cate: item.category || item.cate || "ไม่ระบุหมวดหมู่",
              pic: item.image || item.pic || "https://via.placeholder.com/150"
            }));
            
            allProducts.push(...formattedData);
            console.log(`Added ${formattedData.length} products from page ${pageNo}. Total so far: ${allProducts.length}`);
            
            // ไปดึงข้อมูลหน้าถัดไป
            pageNo++;
            // หน่วงเวลาเล็กน้อยเพื่อป้องกันการเรียก API เร็วเกินไป
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.log(`No data or empty array from API at page ${pageNo}`);
            hasMoreData = false;
          }
        } catch (fetchError) {
          console.error(`Error fetching page ${pageNo}:`, fetchError);
          Alert.alert(
            'ข้อผิดพลาด', 
            `ไม่สามารถเชื่อมต่อ API ได้\nError: ${fetchError.message}`
          );
          hasMoreData = false;
          break;
        }
      }
      
      setProducts(allProducts);
      console.log(`=== FINAL RESULT ===`);
      console.log(`Total products loaded from API: ${allProducts.length}`);
      
      // แสดงข้อความถ้าไม่ได้ข้อมูลจาก API
      if (allProducts.length === 0) {
        setError('ไม่พบสินค้าจาก API');
        Alert.alert('แจ้งเตือน', 'ไม่พบสินค้าจาก API');
      }
      
    } catch (error) {
      console.error('General error in fetchProducts:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      Alert.alert('ข้อผิดพลาด', `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`);
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
  };  // ฟังก์ชันสำหรับจัดการการเลือกสินค้า (ป้องกันการเลือกซ้ำ)
  const handleProductSelect = async (product) => {
    // ตรวจสอบว่าสินค้าถูกเลือกแล้วหรือไม่
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    
    if (isAlreadySelected) {
      Alert.alert(`สินค้าซ้ำ`, `สินค้า "${product.name}" ถูกเลือกไว้แล้ว`);
      return;
    }

    const newProduct = { id: product.id, name: product.name };
    const updatedSelectedProducts = [...selectedProducts, newProduct];
    
    setSelectedProducts(updatedSelectedProducts);
    await saveSelectedProducts(updatedSelectedProducts);
    
    console.log(`บันทึก "${productName}" ลง Local Storage แล้ว`);
  };
  // ProductCard component สำหรับแสดงในรายการ
  const ProductCard = ({ item }) => (
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
      <SafeAreaView style={styles.container}>      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังดึงข้อมูลจาก API...</Text>
        <Text style={styles.loadingSubtext}>https://it2.sut.ac.th/labexample/product.php</Text>
      </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>สวัสดี, {'ผู้ใช้'}</Text>
            <Text style={styles.headerSubtitle}>รายการสินค้า ({products.length} รายการ)</Text>
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
        </TouchableOpacity>      </View>      <ScrollView
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))
        ) : (          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>ไม่พบสินค้าจาก API</Text>
            <Text style={styles.emptySubtext}>กรุณาลากลงเพื่อลองเชื่อมต่อใหม่</Text>
          </View>
        )}
      </ScrollView>
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
  },  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
