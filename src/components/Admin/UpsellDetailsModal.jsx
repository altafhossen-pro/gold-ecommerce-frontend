'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Package, Check, Link2 } from 'lucide-react';
import { upsellAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { getCookie } from 'cookies-next';

export default function UpsellDetailsModal({ isOpen, onClose, product, onSuccess }) {
    const [upsellData, setUpsellData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [adding, setAdding] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Get admin token
    const getAdminToken = () => {
        return getCookie('token');
    };

    // Fetch upsell data for the product
    const fetchUpsellData = async () => {
        try {
            setLoading(true);
            const token = getAdminToken();
            const response = await upsellAPI.getUpsellsByMainProduct(product._id, token);
            
            if (response.success && response.data) {
                setUpsellData(response.data);
            } else {
                // Create new upsell if none exists
                setUpsellData({
                    mainProduct: product,
                    linkedProducts: [],
                    isActive: true
                });
            }
        } catch (error) {
            console.error('Error fetching upsell data:', error);
            toast.error('Failed to fetch upsell data');
        } finally {
            setLoading(false);
        }
    };

    // Search products for linking
    const searchProducts = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchPerformed(false);
            return;
        }

        try {
            setSearchLoading(true);
            const token = getAdminToken();
            const response = await upsellAPI.searchProductsForLinking(
                query.trim(),
                product._id,
                token
            );

            if (response.success) {
                setSearchResults(response.data || []);
                setSearchPerformed(true);
            } else {
                toast.error(response.message || 'Failed to search products');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Failed to search products');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Debounce search
        const timeoutId = setTimeout(() => {
            searchProducts(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    // Add product to selection
    const addProductToSelection = (product) => {
        const isAlreadySelected = selectedProducts.some(p => p._id === product._id);
        if (!isAlreadySelected) {
            setSelectedProducts([...selectedProducts, product]);
            toast.success(`${product.title} added to selection`);
        } else {
            toast.error('Product already selected');
        }
    };

    // Remove product from selection
    const removeProductFromSelection = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    };

    // Add selected products to upsell
    const addSelectedProducts = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product');
            return;
        }

        try {
            setAdding(true);
            const token = getAdminToken();
            
            if (!upsellData._id) {
                // Create new upsell first
                const createResponse = await upsellAPI.createUpsell({
                    mainProduct: product._id,
                    linkedProducts: selectedProducts.map((p, index) => ({
                        product: p._id,
                        order: index
                    }))
                }, token);

                if (!createResponse.success) {
                    toast.error('Failed to create upsell');
                    return;
                }
            } else {
                // Add to existing upsell
                for (let i = 0; i < selectedProducts.length; i++) {
                    const product = selectedProducts[i];
                    const response = await upsellAPI.addLinkedProduct(
                        upsellData._id,
                        product._id,
                        i,
                        token
                    );

                    if (!response.success) {
                        toast.error(`Failed to add ${product.title}`);
                        return;
                    }
                }
            }

            toast.success(`${selectedProducts.length} product(s) added successfully`);
            setSelectedProducts([]);
            setSearchQuery('');
            setSearchResults([]);
            fetchUpsellData();
        } catch (error) {
            console.error('Error adding products:', error);
            toast.error('Failed to add products');
        } finally {
            setAdding(false);
        }
    };

    // Remove linked product
    const removeLinkedProduct = async (productId) => {
        if (!upsellData._id) return;

        try {
            const token = getAdminToken();
            const response = await upsellAPI.removeLinkedProduct(
                upsellData._id,
                productId,
                token
            );

            if (response.success) {
                toast.success('Product removed from upsell');
                fetchUpsellData();
            } else {
                toast.error('Failed to remove product');
            }
        } catch (error) {
            console.error('Error removing product:', error);
            toast.error('Failed to remove product');
        }
    };


    // Reset modal state
    const resetModal = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProducts([]);
        setSearchPerformed(false);
    };

    // Handle modal close
    const handleClose = () => {
        resetModal();
        onClose();
    };

    useEffect(() => {
        if (isOpen && product) {
            fetchUpsellData();
            resetModal();
        }
    }, [isOpen, product]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Upsell Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage linked products for "{product?.title}"
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading upsell data...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Current Linked Products */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Current Linked Products ({upsellData?.linkedProducts?.length || 0})
                                </h3>
                                
                                {upsellData?.linkedProducts?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {upsellData.linkedProducts.map((link, index) => (
                                            <div
                                                key={link.product._id}
                                                className="border border-gray-200 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <img
                                                            src={link.product.featuredImage || '/images/placeholder.png'}
                                                            alt={link.product.title}
                                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                {link.product.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Order: {link.order}
                                                            </p>
                                                            <p className="text-sm font-semibold text-pink-600 mt-1">
                                                                ৳{link.product.priceRange?.min || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => removeLinkedProduct(link.product._id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Remove from upsell"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No linked products yet</p>
                                        <p className="text-sm text-gray-400">Add products below to create upsells</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Products */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Add New Linked Products
                                </h3>
                                
                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products to link..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Search Results */}
                                {searchQuery && (
                                    <div className="mb-4">
                                        {searchLoading ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">Searching...</p>
                                            </div>
                                        ) : searchResults.length === 0 && searchPerformed ? (
                                            <div className="text-center py-4">
                                                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">No products found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {searchResults.map((product) => (
                                                    <div
                                                        key={product._id}
                                                        className="border border-gray-200 rounded-lg p-3 hover:border-pink-300 transition-colors cursor-pointer"
                                                        onClick={() => addProductToSelection(product)}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <img
                                                                src={product.featuredImage || '/images/placeholder.png'}
                                                                alt={product.title}
                                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {product.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    ৳{product.priceRange?.min || 0}
                                                                </p>
                                                            </div>
                                                            <Plus className="w-4 h-4 text-pink-600" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Selected Products */}
                                {selectedProducts.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Selected Products ({selectedProducts.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedProducts.map((product, index) => (
                                                <div
                                                    key={product._id}
                                                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                                                            {index + 1}
                                                        </span>
                                                        <img
                                                            src={product.featuredImage || '/images/placeholder.png'}
                                                            alt={product.title}
                                                            className="w-8 h-8 rounded object-cover"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {product.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                ৳{product.priceRange?.min || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeProductFromSelection(product._id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add Button */}
                                {selectedProducts.length > 0 && (
                                    <button
                                        onClick={addSelectedProducts}
                                        disabled={adding}
                                        className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {adding ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Adding Products...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Add {selectedProducts.length} Product(s)</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
