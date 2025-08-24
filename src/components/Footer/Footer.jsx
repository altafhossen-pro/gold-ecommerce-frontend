'use client';

import React from 'react';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

// Dynamic footer data
const footerData = {
  about: {
    description: "From your very first visit, discover exquisite pink jewelry crafted with love and precision, backed by a team that treats your style as their own."
  },
  quickLinks: [
    { name: "Home", href: "#", isActive: true },
    { name: "Category", href: "#" },
    { name: "Shop", href: "#" },
    { name: "New Arrivals", href: "#" },
    { name: "Offers", href: "#" }
  ],
  utilities: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms & Condition", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Blogs", href: "#" },
    { name: "404 Not Found", href: "#" }
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
  return (
    <footer className="text-white" style={{ background: 'linear-gradient(280.37deg, #2C1A25 1.99%, #1C071B 53.16%, #200C25 99.63%)' }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/images/logo.png" 
                alt="FORPINK.COM" 
                width={170}
                height={70}
                className="w-32 sm:w-40 md:w-auto"
                priority
              />
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerData.about.description}
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              {footerData.socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-white hover:text-pink-400 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {footerData.quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-colors duration-300 hover:text-pink-400 ${
                      link.isActive 
                        ? 'text-pink-400 underline' 
                        : 'text-gray-300'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Utilities Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Utilities</h3>
            <ul className="space-y-2">
              {footerData.utilities.map((utility, index) => (
                <li key={index}>
                  <a
                    href={utility.href}
                    className="text-gray-300 text-sm transition-colors duration-300 hover:text-pink-400"
                  >
                    {utility.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Connect Forpink.com</h3>
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  {footerData.contact.address}
                </span>
              </div>
              
              {/* Phone */}
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Phone: {footerData.contact.phone}
                </span>
              </div>
              
              {/* Email */}
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Email: {footerData.contact.email}
                </span>
              </div>
              
              {/* Call to Action */}
              <div className="flex items-center space-x-3 pt-2">
                <MessageCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  {footerData.contact.callToAction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-pink-400/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
