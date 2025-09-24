'use client';

import React from 'react';
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Shield, Lock, Eye, FileText, Users, Database, Bell, Mail, Phone } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      content: `Welcome to Forpink.com ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or make purchases from our online jewelry store.`
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:
      • Personal identification information (name, email address, phone number)
      • Shipping and billing addresses
      • Payment information (processed securely through our payment partners)
      • Order history and preferences
      • Communication preferences and marketing opt-ins`
    },
    {
      id: "automated-collection",
      title: "Automated Information Collection",
      icon: Eye,
      content: `We automatically collect certain information when you visit our website:
      • Device information (IP address, browser type, operating system)
      • Usage data (pages visited, time spent, links clicked)
      • Cookies and similar technologies to enhance your experience
      • Analytics data to improve our services and user experience`
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Users,
      content: `We use the collected information for various purposes:
      • Processing and fulfilling your orders
      • Providing customer support and responding to inquiries
      • Sending order confirmations and shipping updates
      • Personalizing your shopping experience
      • Sending marketing communications (with your consent)
      • Improving our website and services
      • Preventing fraud and ensuring security`
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Lock,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
      • With trusted service providers who assist in our operations
      • With payment processors to complete transactions
      • With shipping partners to deliver your orders
      • When required by law or to protect our rights
      • With your explicit consent`
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Shield,
      content: `We implement appropriate security measures to protect your personal information:
      • Encryption of sensitive data during transmission
      • Secure storage of personal information
      • Regular security assessments and updates
      • Limited access to personal information on a need-to-know basis
      • Compliance with industry security standards`
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: FileText,
      content: `We use cookies and similar technologies to:
      • Remember your preferences and settings
      • Analyze website traffic and usage patterns
      • Provide personalized content and recommendations
      • Improve website functionality and performance
      • Enable certain features and services`
    },
    {
      id: "marketing",
      title: "Marketing Communications",
      icon: Mail,
      content: `We may send you marketing communications about our products, services, and promotions. You can:
      • Opt-in to receive marketing emails during account creation
      • Unsubscribe from marketing communications at any time
      • Update your communication preferences in your account settings
      • Contact us to manage your marketing preferences`
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: Users,
      content: `You have the following rights regarding your personal information:
      • Access and review your personal information
      • Update or correct inaccurate information
      • Request deletion of your personal information
      • Opt-out of marketing communications
      • Control cookie preferences through your browser settings
      • Contact us with privacy-related questions or concerns`
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: Shield,
      content: `Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, and we will take steps to remove such information.`
    },
    {
      id: "international",
      title: "International Data Transfers",
      icon: Database,
      content: `Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.`
    },
    {
      id: "changes",
      title: "Changes to This Privacy Policy",
      icon: Bell,
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:
      • Posting the updated policy on our website
      • Sending an email notification to registered users
      • Updating the "Last Updated" date at the top of this policy
      We encourage you to review this policy periodically.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">Your privacy is important to us</p>
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Questions About This Privacy Policy?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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
