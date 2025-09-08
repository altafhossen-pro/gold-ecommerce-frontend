'use client';

import React from 'react';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';

function ProductCard({ product, onWishlistToggle, onAddToCart, showWishlistOnHover = true }) {

    return (
        <div className="relative group overflow-hidden rounded-xl shadow-lg border border-[#E7E7E7] hover:shadow-lg transition-all bg-[#F6F6F6] duration-300 hover:ring-1 hover:ring-[#F7AABC]">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden ">
                <Link href={`/product/${product.slug}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>

                {/* Wishlist Icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onWishlistToggle(product.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 cursor-pointer ${product.isWishlisted
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-gray-200 cursor-pointer hover:text-black'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${product.isWishlisted ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4 ">
                <div className='flex items-center justify-between mb-2'>
                    <Link href={`/product/${product.slug}`} className="flex-1 mr-2">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg leading-tight overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {product.name}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm text-gray-600">{product.rating}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">{product?.price?.toFixed(2)} BDT</span>
                    {product?.originalPrice && (
                        <span className="text-gray-500 line-through text-xs sm:text-sm">{product?.originalPrice?.toFixed(2)} BDT</span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product.id);
                    }}
                    className="w-full py-2 sm:py-3 px-3 sm:px-4 cursor-pointer rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 border border-[#EF3D6A] text-[#EF3D6A] hover:bg-[#EF3D6A] hover:text-white"
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
