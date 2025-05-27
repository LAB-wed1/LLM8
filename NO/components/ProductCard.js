import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

// ProductCard component รับ props ตามที่โจทย์กำหนด
const ProductCard = ({ id, name, price, stock, cate, pic, onProductSelect }) => {
  const handlePress = async () => {
    // แสดง Alert ชื่อสินค้าเมื่อผู้ใช้เลือกสินค้า
    Alert.alert(`เลือกสินค้า`, `คุณเลือกสินค้า: ${name}`);
    
    // บันทึกชื่อสินค้า
    if (onProductSelect) {
      await onProductSelect(id, name);
    }
  };

  return (
    // ใช้ TouchableOpacity ครอบ ProductCard เพื่อให้ผู้ใช้สามารถเลือกรายการสินค้าได้
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: pic || 'https://via.placeholder.com/150' }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
        <Text style={styles.category}>{cate}</Text>
        <Text style={styles.price}>฿{price}</Text>
        <Text style={[styles.stock, stock > 0 ? styles.inStock : styles.outOfStock]}>
          {stock > 0 ? `สินค้าคงเหลือ: ${stock} ชิ้น` : 'หมด'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    height: 120,
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
  },
  inStock: {
    color: '#4caf50',
  },
  outOfStock: {
    color: '#f44336',
  },
});

export default ProductCard;
