import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import PropTypes from 'prop-types';

const ProductCard = ({ name, price, stock, pic, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const windowWidth = useWindowDimensions().width;
  
  // Calculate card width based on screen size
  const getCardWidth = () => {
    // For small screens (less than 360px), make cards occupy more width
    if (windowWidth < 360) {
      return (windowWidth - 32) / 2; // Smaller gap on small screens
    }
    // Standard size for medium and larger screens
    return (windowWidth - 48) / 2;
  };
  
  const cardWidth = getCardWidth();
  
  const handlePress = () => {
    console.log('Product selected:', name);
    if (onPress) {
      onPress(name);
    }
  };

  const fallbackImageUrl = 'https://via.placeholder.com/150';
  const formattedPrice = parseInt(price).toLocaleString();

  // Dynamically calculate image height based on card width to maintain aspect ratio
  const imageHeight = cardWidth * 0.8;

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={{ uri: imageError ? fallbackImageUrl : pic }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
        <Text style={styles.description}>จำนวนคงเหลือ {stock}</Text>
        <Text style={styles.price}>฿{formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  );
};

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  stock: PropTypes.string.isRequired,
  pic: PropTypes.string.isRequired,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    height: 40,
    color: '#333',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
  },
});

export default ProductCard;
