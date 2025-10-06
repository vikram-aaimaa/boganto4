import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary-500">
              Boganto
            </div>
            <p className="text-navy-300 text-sm leading-relaxed">
              Your premium destination for literary excellence and book discovery.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-400 hover:text-primary-500 transition-colors duration-200"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Home
              </Link>
              <Link
                href="/books"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Books
              </Link>
              <Link
                href="/categories"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Categories
              </Link>
              <Link
                href="/"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Popular Categories</h3>
            <div className="space-y-2">
              <Link
                href="/category/fiction"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Fiction
              </Link>
              <Link
                href="/category/childrens-fiction"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Children's Fiction
              </Link>
              <Link
                href="/category/science"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Science
              </Link>
              <Link
                href="/category/history"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                History
              </Link>
              <Link
                href="/category/biography-autobiography"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Biography & Autobiography
              </Link>
              <Link
                href="/category/health-fitness"
                className="block text-navy-300 hover:text-primary-500 transition-colors duration-200 text-sm"
              >
                Health & Fitness
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-navy-300 text-sm">
                  123 Library Avenue, Book City
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-navy-300 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-navy-300 text-sm">
                  hello@boganto.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-navy-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-navy-400 text-sm">
              © 2024 Boganto. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-navy-400 hover:text-primary-500 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-navy-400 hover:text-primary-500 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/admin"
                className="text-navy-400 hover:text-primary-500 text-sm transition-colors duration-200"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer