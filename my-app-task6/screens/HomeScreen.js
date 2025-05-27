import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions, 
  useWindowDimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { fetchAllProducts } from '../api/productAPI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/firebase';

const HomeScreen = ({ navigation }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [showInStock, setShowInStock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const windowWidth = useWindowDimensions().width;
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (windowWidth >= 768) {
      return 3; // Tablets and larger screens show 3 columns
    }
    return 2; // Phone screens show 2 columns
  };

  const numColumns = getNumColumns();

  // ตรวจสอบการเข้าสู่ระบบ
  useEffect(() => {
    if (!isAuthenticated) {
      // ถ้าไม่ได้เข้าสู่ระบบ ให้กลับไปหน้า Login
      navigation.replace('Auth');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // ดึงข้อมูลสินค้าจาก Firebase
        const data = await fetchAllProducts();
        
        // ให้แน่ใจว่าทุกสินค้ามี id
        const productsWithId = data.map(product => ({
          ...product,
          id: product.id || `product_${product.name}_${Date.now()}`
        }));
        
        setAllProducts(productsWithId);
        
        // Initially display in-stock products
        const inStockProducts = productsWithId.filter(product => parseInt(product.stock) > 0);
        setDisplayProducts(inStockProducts);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    // ดึงข้อมูลสินค้าเมื่อเข้าสู่ระบบแล้วเท่านั้น
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const showAllProducts = () => {
    setDisplayProducts(allProducts);
    setShowInStock(false);
  };

  const showInStockOnly = () => {
    const inStockProducts = allProducts.filter(product => parseInt(product.stock) > 0);
    setDisplayProducts(inStockProducts);
    setShowInStock(true);
  };

  const handleProductPress = (productName) => {
    // Find the product by name
    const product = allProducts.find(p => p.name === productName);
    
    if (product) {
      // Add the product to cart
      addToCart({
        id: product.id || `product_${product.name}_${Date.now()}`,
        name: product.name,
        price: parseFloat(product.price) || 0, 
        pic: product.pic || 'https://via.placeholder.com/150',
        stock: product.stock || '0'
      });
      
      // Show Alert
      Alert.alert(
        "เพิ่มสินค้าสำเร็จ",
        `"${productName}" ถูกเพิ่มลงในตะกร้าสินค้าแล้ว`,
        [
          {
            text: "ดูตะกร้าสินค้า",
            onPress: () => navigation.navigate('Cart')
          },
          {
            text: "ซื้อสินค้าต่อ",
            style: "cancel"
          }
        ]
      );
    }
  };

  // ถ้าไม่ได้เข้าสู่ระบบ ไม่ต้องแสดงอะไร (จะถูกเปลี่ยนเส้นทางไปหน้า Login)
  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>กรุณารอสักครู่...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>กำลังโหลดสินค้า...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ตรวจสอบว่ามีสินค้าหรือไม่
  if (!allProducts || allProducts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>ไม่พบข้อมูลสินค้า</Text>
      </View>
    );
  }

  // Render item function with key extractor to avoid warning on numColumns change
  const renderItem = ({ item, index }) => (
    <ProductCard
      name={item.name}
      price={item.price || '0'}
      stock={item.stock || '0'}
      pic={item.pic || 'https://via.placeholder.com/150'}
      onPress={handleProductPress}
    />
  );

  const keyExtractor = (item, index) => (item.id || item.name) + '-' + index;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>สินค้าแนะนำ</Text>
        <Text style={styles.welcomeText}>ยินดีต้อนรับคุณ {user?.email || 'ผู้ใช้'}</Text>
        
        <View style={styles.filterTabContainer}>
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              !showInStock ? styles.activeTab : styles.inactiveTab
            ]} 
            onPress={showAllProducts}
          >
            <Text style={[
              styles.filterTabText, 
              !showInStock ? styles.activeTabText : styles.inactiveTabText
            ]}>สินค้าทั้งหมด</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterTab, 
              showInStock ? styles.activeTab : styles.inactiveTab
            ]} 
            onPress={showInStockOnly}
          >
            <Text style={[
              styles.filterTabText, 
              showInStock ? styles.activeTabText : styles.inactiveTabText
            ]}>มีสินค้าในสต็อก</Text>
          </TouchableOpacity>
        </View>
        
        {displayProducts.length > 0 ? (
          <FlatList
            key={`column-${numColumns}`} // This forces FlatList to re-render when columns change
            data={displayProducts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.productRow : null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.centered}>
            <Text style={styles.noProductsText}>ไม่มีสินค้าที่ตรงตามเงื่อนไข</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  filterTabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#c8a2ff',
  },
  inactiveTab: {
    backgroundColor: '#eeeeee',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: 'white',
  },
  inactiveTabText: {
    color: '#888',
  },
  productRow: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});

export default HomeScreen;
