'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from '@/components/Common/ProductCard';
import toast from 'react-hot-toast';
import { productAPI, transformProductData } from '@/services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';



export default function BestSellingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch bestselling products
    useEffect(() => {
        fetchBestsellingProducts();
    }, []);

    const fetchBestsellingProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getBestsellingProducts(10);
            
            if (data.success) {
                // Transform API data to match component structure
                const transformedProducts = data.data.map(product => transformProductData(product));
                setProducts(transformedProducts);
            } else {
                console.error('Failed to fetch bestselling products:', data.message);
            }
        } catch (error) {
            console.error('Error fetching bestselling products:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <section className="py-8 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Best Selling Product</h2>
                    
                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button className="best-selling-prev-btn w-10 h-10 rounded-lg border border-pink-300 text-gray-800 hover:bg-pink-50 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="best-selling-next-btn w-10 h-10 rounded-lg border border-pink-300 text-gray-800 hover:bg-pink-50 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Products Carousel */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        loop={true}
                        navigation={{
                            nextEl: '.best-selling-next-btn',
                            prevEl: '.best-selling-prev-btn',
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            768: {
                                slidesPerView: 3,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                            1280: {
                                slidesPerView: 5,
                            },
                        }}
                        className="best-selling-swiper !py-5 !px-1"
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductCard
                                    product={product}
                                    onWishlistToggle={handleWishlistToggle}
                                    onAddToCart={handleAddToCart}
                                    showWishlistOnHover={false}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );
}
