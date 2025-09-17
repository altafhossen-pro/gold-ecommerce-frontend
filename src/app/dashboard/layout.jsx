'use client'

import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from 'cookies-next'
import CustomerSidebar from "@/components/Customer/CustomerSidebar/CustomerSidebar";
import Header from "@/components/Header/Header";
import AppContext from '@/context/AppContext'
import { userAPI } from '@/services/api'

export default function CustomerDashboardLayout({ children }) {
    const router = useRouter()
    const { user, setUser, setLoading: setContextLoading } = useContext(AppContext)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true)
                
                // Get token from cookies
                const token = getCookie('token')
                
                if (!token) {
                    // No token, redirect to login
                    router.push('/login')
                    return
                }

                // Token exists, verify with backend
                const response = await userAPI.getProfile(token)
                
                if (response.success && response.data) {
                    // User data found, set user and allow access
                    setUser(response.data)
                    setIsAuthenticated(true)
                } else {
                    // Invalid token or user not found, redirect to login
                    router.push('/login')
                }
            } catch (error) {
                console.error('Auth check error:', error)
                // Error occurred, redirect to login
                router.push('/login')
            } finally {
                setIsLoading(false)
                setContextLoading(false)
            }
        }

        checkAuth()
    }, [router, setUser, setContextLoading])

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, don't render anything (redirect will happen)
    if (!isAuthenticated) {
        return null
    }

    // If authenticated, render the dashboard
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Fixed height */}
            <Header isTrackingShow={false} />
            
            {/* Main Content with Sidebar */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Sidebar - Fixed width, scrollable if needed */}
                <div className="hidden md:block md:w-64 bg-white border-r border-gray-200 shadow-sm">
                    <CustomerSidebar />
                </div>

                {/* Main Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <main className="p-6">
                        <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
