'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, Heart, Truck, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import CartModal from '@/components/Cart/CartModal';

// Dynamic navigation menu data - can be replaced with API data later
const navigationMenu = [
  { id: 1, name: "Home", href: "/", isActive: true },
  { id: 2, name: "Category", href: "/category", isActive: false },
  { id: 3, name: "Shop", href: "/shop", isActive: false },
  { id: 4, name: "New Arrivals", href: "/new-arrivals", isActive: false },
  { id: 5, name: "Offers", href: "/offers", isActive: false },
  { id: 6, name: "Contact", href: "/contact-us", isActive: false }
];

export default function Header() {
  const { user, cartCount, cartLoading } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-700 text-white text-sm py-2 px-4 flex items-center justify-center">
        <Truck className="w-4 h-4 mr-2" />
        <span className="text-xs sm:text-sm">Track your order</span>
      </div>

      {/* Main header */}
      <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={170}
                height={70}
                className="w-32 sm:w-40 md:w-auto -mt-3"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationMenu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`font-medium transition-colors ${item.isActive
                  ? 'text-pink-500'
                  : 'text-gray-700 hover:text-pink-500'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search here"
                className="bg-transparent outline-none text-sm w-32 lg:w-40 placeholder-gray-500"
              />
              <button className="bg-pink-500 text-white rounded-full p-2 ml-2 hover:bg-pink-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* Icons */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* User */}
              {
                user?.email ? (
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </button>
                ) : (
                  <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </Link>
                )
              }


              {/* Wishlist with badge */}
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  5
                </span>
              </button>

              {/* Cart with badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {cartLoading ? (
                    <div className="">0</div>
                  ) : (
                    cartCount
                  )}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden mt-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search here"
                className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
                autoFocus
              />
              <button className="bg-pink-500 text-white rounded-full p-2 ml-2 hover:bg-pink-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              {navigationMenu.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`font-medium py-2 transition-colors ${item.isActive
                    ? 'text-pink-500'
                    : 'text-gray-700 hover:text-pink-500'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
