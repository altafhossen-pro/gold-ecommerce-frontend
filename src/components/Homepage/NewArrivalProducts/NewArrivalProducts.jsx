'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from '@/components/Common/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// New arrival products data
const newArrivalProducts = [
    {
        id: 1,
        name: "Hand Ring",
        price: 240.00,
        originalPrice: null,
        rating: 4.5,
        image: "/images/featured/img.png",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 2,
        name: "Nekless",
        price: 240.00,
        originalPrice: 440.00,
        rating: 4.5,
        image: "/images/featured/img1.png",
        isWishlisted: false,
        isHighlighted: true
    },
    {
        id: 3,
        name: "Hand Ring",
        price: 240.00,
        originalPrice: null,
        rating: 4.5,
        image: "/images/featured/img.png",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 4,
        name: "Combo Pack",
        price: 240.00,
        originalPrice: 440.00,
        rating: 4.5,
        image: "/images/featured/img1.png",
        isWishlisted: true,
        isHighlighted: true
    },
    {
        id: 5,
        name: "Hand Ring",
        price: 240.00,
        originalPrice: null,
        rating: 4.5,
        image: "/images/featured/img.png",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 6,
        name: "Nekless",
        price: 240.00,
        originalPrice: 440.00,
        rating: 4.5,
        image: "/images/featured/img1.png",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 7,
        name: "Combo Pack",
        price: 240.00,
        originalPrice: 440.00,
        rating: 4.5,
        image: "/images/featured/img.png",
        isWishlisted: false,
        isHighlighted: false
    }
];

export default function NewArrivalProducts() {
    const [products, setProducts] = React.useState(newArrivalProducts);

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
            </div>
        </section>
    );
}
