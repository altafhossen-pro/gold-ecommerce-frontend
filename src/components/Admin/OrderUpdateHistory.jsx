'use client';

import React from 'react';
import { History, User, Clock, Edit3, DollarSign, MapPin, Package, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { formatDateForTable } from '@/utils/formatDate';

const OrderUpdateHistory = ({ updateHistory }) => {
    if (!updateHistory || updateHistory.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <History className="h-6 w-6 mr-3 text-blue-600" />
                    Update History
                </h2>
                <div className="text-center py-8">
                    <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No updates yet</h3>
                    <p className="text-slate-500">Order updates will appear here once changes are made.</p>
                </div>
            </div>
        );
    }

    const getUpdateIcon = (updateType) => {
        switch (updateType) {
            case 'status_change':
                return <Edit3 className="h-4 w-4 text-blue-600" />;
            case 'item_update':
                return <Package className="h-4 w-4 text-purple-600" />;
            case 'address_change':
                return <MapPin className="h-4 w-4 text-red-600" />;
            case 'price_change':
                return <DollarSign className="h-4 w-4 text-emerald-600" />;
            case 'payment_change':
                return <CreditCard className="h-4 w-4 text-indigo-600" />;
            case 'notes_update':
            case 'admin_notes_update':
                return <FileText className="h-4 w-4 text-orange-600" />;
            default:
                return <Edit3 className="h-4 w-4 text-gray-600" />;
        }
    };

    const getUpdateTypeLabel = (updateType, changes) => {
        // If there are multiple changes, create a more descriptive label
        if (changes && changes.length > 1) {
            const changeTypes = changes.map(change => formatFieldName(change.field, change)).join(', ');
            return `Multiple Changes: ${changeTypes}`;
        }
        
        switch (updateType) {
            case 'status_change':
                return 'Order Status Changed';
            case 'item_update':
                return 'Order Items Updated';
            case 'address_change':
                return 'Shipping Address Changed';
            case 'price_change':
                return 'Order Pricing Updated';
            case 'payment_change':
                return 'Payment Details Updated';
            case 'notes_update':
                return 'Order Notes Updated';
            case 'admin_notes_update':
                return 'Admin Notes Updated';
            default:
                return 'Order Updated';
        }
    };

    const getUpdateTypeColor = (updateType) => {
        switch (updateType) {
            case 'status_change':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'item_update':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'address_change':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'price_change':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'payment_change':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'notes_update':
            case 'admin_notes_update':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatValue = (value, field) => {
        if (value === null || value === undefined) return 'N/A';
        
        if (field === 'items' && Array.isArray(value)) {
            return `${value.length} item(s)`;
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        if (field === 'total' || field === 'shippingCost' || field === 'discount' || field === 'couponDiscount' || field === 'loyaltyDiscount') {
            return `৳${value}`;
        }
        
        return String(value);
    };

    const formatFieldName = (field, change) => {
        // Handle undefined field
        if (!field) {
            return 'Unknown Field';
        }
        
        // Handle individual item changes
        if (field.startsWith('items[') && field.includes('].quantity')) {
            return `${change?.itemName || 'Item'} - Quantity`;
        }
        if (field.startsWith('items[') && field.includes('].price')) {
            return `${change?.itemName || 'Item'} - Price`;
        }
        
        const fieldNames = {
            'total': 'Total Amount',
            'shippingCost': 'Shipping Cost',
            'discount': 'General Discount',
            'couponDiscount': 'Coupon Discount',
            'loyaltyDiscount': 'Loyalty Discount',
            'items': 'Order Items',
            'shippingAddress': 'Shipping Address',
            'billingAddress': 'Billing Address',
            'status': 'Order Status',
            'paymentStatus': 'Payment Status',
            'paymentMethod': 'Payment Method',
            'orderNotes': 'Order Notes',
            'adminNotes': 'Admin Notes'
        };
        return fieldNames[field] || field;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <History className="h-6 w-6 mr-3 text-blue-600" />
                Update History
            </h2>
            
            <div className="space-y-6">
                {updateHistory.map((update, index) => (
                    <div key={index} className="relative">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className={`p-3 rounded-full border-2 ${getUpdateTypeColor(update.updateType)}`}>
                                    {getUpdateIcon(update.updateType)}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {getUpdateTypeLabel(update.updateType, update.changes)}
                                    </h3>
                                    <span className="text-sm text-slate-500 flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatDateForTable(update.timestamp)}
                                    </span>
                                </div>
                                
                                <div className="mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUpdateTypeColor(update.updateType)}`}>
                                        {update.updateType.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                
                                {/* Handle grouped changes (like pricing changes) */}
                                {update.changes && update.changes.length > 0 ? (
                                    <div className="mb-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                            <div className="space-y-3">
                                                {update.changes.filter(change => change && change.field).map((change, changeIndex) => (
                                                    <div key={changeIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-semibold text-gray-800">
                                                                {formatFieldName(change.field, change)}
                                                            </h4>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs text-red-600 font-medium">
                                                                    {formatValue(change.oldValue, change.field)}
                                                                </span>
                                                                <ArrowRight className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    {formatValue(change.newValue, change.field)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Handle single field changes */
                                    <div className="mb-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-gray-800">
                                                        {formatFieldName(update.field)}
                                                    </h4>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-red-600 font-medium">
                                                            {formatValue(update.oldValue, update.field)}
                                                        </span>
                                                        <ArrowRight className="h-3 w-3 text-gray-400" />
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {formatValue(update.newValue, update.field)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {update.reason && (
                                    <div className="mb-3">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Reason:</span> {update.reason}
                                        </p>
                                    </div>
                                )}
                                
                                {update.notes && (
                                    <div className="mb-3">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Notes:</span> {update.notes}
                                        </p>
                                    </div>
                                )}
                                
                                {update.updatedBy && (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>Updated by {update.updatedBy.name || update.updatedBy.email || 'Admin'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {index < updateHistory.length - 1 && (
                            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-200"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderUpdateHistory;
