'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    ArrowLeft,
    Download,
    MapPin,
    CreditCard,
    User,
    Phone,
    Mail,
    Calendar,
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useAppContext } from '@/context/AppContext'
import { orderAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function OrderDetails() {
    const params = useParams()
    const router = useRouter()
    const { token, isAuthenticated } = useAppContext()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch order details from API
    const fetchOrderDetails = async () => {
        if (!isAuthenticated || !token || !params.orderId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await orderAPI.getUserOrderById(params.orderId, token)
            
            if (response.success) {
                setOrder(response.data)
            } else {
                toast.error(response.message || 'Failed to fetch order details')
                router.push('/dashboard/my-orders')
            }
        } catch (error) {
            console.error('Error fetching order details:', error)
            toast.error('Failed to fetch order details')
            router.push('/dashboard/my-orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrderDetails()
    }, [isAuthenticated, token, params.orderId])

    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
                    <p className="text-gray-600">Please login to view order details</p>
                    <div className="mt-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading order details...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <div className="mt-4">
                        <Link
                            href="/dashboard/my-orders"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Transform order data for display
    const getStatusInfo = (status) => {
        const statusMap = {
            'pending': { label: 'Pending', color: 'text-pink-600', bg: 'bg-pink-100', icon: Clock },
            'confirmed': { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
            'processing': { label: 'Processing', color: 'text-pink-600', bg: 'bg-pink-100', icon: Clock },
            'shipped': { label: 'Shipped', color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck },
            'delivered': { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
            'cancelled': { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle },
            'returned': { label: 'Returned', color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertCircle }
        }
        return statusMap[status] || statusMap['pending']
    }

    const statusInfo = getStatusInfo(order.status)
    const StatusIcon = statusInfo.icon

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <Link
                    href="/dashboard/my-orders"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Link>
            </div>

            {/* Invoice Container */}
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold">INVOICE</h1>
                                <p className="text-pink-100 mt-2">Forpink.com</p>
                                <p className="text-pink-100">Premium Gold Jewelry & Accessories</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">#{order.orderId}</div>
                                <div className="text-pink-100 mt-1">
                                    {formatDate(order.createdAt)}
                                </div>
                                <div className="text-pink-100">
                                    {formatTime(order.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Body */}
                    <div className="px-8 py-6">
                        {/* Status Badge */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                    <StatusIcon className="h-4 w-4 mr-2" />
                                    {statusInfo.label}
                                </span>
                            </div>
                            {order.status === 'delivered' && (
                                <button className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </button>
                            )}
                        </div>

                        {/* Company & Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Company Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">From:</h3>
                                <div className="text-gray-700">
                                    <div className="font-semibold text-lg">Forpink.com</div>
                                    <div className="mt-1">123 Jewelry Street</div>
                                    <div>Dhaka 1000, Bangladesh</div>
                                    <div className="mt-2">
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2" />
                                            +880 1234 567890
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <Mail className="h-4 w-4 mr-2" />
                                            info@goldstore.com
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                                <div className="text-gray-700">
                                    <div className="font-semibold">{order.user?.name || 'Customer'}</div>
                                    <div className="mt-1">{order.user?.email || 'customer@email.com'}</div>
                                    {order.shippingAddress && (
                                        <div className="mt-2">
                                            <div className="flex items-start">
                                                <MapPin className="h-4 w-4 mr-2 mt-1" />
                                                <div>
                                                    <div>{order.shippingAddress.label}</div>
                                                    <div>{order.shippingAddress.street}</div>
                                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                                                    <div>{order.shippingAddress.country}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">Qty</th>
                                            <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                                            <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items?.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-4 py-4">
                                                    <img
                                                        src={item.image || '/images/placeholder.png'}
                                                        alt={item.name}
                                                        className="h-16 w-16 object-cover rounded"
                                                    />
                                                </td>
                                                <td className="border border-gray-300 px-4 py-4">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    {item.variant && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {item.variant.size && <span>Size: {item.variant.size}</span>}
                                                            {item.variant.color && <span className="ml-2">Color: {item.variant.color}</span>}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500">
                                                        SKU: {item.variant?.sku || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-4 text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-4 text-right">
                                                    ৳{item.price?.toLocaleString()}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-4 text-right font-medium">
                                                    ৳{item.subtotal?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-sm">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="text-gray-900">৳{(order.total - order.shippingCost + order.discount).toLocaleString()}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount</span>
                                                <span className="text-green-600">-৳{order.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="text-gray-900">৳{order.shippingCost.toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-3">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span className="text-gray-900">Total</span>
                                                <span className="text-pink-600">৳{order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                                <div className="text-gray-700">
                                    <div className="flex items-center mb-2">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        <span className="font-medium">Payment Method:</span>
                                        <span className="ml-2 capitalize">{order.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span className="font-medium">Order Date:</span>
                                        <span className="ml-2">{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Information */}
                            {order.tracking && order.tracking.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Tracking</h3>
                                    <div className="space-y-3">
                                        {order.tracking.map((track, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <div className="w-3 h-3 bg-pink-600 rounded-full mt-1"></div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900 capitalize">
                                                        {track.status.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(track.date)} at {formatTime(track.date)}
                                                    </div>
                                                    {track.note && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {track.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                            <p>Thank you for your business! For any questions about this invoice, please contact us.</p>
                            <p className="mt-2">This is a computer-generated invoice and does not require a signature.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
