'use client';

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Package, 
    Calendar, 
    User, 
    MapPin, 
    CreditCard, 
    Phone, 
    Mail, 
    Truck, 
    Clock,
    CheckCircle,
    AlertCircle,
    Info,
    DollarSign,
    ShoppingBag,
    FileText,
    Edit3,
    Printer,
    Copy,
    Download,
    MoreVertical,
    Eye,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateForTable } from '@/utils/formatDate';
import { orderAPI } from '@/services/api';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getAdminOrderDetails(orderId);

            if (data.success) {
                setOrder(data.data);
            } else {
                toast.error('Failed to fetch order details');
                router.push('/admin/dashboard/orders');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error fetching order details');
            router.push('/admin/dashboard/orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'paid':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'confirmed':
                return <CheckCircle className="h-4 w-4" />;
            case 'processing':
                return <Package className="h-4 w-4" />;
            case 'shipped':
                return <Truck className="h-4 w-4" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getStatusTimeline = (status) => {
        const timeline = [
            { step: 'pending', label: 'Order Placed', completed: true },
            { step: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) },
            { step: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status) },
            { step: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
            { step: 'delivered', label: 'Delivered', completed: status === 'delivered' }
        ];

        if (status === 'cancelled') {
            return timeline.map(item => ({ ...item, completed: false }));
        }

        return timeline;
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(order._id);
        toast.success('Order ID copied!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-slate-600 font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
                    <p className="text-slate-600">The order you're looking for doesn't exist.</p>
                    <Link
                        href="/admin/dashboard/orders"
                        className="inline-flex items-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Header Bar */}
            <div className="bg-white border-b border-slate-200  z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin/dashboard/orders"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Orders
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                    <button 
                                        onClick={copyOrderId}
                                        className="ml-2 p-1 hover:bg-slate-100 rounded transition-colors"
                                        title="Copy Order ID"
                                    >
                                        <Copy className="h-4 w-4 text-slate-500" />
                                    </button>
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {formatDateForTable(order.createdAt)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-2">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </span>
                            <div className="flex items-center space-x-2">
                                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Update Status
                                </button>
                                <button className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
                {/* Status Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                                <p className="text-2xl font-bold text-slate-900">৳{order.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <ShoppingBag className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Items</p>
                                <p className="text-2xl font-bold text-slate-900">{order.items.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-xl ${order.paymentStatus === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <CreditCard className={`h-6 w-6 ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Payment</p>
                                <p className="text-lg font-bold text-slate-900 capitalize">{order.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                {getStatusIcon(order.status)}
                                <div className="text-purple-600">{getStatusIcon(order.status)}</div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600">Status</p>
                                <p className="text-lg font-bold text-slate-900 capitalize">{order.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-3 space-y-8">
                        {/* Order Progress Timeline */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900">Order Progress</h2>
                                <span className="text-sm text-slate-500">Track your order status</span>
                            </div>
                            
                            <div className="relative">
                                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200"></div>
                                <div className="space-y-8">
                                    {getStatusTimeline(order.status).map((step, index) => (
                                        <div key={step.step} className="relative flex items-start">
                                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                                                step.completed 
                                                    ? 'bg-emerald-500 border-emerald-500' 
                                                    : 'bg-white border-slate-300'
                                            }`}>
                                                {step.completed ? (
                                                    <CheckCircle className="h-6 w-6 text-white" />
                                                ) : (
                                                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="ml-6">
                                                <div className={`text-lg font-semibold ${
                                                    step.completed ? 'text-slate-900' : 'text-slate-500'
                                                }`}>
                                                    {step.label}
                                                </div>
                                                {step.completed && (
                                                    <div className="text-sm text-emerald-600 mt-1 font-medium">
                                                        ✓ Completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                    <ShoppingBag className="h-6 w-6 mr-3 text-blue-600" />
                                    Order Items
                                </h2>
                                <div className="bg-slate-100 px-4 py-2 rounded-xl">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="group relative bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-all duration-300 border border-slate-100">
                                        <div className="flex items-center space-x-6">
                                            <div className="relative">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-24 w-24 rounded-xl object-cover border-2 border-white shadow-lg"
                                                />
                                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 mb-3">
                                                    {item.name}
                                                </h3>
                                                
                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    <div className="flex items-center bg-blue-100 px-3 py-1.5 rounded-lg">
                                                        <span className="text-xs font-bold text-blue-800 mr-1">QTY:</span>
                                                        <span className="text-xs font-semibold text-blue-700">{item.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center bg-emerald-100 px-3 py-1.5 rounded-lg">
                                                        <span className="text-xs font-bold text-emerald-800 mr-1">PRICE:</span>
                                                        <span className="text-xs font-semibold text-emerald-700">৳{item.price}</span>
                                                    </div>
                                                </div>

                                                {item.variant && (
                                                    <div className="flex flex-wrap gap-3">
                                                        {item.variant.size && (
                                                            <div className="flex items-center bg-purple-100 px-3 py-1.5 rounded-lg">
                                                                <span className="text-xs font-bold text-purple-800 mr-2">SIZE:</span>
                                                                <span className="text-xs font-semibold text-purple-700">{item.variant.size}</span>
                                                            </div>
                                                        )}
                                                        {item.variant.color && (
                                                            <div className="flex items-center bg-rose-100 px-3 py-1.5 rounded-lg">
                                                                <span className="text-xs font-bold text-rose-800 mr-2">COLOR:</span>
                                                                <div
                                                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm mr-1"
                                                                    style={{
                                                                        backgroundColor: item.variant.colorHexCode,
                                                                    }}
                                                                ></div>
                                                                <span className="text-xs font-semibold text-rose-700">{item.variant.color}</span>
                                                            </div>
                                                        )}
                                                        {item.variant.sku && (
                                                            <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg">
                                                                <span className="text-xs font-bold text-slate-800 mr-2">SKU:</span>
                                                                <span className="text-xs font-mono font-semibold text-slate-700">{item.variant.sku}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-900">
                                                    ৳{item.subtotal}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">Subtotal</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.orderNotes && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                    <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
                                    Order Notes
                                </h2>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
                                    <div className="flex">
                                        <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                        <p className="text-slate-800 leading-relaxed">
                                            {order.orderNotes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8 xl:col-span-2">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <DollarSign className="h-6 w-6 mr-3 text-emerald-600" />
                                Order Summary
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">Subtotal</span>
                                    <span className="font-bold text-slate-900">৳{order.total - order.shippingCost + order.discount}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-600 font-medium">Shipping</span>
                                    <span className="font-bold text-emerald-600">৳{order.shippingCost}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-slate-600 font-medium">Discount</span>
                                        <span className="font-bold text-red-600">-৳{order.discount}</span>
                                    </div>
                                )}
                                <div className="pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-900">Total</span>
                                        <span className="text-2xl font-bold text-slate-900">৳{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <User className="h-6 w-6 mr-3 text-purple-600" />
                                Customer Details
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <User className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-900">
                                            {order.user ? (order.user.name || 'Registered User') : 'Guest User'}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">Customer Name</p>
                                    </div>
                                </div>
                                
                                {order.user?.email && (
                                    <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-semibold text-slate-900">
                                                {order.user.email}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">Email Address</p>
                                        </div>
                                    </div>
                                )}
                                
                                {order.user?.phone && (
                                    <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-semibold text-slate-900">
                                                {order.user.phone}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <CreditCard className="h-6 w-6 mr-3 text-emerald-600" />
                                Payment Info
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-slate-900">
                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">Payment Method</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <MapPin className="h-6 w-6 mr-3 text-red-600" />
                                Shipping Address
                            </h2>
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                                <div className="flex items-start">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <MapPin className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900">{order.shippingAddress?.street}</p>
                                            <p className="text-slate-700 font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                            <p className="text-slate-600">{order.shippingAddress?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <button className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    <Edit3 className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold">Update Order Status</span>
                                </button>
                                
                                <button className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    <Printer className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold">Print Invoice</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
