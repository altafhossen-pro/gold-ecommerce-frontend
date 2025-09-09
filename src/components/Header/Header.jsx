'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ShoppingCart, Heart, Truck, Menu, X, Search } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import CartModal from '@/components/Cart/CartModal';
import WishlistModal from '@/components/Wishlist/WishlistModal';
import SearchBar from './SearchBar';


const navigationMenu = [
  { id: 1, name: "Home", href: "/", isActive: true },
  { id: 2, name: "Categories", href: "/categories", isActive: false },
  { id: 3, name: "Shop", href: "/shop", isActive: false },
  { id: 4, name: "New Arrivals", href: "/shop?sort=new-arrivals", isActive: false },
  { id: 5, name: "Offers", href: "/offers", isActive: false },
  { id: 6, name: "Contact", href: "/contact-us", isActive: false }
];

export default function Header({ isTrackingShow = true }) {
  const { user, cartCount, cartLoading, wishlistCount, isCartOpen, setIsCartOpen } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      {/* Top bar */}
      {
        isTrackingShow && <div className="bg-gray-700 text-white text-sm py-2 px-4 flex items-center justify-center">
          <Truck className="w-4 h-4 mr-2" />
          <span className="text-xs sm:text-sm">Track your order</span>
        </div>
      }


      {/* Main header */}
      <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-50">
        <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={170}
                height={70}
                className="w-32 sm:w-40  -mt-3"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5">
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
            <div className="hidden md:flex">
              <SearchBar className="" />
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
                user?.email ? user?.role === 'admin' ? (
                  <Link href={`/admin/dashboard`} className="p-2 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full transition-colors border border-gray-200">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </Link>
                ) : (
                  <Link href={`/dashboard`} className="p-2 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full transition-colors border border-gray-200">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </Link>
                ) : (
                  <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </Link>
                )
              }


              {/* Wishlist with badge */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              </button>

              {/* Cart with badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
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
            <SearchBar
              isMobile={true}
              onSearchSubmit={() => setIsSearchOpen(false)}
            />
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

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </>
  );
}
