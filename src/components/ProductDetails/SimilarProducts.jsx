'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import { productAPI, transformProductData } from '@/services/api';
import ProductCard from '@/components/Common/ProductCard';
import { addProductToCart } from '@/utils/cartUtils';

const SimilarProducts = ({ currentProductId, currentProductCategory }) => {
  const { addToCart } = useAppContext();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProductId && currentProductCategory) {
      fetchSimilarProducts();
    }
  }, [currentProductId, currentProductCategory]);

  const fetchSimilarProducts = async () => {
    try {
      setLoading(true);
      // Fetch products from the same category, excluding current product
      const response = await productAPI.getProducts({
        category: currentProductCategory,
        limit: 8,
        page: 1
      });
      
      if (response.success) {
        // Filter out the current product and keep original data for variants
        const products = response.data || [];
        const filteredProducts = products
          .filter(product => product._id !== currentProductId)
          .map(product => ({
            ...transformProductData(product),
            variants: product.variants || [], // Keep original variants
            _id: product._id, // Keep original ID
            title: product.title, // Keep original title
            slug: product.slug, // Keep original slug
            featuredImage: product.featuredImage // Keep original image
          }));
        setSimilarProducts(filteredProducts || []);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback((product) => {
    addProductToCart(product, addToCart, 1);
  }, [addToCart]);

  const handleWishlistToggle = useCallback((productId) => {
    // Wishlist functionality can be implemented here
    toast.success('Added to wishlist!');
  }, []);

  const handleAddToCartFromCard = useCallback((productId) => {
    const selectedProduct = similarProducts.find(p => p.id === productId || p._id === productId);
    if (selectedProduct) {
      handleAddToCart(selectedProduct);
    }
  }, [similarProducts, handleAddToCart]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentProductCategory || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCartFromCard}
              showWishlistOnHover={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarProducts;
