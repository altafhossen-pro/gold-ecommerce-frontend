'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    ShoppingCart,
    Heart,
    MessageSquare,
    User,
    Settings,
    CreditCard,
    Truck,
    Star,
    FileText,
    Menu,
    X
} from 'lucide-react'

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/my-orders', icon: ShoppingCart },
    { name: 'My Reviews', href: '/dashboard/my-reviews', icon: Star },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Addresses', href: '/dashboard/addresses', icon: Truck },
    { name: 'Payment Methods', href: '/dashboard/payment-methods', icon: CreditCard },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function CustomerSidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
                >
                    {isMobileOpen ? (
                        <X className="h-6 w-6 text-gray-600" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out max-h-[calc(100vh-80px)] overflow-y-auto
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
            `}>
                {/* Logo - Fixed height */}
                <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">My Account</span>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
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

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
