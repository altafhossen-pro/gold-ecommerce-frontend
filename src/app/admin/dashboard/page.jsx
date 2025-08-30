'use client'

import {
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Eye,
    MoreHorizontal
} from 'lucide-react'

// Sample data
const stats = [
    {
        title: 'Total Revenue',
        value: '৳2,45,000',
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'blue'
    },
    {
        title: 'Total Orders',
        value: '1,249',
        change: '+8.2%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'green'
    },
    {
        title: 'Total Customers',
        value: '856',
        change: '+5.1%',
        trend: 'up',
        icon: Users,
        color: 'purple'
    },
    {
        title: 'Total Products',
        value: '324',
        change: '-2.4%',
        trend: 'down',
        icon: Package,
        color: 'orange'
    }
]

const recentOrders = [
    {
        id: '#ORD-001',
        customer: 'আহমেদ হাসান',
        product: 'Samsung Galaxy S23',
        amount: '৳85,000',
        status: 'Completed',
        date: '2025-08-27'
    },
    {
        id: '#ORD-002',
        customer: 'ফাতিমা খাতুন',
        product: 'iPhone 15 Pro',
        amount: '৳1,25,000',
        status: 'Processing',
        date: '2025-08-26'
    },
    {
        id: '#ORD-003',
        customer: 'মোহাম্মদ আলী',
        product: 'MacBook Air M2',
        amount: '৳1,45,000',
        status: 'Shipped',
        date: '2025-08-25'
    },
    {
        id: '#ORD-004',
        customer: 'রহিমা বেগম',
        product: 'Dell XPS 13',
        amount: '৳95,000',
        status: 'Pending',
        date: '2025-08-24'
    }
]

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800'
        case 'Processing':
            return 'bg-blue-100 text-blue-800'
        case 'Shipped':
            return 'bg-purple-100 text-purple-800'
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl border border-gray-200 p-6 card-hover"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-blue-100' :
                                    stat.color === 'green' ? 'bg-green-100' :
                                        stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                                }`}>
                                <stat.icon className={`h-6 w-6 ${stat.color === 'blue' ? 'text-blue-600' :
                                        stat.color === 'green' ? 'text-green-600' :
                                            stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                                    }`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            View All
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.product}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                            Add New Product
                        </button>
                        <button className="w-full text-left p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                            Process Orders
                        </button>
                        <button className="w-full text-left p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                            View Analytics
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                            <span className="text-sm text-red-800">Samsung Galaxy S23</span>
                            <span className="text-xs text-red-600 font-medium">5 left</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                            <span className="text-sm text-yellow-800">iPhone 15 Pro</span>
                            <span className="text-xs text-yellow-600 font-medium">12 left</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                            <span className="text-sm text-orange-800">MacBook Air M2</span>
                            <span className="text-xs text-orange-600 font-medium">8 left</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Samsung Galaxy S23</span>
                            <span className="text-xs font-medium text-green-600">245 sales</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">iPhone 15 Pro</span>
                            <span className="text-xs font-medium text-green-600">198 sales</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">MacBook Air M2</span>
                            <span className="text-xs font-medium text-green-600">156 sales</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Dell XPS 13</span>
                            <span className="text-xs font-medium text-green-600">134 sales</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}