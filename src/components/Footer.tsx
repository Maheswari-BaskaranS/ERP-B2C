import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import defaultFooterLogo from '../assets/Erpv.png'

const Footer = () => {
  const footerLogo = (import.meta.env.VITE_SITE_FOOTER_LOGO && String(import.meta.env.VITE_SITE_FOOTER_LOGO).trim())
    || (import.meta.env.VITE_SITE_LOGO && String(import.meta.env.VITE_SITE_LOGO).trim())
    || (defaultFooterLogo as string);

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={footerLogo} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white" />
              <span className="font-bold text-lg text-foreground">ERP Customer Portal</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted destination for cutting-edge electronics and smart technology solutions.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91-9003001999</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@celestebirch.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>No: 5D, 3rd Cross Street, Ranga Reddy Garden, Neelankarai, Chennai – 600115.</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Stay Connected</h4>
             <h4 className="font-semibold text-foreground">Stay Smart</h4>
              <h4 className="font-semibold text-foreground">Stay Innovative</h4>
           {/*  <p className="text-sm text-muted-foreground">
              Subscribe to get special offers and fresh updates.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email"
                className="h-9"
              />
              <Button size="sm" className="w-full">
                Subscribe
              </Button>
            </div> */}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 ERP Customer Portal. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Designed to make your shopping experience smoother ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;