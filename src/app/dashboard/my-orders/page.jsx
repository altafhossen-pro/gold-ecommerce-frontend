'use client'

import { useState } from 'react'
import { 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Eye,
    Download
} from 'lucide-react'
import Link from 'next/link'

export default function MyOrders() {
    const [activeTab, setActiveTab] = useState('all')

    // Mock data - replace with real data from API
    const orders = [
        {
            id: '#ORD-001',
            product: 'Gold Diamond Ring',
            date: '2024-01-15',
            status: 'Delivered',
            amount: '৳8,500',
            statusColor: 'text-green-600',
            statusBg: 'bg-green-100',
            statusIcon: CheckCircle,
            trackingNumber: 'TRK123456789',
            estimatedDelivery: '2024-01-15',
            actualDelivery: '2024-01-15'
        },
        {
            id: '#ORD-002',
            product: 'Silver Bracelet',
            date: '2024-01-12',
            status: 'In Transit',
            amount: '৳3,200',
            statusColor: 'text-blue-600',
            statusBg: 'bg-blue-100',
            statusIcon: Truck,
            trackingNumber: 'TRK987654321',
            estimatedDelivery: '2024-01-18',
            actualDelivery: null
        },
        {
            id: '#ORD-003',
            product: 'Pearl Necklace',
            date: '2024-01-10',
            status: 'Processing',
            amount: '৳5,800',
            statusColor: 'text-yellow-600',
            statusBg: 'bg-yellow-100',
            statusIcon: Clock,
            trackingNumber: null,
            estimatedDelivery: '2024-01-20',
            actualDelivery: null
        },
        {
            id: '#ORD-004',
            product: 'Platinum Ring',
            date: '2024-01-08',
            status: 'Cancelled',
            amount: '৳12,000',
            statusColor: 'text-red-600',
            statusBg: 'bg-red-100',
            statusIcon: AlertCircle,
            trackingNumber: null,
            estimatedDelivery: '2024-01-15',
            actualDelivery: null
        }
    ]

    const tabs = [
        { id: 'all', name: 'All Orders', count: orders.length },
        { id: 'processing', name: 'Processing', count: orders.filter(o => o.status === 'Processing').length },
        { id: 'in-transit', name: 'In Transit', count: orders.filter(o => o.status === 'In Transit').length },
        { id: 'delivered', name: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
        { id: 'cancelled', name: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length }
    ]

    const filteredOrders = activeTab === 'all' 
        ? orders 
        : orders.filter(order => {
            if (activeTab === 'in-transit') return order.status === 'In Transit'
            return order.status.toLowerCase() === activeTab
        })

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return CheckCircle
            case 'In Transit':
                return Truck
            case 'Processing':
                return Clock
            case 'Cancelled':
                return AlertCircle
            default:
                return Package
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">
                    Track your orders and view order history
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.name}
                                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Orders List */}
                <div className="p-6">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {activeTab === 'all' 
                                    ? "You haven't placed any orders yet."
                                    : `No ${activeTab} orders found.`
                                }
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <Package className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{order.product}</h3>
                                                <p className="text-sm text-gray-500">{order.id} • {order.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">{order.amount}</p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.statusBg} ${order.statusColor}`}>
                                                <order.statusIcon className="h-4 w-4 mr-2" />
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Order Date</p>
                                            <p className="text-sm text-gray-900">{order.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                                            <p className="text-sm text-gray-900">{order.estimatedDelivery}</p>
                                        </div>
                                        {order.actualDelivery && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Actual Delivery</p>
                                                <p className="text-sm text-gray-900">{order.actualDelivery}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tracking Info */}
                                    {order.trackingNumber && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                                                    <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    Track Package
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex space-x-3">
                                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </button>
                                            {order.status === 'Delivered' && (
                                                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Invoice
                                                </button>
                                            )}
                                        </div>
                                        
                                        {order.status === 'Delivered' && (
                                            <Link
                                                href={`/product/${order.product.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Buy Again
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
