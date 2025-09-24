'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { menuAPI } from '@/services/api';

// Fallback footer data
const fallbackFooterData = {
  about: {
    description: "From your very first visit, discover exquisite pink jewelry crafted with love and precision, backed by a team that treats your style as their own."
  },
  quickLinks: [
    { name: "Home", href: "/", isActive: true },
    { name: "Category", href: "/categories" },
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "/shop?sort=new-arrivals" },
    { name: "Offers", href: "/offers" }
  ],
  utilities: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Condition", href: "/terms-and-conditions" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "404 Not Found", href: "/not-found" }
  ],
  contact: {
    address: "230 Park Avenue, Suite 210, New York, NY 10169, USA",
    phone: "+8801XXXXXXXXX",
    email: "forpink@gmail.com",
    callToAction: "Feel free to call & mail us anytime!"
  },
  socialMedia: [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ]
};

export default function Footer() {
  const [footerData, setFooterData] = useState(fallbackFooterData);
  const [loading, setLoading] = useState(true);

  // Fetch footer menus from API
  useEffect(() => {
    const fetchFooterMenus = async () => {
      try {
        setLoading(true);
        const response = await menuAPI.getFooterMenus();

        if (response.success && response.data) {
          // Transform API data to match component format
          const transformedData = {
            about: footerData.about, // Keep static about section
            quickLinks: response.data.quickLinks || fallbackFooterData.quickLinks,
            utilities: response.data.utilities || fallbackFooterData.utilities,
            contact: response.data.contact || fallbackFooterData.contact,
            socialMedia: response.data.socialMedia && response.data.socialMedia.length > 0 
              ? response.data.socialMedia 
              : fallbackFooterData.socialMedia
          };

          setFooterData(transformedData);
        } else {
          // Use fallback data if API fails
          setFooterData(fallbackFooterData);
        }
      } catch (error) {
        console.error('Error fetching footer menus:', error);
        // Use fallback data on error
        setFooterData(fallbackFooterData);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterMenus();
  }, []);
  return (
    <footer className="text-white" style={{ background: 'linear-gradient(280.37deg, #2C1A25 1.99%, #1C071B 53.16%, #200C25 99.63%)' }}>
      {/* Main Footer Content */}
      <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About Section */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link className='' href="/">
                <Image
                  src="/images/footer_logo.png"
                  alt="FORPINK.COM"
                  width={190}
                  height={80}
                  className="w-36 sm:w-40 "
                  priority
                />
              </Link>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerData.about.description}
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              {loading ? (
                <div className="flex space-x-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                footerData.socialMedia.map((social, index) => {
                  // Get the appropriate icon based on social platform or name
                  const getSocialIcon = (socialItem) => {
                    const platform = socialItem.socialPlatform || socialItem.name?.toLowerCase();
                    switch (platform) {
                      case 'facebook':
                        return <Facebook className="w-5 h-5" />;
                      case 'twitter':
                        return <Twitter className="w-5 h-5" />;
                      case 'instagram':
                        return <Instagram className="w-5 h-5" />;
                      case 'linkedin':
                        return <Linkedin className="w-5 h-5" />;
                      default:
                        // If no specific icon, use a default one or the provided icon
                        return socialItem.icon ? <socialItem.icon className="w-5 h-5" /> : <Facebook className="w-5 h-5" />;
                    }
                  };

                  return (
                    <Link
                      key={index}
                      href={social.href}
                      className="text-white hover:text-pink-400 transition-colors duration-300"
                      aria-label={social.name || social.label}
                    >
                      {getSocialIcon(social)}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-600 rounded animate-pulse w-24"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {footerData.quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target={link.target || '_self'}
                      className={`text-sm transition-colors duration-300 hover:text-pink-400 ${link.isActive
                          ? 'text-pink-400 underline'
                          : 'text-gray-300'
                        }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Utilities Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Utilities</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-600 rounded animate-pulse w-28"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {footerData.utilities.map((utility, index) => (
                  <li key={index}>
                    <Link
                      href={utility.href}
                      target={utility.target || '_self'}
                      className="text-gray-300 text-sm transition-colors duration-300 hover:text-pink-400"
                    >
                      {utility.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Connect Forpink.com</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-600 rounded animate-pulse flex-shrink-0"></div>
                    <div className="h-4 bg-gray-600 rounded animate-pulse w-32"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Dynamic Contact Information */}
                {footerData.contact && Array.isArray(footerData.contact) ? (
                  footerData.contact.map((contact, index) => {
                    const getContactIcon = (contactType) => {
                      switch (contactType) {
                        case 'address':
                          return <MapPin className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />;
                        case 'phone':
                          return <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />;
                        case 'email':
                          return <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />;
                        case 'callToAction':
                          return <MessageCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />;
                        default:
                          return <MessageCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />;
                      }
                    };

                    const getContactText = (contact) => {
                      switch (contact.contactType) {
                        case 'phone':
                          return `Phone: ${contact.href}`;
                        case 'email':
                          return `Email: ${contact.href}`;
                        case 'address':
                        case 'callToAction':
                        default:
                          return contact.description || contact.href;
                      }
                    };

                    const getContactLink = (contact) => {
                      switch (contact.contactType) {
                        case 'address':
                          return `https://www.google.com/maps?q=${encodeURIComponent(contact.href)}`;
                        case 'phone':
                          return `tel:${contact.href}`;
                        case 'email':
                          return `mailto:${contact.href}`;
                        case 'callToAction':
                        default:
                          return '#';
                      }
                    };

                    const isClickable = ['address', 'phone', 'email'].includes(contact.contactType);

                    return (
                      <div key={index} className={`flex items-${contact.contactType === 'address' ? 'start' : 'center'} space-x-3 ${contact.contactType === 'callToAction' ? '' : ''}`}>
                        {getContactIcon(contact.contactType)}
                        {isClickable ? (
                          <a
                            href={getContactLink(contact)}
                            target={contact.contactType === 'address' ? '_blank' : '_self'}
                            rel={contact.contactType === 'address' ? 'noopener noreferrer' : ''}
                            className={`text-gray-300 text-sm hover:text-pink-400 transition-colors duration-300 ${contact.contactType === 'address' ? 'leading-relaxed' : ''}`}
                          >
                            {getContactText(contact)}
                          </a>
                        ) : (
                          <span className={`text-gray-300 text-sm ${contact.contactType === 'address' ? 'leading-relaxed' : ''}`}>
                            {getContactText(contact)}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Fallback to static data if contact is not an array
                  <>
                    {/* Address */}
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(footerData.contact?.address || '230 Park Avenue, Suite 210, New York, NY 10169, USA')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 text-sm leading-relaxed hover:text-pink-400 transition-colors duration-300"
                      >
                        {footerData.contact?.address || '230 Park Avenue, Suite 210, New York, NY 10169, USA'}
                      </a>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <a
                        href={`tel:${footerData.contact?.phone || '+8801XXXXXXXXX'}`}
                        className="text-gray-300 text-sm hover:text-pink-400 transition-colors duration-300"
                      >
                        Phone: {footerData.contact?.phone || '+8801XXXXXXXXX'}
                      </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <a
                        href={`mailto:${footerData.contact?.email || 'forpink@gmail.com'}`}
                        className="text-gray-300 text-sm hover:text-pink-400 transition-colors duration-300"
                      >
                        Email: {footerData.contact?.email || 'forpink@gmail.com'}
                      </a>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center space-x-3 pt-2">
                      <MessageCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">
                        {footerData.contact?.callToAction || 'Feel free to call & mail us anytime!'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-pink-400/30">
        <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              ©2025 Forpink. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
