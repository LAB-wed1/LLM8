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
  FlatList
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

  // คำสั่งที่ 2 & 3: ฟังก์ชันสำหรับจัดการการเลือกสินค้า (ป้องกันการเลือกซ้ำ)
  const handleProductSelect = async (productId, productName) => {
    // ตรวจสอบว่าสินค้าถูกเลือกแล้วหรือไม่
    const isAlreadySelected = selectedProducts.some(product => product.id === productId);
    
    if (isAlreadySelected) {
      window.alert(`สินค้า "${productName}" ถูกเลือกไว้แล้ว`);
      return;
    }

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
      {/* คำสั่งที่ 3: ส่วนปุ่มการคัดกรอง (Filter) - Fixed Header */}
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

      {/* คำสั่งที่ 3: Layout หลักแบ่งเป็น 2 ส่วนด้วย Flex */}
      <View style={styles.mainContentContainer}>
        
        {/* คำสั่งที่ 3: ส่วนแสดงรายการสินค้า (60% ของพื้นที่) */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 รายการสินค้า</Text>
            <Text style={styles.productCount}>
              {filterMode === 'all' ? 'ทั้งหมด' : 'มีสินค้า'}: {filteredProducts.length} รายการ
            </Text>
          </View>
          
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                stock={item.stock}
                cate={item.cate}
                pic={item.pic}
                onProductSelect={handleProductSelect}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* คำสั่งที่ 3: ส่วนแสดงรายการที่ผู้ใช้เลือก (40% ของพื้นที่) */}
        <View style={styles.selectedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🛒 สินค้าที่เลือก</Text>
            <TouchableOpacity 
              style={[styles.clearButton, selectedProducts.length === 0 && styles.disabledButton]}
              onPress={async () => {
                if (selectedProducts.length === 0) return;
                if (window.confirm('คุณต้องการล้างรายการสินค้าที่เลือกทั้งหมดหรือไม่?')) {
                  setSelectedProducts([]);
                  await saveSelectedProducts([]);
                  window.alert('ล้างรายการที่เลือกแล้ว');
                }
              }}
              disabled={selectedProducts.length === 0}
            >
              <Text style={[
                styles.clearButtonText, 
                selectedProducts.length === 0 && styles.disabledButtonText
              ]}>
                ล้างทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          {/* คำสั่งที่ 3: แสดงรายละเอียดสินค้าที่เลือกจาก Local Storage */}
          {selectedProducts.length > 0 ? (
            <FlatList
              data={selectedProducts}
              renderItem={({ item, index }) => (
                <View style={styles.selectedItem}>
                  <View style={styles.selectedItemContent}>
                    <Text style={styles.selectedItemNumber}>{index + 1}.</Text>
                    <Text style={styles.selectedItemName}>{item.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={async () => {
                      const updatedProducts = selectedProducts.filter(p => p.id !== item.id);
                      setSelectedProducts(updatedProducts);
                      await saveSelectedProducts(updatedProducts);
                    }}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              contentContainerStyle={styles.selectedList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptySelectedContainer}>
              <Text style={styles.emptySelectedIcon}>🛒</Text>
              <Text style={styles.emptySelectedText}>ยังไม่มีสินค้าที่เลือก</Text>
              <Text style={styles.emptySelectedSubtext}>แตะที่สินค้าเพื่อเลือก</Text>
            </View>
          )}

          {/* คำสั่งที่ 3: แสดงสรุปจำนวนสินค้าที่เลือก */}
          {selectedProducts.length > 0 && (
            <View style={styles.selectedSummary}>
              <Text style={styles.summaryText}>
                รวม {selectedProducts.length} รายการ
              </Text>
            </View>
          )}
        </View>
      </View>
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
  
  // คำสั่งที่ 3: ปุ่มการคัดกรอง (Filter) - Fixed Header
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },

  // คำสั่งที่ 3: Layout หลักแบ่งพื้นที่ด้วย Flex
  mainContentContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  // คำสั่งที่ 3: ส่วนแสดงรายการสินค้า (60% ของพื้นที่)
  productsSection: {
    flex: 0.6, // 60% ของพื้นที่
    backgroundColor: '#fff',
    marginRight: 1,
  },
  
  // คำสั่งที่ 3: ส่วนแสดงรายการที่ผู้ใช้เลือก (40% ของพื้นที่)
  selectedSection: {
    flex: 0.4, // 40% ของพื้นที่
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 1,
    borderLeftColor: '#dee2e6',
  },

  // คำสั่งที่ 3: Header ของแต่ละส่วน
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // คำสั่งที่ 3: รายการสินค้า
  productsList: {
    padding: 8,
  },

  // คำสั่งที่ 3: การ์ดสินค้า (ปรับขนาดให้เหมาะกับพื้นที่)
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120, // ลดความสูงเพื่อให้เหมาะกับพื้นที่
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    numberOfLines: 2,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
    color: '#666',
  },

  // คำสั่งที่ 3: รายการสินค้าที่เลือก
  selectedList: {
    padding: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
    minWidth: 20,
  },
  selectedItemName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // คำสั่งที่ 3: สถานะเมื่อไม่มีสินค้าที่เลือก
  emptySelectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptySelectedIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptySelectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySelectedSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // คำสั่งที่ 3: สรุปจำนวนสินค้าที่เลือก
  selectedSummary: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D2E',
    textAlign: 'center',
  },

  // คำสั่งที่ 3: ปุ่มล้างรายการ
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },

  // สไตล์สำหรับการโหลดและข้อผิดพลาด
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
});

export default App;
