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
  ActivityIndicator 
} from 'react-native';

// ฟังก์ชันสำหรับดึงข้อมูลจาก API
const fetchProducts = async () => {
  try {
    const url = 'http://it2.sut.ac.th/labexample/product.php';
    console.log('Fetching from URL:', url);

    console.log('Starting fetch request...');
    const response = await fetch(url);
    console.log('Response received:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    const data = JSON.parse(text);
    console.log('Parsed data:', data);
    
    // Return the parsed data
    console.log('Returning data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* วนลูปแสดงสินค้าทั้งหมดโดยใช้ ProductCard */}
        {products.map((item) => (
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
