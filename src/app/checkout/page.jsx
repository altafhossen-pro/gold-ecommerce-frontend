'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { orderAPI, productAPI, loyaltyAPI, couponAPI, addressAPI, upsellAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import CheckoutOptionsModal from '@/components/Common/CheckoutOptionsModal';

export default function Checkout() {
    const { cart, cartTotal, updateCartItem, removeFromCart, cartLoading, user, clearCart, deliveryChargeSettings } = useAppContext();
    const router = useRouter();
    // Checkout options modal state
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);

    // Check authentication status
    useEffect(() => {
        const token = getCookie('token');
        
        // If we have a token but user data is still loading
        if (token && !user) {
            setIsCheckingAuth(true);
            setShowCheckoutModal(false);
        }
        // If no token, show modal immediately
        else if (!token) {
            setIsCheckingAuth(false);
            setShowCheckoutModal(true);
        }
        // If user is loaded and has email, hide modal
        else if (user && user.email) {
            setIsCheckingAuth(false);
            setShowCheckoutModal(false);
        }
    }, [user]);

    // Timeout for authentication check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isCheckingAuth) {
                setIsCheckingAuth(false);
                setShowCheckoutModal(true);
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
            calculateUpsellDiscount();
        } else {
            setStockData({});
            setOutOfStockItems([]);
            setUpsellDiscount(0);
        }
    }, [cart]);

    // Calculate upsell discounts
    const calculateUpsellDiscount = async () => {
        if (cart.length === 0) {
            setUpsellDiscount(0);
            return;
        }

        try {
            const response = await upsellAPI.calculateCartDiscounts(cart);
            
            if (response.success && response.data) {
                setUpsellDiscount(response.data.totalDiscount || 0);
            } else {
                setUpsellDiscount(0);
            }
        } catch (error) {
            console.error('Error calculating upsell discounts:', error);
            setUpsellDiscount(0);
        }
    };

    // Fetch loyalty data when user is available
    useEffect(() => {
        if (user && user._id) {
            fetchLoyaltyData();
        }
    }, [user]);

    // Load divisions on component mount
    useEffect(() => {
        fetchDivisions();
    }, []);

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

    // Fetch divisions data
    const fetchDivisions = async () => {
        try {
            setDivisionsLoading(true);
            const response = await addressAPI.getDivisions();
            if (response.success) {
                setDivisions(response.data);
            }
        } catch (error) {
            console.error('Error fetching divisions:', error);
        } finally {
            setDivisionsLoading(false);
        }
    };

    // Fetch districts by division
    const fetchDistricts = async (divisionId) => {
        try {
            setDistrictsLoading(true);
            const response = await addressAPI.getDistrictsByDivision(divisionId);
            if (response.success) {
                setDistricts(response.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        } finally {
            setDistrictsLoading(false);
        }
    };

    // Fetch upazilas by district
    const fetchUpazilas = async (districtId) => {
        try {
            setUpazilasLoading(true);
            const response = await addressAPI.getUpazilasByDistrict(districtId);
            if (response.success) {
                setUpazilas(response.data);
            }
        } catch (error) {
            console.error('Error fetching upazilas:', error);
        } finally {
            setUpazilasLoading(false);
        }
    };

    // Fetch Dhaka city areas (all areas, no district filter)
    const fetchDhakaAreas = async () => {
        try {
            setDhakaAreasLoading(true);
            const response = await addressAPI.getAllDhakaCityAreas();
            if (response.success) {
                setDhakaAreas(response.data);
            }
        } catch (error) {
            console.error('Error fetching Dhaka areas:', error);
        } finally {
            setDhakaAreasLoading(false);
        }
    };
    
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        division: '',
        divisionId: '',
        district: '',
        districtId: '',
        upazila: '',
        upazilaId: '',
        area: '',
        areaId: '',
        deliveryType: 'outsideDhaka', // Default to outside Dhaka
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

    // Upsell discount state
    const [upsellDiscount, setUpsellDiscount] = useState(0);

    // Stock validation state
    const [stockData, setStockData] = useState({});
    const [stockLoading, setStockLoading] = useState(false);
    const [outOfStockItems, setOutOfStockItems] = useState([]);

    // Address state
    const [divisions, setDivisions] = useState([]);
    const [divisionsLoading, setDivisionsLoading] = useState(true);
    const [districts, setDistricts] = useState([]);
    const [districtsLoading, setDistrictsLoading] = useState(false);
    const [upazilas, setUpazilas] = useState([]);
    const [upazilasLoading, setUpazilasLoading] = useState(false);
    const [dhakaAreas, setDhakaAreas] = useState([]);
    const [dhakaAreasLoading, setDhakaAreasLoading] = useState(false);

    const subtotal = cartTotal;
    
    // Dynamic delivery charge calculation based on delivery type
    const calculateDeliveryCharge = () => {
        if (!deliveryChargeSettings || !formData.deliveryType) return 0;
        
        // Check if cart total meets free shipping requirement
        if (subtotal >= deliveryChargeSettings.shippingFreeRequiredAmount) {
            return 0; // Free shipping
        }
        
        // Check delivery type for delivery charge
        if (formData.deliveryType === 'insideDhaka') {
            return deliveryChargeSettings.insideDhaka;
        } else if (formData.deliveryType === 'subDhaka') {
            return deliveryChargeSettings.subDhaka;
        } else if (formData.deliveryType === 'outsideDhaka') {
            return deliveryChargeSettings.outsideDhaka;
        }
        
        return 0;
    };
    
    const shippingCost = calculateDeliveryCharge();
    const discount = 0; // General discount (not coupon discount)
    // Combine normal discount with upsell discount for UI display
    const totalDiscountForUI = discount + upsellDiscount;
    const totalCost = useLoyaltyPoints ? 0 : (subtotal + shippingCost - discount - upsellDiscount - loyaltyDiscount - couponDiscount);
    
    // Auto-select delivery type when division/district is selected
    useEffect(() => {
        if (formData.divisionId && formData.districtId) {
            // Auto-select delivery type based on district
            if (formData.districtId === '65') {
                setFormData(prev => ({ ...prev, deliveryType: 'insideDhaka' }));
            } else if (formData.districtId === '1') {
                setFormData(prev => ({ ...prev, deliveryType: 'subDhaka' }));
            } else {
                setFormData(prev => ({ ...prev, deliveryType: 'outsideDhaka' }));
            }
        }
    }, [formData.divisionId, formData.districtId]);
    
    // Recalculate delivery charge when delivery type changes
    useEffect(() => {
        // This will trigger re-calculation when formData.deliveryType changes
    }, [formData.deliveryType, subtotal, deliveryChargeSettings]);

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
        
        if (name === 'division') {
            // Find division ID from name
            const selectedDivision = divisions.find(div => div.name === value);
            if (selectedDivision) {
                // Load districts for selected division
                fetchDistricts(selectedDivision.id);
                // Reset district and upazila when division changes
                setFormData(prev => ({
                    ...prev,
                    division: value,
                    divisionId: selectedDivision.id,
                    district: '',
                    districtId: '',
                    upazila: '',
                    upazilaId: '',
                    area: '',
                    areaId: ''
                }));
                setDistricts([]);
                setUpazilas([]);
                setDhakaAreas([]);
            }
        } else if (name === 'district') {
            // Find district ID from name
            const selectedDistrict = districts.find(dist => dist.name === value);
            if (selectedDistrict) {
                // Check if it's Dhaka city (district ID 65)
                if (selectedDistrict.id === '65') {
                    // Load all Dhaka city areas (no district filter)
                    fetchDhakaAreas();
                    setFormData(prev => ({
                        ...prev,
                        district: value,
                        districtId: selectedDistrict.id,
                        upazila: '',
                        upazilaId: '',
                        area: '',
                        areaId: ''
                    }));
                    setUpazilas([]);
                    setDhakaAreas([]);
                } else {
                    // Load upazilas for other districts by district ID
                    fetchUpazilas(selectedDistrict.id);
                    setFormData(prev => ({
                        ...prev,
                        district: value,
                        districtId: selectedDistrict.id,
                        upazila: '',
                        upazilaId: '',
                        area: '',
                        areaId: ''
                    }));
                    setUpazilas([]);
                    setDhakaAreas([]);
                }
            }
        } else if (name === 'upazila') {
            // Find upazila ID from name
            const selectedUpazila = upazilas.find(up => up.name === value);
            setFormData(prev => ({
                ...prev,
                upazila: value,
                upazilaId: selectedUpazila ? selectedUpazila.id : '',
                area: '',
                areaId: ''
            }));
            setDhakaAreas([]);
        } else if (name === 'area') {
            // Find area ID from name
            const selectedArea = dhakaAreas.find(area => area.name === value);
            setFormData(prev => ({
                ...prev,
                area: value,
                areaId: selectedArea ? selectedArea._id : '',
                upazila: '',
                upazilaId: ''
            }));
            setUpazilas([]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleQuantityChange = (itemId, change) => {
        const currentItem = cart.find(item => item.id === itemId);
        if (currentItem) {
            const newQuantity = currentItem.quantity + change;
            
            // Check minimum quantity
            if (newQuantity < 1) {
                return;
            }
            
            // Check maximum available stock
            const availableStock = stockData[itemId]?.availableStock || currentItem.stockQuantity || 0;
            if (newQuantity > availableStock) {
                toast.error(`Only ${availableStock} items available in stock`);
                return;
            }
            
            updateCartItem(itemId, newQuantity);
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

    // Handle guest checkout selection
    const handleGuestCheckout = () => {
        setIsGuestCheckout(true);
        setShowCheckoutModal(false);
    };

    const handleConfirmOrder = async () => {
        // Validate form data
        if (!formData.fullName || !formData.mobileNumber || !formData.deliveryAddress) {
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
                            isDefault: true,
                            // Address IDs for backend processing
                            divisionId: formData.divisionId,
                            districtId: formData.districtId,
                            upazilaId: formData.upazilaId,
                            areaId: formData.areaId,
                            division: formData.division,
                            district: formData.district,
                            upazila: formData.upazila,
                            area: formData.area
                        },
                        billingAddress: {
                            label: 'Billing Address',
                            street: formData.deliveryAddress,
                            city: formData.division,
                            state: formData.division,
                            postalCode: '',
                            country: 'Bangladesh',
                            isDefault: true,
                            // Address IDs for backend processing
                            divisionId: formData.divisionId,
                            districtId: formData.districtId,
                            upazilaId: formData.upazilaId,
                            areaId: formData.areaId,
                            division: formData.division,
                            district: formData.district,
                            upazila: formData.upazila,
                            area: formData.area
                        },
                        paymentMethod: 'cod',
                        paymentStatus: 'pending',
                        total: useLoyaltyPoints ? 0 : calculatedTotal, // If using loyalty points, total is 0
                        discount: discount,
                        upsellDiscount: upsellDiscount, // Separate field for upsell discount
                        loyaltyDiscount: useLoyaltyPoints ? calculatedTotal : loyaltyDiscount,
                        loyaltyPointsUsed: useLoyaltyPoints ? coinsNeeded : 0,
                        shippingCost: shippingCost,
                        orderNotes: formData.orderNotes,
                        coupon: appliedCoupon ? appliedCoupon.code : undefined,
                        couponDiscount: couponDiscount
                    };

                    
                    // Create order based on checkout type
                    let response;
                    if (isGuestCheckout) {
                        // Create guest order (no authentication required)
                        response = await orderAPI.createGuestOrder(orderData);
                    } else {
                        // Create authenticated order
                        const token = getCookie('token');
                        response = await orderAPI.createOrder(orderData, token);
                    }
                    
                    if (response.success) {
                        toast.success('Order placed successfully! Cash on delivery');
                        // Clear cart and redirect to order confirmation with order details
                        clearCart();
                        const order = response.data;
                        const params = new URLSearchParams({
                            orderId: order.orderId,
                            status: order.status,
                            total: order.total + order.shippingCost, // Include shipping cost in total
                            createdAt: order.createdAt,
                            ...(order.couponDiscount > 0 && { couponDiscount: order.couponDiscount }),
                            ...(order.loyaltyDiscount > 0 && { loyaltyDiscount: order.loyaltyDiscount }),
                            ...(order.discount > 0 && { discount: order.discount }),
                            ...(order.upsellDiscount > 0 && { upsellDiscount: order.upsellDiscount }),
                            ...(order.coupon && { coupon: order.coupon }),
                            ...(order.isGuestOrder && { isGuestOrder: 'true' })
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
            <div className="max-w-screen-2xl mx-auto px-4 py-4">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column - Checkout Form */}
                    <div className="space-y-6 w-[60%]">
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

                            {/* Address Selection - Division, District, Upazila in one row */}
                            <div className="mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Division */}
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Division / বিভাগঃ
                                        </label>
                                        <select
                                            name="division"
                                            value={formData.division}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                            disabled={divisionsLoading}
                                        >
                                            <option value="">
                                                {divisionsLoading ? 'Loading...' : 'Select Division'}
                                            </option>
                                            {divisions.map((division) => (
                                                <option key={division.id} value={division.name}>
                                                    {division.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* District - Show only when division is selected */}
                                    {formData.division && (
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                District / জেলাঃ
                                            </label>
                                            <select
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                                disabled={districtsLoading}
                                            >
                                                <option value="">
                                                    {districtsLoading ? 'Loading...' : 'Select District'}
                                                </option>
                                                {districts.map((district) => (
                                                    <option key={district.id} value={district.name}>
                                                        {district.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Upazila/Area - Show based on district ID */}
                                    {formData.district && (
                                        <div>
                                            {/* Show Upazila for non-Dhaka districts (ID != 65) */}
                                            {(() => {
                                                const selectedDistrict = districts.find(dist => dist.name === formData.district);
                                                return selectedDistrict && selectedDistrict.id !== '65';
                                            })() && (
                                                <>
                                                    <label className="block text-sm text-gray-700 mb-2">
                                                        Upazila / উপজেলাঃ
                                                    </label>
                                                    <select
                                                        name="upazila"
                                                        value={formData.upazila}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                                        disabled={upazilasLoading}
                                                    >
                                                        <option value="">
                                                            {upazilasLoading ? 'Loading...' : 'Select Upazila'}
                                                        </option>
                                                        {upazilas.map((upazila) => (
                                                            <option key={upazila.id} value={upazila.name}>
                                                                {upazila.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            )}

                                            {/* Show Area for Dhaka city (ID = 65) */}
                                            {(() => {
                                                const selectedDistrict = districts.find(dist => dist.name === formData.district);
                                                return selectedDistrict && selectedDistrict.id === '65';
                                            })() && (
                                                <>
                                                    <label className="block text-sm text-gray-700 mb-2">
                                                        Area / এলাকাঃ
                                                    </label>
                                                    <select
                                                        name="area"
                                                        value={formData.area}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                                        disabled={dhakaAreasLoading}
                                                    >
                                                        <option value="">
                                                            {dhakaAreasLoading ? 'Loading...' : 'Select Area'}
                                                        </option>
                                                        {dhakaAreas.map((area) => (
                                                            <option key={area._id} value={area.name}>
                                                                {area.name} ({area.city_corporation})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                    required
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

                        {/* Delivery Type Selection */}
                        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">02. Delivery Type <span className="text-red-500">*</span></h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                                    formData.deliveryType === 'insideDhaka' 
                                        ? 'border-pink-500 bg-pink-50' 
                                        : 'border-gray-300 hover:border-pink-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="insideDhaka"
                                        checked={formData.deliveryType === 'insideDhaka'}
                                        onChange={handleInputChange}
                                        className="mr-3 text-pink-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">Inside Dhaka</div>
                                        <div className="text-sm text-gray-600">
                                            {deliveryChargeSettings ? `${deliveryChargeSettings.insideDhaka} ৳` : '80 ৳'}
                                        </div>
                                    </div>
                                </label>
                                
                                <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                                    formData.deliveryType === 'subDhaka' 
                                        ? 'border-pink-500 bg-pink-50' 
                                        : 'border-gray-300 hover:border-pink-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="subDhaka"
                                        checked={formData.deliveryType === 'subDhaka'}
                                        onChange={handleInputChange}
                                        className="mr-3 text-pink-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">Sub Dhaka</div>
                                        <div className="text-sm text-gray-600">
                                            {deliveryChargeSettings ? `${deliveryChargeSettings.subDhaka} ৳` : '120 ৳'}
                                        </div>
                                    </div>
                                </label>
                                
                                <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                                    formData.deliveryType === 'outsideDhaka' 
                                        ? 'border-pink-500 bg-pink-50' 
                                        : 'border-gray-300 hover:border-pink-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="outsideDhaka"
                                        checked={formData.deliveryType === 'outsideDhaka'}
                                        onChange={handleInputChange}
                                        className="mr-3 text-pink-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">Outside Dhaka</div>
                                        <div className="text-sm text-gray-600">
                                            {deliveryChargeSettings ? `${deliveryChargeSettings.outsideDhaka} ৳` : '150 ৳'}
                                        </div>
                                    </div>
                                </label>
                            </div>
                            
                            {/* Auto-selected info */}
                            {formData.divisionId && formData.districtId && (
                                <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                    📍 Auto-selected based on your location: {formData.division} → {formData.district}
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">03. Payment Method <span className="text-red-500">*</span></h2>

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


                        {/* Loyalty Points Section - Only for logged-in users */}
                        {!isGuestCheckout && loyaltyData && loyaltyData.coins > 0 && (
                            <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">04. Loyalty Points</h2>
                                
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
                    <div className="bg-white border border-gray-300 shadow rounded-lg h-fit p-6 w-[40%]">
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
                                                    disabled={item.quantity >= (stockData[item.id]?.availableStock || item.stockQuantity || 0)}
                                                    className={`w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-sm hover:bg-gray-50 ${
                                                        item.quantity >= (stockData[item.id]?.availableStock || item.stockQuantity || 0)
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'cursor-pointer'
                                                    }`}
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
                            
                            {(useLoyaltyPoints || isGuestCheckout) && (
                                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                        <span className="text-xs text-yellow-800">
                                            {isGuestCheckout 
                                                ? 'Coupon feature is available for registered users only'
                                                : 'Coupon cannot be used when paying with loyalty points'
                                            }
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
                                    disabled={useLoyaltyPoints || isGuestCheckout}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    onKeyPress={(e) => e.key === 'Enter' && !useLoyaltyPoints && !isGuestCheckout && handleApplyCoupon()}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim() || useLoyaltyPoints || isGuestCheckout}
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
                                            disabled={useLoyaltyPoints || isGuestCheckout}
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
                                    <span className="text-gray-600">Delivery Charge</span>
                                    <span className="text-pink-500 font-medium">Calculating...</span>
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
                                    <span className="text-gray-600">Delivery Charge</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        <span className="text-pink-500 font-medium">{shippingCost} ৳</span>
                                    )}
                                </div>
                                
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-orange-500">{totalDiscountForUI} ৳</span>
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

            {/* Checkout Options Modal */}
            <CheckoutOptionsModal 
                isOpen={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
                onGuestCheckout={handleGuestCheckout}
            />
        </div>
    );
}