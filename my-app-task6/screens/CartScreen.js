import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  SafeAreaView,
  useWindowDimensions,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useCart } from '../context/CartContext';
import { getCurrentUser } from '../api/firebase';

const CartScreen = ({ navigation }) => {
  const { 
    cartItems, 
    updateQuantity, 
    setDirectQuantity, 
    calculateTotal,
    saveCartToFirebase,
    removeFromCart,
    createOrder,
    loadCartFromFirebase,
    loading
  } = useCart();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = useWindowDimensions().width;

  useEffect(() => {
    const refreshCart = async () => {
      try {
        console.log('Loading cart from Firebase...');
        await loadCartFromFirebase();
        console.log('Cart loading complete');
      } catch (error) {
        console.error('Error during cart refresh:', error);
        // Don't set loading to false here, as loadCartFromFirebase handles that
      }
    };
    
    refreshCart();
    
    const unsubscribe = navigation.addListener('focus', () => {
      refreshCart();
    });
    
    return unsubscribe;
  }, [navigation]);

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCartFromFirebase();
    setRefreshing(false);
  };

  const handleItemPress = (item) => {
    // Show JavaScript Alert Box
    window.alert(`ต้องการลบ "${item.name}" ออกจากตะกร้าสินค้าหรือไม่?`);
    // Then proceed with removal
    handleRemoveItem(item);
  };

  const handleRemoveItem = async (item) => {
    try {
      if (!item || !item.id) {
        console.error('Cannot remove item: Invalid item data', item);
        window.alert("ไม่สามารถลบสินค้าได้เนื่องจากข้อมูลไม่ถูกต้อง");
        return;
      }

      setIsSaving(true);
      console.log('Removing item from cart:', item);
      
      window.alert(`กำลังลบ "${item.name || 'รายการสินค้า'}" ออกจากตะกร้าสินค้า...`);
      
      const result = await removeFromCart(item);
      console.log('Remove result:', result);
      
      setIsSaving(false);
      
      if (result) {
        console.log('Item removed successfully');
        window.alert(`ลบ "${item.name || 'รายการสินค้า'}" ออกจากตะกร้าสินค้าแล้ว`);
        console.log('Refreshing cart after item removal');
        loadCartFromFirebase();
      } else {
        console.log('Failed to remove item, trying to refresh cart');
        await loadCartFromFirebase();
        
        window.alert("ไม่สามารถลบสินค้าได้ โปรดลองอีกครั้งในภายหลัง");
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setIsSaving(false);
      
      window.alert("ไม่สามารถลบสินค้าได้ โปรดลองอีกครั้งในภายหลัง");
    }
  };

  const handleSaveCart = async () => {
    const user = getCurrentUser();
    
    if (!user) {
      window.alert("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถบันทึกตะกร้าสินค้าได้");
      navigation.navigate('Login');
      return;
    }

    if (cartItems.length === 0) {
      window.alert("ตะกร้าสินค้าว่างเปล่า กรุณาเพิ่มสินค้าในตะกร้าก่อนบันทึก");
      return;
    }

    try {
      setIsSaving(true);
      await saveCartToFirebase(cartItems);
      
      setIsSaving(false);
      window.alert("บันทึกข้อมูลตะกร้าสินค้าลง Firebase สำเร็จแล้ว");
    } catch (error) {
      setIsSaving(false);
      window.alert("ไม่สามารถบันทึกข้อมูลตะกร้าสินค้าได้ โปรดลองอีกครั้งในภายหลัง");
    }
  };

  const handleOrder = async () => {
    const user = getCurrentUser();
    
    if (!user) {
      window.alert("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสั่งซื้อสินค้าได้");
      navigation.navigate('Login');
      return;
    }
    
    if (cartItems.length === 0) {
      window.alert("ตะกร้าสินค้าว่างเปล่า กรุณาเพิ่มสินค้าในตะกร้าก่อนทำการสั่งซื้อ");
      return;
    }
    
    const confirmOrder = window.confirm(`ยืนยันการสั่งซื้อสินค้าทั้งหมด ${cartItems.length} รายการ เป็นเงิน ฿${formatPrice(calculateTotal())}`);
    
    if (confirmOrder) {
      try {
        setIsOrdering(true);
        console.log('Creating order...');
        
        window.alert("กำลังสร้างคำสั่งซื้อ โปรดรอสักครู่...");
        
        const orderSuccess = await createOrder();
        
        setIsOrdering(false);
        
        if (orderSuccess) {
          window.alert("ระบบได้บันทึกคำสั่งซื้อของคุณเรียบร้อยแล้ว");
          navigation.navigate('Home');
        } else {
          window.alert("ไม่สามารถสร้างคำสั่งซื้อได้ โปรดลองอีกครั้งในภายหลัง");
        }
      } catch (error) {
        console.error('Order creation error:', error);
        setIsOrdering(false);
        
        window.alert("ไม่สามารถสร้างคำสั่งซื้อได้ โปรดลองอีกครั้งในภายหลัง");
      }
    }
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {item.pic ? (
            <Image 
              source={{ uri: item.pic }} 
              style={styles.itemImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>฿{formatPrice(item.price)}</Text>
        </View>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            keyboardType="numeric"
            onChangeText={(text) => {
              const newQuantity = parseInt(text) || 1;
              setDirectQuantity(item.id, newQuantity);
            }}
          />
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleItemPress(item)}
          >
            <Text style={styles.deleteButtonText}>ลบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerText}>ตะกร้าสินค้า</Text>
        <Text style={styles.subHeaderText}>และที่นี่คุณสามารถดูราคาตะกร้า</Text>
        
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>กำลังโหลดข้อมูลตะกร้าสินค้า...</Text>
          </View>
        ) : (
          <View>
            {cartItems.length > 0 ? (
              <View>
                <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.cartList}
                  showsVerticalScrollIndicator={false}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
                
                <View style={styles.footer}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>รวมทั้งสิ้น:</Text>
                    <Text style={styles.totalAmount}>฿{formatPrice(calculateTotal())}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveCart}
                    disabled={isSaving}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'กำลังบันทึก...' : 'บันทึกตะกร้าสินค้า'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.orderButton}
                    onPress={handleOrder}
                    disabled={isOrdering}
                  >
                    <Text style={styles.orderButtonText}>
                      {isOrdering ? 'กำลังสั่งซื้อ...' : 'สั่งซื้อสินค้า'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCartContainer}>
                <Text style={styles.emptyCartText}>ไม่มีสินค้าในตะกร้า</Text>
                <TouchableOpacity 
                  style={styles.shopButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.shopButtonText}>เลือกซื้อสินค้า</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
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
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityInput: {
    textAlign: 'center',
    width: 40,
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    marginTop: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#ff9500',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
    width: '100%',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e91e63',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: '#888',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CartScreen;
