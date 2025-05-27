// api/productAPI.js
export const fetchProducts = async (pageNo) => {
  try {
    const url = `https://it2.sut.ac.th/labexample/product.php?pageno=${pageNo}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API returns data in format { products: [...] }
    if (data && Array.isArray(data.products)) {
      console.log(`Page ${pageNo} data: ${data.products.length} products`);
      return data.products;
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

export const fetchAllProducts = async () => {
  try {
    let allProducts = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    // Loop until we don't get any more products or reach a reasonable limit
    while (hasMorePages && currentPage <= 10) { // Setting a max of 10 pages for safety
      const pageProducts = await fetchProducts(currentPage);
      
      // If we get no products or empty array, stop fetching
      if (!pageProducts || pageProducts.length === 0) {
        hasMorePages = false;
      } else {
        allProducts = [...allProducts, ...pageProducts];
        console.log(`Page ${currentPage} products: ${pageProducts.length}`);
        currentPage++;
      }
    }

    console.log('Total products loaded:', allProducts.length);
    const inStockProducts = allProducts.filter(item => parseInt(item.stock) > 0);
    console.log('Products in stock:', inStockProducts.length);
    
    return allProducts;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};
