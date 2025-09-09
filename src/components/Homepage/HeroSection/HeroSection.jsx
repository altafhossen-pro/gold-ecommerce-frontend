'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Slider data
const sliderData = [
    {
        id: 1,
        title: "Refine Your Elegance In Every Detail",
        description: "Unlock your signature look with jewelry crafted for perfectionists. Every piece is thoughtfully designed to highlight your unique elegance.",
        modelImage: "/images/slider-model1.png",
        backgroundGradient: "from-pink-100 via-pink-50 to-pink-100"
    },
    {
        id: 2,
        title: "Discover Timeless Beauty & Grace",
        description: "Experience the art of fine jewelry making with our exquisite collection. Each piece tells a story of craftsmanship and elegance.",
        modelImage: "/images/slider-model1.png",
        backgroundGradient: "from-purple-100 via-purple-50 to-purple-100"
    },
    {
        id: 3,
        title: "Express Your Style & Personality",
        description: "From classic to contemporary designs, find jewelry that perfectly complements your personality and style preferences.",
        modelImage: "/images/slider-model1.png",
        backgroundGradient: "from-rose-100 via-rose-50 to-rose-100"
    }
];

// Product images for right side
const productImages = [
    {
        id: 1,
        image: "/images/hero-product1.png",
        badge: { text: "Hot Product", color: "bg-pink-500" },
        size: "large" // Top large image
    },
    {
        id: 2,
        image: "/images/hero-product2.png",
        badge: { text: "30% OFF", color: "bg-pink-500" },
        size: "small" // Bottom left small
    },
    {
        id: 3,
        image: "/images/hero-product3.png",
        badge: { text: "New", color: "bg-pink-500" },
        size: "small" // Bottom right small
    }
];

function HeroSlider() {
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
            autoplay={{
                delay: 4500,
                disableOnInteraction: false,
            }}
            loop={true}
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
                            <div className="flex-1 z-10 px-4 sm:px-6 lg:px-8 lg:ps-12 py-6 lg:py-12 text-center lg:text-left">
                                <div className="transform transition-all duration-700 ease-out">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2 sm:mb-4">
                                        {slide.title}
                                    </h1>

                                    <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 lg:mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                                        {slide.description}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 justify-center lg:justify-start">
                                        <button className="bg-pink-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                                            Shop Now
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>

                                        <button className="border-2 border-gray-800 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white text-sm sm:text-base">
                                            Explore Now
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Model Image */}
                            <div className="hidden lg:block flex-1 max-w-sm ml-8">
                                <div className="relative">
                                    <img
                                        src={slide.modelImage}
                                        alt="Jewelry Model"
                                        className="w-full h-auto object-cover rounded-2xl transition-all duration-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}

            {/* Custom Navigation Arrows */}
            <button className="swiper-button-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-20 hover:scale-110 ">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button className="swiper-button-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-20 hover:scale-110 ">
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

function ProductImageGrid() {
    const [largeImage] = productImages.filter(img => img.size === 'large');
    const smallImages = productImages.filter(img => img.size === 'small');

    return (
        <div className="h-full flex flex-col gap-2 sm:gap-4">
            {/* Top Large Image */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <img
                    src={largeImage.image}
                    alt="Featured Product"
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge */}
                <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 ${largeImage.badge.color} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                    {largeImage.badge.text}
                </div>
            </div>

            {/* Bottom Two Small Images */}
            <div className="flex gap-2 sm:gap-4 h-24 sm:h-32 md:h-36">
                {smallImages.map((product) => (
                    <div
                        key={product.id}
                        className="flex-1 relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                        <img
                            src={product.image}
                            alt="Product"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Badge */}
                        <div className={`absolute top-1 sm:top-2 left-1 sm:left-2 ${product.badge.color} text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold shadow-lg`}>
                            {product.badge.text}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-4 sm:py-6 lg:py-8 px-4">
            <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Left Slider - Full width on mobile, 64% on desktop */}
                    <div className="w-full lg:w-[64%] h-64 sm:h-80 md:h-96 lg:h-auto">
                        <HeroSlider />
                    </div>

                    {/* Right Product Images - Full width on mobile, remaining on desktop */}
                    <div className="w-full lg:flex-1 h-48 sm:h-56 md:h-64 lg:h-auto">
                        <ProductImageGrid />
                    </div>
                </div>
            </div>
        </section>
    );
}