'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, Trash2, Check } from 'lucide-react';
import Header from '@/components/Header/Header';

export default function Checkout() {
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        division: '',
        deliveryAddress: '',
        orderNotes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [couponCode, setCouponCode] = useState('');

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

    const cartItems = [
        {
            id: 1,
            name: 'গ্রাম্য চাকের মধু',
            weight: '1 KG',
            price: 1450,
            quantity: 3,
            image: '/images/featured/img.png'
        }
    ];

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = 0;
    const discount = 0;
    const totalCost = subtotal + shippingCost - discount;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuantityChange = (itemId, change) => {
        console.log(`Quantity changed for item ${itemId} by ${change}`);
    };

    const handleRemoveItem = (itemId) => {
        console.log(`Remove item ${itemId}`);
    };

    const handleApplyCoupon = () => {
        console.log('Applying coupon:', couponCode);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            {/* Sub Navigation */}
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column - Checkout Form */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white p-6">
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
                        <div className="bg-white p-6">
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

                                <label className="flex items-center space-x-3 cursor-pointer">
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
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                                <ArrowLeft className="w-4 h-4" />
                                Continue Shipping
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-white rounded hover:bg-pink-600 font-semibold">
                                Confirm Order
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="bg-white p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded">
                                    {/* Product Image */}
                                    <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                                        <span className="text-orange-600 text-2xl">🍯</span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm">{item.name}, Weight: {item.weight}</h3>
                                        <p className="text-xs text-gray-600">Item Price: {item.price} Tk</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-sm"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-sm"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Total Price */}
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 text-sm">{item.price * item.quantity} Tk</p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-pink-500 hover:text-pink-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Free Delivery Banner */}
                        <div className="mt-4 p-3 bg-pink-100 text-pink-700 rounded flex items-center gap-2">
                            <Check className="w-5 h-5 text-pink-500" />
                            <span className="text-sm font-medium">স্বাগতম! আপনার এই অর্ডারটির ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
                        </div>

                        {/* Coupon Code */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">ENTER YOUR COUPON CODE</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="ENTER YOUR COUPON CODE"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="mt-6 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{subtotal} Tk</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Cost</span>
                                <span className="text-pink-500 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Discount</span>
                                <span className="text-orange-500">{discount} Tk</span>
                            </div>

                            {/* Free Delivery Banner (Bottom) */}
                            <div className="p-3 bg-pink-100 text-pink-700 rounded flex items-center gap-2">
                                <Check className="w-4 h-4 text-pink-500" />
                                <span className="text-xs font-medium">স্বাগতম! আপনার এই অর্ডারটির ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
                            </div>

                            {/* Total Cost */}
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>TOTAL COST:</span>
                                <span>{totalCost} TK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}