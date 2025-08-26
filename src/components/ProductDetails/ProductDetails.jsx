'use client';

import React, { useState } from 'react';
import { Star, Heart, Minus, Plus, ShoppingCart, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/Common/ProductCard';
import CountdownTimer from '@/components/Common/CountdownTimer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Sample product data matching the image
const productData = {
    id: 1,
    name: "Forpink Rign",
    price: 460,
    originalPrice: 680,
    rating: 5,
    reviewCount: 11,
    description: "Celebrate timeless love with the Forpink Ring — a delicate fusion of elegance, charm, and everyday beauty. Perfect for gifting or treating yourself.",
    images: [
        "/images/featured/img.png",
        "/images/featured/img1.png",
        "/images/featured/img.png",
        "/images/featured/img1.png",
        "/images/featured/img.png",
        "/images/featured/img1.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    category: "Rings",
    brand: "ForPink",
    sku: "FP-RING-001",
    availability: "In Stock",
    features: [
        "18k White Gold Setting",
        "Brilliant-Cut Diamond",
        "VS1 Clarity",
        "G Color Grade",
        "Lifetime Warranty"
    ],
    specifications: {
        "Metal": "18k White Gold",
        "Stone": "Natural Diamond",
        "Clarity": "VS1",
        "Color": "G",
        "Cut": "Brilliant",
        "Weight": "1.5 Carats"
    }
};

// Sample reviews
const reviews = [
    {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        date: "2024-01-15",
        comment: "Absolutely beautiful ring! The diamond sparkles brilliantly and the craftsmanship is exceptional. Highly recommend!",
        verified: true
    },
    {
        id: 2,
        name: "Michael Chen",
        rating: 4,
        date: "2024-01-10",
        comment: "Great quality and fast delivery. The ring looks exactly as pictured. Very satisfied with my purchase.",
        verified: true
    },
    {
        id: 3,
        name: "Emily Davis",
        rating: 5,
        date: "2024-01-05",
        comment: "Perfect for my engagement! The diamond is stunning and the setting is elegant. Couldn't be happier!",
        verified: true
    }
];

// Sample related products
const relatedProducts = [
    {
        id: 2,
        name: "Sapphire Ring",
        price: 320.00,
        originalPrice: 480.00,
        rating: 4.3,
        image: "/images/featured/img1.png",
        category: "rings",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 3,
        name: "Pearl Necklace",
        price: 180.00,
        originalPrice: null,
        rating: 4.7,
        image: "/images/featured/img.png",
        category: "necklace",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 4,
        name: "Gold Bracelet",
        price: 290.00,
        originalPrice: 390.00,
        rating: 4.2,
        image: "/images/featured/img1.png",
        category: "bracelet",
        isWishlisted: false,
        isHighlighted: false
    },
    {
        id: 5,
        name: "Emerald Earrings",
        price: 220.00,
        originalPrice: null,
        rating: 4.6,
        image: "/images/featured/img.png",
        category: "earrings",
        isWishlisted: false,
        isHighlighted: false
    }
];

export default function ProductDetails() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(2);
    const [selectedSize, setSelectedSize] = useState("M");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        console.log('Added to cart:', { product: productData, quantity, size: selectedSize });
    };

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
    };

    const discount = productData.originalPrice ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen ">
            <div className="max-w-6xl mx-auto px-8 py-4">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <nav className="flex text-sm text-gray-500">
                        <a href="#" className="hover:text-pink-500">Home</a>
                        <span className="mx-2">/</span>
                        <a href="#" className="hover:text-pink-500">Products</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{productData.name}</span>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 mb-12">
                    {/* Product Images - Left Panel */}
                    <div className="space-y-4 lg:w-[40%]">
                        {/* Main Image with light pink background */}
                        <div className="aspect-square bg-[#FEF2F4] rounded overflow-hidden border border-[#E7E7E7]">
                            <img
                                src={productData.images[selectedImage]}
                                alt={productData.name}
                                className="w-full h-full object-cover p-2"
                            />
                        </div>

                        {/* Thumbnail Images Slider */}
                        <div className="relative">
                            <Swiper
                                modules={[Navigation, Pagination]}
                                spaceBetween={12}
                                slidesPerView={4}
                                loop={true}
                                navigation={{
                                    nextEl: '.swiper-button-next',
                                    prevEl: '.swiper-button-prev',
                                }}
                                pagination={{
                                    clickable: true,
                                    el: '.swiper-pagination',
                                }}
                                className="thumbnail-swiper"
                            >
                                {productData.images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <button
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all w-full ${selectedImage === index
                                                ? 'border-pink-500'
                                                : 'border-gray-200 hover:border-pink-300'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${productData.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Custom Navigation Buttons */}
                            <button className="swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-4 h-4  rounded-full shadow-lg flex items-center justify-center  transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8  rounded-full shadow-lg flex items-center justify-center  transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Pagination Dots */}
                            <div className="swiper-pagination flex justify-center mt-3 space-x-1"></div>
                        </div>
                    </div>

                    {/* Product Info - Right Panel */}
                    <div className="space-y-6 lg:w-[60%]">
                        {/* Product Header - Title, Stars, Reviews in one line */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {productData.name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>
                                <span className="text-red-500 font-medium">{productData.reviewCount} Reviews</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed">
                            {productData.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ৳{productData.price}
                            </span>
                            {productData.originalPrice && (
                                <span className="text-xl text-gray-500 line-through">
                                    ৳{productData.originalPrice}
                                </span>
                            )}
                        </div>

                        <div className='flex items-center justify-between gap-4 flex-wrap'>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                                    <button
                                        onClick={() => handleQuantityChange('decrease')}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange('increase')}
                                        className="p-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Size Selector */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Size</label>
                                <div className="flex gap-2">
                                    {productData.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg border transition-colors ${selectedSize === size
                                                ? 'bg-pink-500 text-white border-pink-500'
                                                : 'border-gray-300 text-gray-700 hover:border-pink-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='mb-2'>
                            <label className="block text-sm font-medium text-gray-700">Offer time</label>
                        </div>
                        <div className='flex items-center justify-between gap-4'>
                            {/* Offer Timer */}
                            <div className="space-y-2">
                                <CountdownTimer endDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 45 * 60 * 1000 + 5 * 1000)} />
                            </div>
                            <button
                                onClick={handleWishlistToggle}
                                className={`p-3 rounded-lg border transition-colors ${isWishlisted
                                    ? 'bg-pink-500 text-white border-pink-500'
                                    : 'border-gray-300 text-gray-600 hover:border-pink-300 hover:text-pink-500'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-white text-[#EF3D6A] py-3 px-1 lg:px-6 rounded cursor-pointer font-semibold border-[1.5px] border-[#EF3D6A] hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to cart
                            </button>
                            <button className="flex-1 rounded bg-[#EF3D6A] text-white py-3 px-1 lg:px-6 cursor-pointer font-semibold hover:bg-[#C1274F] transition-colors">
                                Buy Now
                            </button>
                        </div>
                        <div className='border-b border-[#E7E7E7]'>

                        </div>


                        {/* Collapsible Sections */}
                        <div className="space-y-4">
                            <div className="border border-[#F6F6F6] rounded bg-[#F6F6F6]">
                                <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-900">Additional info</span>
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="border border-[#F6F6F6] rounded bg-[#F6F6F6]">
                                <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-900">Delivery & return info</span>
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Similar Product */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Product</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                {/* Product Image */}
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover "
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4 space-y-2">
                                    {/* Product Title */}
                                    <div className='flex items-center justify-between'>
                                        <h3 className="font-bold text-gray-900 mb-0">Hand Ring</h3>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm text-gray-600">4.5</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <p className="text-lg font-semibold text-gray-900">240.00 BDT</p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <button className="flex-1 bg-white text-[#EF3D6A] py-2 px-3 rounded text-sm font-semibold border border-[#EF3D6A] hover:bg-pink-50 transition-colors cursor-pointer">
                                            Add to cart
                                        </button>
                                        <button className="flex-1 bg-[#EF3D6A] text-white py-2 px-3 rounded text-sm font-semibold hover:bg-[#C1274F] transition-colors cursor-pointer">
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .thumbnail-swiper {
                    padding: 0 40px;
                }
                .swiper-button-next,
                .swiper-button-prev {
                    display: flex !important;
                }
                .swiper-pagination {
                    position: relative;
                    margin-top: 10px;
                }
                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: #d1d5db;
                    opacity: 1;
                }
                .swiper-pagination-bullet-active {
                    background: #ef3d6a;
                }
            `}</style>
        </div>
    );
}

