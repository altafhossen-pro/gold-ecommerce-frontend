'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Phone,
    MessageSquare,
    User
} from 'lucide-react'
import toast from 'react-hot-toast'
import SocialLogin from '@/components/Authentication/SocialLogin'
import { useAppContext } from '@/context/AppContext'
import { userAPI, otpAPI } from '@/services/api'

function LoginPage() {
    const { login } = useAppContext();
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    
    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect')
    const [showPassword, setShowPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('email') // 'email', 'phone', 'social'
    const [otpSent, setOtpSent] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false)

    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        phone: '',
        otp: ''
    })

    const handleLoginChange = (e) => {
        const { name, value } = e.target
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await userAPI.login({
                emailOrPhone: loginForm.email,
                password: loginForm.password
            })

            if (data.success) {
                login(data.data.user, data.data.token)
                toast.success('Login successful!')
                
                if (data.data.user?.role === 'admin') {
                    router.push('/admin/dashboard')
                } else {
                    // Redirect to the original page or home
                    router.push(redirectUrl || '/')
                }
            } else {
                toast.error(data.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendOTP = async () => {
        if (!loginForm.phone) {
            toast.error('Please enter your phone number')
            return
        }

        setLoading(true)
        try {
            const data = await otpAPI.sendOTP(loginForm.phone, 'login')
            
            if (data.success) {
                setOtpSent(true)
                toast.success('OTP sent to your phone number')
            } else {
                toast.error(data.message || 'Failed to send OTP')
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            toast.error('Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        if (!loginForm.otp) {
            toast.error('Please enter OTP')
            return
        }

        setLoading(true)
        try {
            const data = await otpAPI.verifyOTP(loginForm.phone, loginForm.otp)
            
            if (data.success) {
                setOtpVerified(true)
                toast.success('OTP verified successfully!')
                
                // Login user with returned data
                login(data.data.user, data.data.token)
                // Redirect to the original page or home
                router.push(redirectUrl || '/')
            } else {
                toast.error(data.message || 'Invalid OTP')
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            toast.error('OTP verification failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider) => {
        toast.info(`${provider} login coming soon!`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Please Login
                        </h1>
                        <p className="text-gray-600 mt-2">Choose your preferred login method</p>
                    </div>

                    {/* Login Method Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'email'
                                    ? 'bg-white text-pink-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                        </button>
                        <button
                            onClick={() => setActiveTab('phone')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'phone'
                                    ? 'bg-white text-pink-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Phone
                        </button>
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'social'
                                    ? 'bg-white text-pink-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Social
                        </button>
                    </div>



                    {/* Email Login Form */}
                    {activeTab === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={loginForm.email}
                                        onChange={handleLoginChange}
                                        className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={loginForm.password}
                                        onChange={handleLoginChange}
                                        className="block w-full pl-12 pr-12 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        Sign in with Email
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Phone OTP Login Form */}
                    {activeTab === 'phone' && (
                        <div className="space-y-5">
                            {!otpSent ? (
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            value={loginForm.phone}
                                            onChange={handleLoginChange}
                                            className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        We'll send you a verification code via SMS
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MessageSquare className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            maxLength="6"
                                            required
                                            value={loginForm.otp}
                                            onChange={handleLoginChange}
                                            className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white text-center text-lg tracking-widest"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Enter the 6-digit code sent to {loginForm.phone}
                                    </p>
                                </div>
                            )}

                            {!otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={loading || !loginForm.phone}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            Send OTP
                                            <MessageSquare className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        disabled={loading || !loginForm.otp}
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                Verify OTP
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={loading}
                                            className="flex-1 text-sm text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpSent(false)
                                                setOtpVerified(false)
                                                setLoginForm(prev => ({ ...prev, otp: '' }))
                                            }}
                                            className="flex-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
                                        >
                                            Change phone number
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social Login */}
                    {activeTab === 'social' && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <p className="text-gray-600 mb-4">Sign in with your social account</p>
                            </div>
                            <SocialLogin onSocialLogin={handleSocialLogin} />
                        </div>
                    )}

                    {/* Register Link */}
                    <div className="text-center mt-6">
                        <Link
                            href="/register"
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center mx-auto group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Don't have an account? Sign up
                        </Link>
                    </div>


                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 mt-6">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
    )
}

// Wrapper component with Suspense boundary
export default function LoginPageWithSuspense() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>}>
            <LoginPage />
        </Suspense>
    );
}
