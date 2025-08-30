'use client';

import React from 'react';
import { CheckCircle, Home, Package } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Link from 'next/link';

export default function OrderConfirmation() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Order Placed Successfully!
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-8">
                        Thank you for your order. We have received your order and will process it shortly.
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-medium text-gray-900">Cash on Delivery</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Status</p>
                                <p className="font-medium text-green-600">Pending</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estimated Delivery</p>
                                <p className="font-medium text-gray-900">2-3 Business Days</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                        <div className="space-y-3 text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Order Confirmation</p>
                                    <p className="text-sm text-gray-600">You will receive an SMS confirmation shortly</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Order Processing</p>
                                    <p className="text-sm text-gray-600">We will process and prepare your order</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Delivery</p>
                                    <p className="text-sm text-gray-600">Your order will be delivered to your address</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Link>
                        
                        <Link
                            href="/orders"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            View Orders
                        </Link>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                            Need help? Contact our customer support
                        </p>
                        <p className="text-sm text-gray-600">
                            Email: support@example.com | Phone: +880 1234-567890
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
