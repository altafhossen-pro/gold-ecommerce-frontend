'use client'

import { useAppContext } from '@/context/AppContext'
import { 
    ShoppingCart, 
    Heart, 
    Star, 
    Package, 
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react'
import Link from 'next/link'

export default function CustomerDashboard() {
    const { user, cartCount, wishlistCount } = useAppContext()

    // Mock data - replace with real data from API
    const stats = [
        {
            name: 'Total Orders',
            value: '12',
            change: '+2.5%',
            changeType: 'positive',
            icon: ShoppingCart,
            color: 'bg-blue-500'
        },
        {
            name: 'Wishlist Items',
            value: wishlistCount.toString(),
            change: '+1.2%',
            changeType: 'positive',
            icon: Heart,
            color: 'bg-pink-500'
        },
        {
            name: 'Reviews Given',
            value: '8',
            change: '+0.8%',
            changeType: 'positive',
            icon: Star,
            color: 'bg-yellow-500'
        },
        {
            name: 'Total Spent',
            value: '৳15,420',
            change: '+12.3%',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'bg-green-500'
        }
    ]

    const recentOrders = [
        {
            id: '#ORD-001',
            product: 'Gold Diamond Ring',
            date: '2024-01-15',
            status: 'Delivered',
            amount: '৳8,500',
            statusColor: 'text-green-600',
            statusBg: 'bg-green-100'
        },
        {
            id: '#ORD-002',
            product: 'Silver Bracelet',
            date: '2024-01-12',
            status: 'In Transit',
            amount: '৳3,200',
            statusColor: 'text-blue-600',
            statusBg: 'bg-blue-100'
        },
        {
            id: '#ORD-003',
            product: 'Pearl Necklace',
            date: '2024-01-10',
            status: 'Processing',
            amount: '৳5,800',
            statusColor: 'text-yellow-600',
            statusBg: 'bg-yellow-100'
        }
    ]

    const recentReviews = [
        {
            product: 'Gold Diamond Ring',
            rating: 5,
            comment: 'Excellent quality and beautiful design!',
            date: '2024-01-14'
        },
        {
            product: 'Silver Bracelet',
            rating: 4,
            comment: 'Very nice product, fast delivery.',
            date: '2024-01-12'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name || 'Customer'}! 👋
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your account today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`text-sm font-medium ${
                                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat.change}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">from last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders & Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link 
                            href="/dashboard/my-orders"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <Package className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.product}</p>
                                            <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.statusBg} ${order.statusColor}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                        <Link 
                            href="/dashboard/my-reviews"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentReviews.map((review, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">{review.product}</p>
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`h-4 w-4 ${
                                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                                <p className="text-xs text-gray-500">{review.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link 
                        href="/shop"
                        className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <ShoppingCart className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                            <p className="font-medium text-blue-900">Shop Now</p>
                            <p className="text-sm text-blue-600">Browse our latest collection</p>
                        </div>
                    </Link>
                    
                    <Link 
                        href="/dashboard/my-orders"
                        className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <Package className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                            <p className="font-medium text-green-900">Track Orders</p>
                            <p className="text-sm text-green-600">Check your order status</p>
                        </div>
                    </Link>
                    
                    <Link 
                        href="/dashboard/profile"
                        className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                        <User className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-medium text-purple-900">Update Profile</p>
                            <p className="text-sm text-purple-600">Manage your information</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}