'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, Minus, Plus, ShoppingCart, ChevronDown } from 'lucide-react';
import CountdownTimer from '@/components/Common/CountdownTimer';
import SimilarProducts from './SimilarProducts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import toast from 'react-hot-toast';
import { productAPI, transformProductData } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';



export default function ProductDetails({ productSlug }) {
    const { addToCart } = useAppContext();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
    const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch product data
    useEffect(() => {
        if (productSlug) {
            fetchProduct();
        }
    }, [productSlug]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getProductBySlug(productSlug);

            if (data.success) {
                setProduct(data.data);
                // Set default size and color if available
                if (data.data.variants && data.data.variants.length > 0) {
                    const firstVariant = data.data.variants[0];
                    const sizeAttr = firstVariant.attributes.find(attr => attr.name === 'Size');
                    const colorAttr = firstVariant.attributes.find(attr => attr.name === 'Color');

                    if (sizeAttr) setSelectedSize(sizeAttr.value);
                    if (colorAttr) setSelectedColor(colorAttr.value);
                } else {
                    // If no variants, set default values
                    setSelectedSize("Default");
                    setSelectedColor("Default");
                }
            } else {
                toast.error('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error fetching product');
        } finally {
            setLoading(false);
        }
    };



    // Get unique sizes and colors from variants
    const getUniqueSizes = () => {
        if (!product?.variants) return [];
        const sizes = product.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Size'))
            .filter(size => size)
            .map(size => size.value);
        return [...new Set(sizes)];
    };

    const getUniqueColors = () => {
        if (!product?.variants) return [];
        const colors = product.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Color'))
            .filter(color => color)
            .map(color => ({ value: color.value, hexCode: color.hexCode }));
        return colors.filter((color, index, self) =>
            index === self.findIndex(c => c.value === color.value)
        );
    };

    // Get available colors for selected size
    const getAvailableColorsForSize = (size) => {
        if (!product?.variants) return [];
        return product.variants
            .filter(variant => {
                const sizeAttr = variant.attributes.find(attr => attr.name === 'Size');
                return sizeAttr && sizeAttr.value === size;
            })
            .map(variant => {
                const colorAttr = variant.attributes.find(attr => attr.name === 'Color');
                return colorAttr ? { value: colorAttr.value, hexCode: colorAttr.hexCode } : null;
            })
            .filter(color => color);
    };

    // Get selected variant
    const getSelectedVariant = () => {
        if (!product?.variants) return null;
        return product.variants.find(variant => {
            const sizeAttr = variant.attributes.find(attr => attr.name === 'Size');
            const colorAttr = variant.attributes.find(attr => attr.name === 'Color');
            return sizeAttr?.value === selectedSize && colorAttr?.value === selectedColor;
        });
    };

    const selectedVariant = getSelectedVariant();
    const uniqueSizes = getUniqueSizes();
    const uniqueColors = getUniqueColors();
    const availableColors = getAvailableColorsForSize(selectedSize);

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        // Reset color when size changes
        const colorsForSize = getAvailableColorsForSize(size);
        if (colorsForSize.length > 0) {
            setSelectedColor(colorsForSize[0].value);
        } else {
            setSelectedColor("");
        }
    };

    const handleColorChange = (color) => {
        setSelectedColor(color);
    };

    const handleAddToCart = () => {
        if (!product) {
            toast.error('Product not available');
            return;
        }

        // Create selected variant object
        const selectedVariantData = selectedVariant ? {
            size: selectedSize,
            color: selectedColor,
            currentPrice: selectedVariant.currentPrice,
            originalPrice: selectedVariant.originalPrice,
            hexCode: selectedVariant.attributes.find(attr => attr.name === 'Color')?.hexCode,
            sku: selectedVariant.sku,
            stockQuantity: selectedVariant.stockQuantity,
            stockStatus: selectedVariant.stockStatus
        } : null;

        // Add to cart using context
        addToCart(product, selectedVariantData, quantity);
    };

    const handleBuyNow = () => {
        if (!product) {
            toast.error('Product not available');
            return;
        }

        // Create selected variant object
        const selectedVariantData = selectedVariant ? {
            size: selectedSize,
            color: selectedColor,
            currentPrice: selectedVariant.currentPrice,
            originalPrice: selectedVariant.originalPrice,
            hexCode: selectedVariant.attributes.find(attr => attr.name === 'Color')?.hexCode,
            sku: selectedVariant.sku,
            stockQuantity: selectedVariant.stockQuantity,
            stockStatus: selectedVariant.stockStatus
        } : null;

        // Add to cart using context
        addToCart(product, selectedVariantData, quantity);
        
        // Navigate to checkout page
        router.push('/checkout');
    };

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    // Calculate price from selected variant
    const getCurrentPrice = () => {
        if (selectedVariant) {
            return selectedVariant.currentPrice;
        }
        return product?.variants?.[0]?.currentPrice || product?.basePrice || 0;
    };

    const getOriginalPrice = () => {
        if (selectedVariant) {
            return selectedVariant.originalPrice;
        }
        return product?.variants?.[0]?.originalPrice || null;
    };

    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600">The product you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

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
                        <span className="text-gray-900">{product.title}</span>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 mb-12">
                    {/* Product Images - Left Panel */}
                    <div className="space-y-4 lg:w-[40%]">
                        {/* Main Image with light pink background */}
                        <div className="aspect-square bg-[#FEF2F4] rounded overflow-hidden border border-[#E7E7E7]">
                            <img
                                src={product.gallery?.[selectedImage]?.url || product.featuredImage || '/images/placeholder.png'}
                                alt={product.title}
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
                                {product.gallery && product.gallery.length > 0 ? (
                                    product.gallery.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <button
                                                onClick={() => setSelectedImage(index)}
                                                className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all w-full ${selectedImage === index
                                                    ? 'border-pink-500'
                                                    : 'border-gray-200 hover:border-pink-300'
                                                    }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.altText || `${product.title} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        </SwiperSlide>
                                    ))
                                ) : (
                                    <SwiperSlide>
                                        <div className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={product.featuredImage || '/images/placeholder.png'}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </SwiperSlide>
                                )}
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
                                {product.title}
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
                                <span className="text-red-500 font-medium">{product.totalReviews || 0} Reviews</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed">
                            {product.shortDescription || product.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ৳{currentPrice}
                            </span>
                            {originalPrice && (
                                <span className="text-xl text-gray-500 line-through">
                                    ৳{originalPrice}
                                </span>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                                <button
                                    onClick={() => handleQuantityChange('decrease')}
                                    className="p-3 cursor-pointer transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-semibold">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange('increase')}
                                    className="p-3 cursor-pointer transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Size and Color Selectors */}
                        <div className="flex items-start gap-8">
                            {/* Size Selector */}
                            {uniqueSizes.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Select Size</label>
                                    <div className="flex gap-2">
                                        {uniqueSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => handleSizeChange(size)}
                                                className={`w-8 h-8 rounded-md border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium cursor-pointer ${selectedSize === size
                                                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                                        : 'border-gray-300 text-gray-700 hover:border-pink-400 hover:bg-pink-50'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selector */}
                            {availableColors.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Select Color</label>
                                    <div className="flex gap-2">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleColorChange(color.value)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${selectedColor === color.value
                                                        ? 'border-pink-500 ring-2 ring-pink-200 shadow-sm'
                                                        : 'border-gray-300 hover:border-pink-400 hover:shadow-sm'
                                                    }`}
                                                title={color.value}
                                            >
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{
                                                        backgroundColor: color.hexCode,
                                                        border: color.hexCode?.toLowerCase() === '#ffffff' || color.hexCode?.toLowerCase() === '#fff'
                                                            ? '1px solid #d1d5db'
                                                            : 'none'
                                                    }}
                                                ></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                             <button 
                                 onClick={handleBuyNow}
                                 className="flex-1 rounded bg-[#EF3D6A] text-white py-3 px-1 lg:px-6 cursor-pointer font-semibold hover:bg-[#C1274F] transition-colors"
                             >
                                 Buy Now
                             </button>
                         </div>
                        <div className='border-b border-[#E7E7E7]'>

                        </div>


                        {/* Collapsible Sections */}
                        <div className="space-y-4">
                            {/* Additional Info */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Additional Information
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isAdditionalOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isAdditionalOpen && (
                                    <div className="px-6 py-4 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Brand</span>
                                                    <span className="text-sm text-gray-900">{product.brand || 'ForPink'}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">SKU</span>
                                                    <span className="text-sm text-gray-900">{selectedVariant?.sku || product.slug || 'FP-RING-001'}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Category</span>
                                                    <span className="text-sm text-gray-900">{product.category?.name || 'Jewelry'}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Product Type</span>
                                                    <span className="text-sm text-gray-900">{product.productType || 'simple'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Stock Status</span>
                                                    <span className="text-sm text-gray-900">
                                                        {selectedVariant?.stockStatus === 'in_stock' ? 'In Stock' :
                                                            selectedVariant?.stockStatus === 'out_of_stock' ? 'Out of Stock' :
                                                                selectedVariant?.stockStatus === 'low_stock' ? 'Low Stock' :
                                                                    selectedVariant?.stockStatus === 'pre_order' ? 'Pre Order' : 'In Stock'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Stock Quantity</span>
                                                    <span className="text-sm text-gray-900">{selectedVariant?.stockQuantity || product.totalStock || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Weight</span>
                                                    <span className="text-sm text-gray-900">{selectedVariant?.weight ? `${selectedVariant.weight}g` : '2.5g'}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Warranty</span>
                                                    <span className="text-sm text-gray-900">{product.warrantyInfo || '1 Year'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specifications from API */}
                                        {product.specifications && product.specifications.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {product.specifications.map((spec, index) => (
                                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50">
                                                            <span className="text-sm font-medium text-gray-600">{spec.key}</span>
                                                            <span className="text-sm text-gray-900">{spec.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Static Specifications for Jewelry */}
                                        {(!product.specifications || product.specifications.length === 0) && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                        <span className="text-sm font-medium text-gray-600">Material</span>
                                                        <span className="text-sm text-gray-900">18k White Gold</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                        <span className="text-sm font-medium text-gray-600">Stone</span>
                                                        <span className="text-sm text-gray-900">Diamond</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                        <span className="text-sm font-medium text-gray-600">Clarity</span>
                                                        <span className="text-sm text-gray-900">VS1</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                        <span className="text-sm font-medium text-gray-600">Color</span>
                                                        <span className="text-sm text-gray-900">G</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Delivery & Return Info */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Delivery & Return Information
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDeliveryOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDeliveryOpen && (
                                    <div className="px-6 py-4 bg-white">
                                        <div className="space-y-6">
                                            {/* Delivery Info */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Delivery Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm font-medium text-green-800">Free Delivery</span>
                                                        </div>
                                                        <p className="text-xs text-green-700">On orders above ৳1000</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span className="text-sm font-medium text-blue-800">Fast Delivery</span>
                                                        </div>
                                                        <p className="text-xs text-blue-700">2-3 business days</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p>• Delivery within {product.shippingInfo?.handlingTime || 2}-{product.shippingInfo?.handlingTime ? product.shippingInfo.handlingTime + 1 : 3} business days</p>
                                                    <p>• Free delivery on orders above ৳1000</p>
                                                    <p>• Standard delivery charge: ৳60</p>
                                                    <p>• Express delivery available at extra cost</p>
                                                    {product.shippingInfo?.weight && (
                                                        <p>• Product weight: {product.shippingInfo.weight}g</p>
                                                    )}
                                                    {product.shippingInfo?.dimensions && (
                                                        <p>• Dimensions: {product.shippingInfo.dimensions.length}cm × {product.shippingInfo.dimensions.width}cm × {product.shippingInfo.dimensions.height}cm</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Return Info */}
                                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                                    </svg>
                                                    Return & Exchange Policy
                                                </h4>
                                                <div className="bg-orange-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-orange-800">7 Days Return</span>
                                                    </div>
                                                    <p className="text-xs text-orange-700">Easy return and exchange process</p>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    {product.returnPolicy ? (
                                                        <div dangerouslySetInnerHTML={{ __html: product.returnPolicy.replace(/\n/g, '<br/>') }} />
                                                    ) : (
                                                        <>
                                                            <p>• 7 days return policy from delivery date</p>
                                                            <p>• Product must be unused and in original packaging</p>
                                                            <p>• Free return shipping for defective items</p>
                                                            <p>• Exchange available for size/color issues</p>
                                                            <p>• Refund processed within 3-5 business days</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Similar Products */}
                <SimilarProducts 
                    currentProductId={product?._id} 
                    currentProductCategory={product?.category?._id} 
                />
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

