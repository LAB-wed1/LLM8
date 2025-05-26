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
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// คำสั่งที่ 2: Local Storage Setup
// =====================================================
// Key สำหรับเก็บข้อมูลใน AsyncStorage
const SELECTED_PRODUCTS_KEY = '@selected_products';

// คำสั่งที่ 2: ฟังก์ชันสำหรับบันทึกรายการสินค้าที่เลือกลง AsyncStorage
const saveSelectedProducts = async (selectedProducts) => {
  try {
    const jsonValue = JSON.stringify(selectedProducts);
    await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, jsonValue);
    console.log('บันทึกสินค้าที่เลือกลง AsyncStorage สำเร็จ:', selectedProducts);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกสินค้าที่เลือก:', error);
  }
};

// คำสั่งที่ 2: ฟังก์ชันสำหรับโหลดรายการสินค้าที่เลือกจาก AsyncStorage
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

// ฟังก์ชันสำหรับดึงข้อมูลจาก API พร้อมการ pagination
const fetchProducts = async () => {
  const allProducts = [];
  let pageNo = 1;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const url = `https://it2.sut.ac.th/labexample/product.php?pageno=${pageNo}`;
      console.log(`Fetching from URL: ${url} (Page ${pageNo})`);

      const response = await fetch(url);
      console.log(`Response received for page ${pageNo}:`, response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log(`Raw response for page ${pageNo}:`, text);
      
      const data = JSON.parse(text);
      console.log(`Parsed data for page ${pageNo}:`, data);
      
      // ตรวจสอบว่ามีข้อมูลสินค้าในหน้านี้หรือไม่
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        allProducts.push(...data.products);
        console.log(`Added ${data.products.length} products from page ${pageNo}`);
        pageNo++;
      } else if (Array.isArray(data) && data.length > 0) {
        allProducts.push(...data);
        console.log(`Added ${data.length} products from page ${pageNo}`);
        pageNo++;
      } else {
        // ไม่มีข้อมูลเพิ่มเติม หยุดการวนลูป
        hasMoreData = false;
        console.log(`No more data available. Stopping at page ${pageNo}`);
      }
    }
    
    console.log(`Total products fetched: ${allProducts.length}`);
    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return allProducts; // คืนค่าสินค้าที่ดึงมาได้แล้ว (ถ้ามี)
  }
};

// =====================================================
// คำสั่งที่ 1 & 2: ProductCard Component
// =====================================================
// ProductCard component รับ props ตามที่โจทย์กำหนด
const ProductCard = ({ id, name, price, stock, cate, pic, onProductSelect }) => {
  const handlePress = async () => {
    // คำสั่งที่ 1: แสดง Alert ชื่อสินค้าเมื่อผู้ใช้เลือกสินค้า
    window.alert(`คุณเลือกสินค้า: ${name}`);
    
    // คำสั่งที่ 2: บันทึกชื่อสินค้าลง AsyncStorage
    if (onProductSelect) {
      await onProductSelect(id, name);
    }
  };

  return (
    // คำสั่งที่ 1: ใช้ TouchableOpacity ครอบ ProductCard เพื่อให้ผู้ใช้สามารถเลือกรายการสินค้าได้
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}  // คำสั่งที่ 1: เรียกฟังก์ชัน handlePress เมื่อแตะ
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: pic }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
        <Text style={styles.category}>{cate}</Text>
        <Text style={styles.price}>฿{price}</Text>
        <Text style={styles.stock}>สินค้าคงเหลือ: {stock} ชิ้น</Text>
      </View>
    </TouchableOpacity>
  );
};

// =====================================================
// คำสั่งที่ 2: App Component - Local Storage Management
// =====================================================
// App Component หลัก
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' หรือ 'instock'
  const [selectedProducts, setSelectedProducts] = useState([]); // คำสั่งที่ 2: เก็บรายการสินค้าที่เลือก

  useEffect(() => {
    loadProducts();
    loadStoredSelectedProducts(); // คำสั่งที่ 2: โหลดข้อมูลจาก AsyncStorage เมื่อเริ่มแอป
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filterMode]);

  // คำสั่งที่ 2: ฟังก์ชันสำหรับโหลดรายการสินค้าที่เลือกจาก AsyncStorage เมื่อเริ่มแอป
  const loadStoredSelectedProducts = async () => {
    const storedSelectedProducts = await loadSelectedProducts();
    setSelectedProducts(storedSelectedProducts);
  };

  // คำสั่งที่ 2: ฟังก์ชันสำหรับจัดการการเลือกสินค้า
  const handleProductSelect = async (productId, productName) => {
    const newProduct = { id: productId, name: productName };
    const updatedSelectedProducts = [...selectedProducts, newProduct];
    
    setSelectedProducts(updatedSelectedProducts);
    await saveSelectedProducts(updatedSelectedProducts); // คำสั่งที่ 2: บันทึกลง AsyncStorage ทันที
    
    console.log(`บันทึก "${productName}" ลง Local Storage แล้ว`);
  };

  const filterProducts = () => {
    if (filterMode === 'all') {
      setFilteredProducts(products);
    } else if (filterMode === 'instock') {
      const inStockProducts = products.filter(product => product.stock > 0);
      setFilteredProducts(inStockProducts);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        console.log(`Successfully loaded ${data.length} products`);
      } else {
        setError('ไม่พบข้อมูลสินค้า');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Buttons */}
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
            ALL ({products.length})
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
            IN STOCK ({products.filter(p => p.stock > 0).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* คำสั่งที่ 2: แสดงรายการสินค้าที่เลือก (Local Storage Display) */}
      {selectedProducts.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedCountText}>
            สินค้าที่เลือก ({selectedProducts.length} รายการ):
          </Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={async () => {
              if (window.confirm('คุณต้องการล้างรายการสินค้าที่เลือกทั้งหมดหรือไม่?')) {
                setSelectedProducts([]);
                await saveSelectedProducts([]); // คำสั่งที่ 2: ล้างข้อมูลใน AsyncStorage
                window.alert('ล้างรายการที่เลือกแล้ว');
              }
            }}
          >
            <Text style={styles.clearButtonText}>ล้างทั้งหมด</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* คำสั่งที่ 1 & 2: วนลูปแสดงสินค้าที่กรองแล้วโดยใช้ ProductCard */}
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            stock={item.stock}
            cate={item.cate}
            pic={item.pic}
            onProductSelect={handleProductSelect} // คำสั่งที่ 2: ส่งฟังก์ชันบันทึกลง Local Storage
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// กำหนดสไตล์ทั้งหมด
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6e9',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e91e63',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 6,
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  selectedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D2E',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default App;
