'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Plus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { upsellAPI } from '@/services/api';
import { addProductToCart } from '@/utils/cartUtils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const UpsellProducts = ({ currentProductId }) => {
    const { addMultipleToCart } = useAppContext();
    const [upsellData, setUpsellData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);

    // Fetch upsell data for the current product
    useEffect(() => {
        if (currentProductId) {
            fetchUpsellData();
        }
    }, [currentProductId]);

    const fetchUpsellData = async () => {
        try {
            setLoading(true);
            const response = await upsellAPI.getUpsellsByMainProductPublic(currentProductId);
            
            if (response.success && response.data && response.data.linkedProducts?.length > 0) {
                console.log('Upsell data received:', response.data);
                console.log('Linked products details:', response.data.linkedProducts.map(link => ({
                    title: link.product.title,
                    priceRange: link.product.priceRange,
                    variants: link.product.variants?.map(v => ({
                        currentPrice: v.currentPrice,
                        originalPrice: v.originalPrice
                    }))
                })));
                setUpsellData(response.data);
                // Pre-select all products by default
                const allProductIds = response.data.linkedProducts.map(link => link.product._id);
                setSelectedProducts(allProductIds);
            }
        } catch (error) {
            console.error('Error fetching upsell data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle product selection
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Add all selected products to cart
    const addAllToCart = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product');
            return;
        }

        try {
            setAddingToCart(true);
            let addedCount = 0;
            let failedCount = 0;
            const cartItemsToAdd = [];

            // Process each product and prepare cart items
            for (const link of upsellData.linkedProducts) {
                if (selectedProducts.includes(link.product._id)) {
                    try {
                        // Transform product data to match the format expected by addProductToCart
                        const product = {
                            _id: link.product._id,
                            title: link.product.title,
                            name: link.product.title,
                            slug: link.product.slug,
                            featuredImage: link.product.featuredImage,
                            image: link.product.featuredImage,
                            price: link.product.priceRange?.min || 0,
                            basePrice: link.product.priceRange?.min || 0,
                            variants: link.product.variants || [],
                            totalStock: link.product.totalStock || 0
                        };

                        // Use addProductToCart to get the proper variant selection
                        // But don't add to cart yet, just prepare the data
                        let selectedVariant = null;
                        
                        if (product.variants && product.variants.length > 0) {
                            // Find the first available variant (with stock > 0)
                            let selectedVariantData = null;
                            
                            for (const variant of product.variants) {
                                if ((variant.stockQuantity || 0) > 0) {
                                    selectedVariantData = variant;
                                    break;
                                }
                            }
                            
                            // If no variant has stock, skip this product
                            if (!selectedVariantData) {
                                console.warn(`Product ${product.title} is out of stock`);
                                failedCount++;
                                continue;
                            }
                            
                            // Extract size/color attributes from the selected variant
                            const sizeAttr = selectedVariantData.attributes?.find(attr => attr.name === 'Size');
                            const colorAttr = selectedVariantData.attributes?.find(attr => attr.name === 'Color');
                            
                            selectedVariant = {
                                size: sizeAttr?.value || 'Default',
                                color: colorAttr?.value || null,
                                hexCode: colorAttr?.hexCode || null,
                                currentPrice: selectedVariantData.currentPrice || product.price,
                                originalPrice: selectedVariantData.originalPrice || product.price,
                                sku: selectedVariantData.sku,
                                stockQuantity: selectedVariantData.stockQuantity || 0,
                                stockStatus: selectedVariantData.stockStatus || 'in_stock'
                            };
                        } else {
                            // If no variants, create a default variant
                            const productStock = product.totalStock || 0;
                            const isProductOutOfStock = productStock <= 0;
                            
                            if (isProductOutOfStock) {
                                console.warn(`Product ${product.title} is out of stock (totalStock: ${productStock})`);
                                failedCount++;
                                continue;
                            }
                            
                            selectedVariant = {
                                size: 'Default',
                                color: null,
                                hexCode: null,
                                currentPrice: product.price,
                                originalPrice: product.price,
                                sku: product.slug,
                                stockQuantity: productStock,
                                stockStatus: productStock > 0 ? 'in_stock' : 'out_of_stock'
                            };
                        }

                        // Store cart item data instead of adding immediately
                        cartItemsToAdd.push({ product, selectedVariant, quantity: 1 });
                        addedCount++;
                        
                    } catch (productError) {
                        console.error(`Error preparing product ${link.product.title}:`, productError);
                        failedCount++;
                    }
                }
            }

            // Add all cart items at once using batch function
            if (cartItemsToAdd.length > 0) {
                addMultipleToCart(cartItemsToAdd);
                
                // Show additional success message if some failed
                if (failedCount > 0) {
                    toast.success(`${addedCount} product(s) added to cart, ${failedCount} failed`);
                }
            } else if (failedCount > 0) {
                toast.error('Failed to add products to cart');
            }
        } catch (error) {
            console.error('Error adding products to cart:', error);
            toast.error('Failed to add products to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        if (!upsellData) return 0;
        
        return upsellData.linkedProducts
            .filter(link => selectedProducts.includes(link.product._id))
            .reduce((total, link) => {
                const price = link.product.priceRange?.min || 0;
                return total + price;
            }, 0);
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Bought Together</h2>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!upsellData || upsellData.linkedProducts?.length === 0) {
        return null;
    }

    return (
        <div className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Bought Together</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Products */}
                    {upsellData.linkedProducts.map((link, index) => (
                        <div key={link.product._id} className="relative">
                            {/* Plus Icon between products */}
                            {index > 0 && (
                                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-30">
                                    <div className="w-6 h-6  rounded-full flex items-center justify-center   ">
                                        <Plus className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                <div className="relative mb-3">
                                    <Link href={`/product/${link.product.slug}`}>
                                        <img
                                            src={link.product.featuredImage || '/images/placeholder.png'}
                                            alt={link.product.title}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    </Link>
                                    
                                    {/* Selection Checkbox */}
                                    <button
                                    title={selectedProducts.includes(link.product._id) ? 'Remove from selection' : 'Add to selection'}
                                        onClick={() => toggleProductSelection(link.product._id)}
                                        className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                            selectedProducts.includes(link.product._id)
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'bg-white border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        {selectedProducts.includes(link.product._id) && (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Product Info */}
                                <div>
                                    <Link href={`/product/${link.product.slug}`}>
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-pink-600 transition-colors">
                                            {link.product.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg font-semibold text-pink-600">
                                            ৳{link.product.priceRange?.min || 0}
                                        </span>
                                        {/* Check if any variant has originalPrice different from currentPrice */}
                                        {(() => {
                                            const hasDiscount = link.product.variants?.some(variant => 
                                                variant.originalPrice && 
                                                variant.originalPrice > variant.currentPrice
                                            );
                                            
                                            if (hasDiscount) {
                                                // Find the variant with the highest original price for display
                                                const variantWithDiscount = link.product.variants.find(variant => 
                                                    variant.originalPrice && 
                                                    variant.originalPrice > variant.currentPrice
                                                );
                                                
                                                return (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ৳{variantWithDiscount.originalPrice}
                                                    </span>
                                                );
                                            }
                                            
                                            // Fallback to priceRange check
                                            if (link.product.priceRange?.max && link.product.priceRange?.max > link.product.priceRange?.min) {
                                                return (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ৳{link.product.priceRange.max}
                                                    </span>
                                                );
                                            }
                                            
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add to Cart Button - Takes up one grid space */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 flex flex-col justify-center shadow-lg">
                        <div className="text-center">
                            <div className="mb-3">
                                <ShoppingCart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Add all {selectedProducts.length} to Cart
                                </h3>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="bg-white rounded-lg p-2 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium text-sm">Total:</span>
                                        <span className="text-xl font-bold text-pink-600">
                                            ৳{calculateTotalPrice().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={addAllToCart}
                                disabled={selectedProducts.length === 0 || addingToCart}
                                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 px-4 rounded-lg font-bold hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {addingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 mt-2">
                                Uncheck items you don't want
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpsellProducts;
