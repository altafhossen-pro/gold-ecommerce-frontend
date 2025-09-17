'use client'

import { useState, useEffect } from 'react'
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    Edit3,
    Save,
    X,
    Lock,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { userAPI } from '@/services/api'
import toast from 'react-hot-toast'
import { getCookie } from 'cookies-next'

export default function ProfilePage() {
    const { user, token, updateUser } = useAppContext()
    
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            })
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        const newPasswordData = {
            ...passwordData,
            [name]: value
        }
        
        setPasswordData(newPasswordData)
        
        // Real-time validation for current field
        validatePasswordField(name, value, newPasswordData)
        
        // Cross-validation: if newPassword or confirmPassword changes, validate both
        if (name === 'newPassword' && newPasswordData.confirmPassword) {
            validatePasswordField('confirmPassword', newPasswordData.confirmPassword, newPasswordData)
        } else if (name === 'confirmPassword' && newPasswordData.newPassword) {
            validatePasswordField('confirmPassword', value, newPasswordData)
        }
    }

    const validatePasswordField = (fieldName, value, passwordDataToUse = passwordData) => {
        let error = ''
        
        switch (fieldName) {
            case 'currentPassword':
                if (!value) {
                    error = 'Current password is required'
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters'
                }
                break
                
            case 'newPassword':
                if (!value) {
                    error = 'New password is required'
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters'
                } else if (value === passwordDataToUse.currentPassword) {
                    error = 'New password must be different from current password'
                }
                break
                
            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your new password'
                } else if (value !== passwordDataToUse.newPassword) {
                    error = 'Passwords do not match'
                }
                break
                
            default:
                break
        }
        
        setPasswordErrors(prev => ({
            ...prev,
            [fieldName]: error
        }))
    }

    const handleSaveProfile = async () => {
        try {
            setLoading(true)
            const token = getCookie('token')
            const response = await userAPI.updateProfile({
                ...formData,
                token
            })
            
            if (response.success) {
                updateUser(response.data)
                toast.success('Profile updated successfully!')
                setIsEditing(false)
            } else {
                toast.error(response.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        // Check for validation errors
        const hasErrors = Object.values(passwordErrors).some(error => error !== '')
        if (hasErrors) {
            toast.error('Please fix validation errors before submitting')
            return
        }

        // Additional validation checks
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('All fields are required')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        
        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters')
            return
        }

        if (passwordData.newPassword === passwordData.currentPassword) {
            toast.error('New password must be different from current password')
            return
        }

        try {
            setLoading(true)
            const token = getCookie('token')
            const response = await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                token
            })
            
            if (response.success) {
                toast.success('Password changed successfully!')
                cancelPasswordChange()
            } else {
                toast.error(response.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast.error('Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const cancelEdit = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
        })
        setIsEditing(false)
    }

    const cancelPasswordChange = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        setPasswordErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        setIsChangingPassword(false)
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
    }

    if (!user) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Please login to view your profile</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your account information and settings</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors cursor-pointer"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{user.name || 'Not provided'}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{user.email}</span>
                            {user.emailVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" title="Email verified" />
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                            {user.phoneVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" title="Phone verified" />
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <span className="text-gray-900">{user.address || 'Not provided'}</span>
                        </div>
                    </div>

                    {/* Account Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status
                        </label>
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Member Since */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Member Since
                        </label>
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Password & Security</h2>
                    <button
                        onClick={() => setIsChangingPassword(true)}
                        className="flex items-center px-4 py-2 text-pink-600 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer"
                    >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                    </button>
                </div>
                <p className="text-gray-600">Keep your account secure by changing your password regularly.</p>
            </div>

            {/* Profile Update Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-pink-100 rounded-full">
                                    <Edit3 className="h-6 w-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Edit Profile
                                </h3>
                            </div>
                            <button
                                onClick={cancelEdit}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                                        placeholder="Enter your address"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-900">{user.email}</span>
                                        {user.emailVerified && (
                                            <CheckCircle className="h-4 w-4 text-green-500" title="Email verified" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={cancelEdit}
                                    className="flex items-center px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-pink-100 rounded-full">
                                    <Lock className="h-6 w-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Change Password
                                </h3>
                            </div>
                            <button
                                onClick={cancelPasswordChange}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none ${
                                                passwordErrors.currentPassword 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {passwordErrors.currentPassword}
                                        </p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none ${
                                                passwordErrors.newPassword 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword ? (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {passwordErrors.newPassword}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                                    )}
                                </div>

                                {/* Confirm New Password */}
        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none ${
                                                passwordErrors.confirmPassword 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <span className="mr-1">⚠️</span>
                                            {passwordErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={cancelPasswordChange}
                                    className="flex items-center px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading || Object.values(passwordErrors).some(error => error !== '') || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Lock className="h-4 w-4 mr-2" />
                                    )}
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}