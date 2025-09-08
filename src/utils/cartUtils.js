import { toast } from 'react-hot-toast';

/**
 * Common utility function to add a product to cart with its first variant
 * @param {Object} product - The product object
 * @param {Function} addToCart - The addToCart function from AppContext
 * @param {number} quantity - Quantity to add (default: 1)
 */
export const addProductToCart = (product, addToCart, quantity = 1) => {
  try {
    // Get the first available variant or create a proper variant object
    let selectedVariant = null;
    
    if (product.variants && product.variants.length > 0) {
      // Get the first variant and extract size/color attributes
      const firstVariant = product.variants[0];
      const sizeAttr = firstVariant.attributes?.find(attr => attr.name === 'Size');
      const colorAttr = firstVariant.attributes?.find(attr => attr.name === 'Color');
      
      selectedVariant = {
        size: sizeAttr?.value || 'Default',
        color: colorAttr?.value || 'Default',
        hexCode: colorAttr?.hexCode || '#000000',
        currentPrice: firstVariant.currentPrice || product.price,
        originalPrice: firstVariant.originalPrice || product.originalPrice,
        sku: firstVariant.sku,
        stockQuantity: firstVariant.stockQuantity || 10,
        stockStatus: firstVariant.stockStatus || 'in_stock'
      };
    } else {
      // If no variants, create a default variant
      selectedVariant = {
        size: 'Default',
        color: 'Default',
        hexCode: '#000000',
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        sku: product.slug || 'default-sku',
        stockQuantity: 10,
        stockStatus: 'in_stock'
      };
    }

    // Create a proper product object for cart
    const cartProduct = {
      _id: product._id,
      title: product.title || product.name,
      slug: product.slug,
      featuredImage: product.featuredImage || product.image,
      basePrice: product.price,
      variants: product.variants || []
    };

    addToCart(cartProduct, selectedVariant, quantity);
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error('Failed to add product to cart');
  }
};
