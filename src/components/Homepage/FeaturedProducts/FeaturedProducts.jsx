'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/Common/ProductCard';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI, transformProductData } from '@/services/api';

// Dynamic filter categories will be generated from API data



export default function FeaturedProducts() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Fetch featured products
    useEffect(() => {
        fetchFeaturedProducts();
        fetchCategories();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getFeaturedProducts(20);
            
            if (data.success) {
                const transformedProducts = data.data.map(transformProductData);
                setProducts(transformedProducts);
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
        setProducts(prev => prev.map(product =>
            product.id === productId
                ? { ...product, isWishlisted: !product.isWishlisted }
                : product
        ));
    };

    const handleAddToCart = (productId) => {
        // Add to cart logic here
        console.log('Added to cart:', productId);
    };

    return (
        <section className="py-8 sm:py-12 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
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

                {/* Products Grid */}
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
            </div>
        </section>
    );
}
