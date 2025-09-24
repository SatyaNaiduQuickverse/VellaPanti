import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">
              VELLA<span className="border-b-2 border-white pb-1">PANTI</span>
            </h3>
            <p className="text-gray-300 text-sm font-bold uppercase tracking-wide">
              STREET CULTURE • RAP AESTHETICS • GEN Z VIBES<br/>
              AUTHENTIC • BOLD • UNAPOLOGETIC
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white">QUICK LINKS</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  DROPS
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  COLLECTIONS
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white">SUPPORT</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  HELP
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  SHIPPING
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  RETURNS
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white">MY ACCOUNT</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  PROFILE
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  ORDERS
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  WISHLIST
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  CART
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white mt-12 pt-8 text-center text-sm text-white">
          <p className="font-black uppercase tracking-wider">&copy; 2024 VELLAPANTI. ALL RIGHTS RESERVED. | STREET CULTURE • AUTHENTIC STYLE</p>
        </div>
      </div>
    </footer>
  );
}