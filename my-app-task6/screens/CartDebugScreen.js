// screens/CartDebugScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { debugCartDeletion, forceDeleteCartItem, clearAllCartItems } from '../utils/CartDebugger';

const CartDebugScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCartDebugInfo();
  }, [refreshKey]);

  const loadCartDebugInfo = async () => {
    try {
      setLoading(true);
      setMessage('กำลังโหลดข้อมูลตะกร้าสินค้า...');
      
      const result = await debugCartDeletion();
      
      if (result.success && result.cartItems) {
        setCartItems(result.cartItems);
        setMessage(result.message);
      } else {
        setCartItems([]);
        setMessage(result.message || 'ไม่มีข้อมูลตะกร้าสินค้า');
      }
    } catch (error) {
      console.error('Error loading cart debug info:', error);
      setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบ "${item.name || 'รายการสินค้า'}" ออกจากตะกร้าหรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const result = await forceDeleteCartItem(item.id);
              
              if (result.success) {
                Alert.alert('สำเร็จ', 'ลบรายการสินค้าเรียบร้อยแล้ว');
                handleRefresh();
              } else {
                Alert.alert('ข้อผิดพลาด', result.message || 'ไม่สามารถลบรายการสินค้าได้');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบรายการสินค้า');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleClearAllItems = () => {
    Alert.alert(
      'ยืนยันการลบทั้งหมด',
      'คุณต้องการลบรายการสินค้าทั้งหมดในตะกร้าหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบทั้งหมด',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const result = await clearAllCartItems();
              
              if (result.success) {
                Alert.alert('สำเร็จ', result.message || 'ลบรายการสินค้าทั้งหมดเรียบร้อยแล้ว');
                handleRefresh();
              } else {
                Alert.alert('ข้อผิดพลาด', result.message || 'ไม่สามารถลบรายการสินค้าทั้งหมดได้');
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบรายการสินค้าทั้งหมด');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name || 'รายการสินค้า'}</Text>
        <Text style={styles.itemDetail}>รหัส: {item.id}</Text>
        <Text style={styles.itemDetail}>Document ID: {item.id}</Text>
        <Text style={styles.itemDetail}>จำนวน: {item.quantity}</Text>
        <Text style={styles.itemDetail}>ราคา: {item.price} บาท</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item)}
        disabled={processing}
      >
        <Text style={styles.deleteButtonText}>ลบ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ตัวแก้ไขปัญหาตะกร้าสินค้า</Text>
      <Text style={styles.message}>{message}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <>
          {cartItems.length > 0 ? (
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id || Math.random().toString()}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <Text style={styles.emptyText}>ไม่พบรายการในตะกร้าสินค้า</Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={processing || loading}
            >
              <Text style={styles.buttonText}>รีเฟรช</Text>
            </TouchableOpacity>

            {cartItems.length > 0 && (
              <TouchableOpacity 
                style={styles.clearAllButton}
                onPress={handleClearAllItems}
                disabled={processing || loading}
              >
                <Text style={styles.buttonText}>ลบทั้งหมด</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>กลับ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {processing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.overlayText}>กำลังดำเนินการ...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32
  },
  listContent: {
    paddingBottom: 16
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333'
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 16
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  clearAllButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16
  }
});

export default CartDebugScreen;
