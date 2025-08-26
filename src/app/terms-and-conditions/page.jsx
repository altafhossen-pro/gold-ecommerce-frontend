'use client';

import React from 'react';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { FileText, Scale, ShoppingCart, CreditCard, Truck, Shield, Users, AlertTriangle, CheckCircle, Clock, Mail, Phone } from 'lucide-react';

export default function TermsConditions() {
  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: FileText,
      content: `Welcome to Forpink.com. These Terms and Conditions govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms. If you disagree with any part of these terms, please do not use our services.`
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: Scale,
      content: `• "Website" refers to Forpink.com and all its pages
      • "Service" refers to the website and all products, services, and information provided
      • "User," "you," and "your" refers to you as the user of the website
      • "Company," "we," "us," and "our" refers to Forpink.com
      • "Products" refers to all jewelry items available for purchase`
    },
    {
      id: "account-registration",
      title: "Account Registration",
      icon: Users,
      content: `To access certain features of our website, you may need to create an account. You agree to:
      • Provide accurate and complete information
      • Maintain the security of your account credentials
      • Notify us immediately of any unauthorized use
      • Accept responsibility for all activities under your account
      • Be at least 18 years old or have parental consent`
    },
    {
      id: "product-information",
      title: "Product Information",
      icon: ShoppingCart,
      content: `We strive to provide accurate product information, including:
      • Product descriptions, images, and specifications
      • Pricing and availability
      • Material composition and care instructions
      • Size charts and measurements
      
      However, we cannot guarantee that all information is completely accurate or up-to-date. Product images may vary slightly from actual items due to lighting and display differences.`
    },
    {
      id: "pricing-and-payment",
      title: "Pricing and Payment",
      icon: CreditCard,
      content: `• All prices are listed in BDT (Bangladeshi Taka) unless otherwise stated
      • Prices are subject to change without notice
      • We accept major credit cards, debit cards, and digital payment methods
      • Payment is processed securely through our payment partners
      • Orders are not confirmed until payment is successfully processed
      • Sales tax and shipping fees will be added as applicable`
    },
    {
      id: "ordering-and-shipping",
      title: "Ordering and Shipping",
      icon: Truck,
      content: `• Orders are processed within 1-2 business days
      • Shipping times vary by location and delivery method
      • We ship to addresses within Bangladesh
      • Shipping costs are calculated based on weight and destination
      • Tracking information will be provided once your order ships
      • Risk of loss transfers to you upon delivery`
    },
    {
      id: "returns-and-refunds",
      title: "Returns and Refunds",
      icon: CheckCircle,
      content: `• Returns are accepted within 30 days of delivery
      • Items must be unused and in original packaging
      • Return shipping costs are the responsibility of the customer
      • Refunds will be processed within 5-7 business days
      • Custom or personalized items may not be eligible for return
      • Damaged items must be reported within 48 hours of delivery`
    },
    {
      id: "warranty-and-quality",
      title: "Warranty and Quality",
      icon: Shield,
      content: `• All jewelry comes with a 1-year warranty against manufacturing defects
      • Natural stones may have slight variations in color and clarity
      • Precious metals are tested for purity and quality
      • Care instructions are provided with each purchase
      • Professional cleaning and maintenance is recommended
      • Warranty does not cover normal wear and tear`
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: FileText,
      content: `• All content on this website is owned by Forpink.com
      • This includes text, images, logos, and design elements
      • You may not reproduce, distribute, or modify our content
      • Product images may not be used for commercial purposes
      • Trademarks and brand names are protected by law
      • Violation of intellectual property rights may result in legal action`
    },
    {
      id: "prohibited-uses",
      title: "Prohibited Uses",
      icon: AlertTriangle,
      content: `You agree not to use our website for:
      • Any unlawful or fraudulent purpose
      • Attempting to gain unauthorized access to our systems
      • Interfering with website functionality
      • Posting false or misleading information
      • Harassing or threatening other users
      • Violating any applicable laws or regulations`
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of Liability",
      icon: Scale,
      content: `• Our liability is limited to the amount you paid for the product
      • We are not liable for indirect, incidental, or consequential damages
      • We do not guarantee uninterrupted website access
      • Third-party services are not under our control
      • Force majeure events may affect our ability to fulfill orders
      • These limitations apply to the fullest extent permitted by law`
    },
    {
      id: "privacy-and-data",
      title: "Privacy and Data Protection",
      icon: Shield,
      content: `• Your privacy is important to us
      • We collect and process data as described in our Privacy Policy
      • We implement appropriate security measures
      • Your personal information is not sold to third parties
      • You have rights regarding your personal data
      • Please review our Privacy Policy for complete details`
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      icon: Scale,
      content: `• Disputes will be resolved through good faith negotiation
      • If negotiation fails, disputes may be resolved through mediation
      • Legal proceedings will be governed by Bangladeshi law
      • Jurisdiction will be in the courts of Bangladesh
      • Small claims court may be appropriate for minor disputes
      • We encourage direct communication to resolve issues quickly`
    },
    {
      id: "modifications",
      title: "Modifications to Terms",
      icon: Clock,
      content: `• We reserve the right to modify these terms at any time
      • Changes will be effective immediately upon posting
      • Continued use constitutes acceptance of new terms
      • We will notify users of significant changes via email
      • It is your responsibility to review terms periodically
      • Previous versions will be archived for reference`
    },
    {
      id: "contact-information",
      title: "Contact Information",
      icon: Users,
      content: `For questions about these Terms and Conditions, please contact us:
      • Email: forpink@gmail.com
      • Phone: +8801XXXXXXXXX
      • Address: 230 Park Avenue, Suite 210, New York, NY 10169, USA
      • Business Hours: Monday-Friday, 9:00 AM - 6:00 PM (EST)
      • We aim to respond to inquiries within 24 hours`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
            <FileText className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600 text-lg">Please read these terms carefully</p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-pink-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <div className="text-gray-600 leading-relaxed">
                    {section.content.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Questions About These Terms?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4 text-pink-500" />
                <span>forpink@gmail.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4 text-pink-500" />
                <span>+8801XXXXXXXXX</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
