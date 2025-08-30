'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Store,
    Tag,
    Truck,
    Heart,
    MessageSquare
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/dashboard/products', icon: Package },
    { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/dashboard/customers', icon: Users },
    { name: 'Categories', href: '/admin/dashboard/categories', icon: Tag },
    { name: 'Inventory', href: '/admin/dashboard/inventory', icon: Store },
    { name: 'Shipping', href: '/admin/dashboard/shipping', icon: Truck },
    { name: 'Reviews', href: '/admin/dashboard/reviews', icon: MessageSquare },
    { name: 'Wishlist', href: '/admin/dashboard/wishlist', icon: Heart },
    { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 h-screen bg-white border-r border-gray-200 shadow-sm">
            {/* Logo - Fixed height */}
            <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0 ">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            
        </div>
    )
}