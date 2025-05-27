import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getCollectionByQuery, updateDocument, deleteDocument, db } from '../api/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

const OrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusColors = {
    pending: '#FFD700', // Gold
    processing: '#1E90FF', // DodgerBlue
    shipped: '#FF8C00', // DarkOrange
    delivered: '#32CD32', // LimeGreen
    cancelled: '#DC143C' // Crimson
  };

  // สถานะที่สามารถเปลี่ยนได้
  const availableStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // ดึงข้อมูลออร์เดอร์
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const { data, error } = await getCollectionByQuery('orders', q);
      
      if (error) {
        throw new Error(error);
      }
      
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // อัปเดตสถานะออร์เดอร์
  const updateOrderStatus = async (orderId, currentStatus) => {
    const currentIndex = availableStatuses.indexOf(currentStatus);
    
    const options = availableStatuses.map((status, index) => ({
      text: status.charAt(0).toUpperCase() + status.slice(1),
      onPress: () => changeStatus(orderId, status)
    }));
    
    options.push({ text: 'Cancel', style: 'cancel' });
    
    Alert.alert(
      'Update Order Status',
      'Select the new status for this order:',
      options
    );
  };

  // เปลี่ยนสถานะออร์เดอร์
  const changeStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const result = await updateDocument('orders', orderId, { status: newStatus });
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        // อัปเดตข้อมูลในหน้าจอ
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        Alert.alert('Success', 'Order status updated successfully');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // ลบออร์เดอร์
  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteDocument('orders', orderId);
              
              if (result.error) {
                Alert.alert('Error', result.error);
              } else {
                setOrders(orders.filter(order => order.id !== orderId));
                Alert.alert('Success', 'Order deleted successfully');
              }
            } catch (err) {
              console.error('Error deleting order:', err);
              Alert.alert('Error', 'Failed to delete order');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // แสดงผลรายการสินค้าในออร์เดอร์
  const renderOrderItems = (items) => {
    return items.map((item, index) => (
      <View key={index} style={styles.orderItem}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>Quantity: {item.quantity}</Text>
        <Text>Price: ฿{item.price.toFixed(2)}</Text>
      </View>
    ));
  };

  // แสดงผลออร์เดอร์
  const renderOrder = ({ item }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.orderStatusBar}>
          <TouchableOpacity
            onPress={() => updateOrderStatus(item.id, item.status)}
            style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#999' }]}
          >
            <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDeleteOrder(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color="#DC143C" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.orderItems}>
          <Text style={styles.sectionTitle}>Items:</Text>
          {renderOrderItems(item.items)}
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.sectionTitle}>Shipping Address:</Text>
          <Text style={styles.address}>{item.shippingAddress}</Text>
          <Text style={styles.total}>Total: ฿{item.total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
          <TouchableOpacity 
            style={styles.shopButton} 
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E86C1',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
  },
  orderStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  address: {
    marginBottom: 10,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2E86C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 20,
    backgroundColor: '#2E86C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
