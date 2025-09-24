'use client';

import React, { Suspense } from 'react';
import { CheckCircle, Eye, Calendar, DollarSign, Package } from 'lucide-react';
import Footer from '@/components/Footer/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderConfirmation() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const total = searchParams.get('total');
    const createdAt = searchParams.get('createdAt');
    const couponDiscount = searchParams.get('couponDiscount');
    const loyaltyDiscount = searchParams.get('loyaltyDiscount');
    const discount = searchParams.get('discount');
    const coupon = searchParams.get('coupon');

    // Calculate final total after discounts
    const calculateFinalTotal = () => {
        let finalTotal = parseFloat(total) || 0;
        if (couponDiscount) finalTotal -= parseFloat(couponDiscount);
        if (loyaltyDiscount) finalTotal -= parseFloat(loyaltyDiscount);
        if (discount) finalTotal -= parseFloat(discount);
        return Math.max(0, finalTotal); // Ensure total doesn't go below 0
    };

    const finalTotal = calculateFinalTotal();

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'confirmed': return 'text-blue-600 bg-blue-100';
            case 'processing': return 'text-purple-600 bg-purple-100';
            case 'shipped': return 'text-indigo-600 bg-indigo-100';
            case 'delivered': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    return (
        <div className="h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-md mx-4">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        🎉 Order Placed Successfully!
                    </h1>
                    <p className="text-sm text-gray-600 mb-6">
                        Thank you for your order! We'll process it shortly.
                    </p>
                    
                    {/* Order Information Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {/* Order ID */}
                        {orderId && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center justify-center mb-1">
                                    <Package className="w-4 h-4 text-blue-600 mr-1" />
                                    <span className="text-xs font-medium text-blue-600">Order ID</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{orderId}</p>
                            </div>
                        )}

                        {/* Status */}
                        {status && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-100">
                                <div className="flex items-center justify-center mb-1">
                                    <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status).split(' ')[1]}`}></div>
                                    <span className="text-xs font-medium text-gray-600">Status</span>
                                </div>
                                <p className={`text-sm font-semibold capitalize ${getStatusColor(status).split(' ')[0]}`}>
                                    {status}
                                </p>
                            </div>
                        )}

                        {/* Total Amount */}
                        {total && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                                <div className="flex items-center justify-center mb-1">
                                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-xs font-medium text-green-600">Total</span>
                                </div>
                                {finalTotal !== parseFloat(total) ? (
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900">৳{finalTotal}</p>
                                        <p className="text-xs text-gray-500 line-through">৳{total}</p>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-900">৳{finalTotal}</p>
                                )}
                            </div>
                        )}

                        {/* Order Date */}
                        {createdAt && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                                <div className="flex items-center justify-center mb-1">
                                    <Calendar className="w-4 h-4 text-purple-600 mr-1" />
                                    <span className="text-xs font-medium text-purple-600">Date</span>
                                </div>
                                <p className="text-xs font-semibold text-gray-900">{formatDate(createdAt)}</p>
                            </div>
                        )}
                    </div>

                    {/* Discount Breakdown */}
                    {(couponDiscount || loyaltyDiscount || discount) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Savings Applied</h3>
                            <div className="space-y-2">
                                {couponDiscount && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            Coupon Discount {coupon && `(${coupon})`}
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            -৳{couponDiscount}
                                        </span>
                                    </div>
                                )}
                                {loyaltyDiscount && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Loyalty Points Discount</span>
                                        <span className="font-semibold text-pink-600">
                                            -৳{loyaltyDiscount}
                                        </span>
                                    </div>
                                )}
                                {discount && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">General Discount</span>
                                        <span className="font-semibold text-green-600">
                                            -৳{discount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View Details Button */}
                    {orderId && (
                        <Link
                            href={`/dashboard/my-orders/${orderId}`}
                            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Eye className="w-5 h-5 mr-2" />
                            View Order Details
                        </Link>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

// Wrapper component with Suspense boundary
export default function OrderConfirmationWithSuspense() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>}>
            <OrderConfirmation />
        </Suspense>
    );
}
