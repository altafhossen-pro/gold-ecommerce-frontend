'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Package, Calendar, User, MapPin, CreditCard, Mail, Edit } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDateForTable } from '@/utils/formatDate';
import { orderAPI } from '@/services/api';
import { getCookie } from 'cookies-next';
import PermissionDenied from '@/components/Common/PermissionDenied';
import { useAppContext } from '@/context/AppContext';
import DeleteConfirmationModal from '@/components/Common/DeleteConfirmationModal';

export default function AdminOrdersPage() {
    const { hasPermission, loading: contextLoading } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        orderId: '',
        email: '', // Separate email filter
        phone: '', // Separate phone filter
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
        // Check permission first
        if (!contextLoading) {
            if (!hasPermission('order', 'read')) {
                setPermissionError({
                    message: "You don't have permission to view orders.",
                    action: 'Read Orders'
                });
                setLoading(false);
            } else {
                fetchOrders();
            }
        }
    }, [contextLoading, hasPermission, pagination.currentPage, pagination.itemsPerPage]);

    // Refetch orders when any filter changes (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [filters.orderId, filters.email, filters.phone, filters.status, pagination.currentPage, pagination.itemsPerPage]);

    const fetchOrders = async () => {
        try {
            const token = getCookie('token');
            setLoading(true);
            
            // Build query parameters - all filtering done server-side
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: pagination.itemsPerPage.toString()
            });
            
            // Add status filter if not 'all'
            if (filters.status && filters.status !== 'all') {
                params.append('status', filters.status);
            }
            
            // Add Order ID filter
            if (filters.orderId && filters.orderId.trim()) {
                params.append('orderId', filters.orderId.trim());
            }
            
            // Add email filter
            if (filters.email && filters.email.trim()) {
                params.append('email', filters.email.trim());
            }
            
            // Add phone filter
            if (filters.phone && filters.phone.trim()) {
                params.append('phone', filters.phone.trim());
            }
            
            const data = await orderAPI.getAdminOrders(token, params.toString());
            
            if (data.success) {
                // Server-side filtering - directly use returned data
                setOrders(data.data);
                setFilteredOrders(data.data); // Server has already filtered
                setPermissionError(null);
                
                // Update pagination info
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        ...data.pagination
                    }));
                }
            } else {
                // Check if it's a permission error
                if (data.message && (
                    data.message.toLowerCase().includes('permission') ||
                    data.message.toLowerCase().includes('access denied') ||
                    data.message.toLowerCase().includes("don't have permission")
                )) {
                    setPermissionError({
                        message: data.message,
                        action: 'Read Orders'
                    });
                } else {
                    toast.error('Failed to fetch orders');
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Check if it's a 403 error (permission denied)
            if (error.status === 403 || error.response?.status === 403) {
                const errorMessage = error.response?.data?.message || error.message || 'You don\'t have permission to access this resource.';
                setPermissionError({
                    message: errorMessage,
                    action: 'Read Orders'
                });
            } else {
                toast.error('Error fetching orders');
            }
        } finally {
            setLoading(false);
        }
    };

    // No client-side filtering needed - all filtering done server-side

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
        const order = orders.find(o => o._id === orderId);
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;

        try {
            setDeleting(true);
            const token = getCookie('token');
            const data = await orderAPI.deleteOrder(orderToDelete._id, token);

            if (data.success) {
                toast.success('Order deleted successfully!');
                setShowDeleteModal(false);
                setOrderToDelete(null);
                // Refresh orders list
                fetchOrders();
            } else {
                toast.error(data.message || 'Failed to delete order');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            if (error.status === 403 || error.response?.status === 403) {
                toast.error("You don't have permission to delete orders");
            } else {
                toast.error('Error deleting order');
            }
        } finally {
            setDeleting(false);
        }
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

    // Get valid status transitions based on current status
    const getValidStatusTransitions = (currentStatus) => {
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'returned'],
            'delivered': ['returned'],
            'cancelled': [], // No transitions from cancelled
            'returned': [] // No transitions from returned
        };
        return validTransitions[currentStatus] || [];
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;

        // Validate status transition
        const validTransitions = getValidStatusTransitions(selectedOrder.status);
        if (!validTransitions.includes(newStatus)) {
            toast.error(`Cannot change status from ${selectedOrder.status} to ${newStatus}`);
            return;
        }

        if (!hasPermission('order', 'update')) {
            toast.error("You don't have permission to update orders");
            closeStatusModal();
            return;
        }

        try {
            setUpdatingStatus(true);
            const token = getCookie('token');
            const response = await orderAPI.updateOrderStatus(selectedOrder._id, { status: newStatus }, token);
            
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
            console.error('Error updating order status:', error);
            if (error.status === 403 || error.response?.status === 403) {
                toast.error("You don't have permission to update orders");
            } else {
                toast.error('Error updating order status');
            }
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Show permission denied if permission error exists
    if (permissionError && !loading) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError.message}
                action={permissionError.action}
            />
        );
    }

    // Show loading only in table area, not full page

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
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Search by email..."
                                value={filters.email}
                                onChange={(e) => {
                                    handleFilterChange('email', e.target.value);
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        {/* Phone Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                placeholder="Search by phone..."
                                value={filters.phone}
                                onChange={(e) => {
                                    handleFilterChange('phone', e.target.value);
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
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
                
                {loading || contextLoading ? (
                    <div className="p-8 text-center">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Loading orders...</span>
                            </div>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
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
                                        Email/Phone
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
                                                    {order.orderType === 'manual' && order.manualOrderInfo?.phone 
                                                        ? order.manualOrderInfo.phone 
                                                        : order.user?.email || 'N/A'}
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
                                                {hasPermission('order', 'read') && (
                                                    <Link
                                                        href={`/admin/dashboard/orders/${order._id}`}
                                                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Link>
                                                )}
                                                {hasPermission('order', 'update') && (
                                                    <>
                                                        <Link
                                                            href={`/admin/dashboard/orders/${order._id}/edit`}
                                                            className="inline-flex items-center px-3 py-1.5 border border-purple-300 shadow-sm text-xs font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => openStatusModal(order)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Status
                                                        </button>
                                                    </>
                                                )}
                                                {hasPermission('order', 'delete') && (
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </button>
                                                )}
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
                                <option value={selectedOrder.status}>
                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)} (Current)
                                </option>
                                {getValidStatusTransitions(selectedOrder.status).map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {getValidStatusTransitions(selectedOrder.status).length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No status changes allowed from {selectedOrder.status}
                                </p>
                            )}
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                }}
                onConfirm={confirmDeleteOrder}
                title="Delete Order"
                message="Are you sure you want to delete this order? This will soft delete the order (mark as deleted). It will not appear in any lists but will remain in the database."
                itemName={orderToDelete ? `Order #${orderToDelete.orderId || orderToDelete._id.slice(-8).toUpperCase()}` : ''}
                itemType="order"
                isLoading={deleting}
                confirmText="Delete Order"
                cancelText="Cancel"
                dangerLevel="high"
            />
        </div>
    );
}
