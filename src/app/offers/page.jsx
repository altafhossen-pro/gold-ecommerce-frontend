'use client';

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Clock, Tag, Copy, CheckCircle } from 'lucide-react';

export default function Offers() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const offers = [
        {
            id: 1,
            title: "August Gift Voucher",
            discount: "50% Off",
            couponCode: "AUGUST25",
            status: "Active",
            isActive: true,
            minAmount: "৳2000",
            endDate: new Date(currentTime.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            image: "/images/featured/img.png",
            description: "Perfect for summer jewelry collection"
        },
        {
            id: 2,
            title: "Summer Gift Voucher",
            discount: "10% Off",
            couponCode: "SUMMER24",
            status: "Inactive",
            isActive: false,
            minAmount: "৳1000",
            endDate: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), // Expired
            image: "/images/featured/img1.png",
            description: "Summer collection special offer"
        },
        {
            id: 3,
            title: "New Year Special",
            discount: "30% Off",
            couponCode: "NEWYEAR30",
            status: "Active",
            isActive: true,
            minAmount: "৳1500",
            endDate: new Date(currentTime.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            image: "/images/featured/img.png",
            description: "Ring in the new year with style"
        },
        {
            id: 4,
            title: "Valentine's Day",
            discount: "25% Off",
            couponCode: "LOVE25",
            status: "Active",
            isActive: true,
            minAmount: "৳1200",
            endDate: new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            image: "/images/featured/img1.png",
            description: "Show your love with beautiful jewelry"
        }
    ];

    const formatTimeLeft = (endDate) => {
        const difference = endDate - currentTime;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return { days, hours, minutes, seconds };
    };

    const formatNumber = (num) => {
        return num < 10 ? `0${num}` : num;
    };

    const copyToClipboard = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <Header />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
                        <Tag className="w-8 h-8 text-pink-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Special Offers & Coupons</h1>
                    <p className="text-gray-600 text-lg">Discover amazing discounts and voucher codes</p>
                </div>

                {/* Offers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {offers.map((offer) => {
                        const timeLeft = formatTimeLeft(offer.endDate);
                        const isExpired = !offer.isActive || timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

                        return (
                            <div key={offer.id} className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex">
                                    {/* Left Section - Offer Details */}
                                    <div className="flex-1 p-6">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src={offer.image}
                                                alt={offer.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Countdown Timer */}
                                        <div className="mb-4">
                                            <div className="flex gap-2">
                                                {[
                                                    { label: 'D', value: timeLeft.days },
                                                    { label: 'H', value: timeLeft.hours },
                                                    { label: 'M', value: timeLeft.minutes },
                                                    { label: 'S', value: timeLeft.seconds }
                                                ].map((item, index) => (
                                                    <div key={index} className={`flex-1 rounded-lg p-2 text-center shadow-sm border ${isExpired
                                                            ? 'bg-pink-50 border-pink-200'
                                                            : 'bg-purple-50 border-purple-200'
                                                        }`}>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatNumber(item.value)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title and Discount */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.title}</h3>
                                            <p className="text-xl font-bold text-red-500">{offer.discount}</p>
                                        </div>
                                    </div>

                                    {/* Vertical Dashed Line */}
                                    <div className="w-px bg-gradient-to-b from-pink-200 to-purple-200 my-6 relative">
                                        <div className="absolute inset-0 border-l-2 border-dashed border-pink-300"></div>
                                    </div>

                                    {/* Right Section - Coupon Details */}
                                    <div className="flex-1 p-6">
                                        {/* Status */}
                                        <div className="mb-4">
                                            <span className="text-gray-700">Coupon </span>
                                            <span className={`font-semibold ${offer.isActive ? 'text-purple-600' : 'text-red-500'
                                                }`}>
                                                {offer.status}
                                            </span>
                                        </div>

                                        {/* Coupon Code */}
                                        <div className="mb-4">
                                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-dashed border-pink-300 rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-pink-600">{offer.couponCode}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(offer.couponCode, offer.id)}
                                                        className="text-pink-600 hover:text-pink-700 transition-colors p-1 rounded-full hover:bg-pink-100"
                                                    >
                                                        {copiedCode === offer.id ? (
                                                            <CheckCircle className="w-5 h-5" />
                                                        ) : (
                                                            <Copy className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Condition */}
                                        <div className="text-sm text-gray-500">
                                            * This coupon code will apply when you shop more than{' '}
                                            <span className="font-bold text-gray-700">{offer.minAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Additional Info Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Coupons</h2>
                        <p className="text-gray-600">Follow these simple steps to redeem your discount</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                step: "1",
                                title: "Copy Code",
                                description: "Click the copy button next to your desired coupon code"
                            },
                            {
                                step: "2",
                                title: "Add to Cart",
                                description: "Add products worth the minimum amount to your cart"
                            },
                            {
                                step: "3",
                                title: "Apply & Save",
                                description: "Paste the code at checkout and enjoy your discount"
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
