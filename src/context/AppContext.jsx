'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { userAPI, settingsAPI } from '@/services/api'

// Create context
const AppContext = createContext()

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}

// Provider component
export const AppProvider = ({ children }) => {
    // User state
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [token, setToken] = useState(null)
    
    // Permissions state
    const [permissions, setPermissions] = useState([])
    const [roleDetails, setRoleDetails] = useState(null)

    // Cart state
    const [cart, setCart] = useState([])
    const [cartCount, setCartCount] = useState(0)
    const [cartTotal, setCartTotal] = useState(0)
    const [cartLoading, setCartLoading] = useState(true)

    // Wishlist state
    const [wishlist, setWishlist] = useState([])
    const [wishlistCount, setWishlistCount] = useState(0)

    // UI state
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    // Filter state
    const [filters, setFilters] = useState({
        category: '',
        priceRange: [0, 10000],
        sortBy: 'newest',
        inStock: false
    })

    // Delivery charge settings state
    const [deliveryChargeSettings, setDeliveryChargeSettings] = useState(null)
    const [deliverySettingsLoading, setDeliverySettingsLoading] = useState(true)

    // Cart functions
    const addToCart = (product, selectedVariant, quantity = 1) => {
        // Create variant key for unique identification
        const variantKey = selectedVariant ? 
            `${product._id}-${selectedVariant.size}-${selectedVariant.color || 'no-color'}` : 
            product._id;
        
        const cartItem = {
            id: Date.now(), // Unique cart item ID
            productId: product._id,
            productInfo: {
                _id: product._id,
                title: product.title,
                slug: product.slug,
                featuredImage: product.featuredImage,
                category: product.category
            },
            variantKey: variantKey,
            name: product.title,
            variant: selectedVariant ? 
                `Size: ${selectedVariant.size}${selectedVariant.color ? `, Color: ${selectedVariant.color}` : ''}` : 
                'Default',
            price: selectedVariant?.currentPrice || product.basePrice || 0,
            originalPrice: selectedVariant?.originalPrice || null,
            image: product.featuredImage || '/images/placeholder.png',
            quantity,
            total: (selectedVariant?.currentPrice || product.basePrice || 0) * quantity,
            size: selectedVariant?.size || null,
            color: selectedVariant?.color || null, // Can be null if no color
            colorHexCode: selectedVariant?.hexCode || null, // Can be null if no color
            sku: selectedVariant?.sku || product.slug,
            stockQuantity: selectedVariant?.stockQuantity || product.totalStock || 0,
            stockStatus: selectedVariant?.stockStatus || 'in_stock',
            // Add proper variant data for stock checking
            variantData: selectedVariant ? {
                size: selectedVariant.size,
                color: selectedVariant.color,
                hexCode: selectedVariant.hexCode,
                sku: selectedVariant.sku,
                stockQuantity: selectedVariant.stockQuantity,
                stockStatus: selectedVariant.stockStatus,
                currentPrice: selectedVariant.currentPrice,
                originalPrice: selectedVariant.originalPrice
            } : null
        }

        const existingItemIndex = cart.findIndex(item => item.variantKey === variantKey);

        if (existingItemIndex !== -1) {
            // Update quantity if same variant exists
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += quantity;
            updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
            setCart(updatedCart);
            toast.success(`Quantity updated! Total: ${updatedCart[existingItemIndex].quantity}`);
        } else {
            // Add new item
            setCart([...cart, cartItem]);
            toast.success('Added to cart successfully!');
        }
        
        // Auto-open cart modal after adding to cart
        setIsCartOpen(true);
    }

    // Batch add multiple items to cart
    const addMultipleToCart = (items) => {
        if (!items || items.length === 0) return;
        
        const newCartItems = [];
        const updatedCart = [...cart];
        
        items.forEach(({ product, selectedVariant, quantity = 1 }) => {
            const variantKey = selectedVariant ? 
                `${product._id}-${selectedVariant.size}-${selectedVariant.color || 'no-color'}` : 
                product._id;
            
            const cartItem = {
                id: Date.now() + Math.random(), // Unique cart item ID
                productId: product._id,
                productInfo: {
                    _id: product._id,
                    title: product.title,
                    slug: product.slug,
                    featuredImage: product.featuredImage,
                    category: product.category
                },
                variantKey: variantKey,
                name: product.title,
                variant: selectedVariant ? 
                    `Size: ${selectedVariant.size}${selectedVariant.color ? `, Color: ${selectedVariant.color}` : ''}` : 
                    'Default',
                price: selectedVariant?.currentPrice || product.basePrice || 0,
                originalPrice: selectedVariant?.originalPrice || null,
                image: product.featuredImage || '/images/placeholder.png',
                quantity,
                total: (selectedVariant?.currentPrice || product.basePrice || 0) * quantity,
                size: selectedVariant?.size || null,
                color: selectedVariant?.color || null,
                colorHexCode: selectedVariant?.hexCode || null,
                sku: selectedVariant?.sku || product.slug,
                stockQuantity: selectedVariant?.stockQuantity || product.totalStock || 0,
                stockStatus: selectedVariant?.stockStatus || 'in_stock',
                // Add proper variant data for stock checking
                variantData: selectedVariant ? {
                    size: selectedVariant.size,
                    color: selectedVariant.color,
                    hexCode: selectedVariant.hexCode,
                    sku: selectedVariant.sku,
                    stockQuantity: selectedVariant.stockQuantity,
                    stockStatus: selectedVariant.stockStatus,
                    currentPrice: selectedVariant.currentPrice,
                    originalPrice: selectedVariant.originalPrice
                } : null
            };

            const existingItemIndex = updatedCart.findIndex(item => item.variantKey === variantKey);
            
            if (existingItemIndex !== -1) {
                // Update quantity if same variant exists
                updatedCart[existingItemIndex].quantity += quantity;
                updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
            } else {
                // Add new item
                newCartItems.push(cartItem);
            }
        });
        
        // Update cart with all new items at once
        setCart([...updatedCart, ...newCartItems]);
        
        // Show success message
        toast.success(`${items.length} product(s) added to cart`);
        
        // Auto-open cart modal after adding to cart
        setIsCartOpen(true);
    }

    const removeFromCart = (cartItemId) => {
        setCart(cart.filter(item => item.id !== cartItemId));
        toast.success('Item removed from cart');
    }

    const updateCartItem = (cartItemId, quantity) => {
        // Don't allow quantity less than 1
        if (quantity < 1) {
            toast.error('Quantity cannot be less than 1');
            return;
        }
        
        setCart(cart.map(item =>
            item.id === cartItemId
                ? { ...item, quantity, total: item.price * quantity }
                : item
        ));
    }

    const clearCart = () => {
        setCart([])
        setCartCount(0)
        setCartTotal(0)
    }

    // Wishlist functions
    const addToWishlist = (product) => {
        const wishlistItem = {
            id: Date.now(), // Unique wishlist item ID
            productId: product._id,
            _id: product._id,
            name: product.title || product.name,
            title: product.title || product.name,
            price: product.price,
            image: product.featuredImage || product.image,
            slug: product.slug,
            category: product.category,
            variants: product.variants || [] // Preserve variants for moveToCart
        }

        if (!wishlist.find(item => item.productId === product._id)) {
            const updatedWishlist = [...wishlist, wishlistItem];
            setWishlist(updatedWishlist);
            setWishlistCount(updatedWishlist.length);
            // Save to localStorage
            localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        }
    }

    const removeFromWishlist = (productId) => {
        const updatedWishlist = wishlist.filter(item => item.productId !== productId)
        setWishlist(updatedWishlist)
        setWishlistCount(updatedWishlist.length)
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    }

    const moveToCart = (wishlistItem) => {
        try {
            // Create a product object for cart
            const cartProduct = {
                _id: wishlistItem._id,
                title: wishlistItem.title || wishlistItem.name,
                slug: wishlistItem.slug,
                featuredImage: wishlistItem.image,
                basePrice: wishlistItem.price,
                variants: wishlistItem.variants || [] // Keep original variants if available
            };

            // Try to get original variant data from the product
            let selectedVariant = null;
            
            if (wishlistItem.variants && wishlistItem.variants.length > 0) {
                // Use the first original variant
                const firstVariant = wishlistItem.variants[0];
                const sizeAttr = firstVariant.attributes?.find(attr => attr.name === 'Size');
                const colorAttr = firstVariant.attributes?.find(attr => attr.name === 'Color');
                
                selectedVariant = {
                    size: sizeAttr?.value || 'Default', // Size is mandatory
                    color: colorAttr?.value || null, // Color is optional
                    hexCode: colorAttr?.hexCode || null, // Only set if color exists
                    currentPrice: firstVariant.currentPrice || wishlistItem.price,
                    originalPrice: firstVariant.originalPrice || null,
                    sku: firstVariant.sku || wishlistItem.slug,
                    stockQuantity: firstVariant.stockQuantity || 10,
                    stockStatus: firstVariant.stockStatus || 'in_stock'
                };
            } else {
                // If no variants, create a default variant
                selectedVariant = {
                    size: 'Default', // Size is mandatory
                    color: null, // Color is optional
                    hexCode: null, // No color by default
                    currentPrice: wishlistItem.price,
                    originalPrice: null,
                    sku: wishlistItem.slug,
                    stockQuantity: 10,
                    stockStatus: 'in_stock'
                };
            }

            // Add to cart
            addToCart(cartProduct, selectedVariant, 1);
            
            return true;
        } catch (error) {
            console.error('Error moving to cart:', error);
            return false;
        }
    }

    const clearWishlist = () => {
        setWishlist([])
        setWishlistCount(0)
    }

    // User functions
    const login = (userData, userToken) => {
        setUser(userData)
        setToken(userToken)
        setIsAuthenticated(true)
        setCookie('token', userToken, {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
    }

    // Fetch user profile from backend
    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true)
            const savedToken = getCookie('token')
            if (!savedToken) {
                return
            }

            const data = await userAPI.getProfile(savedToken)

            if (data.success) {
                setUser(data.data)
                setIsAuthenticated(true)
                setToken(savedToken)
                
                // Set permissions and role details
                if (data.data.permissions) {
                    setPermissions(data.data.permissions)
                }
                if (data.data.roleDetails) {
                    setRoleDetails(data.data.roleDetails)
                }
            } else {
                // Token is invalid, clear everything
                logout()
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
            // If there's an error, clear everything
            logout()
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch delivery charge settings from backend
    const fetchDeliveryChargeSettings = useCallback(async () => {
        try {
            setDeliverySettingsLoading(true)
            const data = await settingsAPI.getDeliveryChargeSettings()

            if (data.success) {
                // Keep the delivery charge settings object as it comes from backend
                setDeliveryChargeSettings(data.data)
            } else {
                console.error('Failed to fetch delivery settings:', data.message)
            }
        } catch (error) {
            console.error('Error fetching delivery settings:', error)
        } finally {
            setDeliverySettingsLoading(false)
        }
    }, [])

    const logout = () => {
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
        setCart([])
        setCartCount(0)
        setCartTotal(0)
        setWishlist([])
        setWishlistCount(0)
        deleteCookie('token')
        localStorage.removeItem('cart')
        localStorage.removeItem('wishlist')
    }

    const updateUser = (userData) => {
        setUser(userData)
        // Update permissions and role if present
        if (userData?.permissions) {
            setPermissions(userData.permissions)
        }
        if (userData?.roleDetails) {
            setRoleDetails(userData.roleDetails)
        }
    }
    
    // Check if user has permission
    const hasPermission = (module, action) => {
        if (!permissions || permissions.length === 0) return false
        
        // Super admin has all permissions
        if (roleDetails?.isSuperAdmin) return true
        
        // Check if permission exists
        return permissions.some(p => 
            p.module === module && p.action === action
        )
    }

    // UI functions
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    // Search functions
    const updateSearchQuery = (query) => {
        setSearchQuery(query)
    }

    const updateSearchResults = (results) => {
        setSearchResults(results)
    }

    // Filter functions
    const updateFilters = (newFilters) => {
        setFilters({ ...filters, ...newFilters })
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            priceRange: [0, 10000],
            sortBy: 'newest',
            inStock: false
        })
    }

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                const parsedWishlist = JSON.parse(savedWishlist);
                setWishlist(parsedWishlist);
                setWishlistCount(parsedWishlist.length);
            } catch (error) {
                console.error('Error parsing wishlist from localStorage:', error);
            }
        }
    }, []);

    // Update cart totals when cart changes
    const updateCartTotals = () => {
        const total = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0
            const quantity = Number(item.quantity) || 0
            return sum + (price * quantity)
        }, 0)
        const count = cart.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0
            return sum + quantity
        }, 0)
        setCartTotal(total)
        setCartCount(count)
    }

    // Update wishlist count when wishlist changes
    const updateWishlistCount = () => {
        setWishlistCount(wishlist.length)
    }

    // Effect to update totals when cart/wishlist changes
    useEffect(() => {
        updateCartTotals()
    }, [cart])

    useEffect(() => {
        updateWishlistCount()
    }, [wishlist])

    // Initialize from localStorage on mount
    useEffect(() => {
        const initializeApp = async () => {
            const savedToken = getCookie('token')
            const savedCart = localStorage.getItem('cart')
            const savedWishlist = localStorage.getItem('wishlist')
            
            // Fetch delivery charge settings first (no auth required)
            await fetchDeliveryChargeSettings()
            
            if (savedToken) {
                setToken(savedToken)
                // Fetch user profile from backend
                await fetchUserProfile()
            } else {
                setLoading(false)
            }
            
            if (savedCart) {
                setCart(JSON.parse(savedCart))
            }
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist))
            }
            
            // Set cart loading to false after initialization
            setCartLoading(false)
        }
        
        initializeApp()
    }, [fetchUserProfile, fetchDeliveryChargeSettings])

    // Save to localStorage when state changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }, [cart, wishlist])

    const value = {
        // State
        user,
        isAuthenticated,
        token,
        cart,
        cartCount,
        cartTotal,
        cartLoading,
        wishlist,
        wishlistCount,
        loading,
        sidebarOpen,
        isCartOpen,
        searchQuery,
        searchResults,
        filters,
        deliveryChargeSettings,
        deliverySettingsLoading,
        permissions,
        roleDetails,

        // Actions
        setUser,
        setIsAuthenticated,
        setToken,
        setCart,
        setCartCount,
        setCartTotal,
        setWishlist,
        setWishlistCount,
        setLoading,
        setSidebarOpen,
        setIsCartOpen,
        setSearchQuery,
        setSearchResults,
        setFilters,

        // Functions
        login,
        logout,
        updateUser,
        fetchUserProfile,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        toggleSidebar,
        updateSearchQuery,
        updateSearchResults,
        updateFilters,
        clearFilters,
        moveToCart,
        fetchDeliveryChargeSettings,
        hasPermission
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContext

