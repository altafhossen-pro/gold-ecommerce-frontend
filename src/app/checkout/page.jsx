'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { orderAPI, productAPI, loyaltyAPI, couponAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import LoginRequiredModal from '@/components/Common/LoginRequiredModal';

export default function Checkout() {
    const { cart, cartTotal, updateCartItem, removeFromCart, cartLoading, user, clearCart } = useAppContext();
    const router = useRouter();
    // Login required modal state
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check authentication status
    useEffect(() => {
        const token = getCookie('token');
        
        // If we have a token but user data is still loading
        if (token && !user) {
            setIsCheckingAuth(true);
            setShowLoginModal(false);
        }
        // If no token, show modal immediately
        else if (!token) {
            setIsCheckingAuth(false);
            setShowLoginModal(true);
        }
        // If user is loaded and has email, hide modal
        else if (user && user.email) {
            setIsCheckingAuth(false);
            setShowLoginModal(false);
        }
    }, [user]);

    // Timeout for authentication check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isCheckingAuth) {
                setIsCheckingAuth(false);
                setShowLoginModal(true);
            }
        }, 5000); // 5 second timeout

        return () => clearTimeout(timer);
    }, [isCheckingAuth]);

    // Show warning if cart is empty but don't redirect
    useEffect(() => {
        // if (cart.length === 0 && !cartLoading  ) {
        //     toast.error('Your cart is empty. Please add items to proceed.');
        // }
    }, [cart.length, cartLoading]);

    // Check stock availability when cart changes
    useEffect(() => {
        if (cart.length > 0) {
            checkStockAvailability();
        } else {
            setStockData({});
            setOutOfStockItems([]);
        }
    }, [cart]);

    // Fetch loyalty data when user is available
    useEffect(() => {
        if (user && user._id) {
            fetchLoyaltyData();
        }
    }, [user]);

    // Real-time stock checking function
    const checkStockAvailability = async () => {
        try {
            setStockLoading(true);
            
            // Prepare cart items for API call
            const cartItems = cart.map(item => ({
                id: item.id,
                productId: item.productId,
                sku: item.sku,
                quantity: item.quantity
            }));

            const response = await productAPI.checkStockAvailability(cartItems);
            
            if (response.success) {
                // Create a map of stock data for quick lookup
                const stockMap = {};
                const outOfStock = [];
                
                response.data.stockCheckResults.forEach(result => {
                    stockMap[result.cartItemId] = {
                        isAvailable: result.isAvailable,
                        availableStock: result.availableStock,
                        reason: result.reason
                    };
                    
                    if (!result.isAvailable) {
                        outOfStock.push(result);
                    }
                });
                
                setStockData(stockMap);
                setOutOfStockItems(outOfStock);
            }
        } catch (error) {
            // Fallback to local stock data if API fails
            const fallbackStockData = {};
            const fallbackOutOfStock = [];
            
            cart.forEach(item => {
                const isAvailable = (item.stockQuantity || 0) >= item.quantity;
                fallbackStockData[item.id] = {
                    isAvailable,
                    availableStock: item.stockQuantity || 0,
                    reason: 'Local check'
                };
                
                if (!isAvailable) {
                    fallbackOutOfStock.push({
                        cartItemId: item.id,
                        productId: item.productId,
                        reason: 'Insufficient stock'
                    });
                }
            });
            
            setStockData(fallbackStockData);
            setOutOfStockItems(fallbackOutOfStock);
        } finally {
            setStockLoading(false);
        }
    };

    // Fetch user's loyalty data
    const fetchLoyaltyData = async () => {
        try {
            const token = getCookie('token');
            if (!token) return;

            const response = await loyaltyAPI.getLoyalty(user._id, token);
            if (response.success) {
                setLoyaltyData(response.data);
            }
        } catch (error) {
        }
    };
    
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        division: '',
        deliveryAddress: '',
        orderNotes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [manualPaymentData, setManualPaymentData] = useState({
        phoneNumber: '',
        transactionId: ''
    });

    // Loyalty points state
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
    const [loyaltyLoading, setLoyaltyLoading] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

    // Stock validation state
    const [stockData, setStockData] = useState({});
    const [stockLoading, setStockLoading] = useState(false);
    const [outOfStockItems, setOutOfStockItems] = useState([]);

    const divisions = [
        'Dhaka',
        'Chittagong',
        'Rajshahi',
        'Khulna',
        'Barisal',
        'Sylhet',
        'Rangpur',
        'Mymensingh'
    ];

    const subtotal = cartTotal;
    const shippingCost = 0;
    const discount = 0; // General discount (not coupon discount)
    const totalCost = useLoyaltyPoints ? 0 : (subtotal + shippingCost - discount - loyaltyDiscount - couponDiscount);

    // Calculate coins needed for the order
    const calculateCoinsNeeded = () => {
        if (!loyaltyData) return 0;
        return Math.ceil(subtotal / loyaltyData.coinValue);
    };

    const coinsNeeded = calculateCoinsNeeded();
    const remainingCoins = loyaltyData ? (loyaltyData.coins - coinsNeeded) : 0;

    // Calculate if loyalty points can cover the entire order
    const calculateLoyaltyRedemption = () => {
        if (!loyaltyData || !useLoyaltyPoints) {
            setLoyaltyDiscount(0);
            return;
        }

        // Check if user has enough coins to cover the entire order
        if (loyaltyData.coins >= coinsNeeded) {
            // User can pay with loyalty points only
            setLoyaltyDiscount(subtotal);
        } else {
            toast.error(`Insufficient coins. You need ${coinsNeeded} coins but have ${loyaltyData.coins} coins.`);
            setUseLoyaltyPoints(false);
            setLoyaltyDiscount(0);
        }
    };

    // Calculate loyalty redemption when useLoyaltyPoints changes
    useEffect(() => {
        if (useLoyaltyPoints && loyaltyData) {
            calculateLoyaltyRedemption();
            // Remove coupon when loyalty points are used
            if (appliedCoupon) {
                removeCoupon();
                toast.info('Coupon removed because loyalty points are being used');
            }
        } else {
            setLoyaltyDiscount(0);
        }
    }, [useLoyaltyPoints, loyaltyData, subtotal]);

    // Coupon functions
    const applyCoupon = async () => {


        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        // Check if loyalty points are being used
        if (useLoyaltyPoints) {
            setCouponError('Coupon cannot be applied when using loyalty points');
            return;
        }

        try {
            setCouponLoading(true);
            setCouponError('');
            
            const response = await couponAPI.validateCoupon(couponCode.trim(), subtotal);
            
            if (response && response.success) {
                const coupon = response.data.coupon;
                const discountAmount = response.data.discountAmount;
                const discountPercentage = coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : 'Fixed amount';
                
                setAppliedCoupon(coupon);
                setCouponDiscount(discountAmount);
                
                // Show detailed success message
                toast.success(
                    `Coupon applied! ${discountPercentage} discount (৳${discountAmount}) applied. You save ৳${discountAmount}!`
                );
            } else {
                const errorMessage = response?.message || 'Invalid coupon code';
                setCouponError(errorMessage);
                setAppliedCoupon(null);
                setCouponDiscount(0);
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to apply coupon. Please try again.';
            setCouponError(errorMessage);
            setAppliedCoupon(null);
            setCouponDiscount(0);
            toast.error(errorMessage);
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuantityChange = (itemId, change) => {
        const currentItem = cart.find(item => item.id === itemId);
        if (currentItem) {
            const newQuantity = currentItem.quantity + change;
            if (newQuantity >= 1) {
                updateCartItem(itemId, newQuantity);
            }
        }
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
    };

    const handleApplyCoupon = () => {
        applyCoupon();
    };

    const handleManualPaymentChange = (e) => {
        const { name, value } = e.target;
        setManualPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirmOrder = async () => {
        // Validate form data
        if (!formData.fullName || !formData.mobileNumber || !formData.division || !formData.deliveryAddress) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Check for out of stock items
        if (outOfStockItems.length > 0) {
            toast.error('Some items in your cart are out of stock. Please remove them to continue.');
            return;
        }

        // Validate manual payment data if selected
        if (paymentMethod === 'manual') {
            if (!manualPaymentData.phoneNumber || !manualPaymentData.transactionId) {
                toast.error('Please fill in payment details');
                return;
            }
        }

        // Process order based on payment method
        switch (paymentMethod) {
            case 'cash':
                try {
                    // Calculate total from cart items
                    const calculatedTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    // Prepare order data for Cash on Delivery
                    const orderData = {
                        items: cart.map(item => ({
                            product: item.productId,
                            variantSku: item.sku,
                            name: item.name,
                            image: item.image,
                            price: item.price,
                            quantity: item.quantity,
                            subtotal: item.price * item.quantity,
                            // Add variant information for admin
                            variant: {
                                size: item.size,
                                color: item.color,
                                colorHexCode: item.colorHexCode,
                                sku: item.sku,
                                stockQuantity: item.stockQuantity,
                                stockStatus: item.stockStatus
                            }
                        })),
                        shippingAddress: {
                            label: 'Delivery Address',
                            street: formData.deliveryAddress,
                            city: formData.division,
                            state: formData.division,
                            postalCode: '',
                            country: 'Bangladesh',
                            isDefault: true
                        },
                        billingAddress: {
                            label: 'Billing Address',
                            street: formData.deliveryAddress,
                            city: formData.division,
                            state: formData.division,
                            postalCode: '',
                            country: 'Bangladesh',
                            isDefault: true
                        },
                        paymentMethod: 'cod',
                        paymentStatus: 'pending',
                        total: useLoyaltyPoints ? 0 : calculatedTotal, // If using loyalty points, total is 0
                        discount: discount,
                        loyaltyDiscount: useLoyaltyPoints ? calculatedTotal : loyaltyDiscount,
                        loyaltyPointsUsed: useLoyaltyPoints ? coinsNeeded : 0,
                        shippingCost: shippingCost,
                        orderNotes: formData.orderNotes,
                        coupon: appliedCoupon ? appliedCoupon.code : undefined,
                        couponDiscount: couponDiscount
                    };

                    
                    // Create order with authentication
                    const response = await orderAPI.createOrder(orderData, getCookie('token'));
                    
                    if (response.success) {
                        toast.success('Order placed successfully! Cash on delivery');
                        // Clear cart and redirect to order confirmation with order details
                        clearCart();
                        const order = response.data;
                        const params = new URLSearchParams({
                            orderId: order.orderId,
                            status: order.status,
                            total: order.total,
                            createdAt: order.createdAt,
                            ...(order.couponDiscount > 0 && { couponDiscount: order.couponDiscount }),
                            ...(order.loyaltyDiscount > 0 && { loyaltyDiscount: order.loyaltyDiscount }),
                            ...(order.discount > 0 && { discount: order.discount }),
                            ...(order.coupon && { coupon: order.coupon })
                        });
                        router.push(`/order-confirmation?${params.toString()}`);
                    } else {
                        toast.error('Failed to place order. Please try again.');
                    }
                } catch (error) {
                    toast.error('Failed to place order. Please try again.');
                }
                break;
                
            case 'bkash':
                toast.error('This feature is currently under development');
                break;
                
            case 'manual':
                toast.error('This feature is currently under development');
                break;
                
            default:
                toast.error('Please select a payment method');
        }
    };



    // Show loading state while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Authentication</h2>
                    <p className="text-gray-600">Please wait while we verify your login status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sub Navigation */}
            
            {/* Main Content */}
            <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column - Checkout Form */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">01. Fill in the following information:</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">
                                        Full Name / আপনার পুরো নামঃ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name here"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">
                                        Mobile Number / মোবাইল নম্বরঃ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter your mobile number here"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                            </div>

                            {/* Division */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-2">
                                    Division / বিভাগঃ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map((division) => (
                                        <option key={division} value={division}>{division}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Delivery Address */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-2">
                                    Delivery Address / ডেলিভারি এড্রেসঃ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="deliveryAddress"
                                    value={formData.deliveryAddress}
                                    onChange={handleInputChange}
                                    placeholder="Delivery Address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>

                            {/* Order Notes */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-2">
                                    Order Notes / নোট লিখুনঃ
                                </label>
                                <textarea
                                    name="orderNotes"
                                    value={formData.orderNotes}
                                    onChange={handleInputChange}
                                    placeholder="Enter notes here (optional)"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">02. Payment Method <span className="text-red-500">*</span></h2>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-pink-500"
                                    />
                                    <span className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">💳</span>
                                        Cash On Delivery
                                    </span>
                                </label>

                                {/* <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bkash"
                                        checked={paymentMethod === 'bkash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-pink-500"
                                    />
                                    <span className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs">▶</span>
                                        Bkash Live
                                    </span>
                                </label>

                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="manual"
                                        checked={paymentMethod === 'manual'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-pink-500"
                                    />
                                    <span className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">💰</span>
                                        Manual Payment
                                    </span>
                                </label> */}
                            </div>

                            {/* Payment Instructions */}
                            {paymentMethod === 'bkash' && (
                                <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                    <h3 className="font-semibold text-pink-800 mb-2">Bkash Payment Instructions:</h3>
                                    <div className="text-sm text-pink-700 space-y-1">
                                        <p><strong>Personal Bkash/Nogod:</strong> +88 018 40 20 90 60 - (Send money only)</p>
                                        <p><strong>Bkash Merchant:</strong> +88 016 10 80 04 74 - (Payment only)</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'manual' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold text-blue-800 mb-4">Manual Payment Details:</h3>
                                    
                                    {/* Payment Instructions */}
                                    <div className="text-sm text-blue-700 space-y-1 mb-4">
                                        <p><strong>Personal Bkash/Nogod:</strong> +88 018 40 20 90 60 - (Send money only)</p>
                                        <p><strong>Bkash Merchant:</strong> +88 016 10 80 04 74 - (Payment only)</p>
                                    </div>

                                    {/* Manual Payment Form */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-800 mb-1">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={manualPaymentData.phoneNumber}
                                                onChange={handleManualPaymentChange}
                                                placeholder="Enter phone number used for payment"
                                                className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-800 mb-1">
                                                Transaction ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="transactionId"
                                                value={manualPaymentData.transactionId}
                                                onChange={handleManualPaymentChange}
                                                placeholder="Enter transaction ID"
                                                className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Loyalty Points Section */}
                        {loyaltyData && loyaltyData.coins > 0 && (
                            <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">03. Loyalty Points</h2>
                                
                                {appliedCoupon && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-800">
                                                Using loyalty points will remove your applied coupon ({appliedCoupon.code})
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-pink-800">Available Coins</h3>
                                            <p className="text-sm text-pink-600">{loyaltyData.coins} coins (৳{loyaltyData.totalValue})</p>
                                        </div>
                                        <div className="text-2xl">🪙</div>
                                    </div>

                                    {/* Check if user can pay with loyalty points */}
                                    {loyaltyData.coins >= coinsNeeded ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="useLoyaltyPoints"
                                                    checked={useLoyaltyPoints}
                                                    onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                                                    className="w-4 h-4 text-pink-500"
                                                />
                                                <label htmlFor="useLoyaltyPoints" className="text-sm font-medium text-gray-700">
                                                    Pay with {coinsNeeded} coins (৳{subtotal})
                                                </label>
                                            </div>
                                            
                                            
                                            {useLoyaltyPoints && loyaltyData && (
                                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-green-800">Coins to Use:</span>
                                                            <span className="font-semibold text-green-800">{coinsNeeded} coins</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-green-800">Order Total:</span>
                                                            <span className="font-semibold text-green-800">৳{subtotal}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-green-800">Remaining Coins:</span>
                                                            <span className="font-semibold text-green-800">{remainingCoins} coins</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-green-800">Final Payment:</span>
                                                            <span className="font-semibold text-green-800">৳{totalCost} (Paid with coins)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="text-sm text-yellow-800">
                                                <p className="font-medium">Insufficient coins</p>
                                                <p>You need {coinsNeeded} coins to pay for this order (৳{subtotal}), but you have {loyaltyData.coins} coins.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Out of Stock Warning */}
                        {outOfStockItems.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-red-800 mb-2">Out of Stock Items</h3>
                                        <p className="text-sm text-red-700 mb-3">
                                            Some items in your cart are no longer available. Please remove them to continue with your order.
                                        </p>
                                        <div className="space-y-1">
                                            {outOfStockItems.map((item, index) => {
                                                const cartItem = cart.find(c => c.id === item.cartItemId);
                                                return (
                                                    <div key={index} className="text-sm text-red-600 flex items-center justify-between">
                                                        <span>• {cartItem?.name || 'Unknown item'}</span>
                                                        <button
                                                            onClick={() => removeFromCart(item.cartItemId)}
                                                            className="text-red-500 hover:text-red-700 underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => router.push('/')}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Shopping
                            </button>
                            <button 
                                onClick={handleConfirmOrder}
                                disabled={cartLoading || cart.length === 0 || outOfStockItems.length > 0 || stockLoading}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold ${
                                    cartLoading || cart.length === 0 || outOfStockItems.length > 0 || stockLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-pink-500 text-white hover:bg-pink-600'
                                }`}
                            >
                                {stockLoading ? 'Checking Stock...' :
                                 cartLoading ? 'Loading...' :
                                 cart.length === 0 ? 'Cart Empty' :
                                 outOfStockItems.length > 0 ? 'Remove Out of Stock Items' :
                                 paymentMethod === 'cash' ? 'Confirm Order' : 
                                 paymentMethod === 'bkash' ? 'Process to Bkash Payment' : 
                                 'Confirm Manual Payment'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="bg-white border border-gray-300 shadow rounded-lg h-fit p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cartLoading ? (
                                // Loading skeleton
                                Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                    </div>
                                ))
                            ) : cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                                    <button 
                                        onClick={() => router.push('/')}
                                        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => {
                                    const isOutOfStock = stockData[item.id] && !stockData[item.id].isAvailable;
                                    return (
                                    <div key={item.id} className={`flex items-center space-x-4 p-3 border rounded ${
                                        isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200'
                                    }`}>
                                        {/* Product Image */}
                                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                                            {isOutOfStock && (
                                                <div className="text-xs text-red-600 font-medium mb-1">
                                                    {stockData[item.id]?.reason === 'Insufficient stock' 
                                                        ? `Only ${stockData[item.id]?.availableStock || 0} available`
                                                        : 'Out of Stock'
                                                    }
                                                </div>
                                            )}
                                            {item.size && (
                                                <p className="text-xs text-gray-600">Size: {item.size}</p>
                                            )}
                                            {item.color && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-xs text-gray-600">Color:</span>
                                                    <div 
                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                        style={{ 
                                                            backgroundColor: item.colorHexCode,
                                                            border: item.colorHexCode?.toLowerCase() === '#ffffff' || item.colorHexCode?.toLowerCase() === '#fff' 
                                                                ? '1px solid #d1d5db' 
                                                                : 'none'
                                                        }}
                                                        title={item.color}
                                                    ></div>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-600">Item Price: {item.price} ৳</p>
                                        </div>

                                        {/* Quantity Controls */}
                                        {isOutOfStock ? (
                                            <div className="text-xs text-red-600 font-medium">
                                                Remove from cart
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-sm hover:bg-gray-50"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-sm hover:bg-gray-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Total Price */}
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 text-sm">{item.total} ৳</p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className={`p-1 ${
                                                isOutOfStock 
                                                    ? 'text-red-500 hover:text-red-700' 
                                                    : 'text-pink-500 hover:text-pink-700'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Coupon Code */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">ENTER YOUR COUPON CODE</label>
                            
                            {useLoyaltyPoints && (
                                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                        <span className="text-xs text-yellow-800">
                                            Coupon cannot be used when paying with loyalty points
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER YOUR COUPON CODE"
                                    disabled={useLoyaltyPoints}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    onKeyPress={(e) => e.key === 'Enter' && !useLoyaltyPoints && handleApplyCoupon()}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim() || useLoyaltyPoints}
                                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center"
                                >
                                    {couponLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                            Applying...
                                        </>
                                    ) : (
                                        'Apply'
                                    )}
                                </button>
                            </div>
                            
                            {couponError && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="h-3 w-3 text-red-600" />
                                        <span className="text-xs text-red-800">{couponError}</span>
                                    </div>
                                </div>
                            )}
                            
                            {appliedCoupon && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Check className="h-3 w-3 text-green-600" />
                                            <span className="text-xs font-medium text-green-800">
                                                {appliedCoupon.code} Applied
                                            </span>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            disabled={useLoyaltyPoints}
                                            className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="mt-1 text-xs text-green-600">
                                        <span className="font-medium">Discount:</span> {appliedCoupon.discountType === 'percentage' 
                                            ? `${appliedCoupon.discountValue}% off`
                                            : `৳${appliedCoupon.discountValue} off`
                                        } | <span className="font-medium">You Save:</span> ৳{couponDiscount}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cost Breakdown */}
                        {cartLoading ? (
                            <div className="mt-6 space-y-2 text-sm animate-pulse">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping Cost</span>
                                    <span className="text-pink-500 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>TOTAL COST:</span>
                                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        ) : cart.length > 0 && (
                            <div className="mt-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">{subtotal} ৳</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping Cost</span>
                                    <span className="text-pink-500 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-orange-500">{discount} ৳</span>
                                </div>
                                
                                {/* Coupon Discount */}
                                {appliedCoupon && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Coupon Discount ({appliedCoupon.code})</span>
                                        <span className="text-blue-600">-৳{couponDiscount}</span>
                                    </div>
                                )}
                                
                                {/* Loyalty Points Breakdown */}
                                {useLoyaltyPoints && loyaltyData && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Coins Used</span>
                                            <span className="text-pink-600">{coinsNeeded} coins</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remaining Coins</span>
                                            <span className="text-pink-600">{remainingCoins} coins</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Loyalty Discount</span>
                                            <span className="text-green-600">-৳{subtotal}</span>
                                        </div>
                                    </>
                                )}

                                {/* Total Cost */}
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>TOTAL COST:</span>
                                    <span>{totalCost} ৳</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Required Modal */}
            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </div>
    );
}