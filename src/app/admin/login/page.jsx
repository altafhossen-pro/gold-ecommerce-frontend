'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Shield, Copy, UserPlus, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Check credentials
            if (formData.email === 'admin@gmail.com' && formData.password === '12345678') {
                toast.success('Login successful!')
                
                // Store admin session (you can use localStorage or cookies)
                localStorage.setItem('adminToken', 'admin-session-token')
                localStorage.setItem('adminUser', JSON.stringify({
                    email: formData.email,
                    role: 'admin'
                }))
                
                // Redirect to admin dashboard
                router.push('/admin/dashboard')
            } else {
                toast.error('Invalid email or password')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyCredentials = () => {
        setFormData({
            email: 'admin@gmail.com',
            password: '12345678'
        })
        toast.success('Credentials auto-filled!')
    }

    const handleForgetPassword = () => {
        toast('Please contact admin for password reset', {
            icon: '📧',
            duration: 4000,
        })
    }

    const handleRegister = () => {
        toast('Please contact admin for new account registration', {
            icon: '👤',
            duration: 4000,
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EF3D6A] rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
                    <p className="text-gray-600">Sign in to access admin dashboard</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF3D6A] focus:border-[#EF3D6A] transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF3D6A] focus:border-[#EF3D6A] transition-colors"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#EF3D6A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#D63447] focus:ring-2 focus:ring-[#EF3D6A] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Additional Actions */}
                        <div className="flex items-center justify-between text-sm">
                            <button
                                type="button"
                                onClick={handleForgetPassword}
                                className="flex items-center gap-1 text-[#EF3D6A] hover:text-[#D63447] transition-colors"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Forgot Password?
                            </button>
                            <button
                                type="button"
                                onClick={handleRegister}
                                className="flex items-center gap-1 text-[#EF3D6A] hover:text-[#D63447] transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Register
                            </button>
                        </div>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Demo Credentials:</h3>
                            <button
                                onClick={handleCopyCredentials}
                                className="flex items-center gap-1 text-xs text-[#EF3D6A] hover:text-[#D63447] transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                                Auto Fill
                            </button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Email:</strong> admin@gmail.com</p>
                            <p><strong>Password:</strong> 12345678</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        © 2024 Your Store. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
