'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from '@/components/Common/ProductCard';
import toast from 'react-hot-toast';
import { productAPI, transformProductData } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import { addProductToCart } from '@/utils/cartUtils';
import { addProductToWishlist } from '@/utils/wishlistUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function NewArrivalProducts() {
    const { addToCart, addToWishlist, wishlist } = useAppContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch new arrival products
    useEffect(() => {
        fetchNewArrivalProducts();
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

    const fetchNewArrivalProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getNewArrivalProducts(10);
            
            if (data.success) {
                // Keep original data for variants like other components do
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
            } else {
                toast.error('Failed to fetch new arrival products');
            }
        } catch (error) {
            console.error('Error fetching new arrival products:', error);
            toast.error('Error fetching new arrival products');
        } finally {
            setLoading(false);
        }
    };

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
        <section className="py-8 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">New Arrival Product</h2>
                    
                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button className="new-arrival-prev-btn w-10 h-10 rounded-lg border border-pink-300 text-gray-800 hover:bg-pink-50 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="new-arrival-next-btn w-10 h-10 rounded-lg border border-pink-300 text-gray-800 hover:bg-pink-50 transition-colors flex items-center justify-center">
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
                            nextEl: '.new-arrival-next-btn',
                            prevEl: '.new-arrival-prev-btn',
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
                        className="new-arrival-swiper !py-5 !px-1"
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
