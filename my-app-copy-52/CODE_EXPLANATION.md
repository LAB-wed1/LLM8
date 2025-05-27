# 📋 สรุปการทำคำสั่งที่ 1 และ 2 ในโค้ด

## 🎯 คำสั่งที่ 1: แสดง Alert ชื่อสินค้าเมื่อผู้ใช้เลือกสินค้า

### 📍 ตำแหน่งในโค้ด:

#### 1. **ProductCard Component (บรรทัด 50-80)**
```javascript
// คำสั่งที่ 1: ใช้ TouchableOpacity ครอบ ProductCard เพื่อให้ผู้ใช้สามารถเลือกรายการสินค้าได้
<TouchableOpacity 
  style={styles.card} 
  onPress={handlePress}  // คำสั่งที่ 1: เรียกฟังก์ชัน handlePress เมื่อแตะ
  activeOpacity={0.7}
>
```

#### 2. **handlePress Function (บรรทัด 55-62)**
```javascript
const handlePress = async () => {
  // คำสั่งที่ 1: แสดง Alert ชื่อสินค้าเมื่อผู้ใช้เลือกสินค้า
  window.alert(`คุณเลือกสินค้า: ${name}`);
  
  // คำสั่งที่ 2: บันทึกชื่อสินค้าลง AsyncStorage
  if (onProductSelect) {
    await onProductSelect(id, name);
  }
};
```

---

## 💾 คำสั่งที่ 2: บันทึกชื่อสินค้าลง Local Storage

### 📍 ตำแหน่งในโค้ด:

#### 1. **AsyncStorage Import และ Key (บรรทัด 13-18)**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// คำสั่งที่ 2: Local Storage Setup
const SELECTED_PRODUCTS_KEY = '@selected_products';
```

#### 2. **ฟังก์ชันบันทึกลง AsyncStorage (บรรทัด 20-29)**
```javascript
// คำสั่งที่ 2: ฟังก์ชันสำหรับบันทึกรายการสินค้าที่เลือกลง AsyncStorage
const saveSelectedProducts = async (selectedProducts) => {
  try {
    const jsonValue = JSON.stringify(selectedProducts);
    await AsyncStorage.setItem(SELECTED_PRODUCTS_KEY, jsonValue);
    console.log('บันทึกสินค้าที่เลือกลง AsyncStorage สำเร็จ:', selectedProducts);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกสินค้าที่เลือก:', error);
  }
};
```

#### 3. **ฟังก์ชันโหลดจาก AsyncStorage (บรรทัด 31-43)**
```javascript
// คำสั่งที่ 2: ฟังก์ชันสำหรับโหลดรายการสินค้าที่เลือกจาก AsyncStorage
const loadSelectedProducts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SELECTED_PRODUCTS_KEY);
    if (jsonValue != null) {
      const selectedProducts = JSON.parse(jsonValue);
      console.log('โหลดสินค้าที่เลือกจาก AsyncStorage สำเร็จ:', selectedProducts);
      return selectedProducts;
    }
    return [];
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดสินค้าที่เลือก:', error);
    return [];
  }
};
```

#### 4. **State Management ใน App Component (บรรทัด 85-95)**
```javascript
const [selectedProducts, setSelectedProducts] = useState([]); // คำสั่งที่ 2: เก็บรายการสินค้าที่เลือก

useEffect(() => {
  loadProducts();
  loadStoredSelectedProducts(); // คำสั่งที่ 2: โหลดข้อมูลจาก AsyncStorage เมื่อเริ่มแอป
}, []);
```

#### 5. **ฟังก์ชันจัดการการเลือกสินค้า (บรรทัด 105-115)**
```javascript
// คำสั่งที่ 2: ฟังก์ชันสำหรับจัดการการเลือกสินค้า
const handleProductSelect = async (productId, productName) => {
  const newProduct = { id: productId, name: productName };
  const updatedSelectedProducts = [...selectedProducts, newProduct];
  
  setSelectedProducts(updatedSelectedProducts);
  await saveSelectedProducts(updatedSelectedProducts); // คำสั่งที่ 2: บันทึกลง AsyncStorage ทันที
  
  console.log(`บันทึก "${productName}" ลง Local Storage แล้ว`);
};
```

#### 6. **UI แสดงรายการที่เลือก (บรรทัด 235-255)**
```javascript
{/* คำสั่งที่ 2: แสดงรายการสินค้าที่เลือก (Local Storage Display) */}
{selectedProducts.length > 0 && (
  <View style={styles.selectedContainer}>
    <Text style={styles.selectedCountText}>
      สินค้าที่เลือก ({selectedProducts.length} รายการ):
    </Text>
    <TouchableOpacity 
      style={styles.clearButton}
      onPress={async () => {
        if (window.confirm('คุณต้องการล้างรายการสินค้าที่เลือกทั้งหมดหรือไม่?')) {
          setSelectedProducts([]);
          await saveSelectedProducts([]); // คำสั่งที่ 2: ล้างข้อมูลใน AsyncStorage
          window.alert('ล้างรายการที่เลือกแล้ว');
        }
      }}
    >
      <Text style={styles.clearButtonText}>ล้างทั้งหมด</Text>
    </TouchableOpacity>
  </View>
)}
```

#### 7. **การส่ง Props ไป ProductCard (บรรทัด 265-275)**
```javascript
<ProductCard
  key={item.id}
  id={item.id}
  name={item.name}
  price={item.price}
  stock={item.stock}
  cate={item.cate}
  pic={item.pic}
  onProductSelect={handleProductSelect} // คำสั่งที่ 2: ส่งฟังก์ชันบันทึกลง Local Storage
/>
```

---

## 🔄 ลำดับการทำงาน

### คำสั่งที่ 1 (Alert):
1. ผู้ใช้แตะ **TouchableOpacity** ที่ครอบ ProductCard
2. เรียกฟังก์ชัน **handlePress**
3. แสดง **window.alert()** พร้อมชื่อสินค้า

### คำสั่งที่ 2 (Local Storage):
1. หลังจากแสดง Alert แล้ว เรียกฟังก์ชัน **onProductSelect**
2. ฟังก์ชัน **handleProductSelect** จะถูกเรียก
3. เพิ่มสินค้าลงใน **selectedProducts state**
4. เรียกฟังก์ชัน **saveSelectedProducts** เพื่อบันทึกลง **AsyncStorage**
5. อัปเดต UI แสดงรายการสินค้าที่เลือก

### การโหลดข้อมูลเมื่อเปิดแอป:
1. เรียกฟังก์ชัน **loadStoredSelectedProducts** ใน useEffect
2. ฟังก์ชัน **loadSelectedProducts** อ่านข้อมูลจาก AsyncStorage
3. อัปเดต **selectedProducts state** ด้วยข้อมูลที่โหลดมา

---

## 📦 ข้อมูลที่เก็บใน AsyncStorage

**Key**: `@selected_products`

**รูปแบบข้อมูล**:
```json
[
  {
    "id": "product_id_1",
    "name": "ชื่อสินค้า 1"
  },
  {
    "id": "product_id_2",
    "name": "ชื่อสินค้า 2"
  }
]
```
