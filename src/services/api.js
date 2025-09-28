const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
    try {
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        const requestOptions = {
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            ...options,
        };
        
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

// Product API functions
export const productAPI = {
    // Get all products with pagination and filters
    getProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/product?${queryString}`);
    },

    // Check stock availability for cart items
    checkStockAvailability: (cartItems) => {
        return apiCall('/product/check-stock', {
            method: 'POST',
            body: JSON.stringify({ cartItems }),
        });
    },

    // Get featured products
    getFeaturedProducts: (limit = 20) => {
        return apiCall(`/product/featured?limit=${limit}`);
    },

    // Get bestselling products
    getBestsellingProducts: (limit = 10) => {
        return apiCall(`/product/bestselling?limit=${limit}`);
    },

    // Get new arrival products
    getNewArrivalProducts: (limit = 10) => {
        return apiCall(`/product/new-arrivals?limit=${limit}`);
    },

    // Get discounted products
    getDiscountedProducts: (limit = 10) => {
        return apiCall(`/product/discounted?limit=${limit}`);
    },

    // Search products with filters
    searchProducts: (searchQuery, filters = {}) => {
        const params = { ...filters };
        if (searchQuery) {
            params.search = searchQuery;
        }
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/product/search?${queryString}`);
    },

    // Get available filters based on categories
    getAvailableFilters: (categoryIds = []) => {
        const params = {};
        if (categoryIds.length > 0) {
            params.category = categoryIds.join(',');
        }
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/product/filters?${queryString}`);
    },

    // Get single product by ID
    getProductById: (id) => {
        return apiCall(`/product/${id}`);
    },

    // Get product by slug
    getProductBySlug: (slug) => {
        return apiCall(`/product/slug/${slug}`);
    },

    // Get similar products with smart fallback
    getSimilarProducts: (productId, limit = 8, minRequired = 4) => {
        return apiCall(`/product/similar/${productId}?limit=${limit}&minRequired=${minRequired}`);
    },

    // Admin: Create new product
    createProduct: (productData) => {
        return apiCall('/product', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    // Admin: Update product
    updateProduct: (id, productData,token) => {
        return apiCall(`/product/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(productData),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Admin: Delete product
    deleteProduct: (id) => {
        return apiCall(`/product/${id}`, {
            method: 'DELETE',
        });
    },
};

