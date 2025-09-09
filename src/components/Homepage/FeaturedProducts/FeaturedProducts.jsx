'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/Common/ProductCard';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI, transformProductData } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import { addProductToCart } from '@/utils/cartUtils';
import { addProductToWishlist } from '@/utils/wishlistUtils';
import { useRouter } from 'next/navigation';

// Dynamic filter categories will be generated from API data

export default function FeaturedProducts() {
    const { addToCart, addToWishlist, wishlist } = useAppContext();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [totalFeaturedProducts, setTotalFeaturedProducts] = useState(0);

    // Fetch featured products (limited to 10 for 2 rows × 5 columns layout)
    // "See More" button shows only when total featured products > 10
    useEffect(() => {
        fetchFeaturedProducts();
        fetchCategories();
    }, []);

    // Update products wishlist state when global wishlist changes
    useEffect(() => {
        if (products.length > 0) {
            setProducts(prev => prev.map(product => ({
                ...product,
                isWishlisted: wishlist.some(item => item.productId === product._id)
            })));
        }
    }, [wishlist]);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getFeaturedProducts(10); // Limit to 10 products
            
            if (data.success) {
                // Keep original data for variants like SimilarProducts does
                const productsData = data.data || [];
                const transformedProducts = productsData.map(product => ({
                    ...transformProductData(product),
                    variants: product.variants || [], // Keep original variants
                    _id: product._id, // Keep original ID
                    title: product.title, // Keep original title
                    slug: product.slug, // Keep original slug
                    featuredImage: product.featuredImage, // Keep original image
                    isWishlisted: wishlist.some(item => item.productId === product._id) // Sync with global wishlist
                }));
                setProducts(transformedProducts);
                
                // Store total count for "See More" button logic
                if (data.pagination && data.pagination.total) {
                    setTotalFeaturedProducts(data.pagination.total);
                }
            } else {
                toast.error('Failed to fetch featured products');
            }
        } catch (error) {
            console.error('Error fetching featured products:', error);
            toast.error('Error fetching featured products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryAPI.getCategories();
            
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Generate filter categories from products
    const filterCategories = [
        { id: 'all', name: 'All' },
        ...categories.map(cat => ({
            id: cat.name.toLowerCase(),
            name: cat.name
        }))
    ];

    const filteredProducts = activeFilter === 'all'
        ? products
        : products.filter(product => product.category === activeFilter);

    const handleWishlistToggle = (productId) => {
        const product = products.find(p => p.id === productId || p._id === productId);
        if (product) {
            addProductToWishlist(product, addToWishlist);
            // Local state will be updated by useEffect when global wishlist changes
        }
    };

    const handleAddToCart = useCallback((productId) => {
        const selectedProduct = products.find(p => p.id === productId || p._id === productId);
        if (selectedProduct) {
            addProductToCart(selectedProduct, addToCart, 1);
        }
    }, [products, addToCart]);

    return (
        <section className="py-8 sm:py-12 px-4 bg-white">
            <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Our Features Product</h2>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-2">
                        {filterCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveFilter(category.id)}
                                className={`px-3 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${activeFilter === category.id
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid - Maximum 10 products (2 rows × 5 columns) */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onWishlistToggle={handleWishlistToggle}
                                onAddToCart={handleAddToCart}
                                showWishlistOnHover={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-12">
                        <div className="max-w-md mx-auto px-4">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4">
                                No products found based on your filter: <span className="font-medium text-pink-500">{filterCategories.find(cat => cat.id === activeFilter)?.name}</span>
                            </p>
                            <button 
                                onClick={() => setActiveFilter('all')}
                                className="bg-pink-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors"
                            >
                                View All Products
                            </button>
                        </div>
                    </div>
                )}

                {/* See More Button - Show only when there are more than 10 total featured products */}
                {totalFeaturedProducts > 10 && (
                    <div className="text-center mt-8 sm:mt-12">
                        <button 
                            onClick={() => router.push('/shop')}
                            className="bg-white text-pink-500 px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm sm:text-base border-2 border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            See More Products
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
