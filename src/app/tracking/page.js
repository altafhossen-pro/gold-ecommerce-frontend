'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, Home, XCircle } from 'lucide-react';
import { orderAPI } from '@/services/api';
import { useSearchParams } from 'next/navigation';

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Auto-fill orderId from URL parameters and auto-focus the input field
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      // Auto-search when orderId is provided in URL
      if (urlOrderId.trim()) {
        handleAutoSearch(urlOrderId);
      }
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchParams]);

  const handleAutoSearch = async (orderIdToSearch) => {
    if (!orderIdToSearch.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await orderAPI.trackOrder(orderIdToSearch);
      
      if (response.success) {
        setOrderData(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (error) {
      setError('Order not found. Please check your order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await orderAPI.trackOrder(orderId);
      
      if (response.success) {
        setOrderData(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (error) {
      setError('Order not found. Please check your order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status, completed) => {
    if (status === 'cancelled' && completed) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-400" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-gray-400" />;
      case 'processing':
        return <Package className="w-6 h-6 text-gray-400" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-gray-400" />;
      case 'delivered':
        return <Home className="w-6 h-6 text-gray-400" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-gray-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
            <p className="text-gray-600">Enter your order ID to track your order status</p>
          </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Your Order ID:
              </label>
              <input
                ref={inputRef}
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., 579614)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order ID: {orderData.order.orderId}</h3>
                  <p className="text-gray-600">Status: <span className="font-medium capitalize">{orderData.order.status}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{orderData.order.total} ৳</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h3>
              
              <div className="space-y-4">
                {orderData.trackingSteps.map((step, index) => (
                  <div key={step.status} className="relative">
                    {/* Main Content */}
                    <div className="flex justify-between items-center pb-4">
                      {/* Left Side */}
                      <div className="flex items-center">
                        {/* Icon */}
                        <div className="mr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            step.status === 'cancelled' && step.completed
                              ? 'bg-red-100 border-2 border-red-500'
                              : step.completed 
                                ? 'bg-green-100 border-2 border-green-500' 
                                : 'bg-gray-100 border-2 border-gray-300'
                          }`}>
                            {getStatusIcon(step.status, step.completed)}
                          </div>
                        </div>
                        
                        {/* Label and Description */}
                        <div>
                          <h4 className={`font-medium ${
                            step.status === 'cancelled' && step.completed
                              ? 'text-red-700'
                              : step.completed 
                                ? 'text-green-700' 
                                : 'text-gray-500'
                          }`}>
                            {step.label}
                          </h4>
                          {step.completed && (
                            <p className={`text-sm mt-1 ${
                              step.status === 'cancelled' 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                            }`}>
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Timestamp */}
                      {step.timestamp && (
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(step.timestamp)}
                        </div>
                      )}
                    </div>

                    {/* Timeline Line - Outside main content */}
                    {index < orderData.trackingSteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {orderData.order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-20">Address:</span>
                      <span>{orderData.order.shippingAddress.street}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-20">City:</span>
                      <span>{orderData.order.shippingAddress.city}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-20">State:</span>
                      <span>{orderData.order.shippingAddress.state}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-600 w-20">Country:</span>
                      <span>{orderData.order.shippingAddress.country}</span>
                    </div>
                    {orderData.order.shippingAddress.postalCode && (
                      <div className="flex items-start">
                        <span className="font-medium text-gray-600 w-20">Postal:</span>
                        <span>{orderData.order.shippingAddress.postalCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking page...</p>
        </div>
      </div>
    }>
      <TrackingPageContent />
    </Suspense>
  );
}
