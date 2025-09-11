'use client'

import { useAppContext } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminHeader from "@/components/Admin/AdminHeader";
import AdminSidebar from "@/components/Admin/AdminSidebar/AdminSidebar";

export default function RootLayout({ children }) {
    const { user, isAuthenticated, loading } = useAppContext()
    const router = useRouter();

    useEffect(() => {
        // Wait for loading to complete
        if (!loading) {
            // Check if user is not authenticated
            if (!isAuthenticated) {
                router.push('/login')
                return
            }
            
            // Check if user is not admin
            if (user?.role !== 'admin') {
                router.push('/')
                return
            }
        }
    }, [user, isAuthenticated, loading, router])

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // Don't render admin panel if user is not admin
    if (!isAuthenticated || user?.role !== 'admin') {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Fixed height with scroll */}
            <div className="hidden md:flex md:w-64 md:flex-col h-screen">
                <AdminSidebar />
            </div>

            {/* Main Content Area - Fixed height */}
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                {/* Header - Fixed height */}
                <AdminHeader />

                {/* Main Content - Scrollable within remaining height */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="2xl:max-w-7xl xl:max-w-6xl lg:xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl xl:2xl:max-w-7xl xl:max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}