'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
    Package, 
    Plus, 
    RefreshCw,
    TrendingUp,
    Calendar,
    User,
    ArrowRight
} from 'lucide-react';
import { inventoryAPI } from '@/services/api';
import { getCookie } from 'cookies-next';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

const StockAdjustmentPage = () => {
    const router = useRouter();
    const { hasPermission, contextLoading } = useAppContext();
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const token = getCookie('token');
    const [checkingPermission, setCheckingPermission] = useState(true);
    const [hasReadPermission, setHasReadPermission] = useState(false);
    const [permissionError, setPermissionError] = useState(null);

    useEffect(() => {
        if (!contextLoading) {
            const readPerm = hasPermission('inventory', 'read');
            setHasReadPermission(readPerm);
            setCheckingPermission(false);
            if (!readPerm) {
                setPermissionError('You do not have permission to view stock adjustments');
            }
        }
    }, [contextLoading, hasPermission]);

    useEffect(() => {
        if (hasReadPermission) {
            fetchAdjustments();
        }
    }, [page, hasReadPermission]);

    const fetchAdjustments = async () => {
        try {
            setLoading(true);
            const response = await inventoryAPI.getStockAdjustments({
                page,
                limit: 20
            }, token);
            
            if (response.success) {
                setAdjustments(response.data);
                setTotalPages(response.pagination.totalPages);
            } else {
                toast.error('Failed to fetch stock adjustments');
            }
        } catch (error) {
            console.error('Error fetching stock adjustments:', error);
            toast.error('Error fetching stock adjustments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReasonLabel = (reason) => {
        const reasonMap = {
            'damaged': 'Damaged',
            'expired': 'Expired',
            'lost': 'Lost',
            'theft': 'Theft',
            'returned': 'Returned',
            'defective': 'Defective',
            'waste': 'Waste',
            'other': 'Other'
        };
        return reasonMap[reason] || reason;
    };

    if (checkingPermission || contextLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (permissionError || !hasReadPermission) {
        return <PermissionDenied message={permissionError} />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage stock adjustments and track inventory reductions</p>
                </div>
                <button
                    onClick={() => router.push('/admin/dashboard/inventory/stock-adjustment/create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Stock Adjustment</span>
                </button>
            </div>

            {/* Adjustments List */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Adjustment History</h2>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading adjustments...</p>
                    </div>
                ) : adjustments.length === 0 ? (
                    <div className="p-12 text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">No stock adjustments found</p>
                        <button
                            onClick={() => router.push('/admin/dashboard/inventory/stock-adjustment/create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create First Adjustment</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Adjustment #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Adjusted By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {adjustments.map((adjustment) => (
                                        <tr key={adjustment._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {adjustment.adjustmentNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(adjustment.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs">
                                                    {adjustment.items?.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="text-xs">
                                                            {item.product?.title || 'N/A'}
                                                            {item.variant?.sku && ` (${item.variant.sku})`}
                                                            <span className="text-red-600 ml-1">
                                                                -{item.quantity} ({getReasonLabel(item.reason)})
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {adjustment.items?.length > 2 && (
                                                        <div className="text-xs text-gray-500">
                                                            +{adjustment.items.length - 2} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="text-red-600 font-medium">
                                                    -{adjustment.totalQuantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {adjustment.performedBy?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => router.push(`/admin/dashboard/inventory/stock-adjustment/${adjustment._id}`)}
                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
                                                >
                                                    <span>View</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={page === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Page <span className="font-medium">{page}</span> of{' '}
                                            <span className="font-medium">{totalPages}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                                disabled={page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={page === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StockAdjustmentPage;

