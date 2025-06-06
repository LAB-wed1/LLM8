import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const SELECTED_PRODUCTS_KEY = '@selected_products';

const CartScreen = ({ navigation }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSelectedProducts();
    });

    return unsubscribe;
  }, [navigation]);

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

  const removeProduct = async (productId) => {
    const updatedProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(updatedProducts);
    await saveSelectedProducts(updatedProducts);
    Alert.alert('สำเร็จ', 'ลบสินค้าออกจากตะกร้าแล้ว');
  };

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
            setSelectedProducts([]);
            await saveSelectedProducts([]);
            Alert.alert('สำเร็จ', 'ล้างตะกร้าสินค้าแล้ว');
          }
        }
      ]
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => total + parseFloat(product.price || 0), 0);
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
          <Text style={styles.productPrice}>฿{item.price}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeProduct(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

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
                {selectedProducts.length} รายการ
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
});

export default CartScreen;
