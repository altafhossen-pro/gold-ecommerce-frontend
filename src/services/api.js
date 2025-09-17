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
        console.error('API Error:', error);
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
    updateProduct: (id, productData) => {
        return apiCall(`/product/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
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
        return apiCall(`/user/admin/users?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin - Get single user by ID
    getUserById: (userId, token) => {
        return apiCall(`/user/admin/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Admin - Update user by ID
    updateUserById: (userId, userData, token) => {
        return apiCall(`/user/admin/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
    },
    AdminUserupdateProfile: (userId, userData, token) => {
        return apiCall(`/user/admin/users/${userId}`, {
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
        return apiCall(`/user/admin/users/${userId}`, {
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
    createOrder: (orderData) => {
        return apiCall('/order', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    // Get admin orders (for admin dashboard)
    getAdminOrders: () => {
        return apiCall('/order');
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

// Offer Banner API
export const offerBannerAPI = {
    // Get active offer banners
    getActiveBanners: () => {
        return apiCall('/offer-banner/active');
    },

    // Get all banners (admin)
    getAllBanners: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/offer-banner?${queryString}`);
    },

    // Get banner by ID
    getBannerById: (id) => {
        return apiCall(`/offer-banner/${id}`);
    },

    // Create banner
    createBanner: (data) => {
        return apiCall('/offer-banner', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update banner
    updateBanner: (id, data) => {
        return apiCall(`/offer-banner/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete banner
    deleteBanner: (id) => {
        return apiCall(`/offer-banner/${id}`, {
            method: 'DELETE',
        });
    },

    // Toggle banner status
    toggleBannerStatus: (id) => {
        return apiCall(`/offer-banner/${id}/toggle-status`, {
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

export default {
    productAPI,
    categoryAPI,
    userAPI,
    cartAPI,
    wishlistAPI,
    orderAPI,
    uploadAPI,
    reviewAPI,
    testimonialAPI,
    offerBannerAPI,
    transformProductData,
};
