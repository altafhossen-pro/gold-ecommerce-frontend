'use client';

import React, { useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
    
export default function CartModal({ isOpen, onClose }) {
    const { cart, cartTotal, updateCartItem, removeFromCart, cartLoading } = useAppContext();
    const router = useRouter();

    // Body scroll lock when modal is open
    useEffect(() => {
        let scrollY = 0;

        if (isOpen) {
            // Save current scroll position
            scrollY = window.scrollY;
            
            // Calculate scrollbar width to prevent layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Disable body scroll and prevent layout shift
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Restore body scroll and position
            const savedScrollY = parseInt(document.body.style.top || '0') * -1;
            
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // Restore scroll position
            if (savedScrollY > 0) {
                window.scrollTo(0, savedScrollY);
            }
        }

        // Cleanup function
        return () => {
            const savedScrollY = parseInt(document.body.style.top || '0') * -1;
            
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // Restore scroll position on cleanup
            if (savedScrollY > 0) {
                window.scrollTo(0, savedScrollY);
            }
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black z-[9999] transition-all duration-300 ease-out ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                style={{ display: isOpen ? 'block' : 'none' }}
            ></div>

            {/* Cart Modal */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[10000] transform transition-all duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}>

                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-[#EF3D6A]" />
                        <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hover:scale-110"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cartLoading ? (
                        // Loading skeleton
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div 
                                    key={index} 
                                    className={`flex gap-3 p-2 bg-gray-50 rounded-lg animate-pulse transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : cart.length === 0 ? (
                        <div className={`text-center py-8 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                            <p className="text-sm text-gray-500">Add some products to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className={`flex gap-3 p-2 bg-gray-50 rounded-lg transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                                    style={{ transitionDelay: `${index * 50}ms` }}
                                >
                                    {/* Product Image */}
                                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">
                                            {item.name}
                                        </h3>

                                        {/* Variant Info with Color Circle */}
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.size && (
                                                <span className="text-xs text-gray-600">
                                                    Size: {item.size}
                                                </span>
                                            )}
                                            {item.color && item.colorHexCode && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-600">Color:</span>
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor: item.colorHexCode,
                                                            border: item.colorHexCode?.toLowerCase() === '#ffffff' || item.colorHexCode?.toLowerCase() === '#fff'
                                                                ? '1px solid #d1d5db'
                                                                : 'none'
                                                        }}
                                                        title={item.color}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-700 mb-1">
                                            Item Price: {item.price} ৳
                                        </p>

                                        <div className='flex items-center justify-between'>
                                            <p className="text-sm font-semibold text-[#EF3D6A] ">
                                                {item.total}৳
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border border-[#EF3D6A] rounded-md p-1">
                                                    <button
                                                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                                                        className="p-1 cursor-pointer transition-colors hover:bg-[#EF3D6A] hover:text-white rounded"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-2 text-sm font-medium text-[#EF3D6A]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                                                        className="p-1 cursor-pointer transition-colors hover:bg-[#EF3D6A] hover:text-white rounded"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}

                                    </div>

                                    {/* Remove Button */}
                                    <div className='flex items-center justify-center'>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 h-fit text-[#EF3D6A] hover:bg-[#EF3D6A] hover:text-white rounded-full transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer/Checkout - Fixed at bottom */}
                {cartLoading ? (
                    <div className={`border-t border-gray-200 p-4 flex-shrink-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="w-full bg-gray-300 py-3 px-4 rounded-lg flex items-center justify-between animate-pulse">
                            <div className="h-4 bg-gray-400 rounded w-32"></div>
                            <div className="h-4 bg-gray-400 rounded w-16"></div>
                        </div>
                    </div>
                ) : cart.length > 0 && (
                    <div className={`border-t border-gray-200 p-4 flex-shrink-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Link 
                            href="/checkout"
                            onClick={onClose}
                            className="w-full bg-[#EF3D6A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#D63447] transition-all duration-200 flex items-center justify-between cursor-pointer hover:scale-[1.02] hover:shadow-lg"
                        >
                            <span>Proceed To Checkout</span>
                            <span>{cartTotal} ৳</span>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
