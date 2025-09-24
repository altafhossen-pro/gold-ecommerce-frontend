'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Package, Calendar, User, MapPin, CreditCard, Mail, Edit } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDateForTable } from '@/utils/formatDate';
import { orderAPI } from '@/services/api';
import { getCookie } from 'cookies-next';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        orderId: '',
        email: '',
        phone: '',
        status: 'all'
    });
    
    // Pagination states
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        fetchOrders();
    }, [pagination.currentPage, pagination.itemsPerPage]);

    // Filter orders whenever filters change
    useEffect(() => {
        filterOrders();
    }, [orders, filters]);

    const fetchOrders = async () => {
        try {
            const token = getCookie('token');
            setLoading(true);
            
            // Build query parameters
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString()
            });
            
            // Add status filter if not 'all'
            if (filters.status !== 'all') {
                params.append('status', filters.status);
            }
            
            const data = await orderAPI.getAdminOrders(token, params.toString());
            
            if (data.success) {
                setOrders(data.data);
                setFilteredOrders(data.data);
                
                // Update pagination info
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        ...data.pagination
                    }));
                }
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            toast.error('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Client-side filtering for Order ID, Email, and Phone (only on current page)
        // Status filtering is handled server-side
        
        // Filter by Order ID
        if (filters.orderId) {
            filtered = filtered.filter(order => 
                (order.orderId || order._id.slice(-8).toUpperCase()).toLowerCase().includes(filters.orderId.toLowerCase())
            );
        }

        // Filter by Email
        if (filters.email) {
            filtered = filtered.filter(order => 
                order.user?.email?.toLowerCase().includes(filters.email.toLowerCase())
            );
        }

        // Filter by Phone
        if (filters.phone) {
            filtered = filtered.filter(order => 
                order.user?.phone?.includes(filters.phone)
            );
        }

        setFilteredOrders(filtered);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        
        // If status filter changes, reset to page 1 and refetch
        if (key === 'status') {
            setPagination(prev => ({
                ...prev,
                currentPage: 1
            }));
        }
    };

    const clearFilters = () => {
        setFilters({
            orderId: '',
            email: '',
            phone: '',
            status: 'all'
        });
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage: parseInt(newItemsPerPage),
            currentPage: 1
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDeleteOrder = (orderId) => {
        toast.error('Admin cannot delete orders. Please contact system administrator.');
    };

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setUpdatingStatus(true);
            const response = await orderAPI.updateOrderStatus(selectedOrder._id, newStatus);
            
            if (response.success) {
                toast.success('Order status updated successfully');
                // Update the order in the local state
                const updatedOrders = orders.map(order => 
                    order._id === selectedOrder._id 
                        ? { ...order, status: newStatus }
                        : order
                );
                setOrders(updatedOrders);
                setFilteredOrders(updatedOrders);
                closeStatusModal();
            } else {
                toast.error(response.message || 'Failed to update order status');
            }
        } catch (error) {
            toast.error('Error updating order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">All Orders</h2>
                </div>
                
                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Order ID Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order ID
                            </label>
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={filters.orderId}
                                onChange={(e) => handleFilterChange('orderId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Email Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Email
                            </label>
                            <input
                                type="email"
                                placeholder="Search by email..."
                                value={filters.email}
                                onChange={(e) => handleFilterChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Phone Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Phone
                            </label>
                            <input
                                type="tel"
                                placeholder="Search by phone..."
                                value={filters.phone}
                                onChange={(e) => handleFilterChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Clear Filters Button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                
                {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {orders.length === 0 
                                ? 'Orders will appear here once customers place them.'
                                : 'Try adjusting your search criteria or clear the filters.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderId || order._id.slice(-8).toUpperCase()}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                <div className="text-sm text-gray-900">
                                                    {order.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                <div className="text-sm text-gray-900">
                                                    {formatDateForTable(order.createdAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ৳{order.total}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {(order.couponDiscount > 0 || order.loyaltyDiscount > 0 || order.discount > 0) ? (
                                                    <div className="space-y-1">
                                                        {order.couponDiscount > 0 && (
                                                            <div className="text-blue-600 font-medium">
                                                                -৳{order.couponDiscount} {order.coupon && `(${order.coupon})`}
                                                            </div>
                                                        )}
                                                        {order.loyaltyDiscount > 0 && (
                                                            <div className="text-pink-600 font-medium">
                                                                -৳{order.loyaltyDiscount} (Loyalty)
                                                            </div>
                                                        )}
                                                        {order.discount > 0 && order.couponDiscount === 0 && (
                                                            <div className="text-green-600 font-medium">
                                                                -৳{order.discount}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No discount</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/admin/dashboard/orders/${order._id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => openStatusModal(order)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Status
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {filteredOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            {/* Items per page selector */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Show:</span>
                                <select
                                    value={pagination.itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm text-gray-700">per page</span>
                            </div>
                            
                            {/* Pagination info */}
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                                {pagination.totalItems} results
                            </div>
                            
                            {/* Pagination buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {/* Page numbers */}
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1 text-sm border rounded ${
                                                    pageNum === pagination.currentPage
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            {isStatusModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
                            <button
                                onClick={closeStatusModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Order ID: <span className="font-medium">#{selectedOrder.orderId || selectedOrder._id.slice(-8).toUpperCase()}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Customer: <span className="font-medium">{selectedOrder.user?.email || 'N/A'}</span>
                            </p>
                            
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                </span>
                            </label>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeStatusModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updatingStatus || newStatus === selectedOrder.status}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    updatingStatus || newStatus === selectedOrder.status
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {updatingStatus ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
