'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Phone,
    ArrowRight,
    ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import SocialLogin from '@/components/Authentication/SocialLogin'
import { useAppContext } from '@/context/AppContext'
import { userAPI } from '@/services/api'

export default function RegisterPage() {
    const router = useRouter()
    const { login } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('email') // 'email', 'social'

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })

    const handleRegisterChange = (e) => {
        const { name, value } = e.target
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEmailRegister = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Validate passwords match
        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error('Passwords do not match')
            setLoading(false)
            return
        }

        // Validate password strength
        if (registerForm.password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            const data = await userAPI.register({
                name: registerForm.name,
                email: registerForm.email,
                phone: registerForm.phone,
                password: registerForm.password
            })

            if (data.success) {
                // Auto-login after successful registration
                if (data.data && data.data.token) {
                    login(data.data.user, data.data.token)
                }
                toast.success('Registration successful! Welcome!')
                router.push('/')
            } else {
                toast.error(data.message || 'Registration failed')
            }
        } catch (error) {
            console.error('Registration error:', error)
            toast.error('Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider) => {
        toast.info(`${provider} registration coming soon!`)
    }

    return (
        <div className="min-h-screen bg-gray-50  flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Please Register
                        </h1>
                        <p className="text-gray-600 mt-2">Choose your preferred registration method</p>
                    </div>

                    {/* Registration Method Tabs */}
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
                    {/* Email Registration Form */}
                    {activeTab === 'email' && (
                        <form onSubmit={handleEmailRegister} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={registerForm.name}
                                        onChange={handleRegisterChange}
                                        className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

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
                                        value={registerForm.email}
                                        onChange={handleRegisterChange}
                                        className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
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
                                        value={registerForm.phone}
                                        onChange={handleRegisterChange}
                                        className="block w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your phone number"
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
                                        autoComplete="new-password"
                                        required
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        className="block w-full pl-12 pr-12 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Create a password"
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

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={registerForm.confirmPassword}
                                        onChange={handleRegisterChange}
                                        className="block w-full pl-12 pr-12 py-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-pink-600 hover:text-pink-500">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-pink-600 hover:text-pink-500">
                                        Privacy Policy
                                    </Link>
                                </label>
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
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Social Registration */}
                    {activeTab === 'social' && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <p className="text-gray-600 mb-4">Sign up with your social account</p>
                            </div>
                            <SocialLogin onSocialLogin={handleSocialLogin} />
                        </div>
                    )}

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <Link
                            href="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center mx-auto group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Already have an account? Sign in
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
