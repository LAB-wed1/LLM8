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

// ProductCard component รับ props ตามที่โจทย์กำหนด
const ProductCard = ({ id, name, price, stock, cate, pic }) => {
  return (
    <View style={styles.card}>
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
    </View>
  );
};

// App Component หลัก
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' หรือ 'instock'

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, filterMode]);

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

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* วนลูปแสดงสินค้าที่กรองแล้วโดยใช้ ProductCard */}
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            stock={item.stock}
            cate={item.cate}
            pic={item.pic}
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
});

export default App;
