'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { heroBannerAPI, heroProductAPI } from '@/services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


function HeroSlider({ sliderData, loading }) {
    if (loading) {
        return (
            <div className="h-full bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading hero banners...</p>
                </div>
            </div>
        );
    }

    if (!sliderData || sliderData.length === 0) {
        return (
            <div className="h-full bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-pink-200 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hero Banners</h3>
                    <p className="text-gray-500 mb-4">Hero banners will appear here once added by admin</p>
                    <div className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Contact admin to add banners
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }}
            pagination={{
                clickable: true,
                el: '.swiper-pagination',
                renderBullet: function (index, className) {
                    return `<span class="${className} h-2 rounded-full transition-all duration-300 w-2 bg-pink-300/60 hover:bg-pink-400"></span>`;
                },
            }}
            // autoplay={{
            //     delay: 4500,
            //     disableOnInteraction: false,
            // }}
            loop={sliderData.length > 1}
            className="h-full"
        >
            {sliderData.map((slide) => (
                <SwiperSlide key={slide.id}>
                    <div className={`relative h-full bg-gradient-to-r ${slide.backgroundGradient} overflow-hidden rounded-2xl`}>
                        {/* Background decorative elements */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-pink-300 rounded-full blur-sm"></div>
                            <div className="absolute top-16 sm:top-32 right-4 sm:right-20 w-8 h-8 sm:w-12 sm:h-12 bg-pink-200 rounded-full blur-sm"></div>
                            <div className="absolute bottom-12 sm:bottom-20 left-8 sm:left-32 w-10 h-10 sm:w-16 sm:h-16 bg-pink-100 rounded-full blur-sm"></div>
                            <div className="absolute bottom-16 sm:bottom-32 right-4 sm:right-10 w-6 h-6 sm:w-8 sm:h-8 bg-pink-300 rounded-full blur-sm"></div>
                        </div>

                        {/* Main Content */}
                        <div className="relative h-full flex flex-col lg:flex-row items-center justify-between">
                            {/* Left Text Content */}
                            <div className="flex-1 z-10 px-4 sm:px-6 lg:px-8 lg:ps-12 py-6 lg:py-0 text-center lg:text-left">
                                <div className="transform transition-all duration-700 ease-out py-6">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2 sm:mb-4">
                                        {slide.title}
                                    </h1>

                                    <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 lg:mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                                        {slide.description}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-0 justify-center lg:justify-start">
                                        <a 
                                            href={slide.button1Link || '/shop'}
                                            className="bg-pink-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                                            aria-label={slide.button1Text || 'Shop our jewelry collection'}
                                        >
                                            {slide.button1Text || 'Shop Now'}
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </a>

                                        <a 
                                            href={slide.button2Link || '/categories'}
                                            className="border-2 border-gray-800 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white text-sm sm:text-base"
                                            aria-label={slide.button2Text || 'Explore our jewelry categories'}
                                        >
                                            {slide.button2Text || 'Explore Now'}
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Model Image */}
                            <div className="hidden lg:block flex-1 max-w-sm ml-8 h-full">
                                <div className="relative h-full">
                                    <img
                                        src={slide.modelImage}
                                        alt="Jewelry Model"
                                        className="absolute right-0 bottom-0 w-full h-auto object-cover rounded-2xl transition-all duration-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}

            {/* Custom Navigation Arrows */}
            <button 
                className="swiper-button-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-20 hover:scale-110"
                aria-label="Previous slide"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button 
                className="swiper-button-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-20 hover:scale-110"
                aria-label="Next slide"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Custom Pagination */}
            <div className="relative">
                <div className="swiper-pagination absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20"></div>
            </div>
        </Swiper>
    );
}

function ProductImageGrid({ productImages, loading }) {
    if (loading) {
        return (
            <div className="h-full flex flex-col gap-2 sm:gap-4">
                <div className="relative group overflow-hidden rounded-xl shadow-lg animate-pulse bg-gray-200 h-48"></div>
                <div className="flex gap-2 sm:gap-4 h-24 sm:h-32 md:h-36">
                    <div className="flex-1 relative group overflow-hidden rounded-xl shadow-lg animate-pulse bg-gray-200"></div>
                    <div className="flex-1 relative group overflow-hidden rounded-xl shadow-lg animate-pulse bg-gray-200"></div>
                </div>
            </div>
        );
    }

    if (!productImages || productImages.length === 0) {
        return (
            <div className="h-full flex flex-col gap-2 sm:gap-4">
                <div className="relative group overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Featured Products</h3>
                        <p className="text-sm text-gray-500">Products will appear here once added by admin</p>
                    </div>
                </div>
            </div>
        );
    }

    const [largeImage] = productImages.filter(img => img.size === 'large');
    const smallImages = productImages.filter(img => img.size === 'small');

    return (
        <div className="h-full flex flex-col gap-2 sm:gap-4">
            {/* Top Large Image */}
            {largeImage && (
                <Link 
                    href={`/product/${largeImage.productId?.slug}`}
                    className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block"
                >
                    <img
                        src={largeImage.customImage || largeImage.productId?.featuredImage || largeImage.productId?.images?.[0] || "/images/placeholder.png"}
                        alt={largeImage.productId?.title || largeImage.productId?.name || "Featured Product"}
                        className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge */}
                    {largeImage.badge?.text && (
                        <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 ${largeImage.badge.color} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                            {largeImage.badge.text}
                        </div>
                    )}
                </Link>
            )}

            {/* Bottom Two Small Images */}
            <div className="flex gap-2 sm:gap-4 h-24 sm:h-32 md:h-36">
                {smallImages.map((product) => (
                    <Link
                        key={product._id}
                        href={`/product/${product.productId?.slug}`}
                        className="flex-1 relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block"
                    >
                        <img
                            src={product.customImage || product.productId?.featuredImage || product.productId?.images?.[0] || "/images/placeholder.png"}
                            alt={product.productId?.title || product.productId?.name || "Product"}
                            className="w-full h-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Badge */}
                        {product.badge?.text && (
                            <div className={`absolute top-1 sm:top-2 left-1 sm:left-2 ${product.badge.color} text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-lg`}>
                                {product.badge.text}
                            </div>
                        )}

                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function HeroSection() {
    const [sliderData, setSliderData] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHeroBanners = async () => {
            try {
                setLoading(true);
                const response = await heroBannerAPI.getHeroBanners();
                
                if (response.success && response.data && response.data.length > 0) {
                    setSliderData(response.data);
                } else {
                    setSliderData([]);
                }
            } catch (error) {
                console.error('Error fetching hero banners:', error);
                setError(error.message);
                setSliderData([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchHeroProducts = async () => {
            try {
                setProductsLoading(true);
                const response = await heroProductAPI.getHeroProducts();
                
                if (response.success && response.data && response.data.length > 0) {
                    setProductImages(response.data);
                } else {
                    setProductImages([]);
                }
            } catch (error) {
                console.error('Error fetching hero products:', error);
                setProductImages([]);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchHeroBanners();
        fetchHeroProducts();
    }, []);

    return (
        <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-4 sm:py-6 lg:py-8 px-4">
            <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Left Slider - Full width on mobile, 64% on desktop */}
                    <div className="w-full lg:w-[64%] h-64 sm:h-80 md:h-96 ">
                        <HeroSlider sliderData={sliderData} loading={loading} />
                    </div>

                    {/* Right Product Images - Full width on mobile, remaining on desktop */}
                    <div className="w-full lg:flex-1 h-48 sm:h-56 md:h-64 lg:h-auto">
                        <ProductImageGrid productImages={productImages} loading={productsLoading} />
                    </div>
                </div>
            </div>
        </section>
    );
}