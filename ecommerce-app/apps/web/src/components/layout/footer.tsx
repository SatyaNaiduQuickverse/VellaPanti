import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EcommerceApp</h3>
            <p className="text-gray-600 text-sm">
              Your one-stop shop for all your needs. Quality products, great prices, 
              and excellent customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-primary">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="font-semibold">My Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-primary">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-primary">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-600 hover:text-primary">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-primary">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 EcommerceApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}