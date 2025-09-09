'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/Common/ProductCard';
import { productAPI, categoryAPI, transformProductData } from '@/services/api';
import { addProductToCart } from '@/utils/cartUtils';
import { addProductToWishlist, removeProductFromWishlist } from '@/utils/wishlistUtils';
import { useAppContext } from '@/context/AppContext';

import { ChevronDown, ChevronUp, Filter, X, Flame, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import Pagination from '@/components/Common/Pagination';
import toast from 'react-hot-toast';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

function ShopPageContent() {
    const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useAppContext();
    const searchParams = useSearchParams();
    const categorySlug = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    // State for products and loading
    const [searchResults, setSearchResults] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(12);

    // State for filters
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBraceletSizes, setSelectedBraceletSizes] = useState([]);
    const [selectedRingSizes, setSelectedRingSizes] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false); // Mobile filters hidden by default
    const [showBraceletSizes, setShowBraceletSizes] = useState(true);
    const [showRingSizes, setShowRingSizes] = useState(true);

    // Dynamic size filters based on selected categories
    const [availableBraceletSizes, setAvailableBraceletSizes] = useState([]);
    const [availableRingSizes, setAvailableRingSizes] = useState([]);
    const [showBraceletSizeFilter, setShowBraceletSizeFilter] = useState(false);
    const [showRingSizeFilter, setShowRingSizeFilter] = useState(false);

    // Sorting state
    const [sortBy, setSortBy] = useState(sortParam || 'popular'); // popular, new-arrivals, price-low, price-high, best-selling

    // Cart state
    const [cart, setCart] = useState([]);

    // Sorting options
    const sortingOptions = [
        { value: 'popular', label: 'Popular', icon: Flame, color: 'bg-[#EF3D6A]' },
        { value: 'new-arrivals', label: 'New Arrivals', icon: Clock, color: 'bg-[#EF3D6A]' },
        { value: 'price-low', label: 'Price: Low to High', icon: TrendingUp, color: 'bg-[#EF3D6A]' },
        { value: 'price-high', label: 'Price: High to Low', icon: TrendingUp, color: 'bg-[#EF3D6A]  ' },
        { value: 'best-selling', label: 'Best Selling', icon: BarChart3, color: 'bg-[#EF3D6A]' }
    ];

    // Fetch main categories only (no child categories)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getMainCategories();
                if (response.success) {
                    setCategories(response.data || []);

                    // If category slug is provided in URL, automatically select that category
                    if (categorySlug) {
                        const category = response.data.find(cat => cat.slug === categorySlug);
                        if (category) {
                            setSelectedCategories([category._id]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching main categories:', error);
            }
        };
        fetchCategories();
    }, [categorySlug]);

    // Fetch all available sizes when page loads (no categories selected)
    useEffect(() => {
        fetchAvailableSizes([]);
    }, []);

    // Load cart from localStorage
    useEffect(() => {
        const loadCart = () => {
            // Load cart from localStorage
            const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(savedCart);
        };

        loadCart();
    }, []);

    // Fetch available sizes based on selected categories
    const fetchAvailableSizes = async (categoryIds) => {
        try {
            const response = await productAPI.getAvailableFilters(categoryIds);

            if (response.success && response.data) {
                const { braceletSizes, ringSizes, showBraceletFilter, showRingFilter } = response.data;

                setAvailableBraceletSizes(braceletSizes || []);
                setAvailableRingSizes(ringSizes || []);
                setShowBraceletSizeFilter(showBraceletFilter || false);
                setShowRingSizeFilter(showRingFilter || false);
            }
        } catch (error) {
            console.error('Error fetching available filters:', error);
        }
    };

    // Fetch products with filters and sorting
    const fetchProducts = async () => {
        setLoading(true);
        try {
            let response;

            // Handle special sorting cases
            if (sortBy === 'new-arrivals') {
                // Use new-arrivals API with pagination
                response = await productAPI.getNewArrivalProducts(itemsPerPage, currentPage);
            } else if (sortBy === 'best-selling') {
                // Use best-selling API with pagination
                response = await productAPI.getBestsellingProducts(itemsPerPage, currentPage);
            } else {
                // Use regular search API with sorting and pagination
                const filters = {
                    page: currentPage,
                    limit: itemsPerPage,
                    category: selectedCategories.join(','),
                    braceletSize: selectedBraceletSizes.join(','),
                    ringSize: selectedRingSizes.join(','),
                    ...(priceRange.min && { minPrice: priceRange.min }),
                    ...(priceRange.max && { maxPrice: priceRange.max }),
                    sort: sortBy === 'price-low' ? 'priceRange.min' : sortBy === 'price-high' ? '-priceRange.max' : '-createdAt'
                };

                response = await productAPI.searchProducts('', filters);
            }

            if (response.success) {
                // Transform the product data to match ProductCard component expectations
                const transformedProducts = (response.data || []).map(product => ({
                    ...transformProductData(product),
                    variants: product.variants || [], // Keep original variants
                    _id: product._id, // Keep original ID
                    title: product.title, // Keep original title
                    slug: product.slug, // Keep original slug
                    featuredImage: product.featuredImage, // Keep original image
                }));
                setSearchResults(transformedProducts);
                setTotalResults(response.pagination?.total || 0);
                setTotalPages(response.pagination?.totalPages || 1);
            } else {
                // Handle API error response
                toast.error(response.message || 'Failed to fetch products');
                setSearchResults([]);
                setTotalResults(0);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products. Please try again.');
            setSearchResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and sorting
    useEffect(() => {
        fetchProducts();
    }, [selectedCategories, selectedBraceletSizes, selectedRingSizes, priceRange, sortBy, currentPage]);

    // Initial fetch when page loads
    useEffect(() => {
        fetchProducts();
    }, []);

    // Update products wishlist state when global wishlist changes
    useEffect(() => {
        if (searchResults.length > 0) {
            setSearchResults(prev => prev.map(product => ({
                ...product,
                isWishlisted: wishlist.some(item => item.productId === product._id)
            })));
        }
    }, [wishlist]);

    // Handle URL parameter changes
    useEffect(() => {
        if (sortParam && sortParam !== sortBy) {
            setSortBy(sortParam);
        }
    }, [sortParam]);



    // Handle filter changes
    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId];

            // Fetch available sizes for the new category selection
            fetchAvailableSizes(newCategories);

            return newCategories;
        });

        // Clear size selections when categories change
        setSelectedBraceletSizes([]);
        setSelectedRingSizes([]);
    };

    const handleBraceletSizeChange = (size) => {
        setSelectedBraceletSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const handleRingSizeChange = (size) => {
        setSelectedRingSizes(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const handlePriceRangeChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

        const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedBraceletSizes([]);
        setSelectedRingSizes([]);
        setPriceRange({ min: '', max: '' });
        setSortBy('popular'); // Reset to popular sorting
        setCurrentPage(1); // Reset to first page
        
        // Clear URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('sort');
        window.history.replaceState({}, '', url);
        
        // Fetch all available sizes when filters are cleared
        fetchAvailableSizes([]);
    };

    // Handle sorting change
    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        setCurrentPage(1); // Reset to first page when sorting changes
        
        // Update URL with sorting parameter
        const url = new URL(window.location);
        if (newSortBy === 'popular') {
            url.searchParams.delete('sort');
        } else {
            url.searchParams.set('sort', newSortBy);
        }
        window.history.replaceState({}, '', url);
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle wishlist toggle
    const handleWishlistToggle = (productId) => {
        const product = searchResults.find(p => p.id === productId || p._id === productId);
        if (product) {
            // Check if product is already in wishlist
            const isInWishlist = wishlist.some(item => item.productId === product._id);
            
            if (isInWishlist) {
                // Remove from wishlist
                removeProductFromWishlist(product._id, removeFromWishlist);
            } else {
                // Add to wishlist
                addProductToWishlist(product, addToWishlist);
            }
        }
    };

    // Handle add to cart
    const handleAddToCart = (productId) => {
        const product = searchResults.find(p => p.id === productId || p._id === productId);
        if (product) {
            addProductToCart(product, addToCart, 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto px-4 py-4">
                {/* Mobile Filter Toggle Button */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </span>
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Breadcrumb Navigation */}
                {selectedCategories.length > 0 && (
                    <div className="mb-4">
                        <nav className="flex items-center space-x-2 text-sm text-gray-500">
                            <button
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setSelectedBraceletSizes([]);
                                    setSelectedRingSizes([]);
                                    setPriceRange({ min: '', max: '' });
                                    setSortBy('popular'); // Reset sorting when clearing category
                                    setCurrentPage(1); // Reset to first page
                                    
                                    // Clear URL parameters
                                    const url = new URL(window.location);
                                    url.searchParams.delete('sort');
                                    window.history.replaceState({}, '', url);
                                    
                                    fetchAvailableSizes([]);
                                }}
                                className="hover:text-pink-600 transition-colors duration-200"
                            >
                                All Categories
                            </button>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">
                                {categories.find(cat => cat._id === selectedCategories[0])?.name}
                            </span>
                        </nav>
                    </div>
                )}

                {/* Shop Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900 ">
                        {selectedCategories.length > 0
                            ? `Shop ${categories.find(cat => cat._id === selectedCategories[0])?.name || 'Category'}`
                            : 'Shop All Products'
                        }
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            {loading ? 'Loading...' : `${totalResults} products found`}
                        </p>
                        {(selectedCategories.length > 0 || selectedBraceletSizes.length > 0 ||
                            selectedRingSizes.length > 0 || priceRange.min || priceRange.max) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-pink-500 hover:text-pink-600 text-sm flex items-center space-x-1"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Clear all filters</span>
                                </button>
                            )}
                    </div>
                </div>



                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Filters */}
                    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            {/* Main Category Filter */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Main Category</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {categories.map((category) => (
                                        <label key={category._id} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category._id)}
                                                onChange={() => handleCategoryChange(category._id)}
                                                className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                            />
                                            <span className="text-sm text-gray-700">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Bracelet Size Filter - Only show if category has bracelet products */}
                            {showBraceletSizeFilter && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900">Bracelet Size</h3>
                                        <button
                                            onClick={() => setShowBraceletSizes(!showBraceletSizes)}
                                            className="text-blue-500 hover:text-blue-600 text-sm"
                                        >
                                            {showBraceletSizes ? 'VIEW LESS' : 'VIEW MORE'}
                                        </button>
                                    </div>
                                    {showBraceletSizes && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableBraceletSizes.map((size) => (
                                                <label key={size} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBraceletSizes.includes(size)}
                                                        onChange={() => handleBraceletSizeChange(size)}
                                                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{size}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ring Size Filter - Only show if category has ring products */}
                            {showRingSizeFilter && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900">Ring Size</h3>
                                        <button
                                            onClick={() => setShowRingSizes(!showRingSizes)}
                                            className="text-blue-500 hover:text-blue-600 text-sm"
                                        >
                                            {showRingSizes ? 'VIEW LESS' : 'VIEW MORE'}
                                        </button>
                                    </div>
                                    {showRingSizes && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {availableRingSizes.map((size) => (
                                                <label key={size} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRingSizes.includes(size)}
                                                        onChange={() => handleRingSizeChange(size)}
                                                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{size}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Price Range Filter */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2 items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (parseFloat(value) >= 0)) {
                                                    handlePriceRangeChange('min', value);
                                                }
                                            }}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                        <span className="text-gray-500 text-center text-sm">to</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (parseFloat(value) >= 0)) {
                                                    handlePriceRangeChange('max', value);
                                                }
                                            }}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                    {(priceRange.min || priceRange.max) && (
                                        <button
                                            onClick={() => {
                                                setPriceRange({ min: '', max: '' });
                                            }}
                                            className="w-full bg-gray-100 text-gray-600 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                        >
                                            Clear Price Filter
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Product Grid */}
                    <div className="flex-1">
                        {/* Sorting Bar */}
                        <div className="mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
                                    {sortingOptions.map((option) => {
                                        const IconComponent = option.icon;
                                        const isActive = sortBy === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                                        ? `${option.color} text-white shadow-md transform scale-105`
                                                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-800'
                                                    }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <span>{option.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                                                                         {searchResults.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={{
                                    ...product,
                                    isWishlisted: wishlist.some(item => item.productId === product._id)
                                }}
                                onWishlistToggle={handleWishlistToggle}
                                onAddToCart={handleAddToCart}
                                showWishlistOnHover={true}
                            />
                        ))}
                                                            </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600">
                                        Try adjusting your filters
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalItems={totalResults}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto px-4 py-4">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    </div>
                </div>
                <Footer />
            </div>
        }>
            <ShopPageContent />
        </Suspense>
    );
}
