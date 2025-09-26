'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search, User, UserPlus, ShoppingCart, Package, Trash2, Save, AlertTriangle } from 'lucide-react';
import { userAPI, productAPI, orderAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

export default function ManualOrderCreation() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [searchingProducts, setSearchingProducts] = useState(false);
    
    // Form states
    const [orderType, setOrderType] = useState('existing'); // 'existing' or 'guest'
    const [selectedUser, setSelectedUser] = useState(null);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [orderItems, setOrderItems] = useState([]);
    const [orderNotes, setOrderNotes] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    
    // Search states
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [productResults, setProductResults] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    
    // Current product selection
    const [currentProduct, setCurrentProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Search users
    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        
        try {
            setSearchingUsers(true);
            const token = getCookie('token');
            const response = await userAPI.searchUsers(query, token);
            
            if (response.success) {
                setSearchResults(response.data || []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            toast.error('Error searching users');
        } finally {
            setSearchingUsers(false);
        }
    };

    // Search products
    const searchProducts = async (query) => {
        if (!query.trim()) {
            setProductResults([]);
            return;
        }
        
        try {
            setSearchingProducts(true);
            const response = await productAPI.searchProducts(query);
            
            if (response.success) {
                setProductResults(response.data || []);
            }
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Error searching products');
        } finally {
            setSearchingProducts(false);
        }
    };

    // Handle user selection
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setUserSearchTerm(`${user.name} (${user.email})`);
        setShowUserDropdown(false);
    };

    // Handle product selection
    const handleProductSelect = (product) => {
        setCurrentProduct(product);
        setProductSearchTerm(product.title);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
        setShowProductDropdown(false);
        
        // Set default size and color if available
        if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
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
    };

    // Get unique sizes from variants (mandatory)
    const getUniqueSizes = () => {
        if (!currentProduct?.variants) return [];
        const sizes = currentProduct.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Size'))
            .filter(size => size)
            .map(size => size.value);
        return [...new Set(sizes)];
    };

    // Get unique colors from variants (optional - only if variants have color)
    const getUniqueColors = () => {
        if (!currentProduct?.variants) return [];
        const colors = currentProduct.variants
            .map(variant => variant.attributes.find(attr => attr.name === 'Color'))
            .filter(color => color) // Only include variants that have color
            .map(color => ({ value: color.value, hexCode: color.hexCode }));
        return colors.filter((color, index, self) =>
            index === self.findIndex(c => c.value === color.value)
        );
    };

    // Get available colors for selected size (optional)
    const getAvailableColorsForSize = (size) => {
        if (!currentProduct?.variants) return [];
        return currentProduct.variants
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
        if (!currentProduct?.variants) return null;
        return currentProduct.variants.find(variant => {
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

    // Add item to order
    const addItemToOrder = () => {
        if (!currentProduct || !selectedVariant || quantity < 1) {
            toast.error('Please select product, variant and quantity');
            return;
        }

        const newItem = {
            productId: currentProduct._id,
            variantId: selectedVariant._id,
            product: currentProduct,
            variant: {
                ...selectedVariant,
                size: selectedSize,
                color: selectedColor,
                colorHexCode: selectedVariant.attributes.find(attr => attr.name === 'Color')?.hexCode
            },
            quantity: quantity,
            price: selectedVariant.currentPrice,
            total: selectedVariant.currentPrice * quantity
        };

        setOrderItems(prev => [...prev, newItem]);
        
        // Reset selection
        setCurrentProduct(null);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
        setProductSearchTerm('');
        
        toast.success('Item added to order');
    };

    // Remove item from order
    const removeItemFromOrder = (index) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
        toast.success('Item removed from order');
    };

    // Calculate order total
    const calculateSubtotal = () => {
        return orderItems.reduce((total, item) => total + item.total, 0);
    };

    // Calculate final total with discount
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return Math.max(0, subtotal - discountAmount);
    };

    // Create manual order
    const createManualOrder = async () => {
        if (orderItems.length === 0) {
            toast.error('Please add at least one item to the order');
            return;
        }

        if (orderType === 'existing' && !selectedUser) {
            toast.error('Please select a user');
            return;
        }

        if (orderType === 'guest' && (!guestInfo.name || !guestInfo.phone)) {
            toast.error('Please provide guest name and phone number');
            return;
        }

        // Validate delivery address
        if (!deliveryAddress.trim()) {
            toast.error('Please provide delivery address');
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const confirmCreateOrder = async () => {
        try {
            setSaving(true);
            const token = getCookie('token');
            
            const orderData = {
                orderType: orderType,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    // Add variant details for backend processing
                    size: item.variant.size,
                    color: item.variant.color,
                    colorHexCode: item.variant.colorHexCode,
                    sku: item.variant.sku,
                    stockQuantity: item.variant.stockQuantity,
                    stockStatus: item.variant.stockStatus
                })),
                subtotal: calculateSubtotal(),
                discount: discountAmount,
                totalAmount: calculateTotal(),
                status: 'confirmed', // Manual orders are confirmed by default
                notes: orderNotes,
                deliveryAddress: deliveryAddress,
                ...(orderType === 'existing' 
                    ? { userId: selectedUser._id }
                    : { 
                        guestInfo: {
                            name: guestInfo.name,
                            email: guestInfo.email,
                            phone: guestInfo.phone,
                            address: guestInfo.address
                        }
                    }
                )
            };

            const response = await orderAPI.createManualOrder(orderData, token);
            
            if (response.success) {
                toast.success('Manual order created successfully!');
                // Reset form
                setOrderItems([]);
                setSelectedUser(null);
                setGuestInfo({ name: '', email: '', phone: '', address: '' });
                setOrderNotes('');
                setDiscountAmount(0);
                setDeliveryAddress('');
                setUserSearchTerm('');
                setProductSearchTerm('');
                setShowConfirmModal(false);
                
                // Navigate to orders page immediately
                router.push('/admin/dashboard/orders');
            } else {
                toast.error(response.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating manual order:', error);
            toast.error('Error creating manual order');
        } finally {
            setSaving(false);
        }
    };

    const cancelCreateOrder = () => {
        setShowConfirmModal(false);
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (userSearchTerm.trim()) {
                searchUsers(userSearchTerm);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [userSearchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (productSearchTerm.trim()) {
                searchProducts(productSearchTerm);
            } else {
                setProductResults([]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [productSearchTerm]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Manual Order</h1>
                    <p className="text-gray-600">Create orders manually for existing users or guests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                    
                    {/* Order Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Order Type
                        </label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setOrderType('existing')}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    orderType === 'existing'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Existing User
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderType('guest')}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    orderType === 'guest'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Guest User
                            </button>
                        </div>
                    </div>

                    {/* User Selection */}
                    {orderType === 'existing' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select User
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    {searchingUsers ? (
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : (
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    )}
                                    <input
                                        type="text"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        onFocus={() => setShowUserDropdown(true)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search users by name or email..."
                                    />
                                </div>
                                
                                {showUserDropdown && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map((user) => (
                                            <div
                                                key={user._id}
                                                onClick={() => handleUserSelect(user)}
                                                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {user.email} • {user.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedUser && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-xs text-green-700">
                                        ✓ Selected: {selectedUser.name} - {selectedUser.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guest Information */}
                    {orderType === 'guest' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guest Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={guestInfo.name}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter guest name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={guestInfo.email}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                    )}

                    {/* Discount Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (৳)
                        </label>
                        <input
                            type="text"
                            value={discountAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setDiscountAmount(value);
                                }
                            }}
                            onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setDiscountAmount(value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter discount amount"
                        />
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter complete delivery address"
                            rows={3}
                        />
                    </div>

                    {/* Order Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Notes (Optional)
                        </label>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any special notes for this order..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Product Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h2>
                    
                    {/* Product Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Products
                        </label>
                        <div className="relative">
                            <div className="relative">
                                {searchingProducts ? (
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                )}
                                <input
                                    type="text"
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    onFocus={() => setShowProductDropdown(true)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search products by name..."
                                />
                            </div>
                            
                            {showProductDropdown && productResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {productResults.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductSelect(product)}
                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 mr-3">
                                                <img
                                                    src={product.featuredImage || "/images/placeholder.png"}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {product.category?.name} • ৳{product.priceRange?.min || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    {currentProduct && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-md">
                            <h3 className="font-medium text-gray-900 mb-2">{currentProduct.title}</h3>
                            
                            {/* Size and Color Selectors */}
                            <div className="flex items-start gap-8 mb-4">
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

                            {/* Selected Variant Info - Product Details Style */}
                            {selectedVariant && (
                                <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Selected Variant Details</h4>
                                    
                                    {/* Price Display */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ৳{selectedVariant.currentPrice}
                                        </span>
                                        {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.currentPrice && (
                                            <span className="text-lg text-gray-500 line-through">
                                                ৳{selectedVariant.originalPrice}
                                            </span>
                                        )}
                                        {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.currentPrice && (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                                {Math.round(((selectedVariant.originalPrice - selectedVariant.currentPrice) / selectedVariant.originalPrice) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {/* Variant Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Size</span>
                                            <span className="text-sm text-gray-900">{selectedSize}</span>
                                        </div>
                                        {selectedColor && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Color</span>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: selectedVariant.attributes.find(attr => attr.name === 'Color')?.hexCode }}
                                                    ></div>
                                                    <span className="text-sm text-gray-900">{selectedColor}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">SKU</span>
                                            <span className="text-sm text-gray-900">{selectedVariant.sku}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Stock</span>
                                            <span className={`text-sm font-medium ${
                                                selectedVariant.stockQuantity > 10 ? 'text-green-600' : 
                                                selectedVariant.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} available` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            selectedVariant.stockStatus === 'in_stock' ? 'bg-green-500' :
                                            selectedVariant.stockStatus === 'low_stock' ? 'bg-yellow-500' :
                                            selectedVariant.stockStatus === 'out_of_stock' ? 'bg-red-500' : 'bg-gray-500'
                                        }`}></div>
                                        <span className="text-sm text-gray-600 capitalize">
                                            {selectedVariant.stockStatus?.replace('_', ' ') || 'In Stock'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Control - Product Details Style */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="p-3 cursor-pointer transition-colors hover:bg-gray-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(selectedVariant?.stockQuantity || 999, prev + 1))}
                                        className="p-3 cursor-pointer transition-colors hover:bg-gray-50"
                                        disabled={!selectedVariant || quantity >= (selectedVariant?.stockQuantity || 999)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                {selectedVariant && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max: {selectedVariant.stockQuantity} available
                                    </p>
                                )}
                            </div>

                            {/* Add to Order Button */}
                            <button
                                onClick={addItemToOrder}
                                disabled={!selectedVariant || quantity < 1}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Add to Order
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            {orderItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 mr-4">
                                                    <img
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                        src={item.product.featuredImage || "/images/placeholder.png"}
                                                        alt={item.product.title}
                                                    />
                                                </div>
                                                <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.product.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.product.category?.name || 'Product'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {/* Size and Color Row */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-medium text-gray-600">Size:</span>
                                                        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                            {item.variant.size}
                                                        </span>
                                                    </div>
                                                    {item.variant.color && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-medium text-gray-600">Color:</span>
                                                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                                                <div 
                                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                                    style={{ backgroundColor: item.variant.colorHexCode }}
                                                                ></div>
                                                                <span className="text-sm font-semibold text-gray-900">{item.variant.color}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* SKU and Stock Row */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-medium text-gray-600">SKU:</span>
                                                        <span className="text-sm text-gray-900 font-mono bg-blue-50 px-2 py-1 rounded">
                                                            {item.variant.sku}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-medium text-gray-600">Stock:</span>
                                                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                                                            item.variant.stockQuantity > 10 ? 'text-green-700 bg-green-100' : 
                                                            item.variant.stockQuantity > 0 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
                                                        }`}>
                                                            {item.variant.stockQuantity > 0 ? `${item.variant.stockQuantity} available` : 'Out of Stock'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ৳{item.price}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {item.quantity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                ৳{item.total}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => removeItemFromOrder(index)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="text-sm text-gray-900">৳{calculateSubtotal()}</span>
                            </div>
                            {discountAmount > 0 && (
                        <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Admin Discount:</span>
                                    <span className="text-sm text-red-600">-৳{discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                            <span className="text-lg font-bold text-gray-900">৳{calculateTotal()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Order Button */}
            {orderItems.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={createManualOrder}
                        disabled={saving}
                        className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:shadow-none flex items-center transition-all duration-200 cursor-pointer font-medium"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Creating Order...' : 'Create Manual Order'}
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-in fade-in-0 zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Confirm Order Creation</h3>
                                <p className="text-sm text-gray-500">This action will create a confirmed order</p>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to create this manual order? This will immediately confirm the order and reduce product stock.
                            </p>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-amber-900 mb-2">Important Notice:</p>
                                        <ul className="space-y-1.5 text-amber-800">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                                Order status will be set to <span className="font-semibold">Confirmed</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                                Product stock will be <span className="font-semibold">immediately reduced</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                                This action <span className="font-semibold">cannot be undone</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={cancelCreateOrder}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCreateOrder}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-none flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Yes, Create Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
