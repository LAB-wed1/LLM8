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

const HomeScreen = ({ navigation }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [showInStock, setShowInStock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const windowWidth = useWindowDimensions().width;
  const { addToCart } = useCart();

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (windowWidth >= 768) {
      return 3; // Tablets and larger screens show 3 columns
    }
    return 2; // Phone screens show 2 columns
  };

  const numColumns = getNumColumns();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchAllProducts();
        setAllProducts(data);
        
        // Initially display in-stock products
        const inStockProducts = data.filter(product => parseInt(product.stock) > 0);
        setDisplayProducts(inStockProducts);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
      addToCart(product);
      
      // Show a success message
      Alert.alert(
        "Added to Cart",
        `${productName} has been added to your cart.`,
        [
          { 
            text: "Continue Shopping", 
            style: "cancel" 
          },
          { 
            text: "Go to Cart", 
            onPress: () => navigation.navigate('Cart') 
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
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
        <Text style={styles.headerText}>Featured Products</Text>
        
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
            ]}>ALL</Text>
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
            ]}>IN STOCK</Text>
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
            <Text style={styles.noProductsText}>No products available.</Text>
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
    marginBottom: 16,
    color: '#333',
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
  },
});

export default HomeScreen;
