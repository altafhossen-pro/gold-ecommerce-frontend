'use client';

import React, { useState } from 'react';
import { Star, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/Common/ProductCard';

// Sample product data
const productData = {
    id: 1,
    name: "Elegant Diamond Ring",
    price: 240.00,
    originalPrice: 440.00,
    rating: 4.5,
    reviewCount: 128,
    description: "This stunning diamond ring features a brilliant-cut diamond set in 18k white gold. Perfect for special occasions, this elegant piece showcases exceptional craftsmanship and timeless beauty.",
    images: [
        "/images/featured/img.png",
        "/images/featured/img1.png",
        "/images/featured/img.png",
        "/images/featured/img1.png"
    ],
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
    const [quantity, setQuantity] = useState(1);
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
        console.log('Added to cart:', { product: productData, quantity });
    };

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
    };

    const discount = productData.originalPrice ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={productData.images[selectedImage]}
                                alt={productData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-4 gap-3">
                            {productData.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedImage === index 
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
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Product Header */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {productData.name}
                            </h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">{productData.rating}</span>
                                    <span className="text-gray-500">({productData.reviewCount} reviews)</span>
                                </div>
                                <span className="text-green-600 font-medium">{productData.availability}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ${productData.price.toFixed(2)}
                            </span>
                            {productData.originalPrice && (
                                <>
                                    <span className="text-xl text-gray-500 line-through">
                                        ${productData.originalPrice.toFixed(2)}
                                    </span>
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-semibold">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed">
                            {productData.description}
                        </p>

                        {/* Features */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
                            <ul className="space-y-2">
                                {productData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-600">
                                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
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
                                <span className="text-gray-500">Available: 15 in stock</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleWishlistToggle}
                                    className={`p-3 rounded-lg border transition-colors ${
                                        isWishlisted 
                                            ? 'bg-pink-500 text-white border-pink-500' 
                                            : 'border-gray-300 text-gray-600 hover:border-pink-300 hover:text-pink-500'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-pink-300 hover:text-pink-500 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div className="border-t pt-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">SKU:</span>
                                <span className="text-gray-900">{productData.sku}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Category:</span>
                                <span className="text-gray-900">{productData.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Brand:</span>
                                <span className="text-gray-900">{productData.brand}</span>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-6 pt-6 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="w-4 h-4" />
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="w-4 h-4" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <RotateCcw className="w-4 h-4" />
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'description', label: 'Description' },
                                { id: 'specifications', label: 'Specifications' },
                                { id: 'reviews', label: 'Reviews' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-pink-500 text-pink-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'description' && (
                            <div className="prose max-w-none">
                                <p className="text-gray-600 leading-relaxed">
                                    {productData.description}
                                </p>
                                <p className="text-gray-600 leading-relaxed mt-4">
                                    This exquisite piece is perfect for special occasions and everyday elegance. 
                                    The diamond's brilliance is enhanced by the premium white gold setting, 
                                    creating a timeless piece that will be cherished for generations.
                                </p>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(productData.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="font-medium text-gray-700">{key}:</span>
                                        <span className="text-gray-600">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Customer Reviews ({reviews.length})
                                    </h3>
                                    <button className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors">
                                        Write a Review
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.rating 
                                                                            ? 'fill-yellow-400 text-yellow-400' 
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.date).toLocaleDateString()}
                                                        </span>
                                                        {review.verified && (
                                                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                                                                Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onWishlistToggle={() => {}}
                                onAddToCart={() => {}}
                                showWishlistOnHover={false}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

