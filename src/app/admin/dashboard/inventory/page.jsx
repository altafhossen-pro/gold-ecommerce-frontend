'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
    Package, 
    Search, 
    Plus, 
    Minus, 
    AlertTriangle,
    RefreshCw,
    X,
    Eye,
    Edit3
} from 'lucide-react';
import { inventoryAPI } from '@/services/api';
import StockHistoryModal from '@/components/Admin/StockHistoryModal';
import { getCookie } from 'cookies-next';
import VariantStockCard from '@/components/Admin/VariantStockCard';
import MainProductStockForm from '@/components/Admin/MainProductStockForm';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

const InventoryPage = () => {
    const router = useRouter();
    const { hasPermission, contextLoading } = useAppContext();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [sortBy, setSortBy] = useState('-createdAt');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        type: 'add',
        quantity: '',
        reason: '',
        cost: '',
        notes: ''
    });
    const [analyticsFilter, setAnalyticsFilter] = useState('7days');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const token = getCookie('token');
    const [checkingPermission, setCheckingPermission] = useState(true);
    const [hasReadPermission, setHasReadPermission] = useState(false);
    const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    // Fetch inventory data
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                search: searchTerm,
                stockFilter,
                sort: sortBy
            };
            
            const response = await inventoryAPI.getInventory(params, token);
            if (response.success) {
                setInventory(response.data);
                setTotalPages(response.pagination.totalPages);
                
                // Update selectedProduct if it's currently set (for modal realtime update)
                if (selectedProduct) {
                    const updatedProduct = response.data.find(p => p._id === selectedProduct._id);
                    if (updatedProduct) {
                        setSelectedProduct(updatedProduct);
                    }
                }
            } else {
                toast.error('Failed to fetch inventory');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Error fetching inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contextLoading) return;
        const canRead = hasPermission('inventory', 'read');
        const canUpdate = hasPermission('inventory', 'update');
        setHasReadPermission(canRead);
        setHasUpdatePermission(!!canUpdate);
        setCheckingPermission(false);
        if (canRead) {
            fetchInventory();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextLoading, currentPage, searchTerm, stockFilter, sortBy]);

    // Handle stock update
    const handleStockUpdate = async (productId, variantSku = null) => {
        if (!hasUpdatePermission) {
            toast.error("You don't have permission to update inventory");
            return;
        }
        try {
            if (!updateForm.quantity || updateForm.quantity === '0') {
                toast.error('Please enter a valid quantity');
                return;
            }

            const updateData = {
                productId,
                variantSku,
                ...updateForm,
                quantity: parseInt(updateForm.quantity)
            };

            const response = await inventoryAPI.updateStock(updateData, token);
            if (response.success) {
                toast.success('Stock updated successfully');
                setShowUpdateModal(false);
                setUpdateForm({
                    type: 'add',
                    quantity: '',
                    reason: '',
                    cost: '',
                    notes: ''
                });
                fetchInventory();
                fetchAnalyticsData();
            } else {
                toast.error(response.message || 'Failed to update stock');
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Error updating stock');
        }
    };


    // Analytics data state
    const [analyticsData, setAnalyticsData] = useState({
        stockAdded: 0,
        stockRemoved: 0,
        totalProducts: 0,
        lowStockCount: 0
    });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Fetch analytics data from API
    const fetchAnalyticsData = async () => {
        try {
            setAnalyticsLoading(true);
            const params = {
                period: analyticsFilter
            };
            
            if (analyticsFilter === 'custom') {
                if (customDateRange.startDate && customDateRange.endDate) {
                    params.startDate = customDateRange.startDate;
                    params.endDate = customDateRange.endDate;
                }
            }

            const response = await inventoryAPI.getStockAnalytics(params, token);
            if (response.success) {
                setAnalyticsData({
                    stockAdded: response.data.stockAdded || 0,
                    stockRemoved: response.data.stockRemoved || 0,
                    totalProducts: response.data.totalProducts || 0,
                    lowStockCount: response.data.lowStockCount || 0
                });
            } else {
                console.error('Failed to fetch analytics:', response.message);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch analytics when filter changes
    useEffect(() => {
        fetchAnalyticsData();
    }, [analyticsFilter, customDateRange]);

    // Get stock status color
    const getStockStatusColor = (status) => {
        switch (status) {
            case 'out_of_stock':
                return 'text-red-600 bg-red-50';
            case 'low_stock':
                return 'text-yellow-600 bg-yellow-50';
            case 'in_stock':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // Get stock status text
    const getStockStatusText = (status) => {
        switch (status) {
            case 'out_of_stock':
                return 'Out of Stock';
            case 'low_stock':
                return 'Low Stock';
            case 'in_stock':
                return 'In Stock';
            default:
                return 'Unknown';
        }
    };

    if (checkingPermission || contextLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!hasReadPermission || permissionError) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError || "You don't have permission to access inventory"}
                action="Contact your administrator for access"
                showBackButton={true}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600">Manage product stock and track inventory changes</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchInventory}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-400/40 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Stock Analytics</h3>
                    
                    {/* Analytics Filters */}
                    <div className="flex items-center space-x-3">
                        <select
                            value={analyticsFilter}
                            onChange={(e) => setAnalyticsFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="6months">Last 6 Months</option>
                            <option value="1year">Last 1 Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        
                        {analyticsFilter === 'custom' && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={customDateRange.startDate}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Start Date"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={customDateRange.endDate}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="End Date"
                                />
                            </div>
                        )}
                        
                        <button
                            onClick={fetchAnalyticsData}
                            disabled={analyticsLoading}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                            <span>{analyticsLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl border border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-2 bg-white rounded-lg">
                                <Plus className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">Stock Added</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {analyticsLoading ? '...' : analyticsData.stockAdded}
                                </p>
                                <p className="text-xs text-green-600">
                                    {analyticsFilter === 'today' ? 'Today' : 
                                     analyticsFilter === 'yesterday' ? 'Yesterday' :
                                     analyticsFilter === '7days' ? 'Last 7 days' :
                                     analyticsFilter === '30days' ? 'Last 30 days' :
                                     analyticsFilter === '6months' ? 'Last 6 months' :
                                     analyticsFilter === '1year' ? 'Last 1 year' :
                                     analyticsFilter === 'custom' ? 'Custom period' : 'Period'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Minus className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">Stock Removed</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {analyticsLoading ? '...' : analyticsData.stockRemoved}
                                </p>
                                <p className="text-xs text-red-600">
                                    {analyticsFilter === 'today' ? 'Today' : 
                                     analyticsFilter === 'yesterday' ? 'Yesterday' :
                                     analyticsFilter === '7days' ? 'Last 7 days' :
                                     analyticsFilter === '30days' ? 'Last 30 days' :
                                     analyticsFilter === '6months' ? 'Last 6 months' :
                                     analyticsFilter === '1year' ? 'Last 1 year' :
                                     analyticsFilter === 'custom' ? 'Custom period' : 'Period'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-800">Total Products</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {analyticsLoading ? '...' : analyticsData.totalProducts}
                                </p>
                                <p className="text-xs text-blue-600">Active products</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-800">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {analyticsLoading ? '...' : analyticsData.lowStockCount}
                                </p>
                                <p className="text-xs text-yellow-600">Need attention</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-400/40">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="in">In Stock</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="-createdAt">Newest First</option>
                        <option value="createdAt">Oldest First</option>
                        <option value="title">Name A-Z</option>
                        <option value="-title">Name Z-A</option>
                        <option value="totalStock">Stock Low-High</option>
                        <option value="-totalStock">Stock High-Low</option>
                    </select>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {inventory.length} products
                        </span>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="text-gray-600">Loading inventory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((product) => (
                                    <tr key={product._id} className="hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        className="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-200"
                                                        src={product.featuredImage || '/placeholder-product.jpg'}
                                                        alt={product.title}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.brand}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.category?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.stockStatus)}`}>
                                                {getStockStatusText(product.stockStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{product.totalStock}</span>
                                                {product.lowStockVariants > 0 && (
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.variants?.length || 0} variants
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {hasUpdatePermission && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowUpdateModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                    title="Update Stock"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowHistoryModal(true);
                                                    }}
                                                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                                                    title="View History"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Update Stock - {selectedProduct?.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage stock levels for this product and its variants
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
                            {selectedProduct && (
                                <div className="space-y-6">
                                    {/* Product Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={selectedProduct.featuredImage || '/placeholder-product.jpg'}
                                                alt={selectedProduct.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{selectedProduct.title}</h4>
                                                <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                                                <p className="text-sm text-gray-500">Current Total Stock: {selectedProduct.totalStock}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variants Section - Show if variants exist */}
                                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                Product Variants ({selectedProduct.variants.length})
                                            </h4>
                                            <div className="space-y-4">
                                                {selectedProduct.variants.map((variant, index) => (
                                                    <VariantStockCard
                                                        key={variant.sku || index}
                                                        variant={variant}
                                                        productId={selectedProduct._id}
                                                        onStockUpdate={() => {
                                                            fetchInventory();
                                                            fetchAnalyticsData();
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                            <p className="text-yellow-700 font-medium">No variants found for this product</p>
                                            <p className="text-yellow-600 text-sm mt-1">This product doesn't have any variants to manage</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 px-6 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock History Modal */}
            <StockHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default InventoryPage;