// Category API functions
export const categoryAPI = {
    // Get all categories with pagination
    getCategories: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/category?${queryString}`);
    },

    // Get categories for homepage (limited, active categories)
    getHomepageCategories: (limit = 10) => {
        return apiCall(`/category/homepage?limit=${limit}`);
    },

    // Get only main/parent categories (no children)
    getMainCategories: () => {
        return apiCall('/category/main');
    },

    // Get paginated main categories with pagination
    getPaginatedMainCategories: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/category/main/paginated?${queryString}`);
    },

    // Get featured categories for homepage
    getFeaturedCategories: (limit = 6) => {
        return apiCall(`/category/featured?limit=${limit}`);
    },

    // Get single category by ID
    getCategoryById: (id) => {
        return apiCall(`/category/${id}`);
    },

    // Get category by slug
    getCategoryBySlug: (slug) => {
        return apiCall(`/category/slug/${slug}`);
    },

    // Admin: Create new category
    createCategory: (categoryData) => {
        return apiCall('/category', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    },

    // Admin: Update category
    updateCategory: (id, categoryData) => {
        return apiCall(`/category/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    },

    // Admin: Delete category
    deleteCategory: (id) => {
        return apiCall(`/category/${id}`, {
            method: 'DELETE',
        });
    },
};

// OTP API functions
export const otpAPI = {
    // Send OTP to phone number
    sendOTP: (phone, type = 'login') => {
        return apiCall('/otp/send', {
            method: 'POST',
            body: JSON.stringify({ phone, type }),
        });
    },

    // Verify OTP and login
    verifyOTP: (phone, otp) => {
        return apiCall('/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone, otp }),
        });
    },

    // Resend OTP
    resendOTP: (phone, type = 'login') => {
        return apiCall('/otp/resend', {
            method: 'POST',
            body: JSON.stringify({ phone, type }),
        });
    },

    // Get OTP status (for debugging)
    getOTPStatus: (phone) => {
        return apiCall(`/otp/status?phone=${phone}`);
    },
};

// User API functions
export const userAPI = {
    // Login user
    login: (credentials) => {
        return apiCall('/user/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Register user (signup)
    register: (userData) => {
        return apiCall('/user/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Get user profile
    getProfile: (token) => {
        return apiCall('/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Update user profile
    updateProfile: (userData) => {
        return apiCall('/user/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`,
            },
            body: JSON.stringify({
                name: userData.name,
                phone: userData.phone,
                address: userData.address
            }),
        });
    },

    // Search users (admin)
    searchUsers: (query, token) => {
        return apiCall(`/admin/user/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Change password
    changePassword: (passwordData) => {
        return apiCall('/user/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${passwordData.token}`,
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }),
        });
    },

    // Admin - Get all users with pagination and filtering
    getUsers: (params = {}, token) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key,  params[key]);
            }
        });
        return apiCall(`/admin/user?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin - Get single user by ID
    getUserById: (userId, token) => {
        return apiCall(`/admin/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin - Update user by ID
    updateUserById: (userId, userData, token) => {
        return apiCall(`/admin/user/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
    },
    AdminUserupdateProfile: (userId, userData, token) => {
        return apiCall(`/admin/user/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
    },

    // Admin - Soft delete user
    deleteUser: (userId, token) => {
        return apiCall(`/admin/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Cart API functions
export const cartAPI = {
    // Get user cart
    getCart: () => {
        return apiCall('/cart');
    },

    // Add item to cart
    addToCart: (cartItem) => {
        return apiCall('/cart/add', {
            method: 'POST',
            body: JSON.stringify(cartItem),
        });
    },

    // Update cart item
    updateCartItem: (itemId, quantity) => {
        return apiCall(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    },

    // Remove item from cart
    removeFromCart: (itemId) => {
        return apiCall(`/cart/${itemId}`, {
            method: 'DELETE',
        });
    },

    // Clear cart
    clearCart: () => {
        return apiCall('/cart/clear', {
            method: 'DELETE',
        });
    },
};

// Wishlist API functions
export const wishlistAPI = {
    // Get user wishlist
    getWishlist: () => {
        return apiCall('/wishlist');
    },

    // Add item to wishlist
    addToWishlist: (productId) => {
        return apiCall('/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        });
    },

    // Remove item from wishlist
    removeFromWishlist: (productId) => {
        return apiCall(`/wishlist/${productId}`, {
            method: 'DELETE',
        });
    },
};

// Order API functions
export const orderAPI = {
    // Get user orders
    getOrders: (params = {}, token) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]);
            }
        });
        return apiCall(`/order?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get user's own orders
    getUserOrders: (token) => {
        return apiCall('/order/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get user's single order by orderId
    getUserOrderById: (orderId, token) => {
        return apiCall(`/order/user/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get single order
    getOrderById: (orderId) => {
        return apiCall(`/order/${orderId}`);
    },

    // Create new order
    createOrder: (orderData, token) => {
        return apiCall('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });
    },

    // Create manual order (admin)
    createManualOrder: (orderData, token) => {
        return apiCall('/order/manual', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });
    },

    // Get admin orders (for admin dashboard)
    getAdminOrders: (token, queryParams = '') => {
        const url = queryParams ? `/order?${queryParams}` : '/order';
        return apiCall(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get admin order details
    getAdminOrderDetails: (orderId) => {
        return apiCall(`/order/${orderId}`);
    },

    // Update order status (for admin)
    updateOrderStatus: (orderId, status) => {
        return apiCall(`/order/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    // Track order by order ID
    trackOrder: (orderId) => {
        return apiCall(`/order/track/${orderId}`);
    },
};

// Upload API functions
export const uploadAPI = {
    // Upload single image
    uploadSingle: (formData) => {
        return apiCall('/upload/single', {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData, let browser set it
            },
        });
    },
};

// Utility function to transform product data for components
export const transformProductData = (product) => ({
    id: product._id,
    name: product.title,
    price: product.variants?.[0]?.currentPrice || product.basePrice || 0,
    originalPrice: product.variants?.[0]?.originalPrice || null,
    rating: product.averageRating || 0,
    image: product.featuredImage || '/images/placeholder.png',
    category: product.category?.name?.toLowerCase() || 'other',
    isWishlisted: false,
    isHighlighted: product.isFeatured || product.isBestselling || product.isNewArrival || false,
    slug: product.slug,
    description: product.shortDescription || product.description,
    totalReviews: product.totalReviews || 0,
    totalSold: product.totalSold || 0,
});

// Review API functions
export const reviewAPI = {
    // Get all reviews for a product
    getProductReviews: (productId) => {
        return apiCall(`/review?product=${productId}`);
    },

    // Get user's reviews
    getUserReviews: (token) => {
        return apiCall('/review/user/reviews', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get user's reviewable products (from delivered orders)
    getUserReviewableProducts: (token) => {
        return apiCall('/review/user/reviewable-products', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Create a new review
    createReview: (reviewData, token) => {
        return apiCall('/review', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });
    },

    // Update a review
    updateReview: (reviewId, reviewData, token) => {
        return apiCall(`/review/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
        });
    },

    // Delete a review
    deleteReview: (reviewId, token) => {
        return apiCall(`/review/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get single review by ID
    getReviewById: (reviewId) => {
        return apiCall(`/review/${reviewId}`);
    },
};

// Testimonial API
export const testimonialAPI = {
    // Get all testimonials (admin)
    getTestimonials: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/testimonial?${queryString}`,{
            headers : {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get active testimonials (public)
    getActiveTestimonials: () => {
        return apiCall('/testimonial/active');
    },

    // Get testimonial by ID
    getTestimonialById: (id, token) => {
        return apiCall(`/testimonial/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Create testimonial
    createTestimonial: (data,token) => {
        return apiCall('/testimonial', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Update testimonial
    updateTestimonial: (id, data, token) => {
        return apiCall(`/testimonial/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Delete testimonial
    deleteTestimonial: (id,token) => {
        return apiCall(`/testimonial/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Toggle testimonial status
    toggleTestimonialStatus: (id) => {
        return apiCall(`/testimonial/${id}/toggle-status`, {
            method: 'PATCH',
        });
    },
};

// Analytics API functions
export const analyticsAPI = {
    // Get dashboard statistics
    getDashboardStats: (period = '30d', token) => {
        return apiCall(`/admin/analytics/dashboard?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get sales analytics
    getSalesAnalytics: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/admin/analytics/sales?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get product analytics
    getProductAnalytics: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/admin/analytics/products?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get customer analytics
    getCustomerAnalytics: (token) => {
        return apiCall('/admin/analytics/customers', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Menu API functions
export const menuAPI = {
    // Get header menus
    getHeaderMenus: () => {
        return apiCall('/menu/header');
    },

    // Get footer menus
    getFooterMenus: (section = null) => {
        const query = section ? `?section=${section}` : '';
        return apiCall(`/menu/footer${query}`);
    },

    // Admin: Create header menu
    createHeaderMenu: (menuData, token) => {
        return apiCall('/menu/header', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(menuData),
        });
    },

    // Admin: Update header menu
    updateHeaderMenu: (id, menuData, token) => {
        return apiCall(`/menu/header/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(menuData),
        });
    },

    // Admin: Delete header menu
    deleteHeaderMenu: (id, token) => {
        return apiCall(`/menu/header/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Create footer menu
    createFooterMenu: (menuData, token) => {
        return apiCall('/menu/footer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(menuData),
        });
    },

    // Admin: Update footer menu
    updateFooterMenu: (id, menuData, token) => {
        return apiCall(`/menu/footer/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(menuData),
        });
    },

    // Admin: Delete footer menu
    deleteFooterMenu: (id, token) => {
        return apiCall(`/menu/footer/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Update menu order
    updateMenuOrder: (menus, token) => {
        return apiCall('/menu/order', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ menus }),
        });
    },
};

// Hero Banner API
export const heroBannerAPI = {
    // Get active hero banners
    getHeroBanners: () => {
        return apiCall('/hero-banner');
    },

    // Admin: Get all hero banners
    getAllHeroBanners: (token) => {
        return apiCall('/hero-banner/admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Create hero banner
    createHeroBanner: (bannerData, token) => {
        return apiCall('/hero-banner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bannerData),
        });
    },

    // Admin: Update hero banner
    updateHeroBanner: (id, bannerData, token) => {
        return apiCall(`/hero-banner/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bannerData),
        });
    },

    // Admin: Delete hero banner
    deleteHeroBanner: (id, token) => {
        return apiCall(`/hero-banner/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Update banner order
    updateBannerOrder: (banners, token) => {
        return apiCall('/hero-banner/order/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ banners }),
        });
    },
};

// Hero Product API
export const heroProductAPI = {
    // Get active hero products
    getHeroProducts: () => {
        return apiCall('/hero-product');
    },

    // Admin: Get all hero products
    getAllHeroProducts: (token) => {
        return apiCall('/hero-product/admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Create hero product
    createHeroProduct: (productData, token) => {
        return apiCall('/hero-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });
    },

    // Admin: Update hero product
    updateHeroProduct: (id, productData, token) => {
        return apiCall(`/hero-product/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });
    },

    // Admin: Delete hero product
    deleteHeroProduct: (id, token) => {
        return apiCall(`/hero-product/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin: Update product order
    updateProductOrder: (products, token) => {
        return apiCall('/hero-product/order/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ products }),
        });
    },
};

// Offer Banner API
export const offerBannerAPI = {
    // Get active offer banners
    getActiveBanners: () => {
        return apiCall('/offer-banner/active');
    },

    // Get active banner (frontend)
    getActiveOfferBanner: () => {
        return apiCall('/offer-banner/active');
    },

    // Get all banners (admin)
    getAllOfferBanners: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/offer-banner?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get banner by ID
    getOfferBannerById: (id) => {
        return apiCall(`/offer-banner/${id}`);
    },

    // Create banner
    createOfferBanner: (data, token) => {
        return apiCall('/offer-banner', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Update banner
    updateOfferBanner: (id, data, token) => {
        return apiCall(`/offer-banner/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Delete banner
    deleteOfferBanner: (id, token) => {
        return apiCall(`/offer-banner/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Toggle banner status
    toggleBannerStatus: (id) => {
        return apiCall(`/offer-banner/${id}/toggle`, {
            method: 'PATCH',
        });
    },

    // Track banner click
    trackBannerClick: (id) => {
        return apiCall(`/offer-banner/${id}/click`, {
            method: 'POST',
        });
    },
};

// Loyalty API functions
export const loyaltyAPI = {
    // Get user loyalty data
    getLoyalty: (userId, token) => {
        return apiCall(`/loyalty?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get loyalty history
    getLoyaltyHistory: (userId, token, limit = 10) => {
        return apiCall(`/loyalty/history?userId=${userId}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Redeem coins for checkout
    redeemCoinsForCheckout: (coinsToRedeem, orderTotal, token) => {
        return apiCall('/loyalty/redeem-coins', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinsToRedeem, orderTotal }),
        });
    },

    // Admin: Earn points/coins
    earnPoints: (userId, points, coins, order, description, token) => {
        return apiCall('/loyalty/earn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, points, coins, order, description }),
        });
    },

    // Admin: Redeem points/coins
    redeemPoints: (userId, points, coins, order, description, token) => {
        return apiCall('/loyalty/redeem', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, points, coins, order, description }),
        });
    },

    // Admin: Adjust points/coins
    adjustPoints: (userId, points, coins, description, token) => {
        return apiCall('/loyalty/adjust', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, points, coins, description }),
        });
    },
};

// Settings API functions
export const settingsAPI = {
    // Get current settings
    getSettings: () => {
        return apiCall('/settings');
    },

    // Update settings (Admin only)
    updateSettings: (settingsData, token) => {
        return apiCall('/settings', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData),
        });
    },

    // Reset settings to default (Admin only)
    resetSettings: (token) => {
        return apiCall('/settings/reset', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Coupon API functions
export const couponAPI = {
    // Get all coupons (Admin only)
    getAllCoupons: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/coupon?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Get single coupon by ID (Admin only)
    getCouponById: (id, token) => {
        return apiCall(`/coupon/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Validate coupon code (Public)
    validateCoupon: (code, orderAmount) => {
        return apiCall('/coupon/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, orderAmount }),
        });
    },

    // Create new coupon (Admin only)
    createCoupon: (couponData, token) => {
        return apiCall('/coupon', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData),
        });
    },

    // Update coupon (Admin only)
    updateCoupon: (id, couponData, token) => {
        return apiCall(`/coupon/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData),
        });
    },

    // Delete coupon (Admin only)
    deleteCoupon: (id, token) => {
        return apiCall(`/coupon/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Toggle coupon status (Admin only)
    toggleCouponStatus: (id, token) => {
        return apiCall(`/coupon/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Inventory API functions
export const inventoryAPI = {
    // Get inventory overview
    getInventory: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/inventory?${queryString}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
    },

    // Get low stock products
    getLowStockProducts: (threshold = 5, token) => {
        return apiCall(`/inventory/low-stock?threshold=${threshold}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
    },

    // Update stock for a product
    updateStock: (stockData, token) => {
        return apiCall('/inventory/update-stock', {
            method: 'POST',
            body: JSON.stringify(stockData),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Bulk update stock
    bulkUpdateStock: (updates, token) => {
        return apiCall('/inventory/bulk-update-stock', {
            method: 'POST',
            body: JSON.stringify(updates),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Get stock history for a product
    getStockHistory: (productId, params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/inventory/stock-history/${productId}?${queryString}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    },

    // Get stock summary/analytics
    getStockSummary: (productId, params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/inventory/stock-summary/${productId}?${queryString}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
    },

    // Get overall stock analytics
    getStockAnalytics: (params = {}, token) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/inventory/analytics?${queryString}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    },
};

// Upsell API functions
export const upsellAPI = {
    // Get all upsells with pagination
    getAllUpsells: (params = '', token) => {
        return apiCall(`/upsell?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Get single upsell by ID
    getUpsellById: (id, token) => {
        return apiCall(`/upsell/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Create new upsell
    createUpsell: (upsellData, token) => {
        return apiCall('/upsell', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(upsellData),
        });
    },

    // Update upsell
    updateUpsell: (id, upsellData, token) => {
        return apiCall(`/upsell/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(upsellData),
        });
    },

    // Delete upsell
    deleteUpsell: (id, token) => {
        return apiCall(`/upsell/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Add linked product to upsell
    addLinkedProduct: (upsellId, productId, order = 0, token) => {
        return apiCall(`/upsell/${upsellId}/linked-products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, order }),
        });
    },

    // Remove linked product from upsell
    removeLinkedProduct: (upsellId, productId, token) => {
        return apiCall(`/upsell/${upsellId}/linked-products`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });
    },

    // Update linked product order
    updateLinkedProductOrder: (upsellId, productId, order, token) => {
        return apiCall(`/upsell/${upsellId}/linked-products/order`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, order }),
        });
    },

    // Toggle linked product status
    toggleLinkedProductStatus: (upsellId, productId, token) => {
        return apiCall(`/upsell/${upsellId}/linked-products/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });
    },

    // Get upsells by main product
    getUpsellsByMainProduct: (productId, token) => {
        return apiCall(`/upsell/main-product/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Get upsells by linked product
    getUpsellsByLinkedProduct: (productId, token) => {
        return apiCall(`/upsell/linked-product/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Search products for linking
    searchProductsForLinking: (query, excludeId, token) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (excludeId) params.append('excludeId', excludeId);
        
        return apiCall(`/upsell/search/products?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Get upsells by main product (Public - no auth required)
    getUpsellsByMainProductPublic: (productId) => {
        return apiCall(`/upsell/public/main-product/${productId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
};

export default {
    productAPI,
    categoryAPI,
    userAPI,
    otpAPI,
    analyticsAPI,
    cartAPI,
    wishlistAPI,
    orderAPI,
    uploadAPI,
    reviewAPI,
    testimonialAPI,
    offerBannerAPI,
    menuAPI,
    heroBannerAPI,
    heroProductAPI,
    loyaltyAPI,
    settingsAPI,
    couponAPI,
    inventoryAPI,
    upsellAPI,
    transformProductData,
};
