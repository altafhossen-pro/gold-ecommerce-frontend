'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Trash2, Package, Calendar, User, MapPin, CreditCard, Mail, Edit, MoreVertical, Copy } from 'lucide-react';
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
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({});
    const buttonRefs = useRef({});
    const [contextMenu, setContextMenu] = useState({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
    
    // Filter states
    const [filters, setFilters] = useState({
        search: '', // Unified search for orderId, email, phone
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

    // Check permission on mount
    useEffect(() => {
        if (!contextLoading) {
            if (!hasPermission('order', 'read')) {
                setPermissionError({
                    message: "You don't have permission to view orders.",
                    action: 'Read Orders'
                });
                setLoading(false);
            }
        }
    }, [contextLoading, hasPermission]);

    // Refetch orders when filters or pagination changes (debounced)
    // This single useEffect handles all data fetching to prevent duplicate calls
    useEffect(() => {
        // Don't fetch if still loading context or no permission
        if (contextLoading || !hasPermission('order', 'read')) {
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [filters.search, filters.status, pagination.currentPage, pagination.itemsPerPage, contextLoading, hasPermission]);

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
            
            // Add unified search filter (searches orderId, email, phone)
            if (filters.search && filters.search.trim()) {
                params.append('search', filters.search.trim());
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
            search: '',
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

    const getOrderSourceLabel = (source) => {
        if (!source) return 'N/A';
        const labels = {
            'website': 'Website',
            'facebook': 'Facebook',
            'whatsapp': 'WhatsApp',
            'phone': 'Phone Call',
            'email': 'Email',
            'walk-in': 'Walk-in',
            'instagram': 'Instagram',
            'manual': 'Manual',
            'other': 'Other'
        };
        return labels[source] || source;
    };

    // Calculate dropdown position based on available space (floating style - fixed positioning)
    const calculateDropdownPosition = (orderId) => {
        const buttonElement = buttonRefs.current[orderId];
        if (!buttonElement) return { top: 0, left: 0, position: 'fixed' };

        const rect = buttonElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = 200; // Approximate height of dropdown
        const dropdownWidth = 192; // w-48 = 192px
        const gap = 8; // Gap between button and dropdown

        let position = {
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        };

        // Vertical positioning: check if there's enough space below
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            // Open above - position from bottom of viewport
            position.bottom = `${viewportHeight - rect.top + gap}px`;
            position.top = 'auto';
        } else {
            // Open below (default) - position from top of viewport
            position.top = `${rect.bottom + gap}px`;
            position.bottom = 'auto';
        }

        // Horizontal positioning: align to right edge of button by default
        const spaceRight = viewportWidth - rect.right;
        
        if (spaceRight < dropdownWidth) {
            // Not enough space on right, align to left edge of button
            position.left = `${rect.left}px`;
            position.right = 'auto';
        } else {
            // Default: align to right edge of button
            position.right = `${viewportWidth - rect.right}px`;
            position.left = 'auto';
        }

        return position;
    };

    const handleDropdownToggle = (orderId) => {
        if (openDropdownId === orderId) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(orderId);
            setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
            // Calculate position after a small delay to ensure button is rendered
            setTimeout(() => {
                const position = calculateDropdownPosition(orderId);
                setDropdownPosition(prev => ({
                    ...prev,
                    [orderId]: position
                }));
            }, 0);
        }
    };

    // Handle right-click context menu
    const handleContextMenu = (e, orderId) => {
        e.preventDefault(); // Prevent browser default context menu
        
        // Check if text is selected
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().trim().length > 0;
        
        setContextMenu({
            open: true,
            orderId: orderId,
            x: e.clientX,
            y: e.clientY,
            hasSelection: hasSelection
        });
        
        // Close dropdown menu if open
        if (openDropdownId) {
            setOpenDropdownId(null);
        }
    };

    // Handle copy to clipboard
    const handleCopy = async () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            try {
                await navigator.clipboard.writeText(selection.toString());
                toast.success('Copied to clipboard');
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = selection.toString();
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    toast.success('Copied to clipboard');
                } catch (err) {
                    toast.error('Failed to copy');
                }
                document.body.removeChild(textArea);
            }
        }
        setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
    };

    // Calculate context menu position
    const getContextMenuPosition = () => {
        if (!contextMenu.open) return {};
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuWidth = 192; // w-48
        const menuHeight = contextMenu.hasSelection ? 250 : 200; // Approximate
        
        let left = contextMenu.x;
        let top = contextMenu.y;
        
        // Adjust if menu would go off screen
        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - 10;
        }
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight - 10;
        }
        
        return {
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
            zIndex: 9999
        };
    };

    // Close dropdown and context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId && !event.target.closest('.dropdown-menu-container')) {
                setOpenDropdownId(null);
            }
            if (contextMenu.open && !event.target.closest('.context-menu-container')) {
                setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId, contextMenu.open]);

    // Recalculate position on scroll or resize (for relative positioning, less critical but still useful)
    useEffect(() => {
        if (openDropdownId) {
            const handleResize = () => {
                const position = calculateDropdownPosition(openDropdownId);
                setDropdownPosition(prev => ({
                    ...prev,
                    [openDropdownId]: position
                }));
            };

            window.addEventListener('resize', handleResize);
            // For relative positioning, scroll is less critical but we'll keep it for vertical adjustment
            window.addEventListener('scroll', handleResize, true);

            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleResize, true);
            };
        }
    }, [openDropdownId]);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Unified Search Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search (Order ID, Email, Phone)
                            </label>
                            <input
                                type="text"
                                placeholder="Search by Order ID, Email, or Phone..."
                                value={filters.search}
                                onChange={(e) => {
                                    handleFilterChange('search', e.target.value);
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
                                        Order Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr 
                                        key={order._id} 
                                        className="hover:bg-gray-50"
                                        onContextMenu={(e) => handleContextMenu(e, order._id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderId || order._id.slice(-8).toUpperCase()}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                <div className="text-sm text-gray-900">
                                                    {order.isGuestOrder && order.guestInfo?.phone 
                                                        ? order.guestInfo.phone 
                                                        : order.orderType === 'manual' && order.manualOrderInfo?.phone 
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {getOrderSourceLabel(order.orderSource)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="relative dropdown-menu-container">
                                                <button
                                                    ref={(el) => (buttonRefs.current[order._id] = el)}
                                                    onClick={() => handleDropdownToggle(order._id)}
                                                    className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
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

            {/* Floating Dropdown Menu (Portal) */}
            {openDropdownId && typeof window !== 'undefined' && createPortal(
                <div 
                    className="w-48 bg-white rounded-md shadow-lg border border-gray-200"
                    style={dropdownPosition[openDropdownId] || {}}
                >
                    <div className="py-1">
                        {hasPermission('order', 'read') && (
                            <Link
                                href={`/admin/dashboard/orders/${openDropdownId}`}
                                onClick={() => setOpenDropdownId(null)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Link>
                        )}
                        {hasPermission('order', 'update') && (
                            <>
                                <Link
                                    href={`/admin/dashboard/orders/${openDropdownId}/edit`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        const order = orders.find(o => o._id === openDropdownId);
                                        if (order) {
                                            setOpenDropdownId(null);
                                            openStatusModal(order);
                                        }
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Status
                                </button>
                            </>
                        )}
                        {hasPermission('order', 'delete') && (
                            <button
                                onClick={() => {
                                    setOpenDropdownId(null);
                                    handleDeleteOrder(openDropdownId);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Right-Click Context Menu (Portal) */}
            {contextMenu.open && contextMenu.orderId && typeof window !== 'undefined' && createPortal(
                <div 
                    className="context-menu-container w-48 bg-white rounded-md shadow-lg border border-gray-200"
                    style={getContextMenuPosition()}
                >
                    <div className="py-1">
                        {/* Copy option if text is selected */}
                        {contextMenu.hasSelection && (
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </button>
                        )}
                        
                        {/* Divider if copy option is shown */}
                        {contextMenu.hasSelection && (
                            <div className="border-t border-gray-200 my-1"></div>
                        )}

                        {/* Order actions */}
                        {hasPermission('order', 'read') && (
                            <Link
                                href={`/admin/dashboard/orders/${contextMenu.orderId}`}
                                onClick={() => setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false })}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Link>
                        )}
                        {hasPermission('order', 'update') && (
                            <>
                                <Link
                                    href={`/admin/dashboard/orders/${contextMenu.orderId}/edit`}
                                    onClick={() => setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false })}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        const order = orders.find(o => o._id === contextMenu.orderId);
                                        if (order) {
                                            setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
                                            openStatusModal(order);
                                        }
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Status
                                </button>
                            </>
                        )}
                        {hasPermission('order', 'delete') && (
                            <button
                                onClick={() => {
                                    setContextMenu({ open: false, orderId: null, x: 0, y: 0, hasSelection: false });
                                    handleDeleteOrder(contextMenu.orderId);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
