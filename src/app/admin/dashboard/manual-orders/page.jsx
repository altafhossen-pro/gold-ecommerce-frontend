'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search, User, UserPlus, ShoppingCart, Package, Trash2, Save, AlertTriangle, X } from 'lucide-react';
import { userAPI, productAPI, orderAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

export default function ManualOrderCreation() {
    const router = useRouter();
    const { hasPermission, contextLoading, deliveryChargeSettings } = useAppContext();
    const [checkingPermission, setCheckingPermission] = useState(true);
    const [hasCreatePermission, setHasCreatePermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [searchingProducts, setSearchingProducts] = useState(false);

    // Form states
    const [orderType, setOrderType] = useState('guest'); // 'existing' or 'guest' - default guest
    const [orderSource, setOrderSource] = useState(''); // no default, user must select
    const [selectedUser, setSelectedUser] = useState(null);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [orderItems, setOrderItems] = useState([]);
    const [orderNotes, setOrderNotes] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [deliveryCharge, setDeliveryCharge] = useState(150); // Default outsideDhaka from settings
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

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (productSearchTerm.trim()) {
                searchProducts(productSearchTerm);
            } else {
                setProductResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [productSearchTerm]);

    // Auto-fill guest info when phone number is 11 digits
    useEffect(() => {
        const phoneNumber = guestInfo.phone.trim();
        if (phoneNumber.length === 11 && /^\d+$/.test(phoneNumber)) {
            autoFillGuestInfo(phoneNumber);
        }
    }, [guestInfo.phone]);

    // Auto-fill guest info from phone number
    const autoFillGuestInfo = async (phoneNumber) => {
        try {
            const token = getCookie('token');
            const response = await orderAPI.getCustomerInfoByPhone(phoneNumber, token);

            if (response.success && response.data) {
                const { name, address } = response.data;

                // Only update if we found some data
                if (name || address) {
                    setGuestInfo(prev => ({
                        ...prev,
                        name: name || prev.name,
                        address: address || prev.address
                    }));

                    if (name && address) {
                        toast.success('Customer info auto-filled from database');
                    } else if (name) {
                        toast.success('Customer name auto-filled from user database');
                    } else if (address) {
                        toast.success('Customer address auto-filled from previous order');
                    }
                }
            }
        } catch (error) {
            console.error('Error auto-filling guest info:', error);
            // Silent fail - don't show error to user
        }
    };

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

    // Search products with debounce
    const searchProducts = async (query) => {
        if (!query.trim()) {
            setProductResults([]);
            return;
        }

        try {
            setSearchingProducts(true);

            // First try to search by SKU directly
            const skuResponse = await productAPI.searchProducts(query.trim());

            if (skuResponse.success) {
                const products = skuResponse.data || [];

                // Check if search term matches any variant SKU exactly
                let matchingVariant = null;
                let matchingProduct = null;

                for (const product of products) {
                    if (product.variants && product.variants.length > 0) {
                        for (const variant of product.variants) {
                            if (variant.sku && variant.sku.toLowerCase() === query.trim().toLowerCase()) {
                                matchingVariant = variant;
                                matchingProduct = product;
                                break;
                            }
                        }
                        if (matchingVariant) break;
                    }
                }

                // If SKU match found, auto-add the variant
                if (matchingVariant && matchingProduct) {

                    // Check if this SKU already exists in order items (SKU match only)
                    const existingItemIndex = orderItems.findIndex(item =>
                        item.variant?.sku && item.variant.sku === matchingVariant.sku
                    );

                    if (existingItemIndex !== -1) {
                        // Update existing item quantity
                        setOrderItems(prev => prev.map((item, index) =>
                            index === existingItemIndex
                                ? {
                                    ...item,
                                    quantity: item.quantity + 1,
                                    total: (matchingVariant.currentPrice || matchingVariant.price) * (item.quantity + 1)
                                }
                                : item
                        ));
                        toast.success(`Quantity updated for "${matchingProduct.title}" (SKU: ${matchingVariant.sku})`);
                    } else {
                        // Add new item
                        const newItem = {
                            productId: matchingProduct._id,
                            variantId: matchingVariant._id,
                            product: matchingProduct,
                            variant: {
                                ...matchingVariant,
                                size: matchingVariant.attributes?.find(attr => attr.name === 'Size')?.value || matchingVariant.size,
                                color: matchingVariant.attributes?.find(attr => attr.name === 'Color')?.value || matchingVariant.color,
                                colorHexCode: matchingVariant.attributes?.find(attr => attr.name === 'Color')?.hexCode
                            },
                            quantity: 1,
                            price: matchingVariant.currentPrice || matchingVariant.price,
                            total: (matchingVariant.currentPrice || matchingVariant.price) * 1
                        };

                        setOrderItems(prev => [...prev, newItem]);
                        toast.success(`Product "${matchingProduct.title}" (SKU: ${matchingVariant.sku}) added to order`);
                    }

                    setProductSearchTerm('');
                    return;
                }

                // If no SKU match, show regular search results
                setProductResults(products);
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

    // Calculate final total with discount and delivery charge
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const delivery = deliveryCharge || 0;
        const discount = discountAmount || 0;
        return Math.max(0, subtotal + delivery - discount);
    };

    // Set default delivery charge from context when available
    useEffect(() => {
        if (deliveryChargeSettings?.outsideDhaka) {
            setDeliveryCharge(deliveryChargeSettings.outsideDhaka);
        }
    }, [deliveryChargeSettings]);

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

        if (orderType === 'guest' && (!guestInfo.name || !guestInfo.phone || !guestInfo.address)) {
            toast.error('Please provide guest name, phone number, and address');
            return;
        }

        if (!orderSource) {
            toast.error('Please select order source');
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
                orderSource: orderSource,
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
                discount: discountAmount || 0,
                shippingCost: deliveryCharge || 0,
                totalAmount: calculateTotal(), // Total with delivery charge and discount
                status: 'confirmed', // Manual orders are confirmed by default
                notes: orderNotes,
                deliveryAddress: orderType === 'guest' ? guestInfo.address : deliveryAddress,
                ...(orderType === 'existing'
                    ? { userId: selectedUser._id }
                    : {
                        guestInfo: {
                            name: guestInfo.name,
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
                setGuestInfo({ name: '', phone: '', address: '' });
                setOrderNotes('');
                setDiscountAmount(0);
                setDeliveryCharge(deliveryChargeSettings?.outsideDhaka || 150);
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

    // Check permission on mount
    useEffect(() => {
        if (!contextLoading) {
            const canCreate = hasPermission('order', 'create');
            setHasCreatePermission(canCreate);
            setCheckingPermission(false);
        }
    }, [contextLoading, hasPermission]);

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

    // Show loading while checking permission
    if (checkingPermission || contextLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show permission denied if user doesn't have permission
    if (!hasCreatePermission) {
        return (
            <PermissionDenied
                title="Access Denied"
                message="You don't have permission to create orders."
                action="Create Orders"
                showBackButton={true}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Manual Order</h1>
                    <p className="text-gray-600">Create orders manually for existing users or guests</p>
                </div>
            </div>

            {/* Top Section - Search and Add Products */}
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
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setProductSearchTerm(value);

                                    // If it looks like a SKU (short, alphanumeric), try immediate search
                                    if (value.length >= 3 && /^[a-zA-Z0-9]+$/.test(value)) {
                                        // This will trigger the debounced search
                                        setShowProductDropdown(true);
                                    }
                                }}
                                onFocus={() => setShowProductDropdown(true)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search products by name or SKU..."
                                autoFocus
                            />
                        </div>

                        {showProductDropdown && productResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {productResults.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleProductSelect(product)}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={product.featuredImage || '/images/placeholder.png'}
                                                alt={product.title}
                                                className="w-10 h-10 rounded object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/images/placeholder.png';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {product.variants?.length || 0} variants available
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Selection Details */}
                {currentProduct && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                                <img
                                    src={currentProduct.featuredImage || '/images/placeholder.png'}
                                    alt={currentProduct.title}
                                    className="w-16 h-16 rounded object-cover"
                                    onError={(e) => {
                                        e.target.src = '/images/placeholder.png';
                                    }}
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{currentProduct.title}</h3>
                                    <p className="text-sm text-gray-600">Select variant and quantity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setCurrentProduct(null);
                                    setSelectedSize("");
                                    setSelectedColor("");
                                    setQuantity(1);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Size Selection */}
                        {uniqueSizes.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Size
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueSizes.map((size) => (
                                                <button
                                            key={size}
                                            onClick={() => handleSizeChange(size)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedSize === size
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                        {/* Color Selection */}
                        {availableColors.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => handleColorChange(color.value)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedColor === color.value
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {color.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Control */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    const maxQuantity = selectedVariant?.stockQuantity || 999;
                                    setQuantity(Math.max(1, Math.min(maxQuantity, value)));
                                }}
                                min="1"
                                max={selectedVariant?.stockQuantity || 999}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Enter quantity"
                            />
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

            {/* Order Items Table */}
            {orderItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Variant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.product.featuredImage || '/images/placeholder.png'}
                                                    alt={item.product.title}
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder.png';
                                                    }}
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.product.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        SKU: {item.variant.sku}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {item.variant.size && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                        {item.variant.size}
                                                    </span>
                                                )}
                                                {item.variant.color && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {item.variant.color}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => removeItemFromOrder(index)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary with Inputs */}
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Charge (৳)
                                    </label>
                                    <input
                                        type="text"
                                        value={deliveryCharge}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Only allow numbers, no decimals
                                            if (value === '' || /^\d+$/.test(value)) {
                                                setDeliveryCharge(value === '' ? 0 : parseInt(value) || 0);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter delivery charge"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Default: ৳{deliveryChargeSettings?.outsideDhaka || 150} (Outside Dhaka)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Amount (৳)
                                    </label>
                                    <input
                                        type="text"
                                        value={discountAmount}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Only allow numbers, no decimals
                                            if (value === '' || /^\d+$/.test(value)) {
                                                const newDiscount = value === '' ? 0 : parseInt(value) || 0;
                                                const maxDiscount = calculateSubtotal() + (deliveryCharge || 0);
                                                
                                                // Don't allow discount more than subtotal + delivery charge
                                                if (newDiscount <= maxDiscount) {
                                                    setDiscountAmount(newDiscount);
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter discount amount"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Max discount: ৳{calculateSubtotal() + (deliveryCharge || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Summary Display */}
                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="text-gray-900">৳{calculateSubtotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Delivery Charge:</span>
                                        <span className="text-gray-900">৳{deliveryCharge || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="text-red-600">-৳{discountAmount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span className="text-gray-900">Total:</span>
                                        <span className="text-blue-600">৳{calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section - Order Details */}
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
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${orderType === 'existing'
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
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${orderType === 'guest'
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Guest User
                        </button>
                    </div>
                </div>

                {/* Order Source Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Source
                    </label>
                    <select
                        value={orderSource}
                        onChange={(e) => setOrderSource(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                    >
                        <option value="">Select order source</option>
                        <option value="website">Website</option>
                        <option value="facebook">Facebook</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="walk-in">Walk-in</option>
                        <option value="instagram">Instagram</option>
                        <option value="manual">Manual</option>
                        <option value="other">Other</option>
                    </select>
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
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{selectedUser.name}</h4>
                                            <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setUserSearchTerm('');
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Guest User Form */}
                {orderType === 'guest' && (
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={guestInfo.name}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={guestInfo.address}
                                onChange={(e) => setGuestInfo(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder="Enter delivery address"
                                required
                            />
                        </div>
                    </div>
                )}


                {/* Order Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Notes
                    </label>
                    <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Add any special instructions or notes"
                    />
                </div>

            </div>

            {/* Create Order Button */}
            {orderItems.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <Save className="h-5 w-5" />
                        <span>{saving ? 'Creating Order...' : 'Create Order'}</span>
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Order Creation</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to create this order? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelCreateOrder}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCreateOrder}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
                            >
                                {saving ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}