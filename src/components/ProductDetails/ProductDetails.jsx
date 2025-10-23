'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import CountdownTimer from '@/components/Common/CountdownTimer';
import UpsellProducts from './UpsellProducts';
import SimilarProducts from './SimilarProducts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { productAPI, transformProductData } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { addProductToWishlist } from '@/utils/wishlistUtils';
import ProductNotFound from '@/components/Common/ProductNotFound';



export default function ProductDetails({ productSlug }) {
    const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useAppContext();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch product data
    useEffect(() => {
        if (productSlug) {
            fetchProduct();
        }
    }, [productSlug]);

    // Check if product is in wishlist
    useEffect(() => {
        if (product && wishlist) {
            const isInWishlist = wishlist.some(item => item.productId === product._id);
            setIsWishlisted(isInWishlist);
        }
    }, [product, wishlist]);

    // Reset selected image to 0 (featured image) when product changes
    useEffect(() => {
        if (product) {
            setSelectedImage(0);
        }
    }, [product]);

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

                    // Size is mandatory - set it if available
                    if (sizeAttr) {
                        setSelectedSize(sizeAttr.value);
                    }
                    
                    // Color is optional - only set if variant has color
                    if (colorAttr) {
                        setSelectedColor(colorAttr.value);
                    } else {
                        setSelectedColor(""); // No color for this variant
                    }
                } else {
                    // If no variants, set default values
                    setSelectedSize("Default");
                    setSelectedColor(""); // No color by default
                }
            } else {
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };



    // Get unique sizes from variants (mandatory)
    const getUniqueSizes = () => {
        if (!product?.variants) return [];
        const sizes = product.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Size'))
            .filter(size => size)
            .map(size => size.value);
        return [...new Set(sizes)];
    };

    // Get unique colors from variants (optional - only if variants have color)
    const getUniqueColors = () => {
        if (!product?.variants) return [];
        const colors = product.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Color'))
            .filter(color => color) // Only include variants that have color
            .map(color => ({ value: color.value, hexCode: color.hexCode }));
        return colors.filter((color, index, self) =>
            index === self.findIndex(c => c.value === color.value)
        );
    };

    // Get available colors for selected size (optional)
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
            .filter(color => color); // Only include variants that have color
    };

    // Get selected variant (size mandatory, color optional)
    const getSelectedVariant = () => {
        if (!product?.variants) return null;
        return product.variants.find(variant => {
            const sizeAttr = variant.attributes.find(attr => attr.name === 'Size');
            const colorAttr = variant.attributes.find(attr => attr.name === 'Color');
            
            // Size must match (mandatory)
            const sizeMatches = sizeAttr?.value === selectedSize;
            
            // Color matching logic:
            // 1. If variant has color and we have selectedColor, both must match
            // 2. If variant has no color and we have no selectedColor, it matches
            // 3. If variant has color but we have no selectedColor, it doesn't match
            // 4. If variant has no color but we have selectedColor, it doesn't match
            let colorMatches = true;
            if (colorAttr && selectedColor) {
                colorMatches = colorAttr.value === selectedColor;
            } else if (colorAttr && !selectedColor) {
                colorMatches = false; // Variant has color but we don't have selected color
            } else if (!colorAttr && selectedColor) {
                colorMatches = false; // We have selected color but variant has no color
            }
            // If both variant and selectedColor are null/empty, colorMatches remains true
            
            return sizeMatches && colorMatches;
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
            // If no colors available for this size, clear selected color
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
        if (!product) return;

        if (isWishlisted) {
            removeFromWishlist(product._id);
            setIsWishlisted(false);
        } else {
            // Ensure product has the required fields for wishlist
            const productForWishlist = {
                ...product,
                price: product.variants?.[0]?.currentPrice || product.basePrice || 0,
                category: product.category?.name || product.category || 'Other'
            };
            addProductToWishlist(productForWishlist, addToWishlist);
            setIsWishlisted(true);
        }
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

    // Get all images (featured + gallery)
    const getAllImages = () => {
        if (!product) return [];

        const images = [];

        // Add featured image first (if exists)
        if (product.featuredImage) {
            images.push({
                url: product.featuredImage,
                altText: product.title,
                isFeatured: true
            });
        }

        // Add gallery images
        if (product.gallery && product.gallery.length > 0) {
            images.push(...product.gallery);
        }

        return images;
    };

    // Get display image based on selected index
    const getDisplayImage = (index) => {
        if (!product) return '/images/placeholder.png';

        const allImages = getAllImages();
        if (allImages.length > 0 && index < allImages.length) {
            return allImages[index].url;
        }
        return '/images/placeholder.png';
    };

    // Get total number of images
    const totalImages = product ? getAllImages().length : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!product) {
        return <ProductNotFound />;
    }

    return (
        <div className="min-h-screen px-4 lg:px-4 py-4">
            <div className="max-w-screen-2xl px-4 mx-auto">
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
                                src={getDisplayImage(selectedImage)}
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
                                loop={totalImages > 4}
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
                                {product && totalImages > 0 ? (
                                    getAllImages()?.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <button
                                                onClick={() => setSelectedImage(index)}
                                                className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all cursor-pointer w-full ${selectedImage === index
                                                    ? 'border-pink-500'
                                                    : 'border-gray-200 hover:border-pink-300'
                                                    }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.altText || `${product.title} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Featured Image Badge */}

                                            </button>
                                        </SwiperSlide>
                                    ))
                                ) : (
                                    <SwiperSlide>
                                        <div className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src="/images/placeholder.png"
                                                alt={product?.title || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </SwiperSlide>
                                )}

                            </Swiper>
                            {
                                totalImages > 4 && (
                                    <>
                                        <div className='!h-full !m-0 ' style={{ display: "ruby-text" }}>
                                            <button 
                                                className="swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-4  flex items-center justify-center  transition-colors"
                                                aria-label="Previous image"
                                            >
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button 
                                                className="swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-4  flex items-center justify-center  transition-colors"
                                                aria-label="Next image"
                                            >
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                        {/* Custom Navigation Buttons */}

                                    </>
                                )
                            }




                            {/* Pagination Dots */}
                            {totalImages > 1 && (
                                <div className="swiper-pagination flex justify-center mt-3 space-x-1"></div>
                            )}
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

                            {/* Color Selector - Only show if colors are available */}
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
                                aria-label={isWishlisted ? `Remove ${product?.title} from wishlist` : `Add ${product?.title} to wishlist`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            {/* Check if variant is out of stock */}
                            {selectedVariant && selectedVariant.stockQuantity <= 0 ? (
                                <button
                                    disabled
                                    className="flex-1 bg-gray-300 text-gray-500 py-3 px-1 lg:px-6 rounded cursor-not-allowed font-semibold border-[1.5px] border-gray-300 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Out of Stock
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-white text-[#EF3D6A] py-3 px-1 lg:px-6 rounded cursor-pointer font-semibold border-[1.5px] border-[#EF3D6A] hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                                    aria-label={`Add ${product?.title} to cart`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to cart
                                </button>
                            )}
                            
                            {/* Check if variant is out of stock for Buy Now */}
                            {selectedVariant && selectedVariant.stockQuantity <= 0 ? (
                                <button
                                    disabled
                                    className="flex-1 rounded bg-gray-300 text-gray-500 py-3 px-1 lg:px-6 cursor-not-allowed font-semibold"
                                >
                                    Out of Stock
                                </button>
                            ) : (
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 rounded bg-[#EF3D6A] text-white py-3 px-1 lg:px-6 cursor-pointer font-semibold hover:bg-[#C1274F] transition-colors"
                                    aria-label={`Buy ${product?.title} now`}
                                >
                                    Buy Now
                                </button>
                            )}
                        </div>
                        <div className='border-b border-[#E7E7E7]'>

                        </div>



                    </div>

                </div>
                <div>
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'description'
                                        ? 'border-pink-500 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('additional')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'additional'
                                        ? 'border-pink-500 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Additional Information
                            </button>
                            <button
                                onClick={() => setActiveTab('delivery')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'delivery'
                                        ? 'border-pink-500 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Delivery & Return
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="py-6">
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                                    <div className="text-gray-600 leading-relaxed">
                                        {product.description ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            <p>{product.shortDescription || 'No detailed description available for this product.'}</p>
                                        )}
                                    </div>
                                </div>
                                
                                
                            </div>
                        )}

                        {/* Additional Information Tab */}
                        {activeTab === 'additional' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Brand</span>
                                            <span className="text-sm text-gray-900">{product.brand || 'ForPink'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 ">
                                            <span className="text-sm font-medium text-gray-600">SKU</span>
                                            <span className="text-sm text-gray-900">{selectedVariant?.sku || product.slug || 'FP-RING-001'}</span>
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
                                        <div className="flex items-center justify-between py-2 ">
                                            <span className="text-sm font-medium text-gray-600">Stock Quantity</span>
                                            <span className="text-sm text-gray-900">{selectedVariant?.stockQuantity || product.totalStock || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Specifications from API */}
                                {product.specifications && product.specifications.length > 0 && (
                                    <div className="pt-6 border-t border-gray-100">
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
                                    <div className="pt-6 border-t border-gray-100">
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

                        {/* Delivery & Return Tab */}
                        {activeTab === 'delivery' && (
                            <div className="space-y-6">
                                {/* Delivery Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Delivery Information
                                    </h4>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <p>• <strong>Delivery Time:</strong> 3-5 business days from order confirmation</p>
                                        <p>• <strong>Delivery Charge:</strong> Must be paid upfront with order</p>
                                        <p>• <strong>Free Delivery:</strong> Available for select products (admin will notify during order confirmation)</p>
                                        <p>• <strong>Tracking:</strong> You will receive tracking information via SMS/Email</p>
                                        <p>• <strong>Delivery Areas:</strong> We deliver across Bangladesh</p>
                                        {product.shippingInfo?.weight && (
                                            <p>• <strong>Product Weight:</strong> {product.shippingInfo.weight}g</p>
                                        )}
                                        {product.shippingInfo?.dimensions && (
                                            <p>• <strong>Dimensions:</strong> {product.shippingInfo.dimensions.length}cm × {product.shippingInfo.dimensions.width}cm × {product.shippingInfo.dimensions.height}cm</p>
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
                                    <div className="text-sm text-gray-600 space-y-2">
                                        {product.returnPolicy ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.returnPolicy.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            <>
                                                <p>• <strong>Return Period:</strong> 7 days from delivery date</p>
                                                <p>• <strong>Condition:</strong> Product must be unused and in original packaging</p>
                                                <p>• <strong>Processing Time:</strong> 3-5 working days for refund processing</p>
                                                <p>• <strong>Return Shipping:</strong> Customer responsible for return shipping costs</p>
                                                <p>• <strong>Refund Method:</strong> Refund will be processed to original payment method</p>
                                                <p>• <strong>Exchange:</strong> Available for size/color issues within return period</p>
                                                <p>• <strong>Defective Items:</strong> Free return shipping for defective or damaged products</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>



                {/* Upsell Products */}
                <UpsellProducts
                    currentProductId={product?._id}
                />

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

