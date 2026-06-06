"use client"

import Link from "next/link"
import { Shield, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Updates", href: "/updates" },
    ],
    support: [
      { label: "Help Center", href: "/resources" },
      { label: "Contact Us", href: "/contact" },
      { label: "System Status", href: "/status" },
      { label: "API Docs", href: "/docs" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Compliance", href: "/compliance" },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ]

  const emergencyContacts = [
    { label: "Emergency", number: "15" },
    { label: "Police Non-Emergency", number: "042-99212609" },
    { label: "Support Hotline", number: "0800-111-11" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Emergency Banner */}
      <div className="bg-red-600 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
            <div className="flex items-center mb-2 sm:mb-0">
              <Phone className="h-5 w-5 mr-2" />
              <span className="font-semibold">Emergency: Call 15</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              {emergencyContacts.slice(1).map((contact, index) => (
                <div key={index} className="flex items-center">
                  <span className="mr-2">{contact.label}:</span>
                  <span className="font-semibold">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">ClearCase</span>
              </Link>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering communities and law enforcement with modern technology for safer neighborhoods and efficient
                crime management.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">CPO - Centeral Police Office, (IGP), Punjab, Lahore</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">042-99212609</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">police@clearcase.com</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} ClearCase Management System. All rights reserved.
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
