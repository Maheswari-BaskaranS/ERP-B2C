import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <nav className="bg-primary shadow-soft sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8">
          <Link 
            to="/products" 
            className="text-white font-semibold py-3 px-4 hover:bg-white/10 rounded transition-colors"
          >
            Products
          </Link>
          <Link 
            to="/about" 
            className="text-white font-semibold py-3 px-4 hover:bg-white/10 rounded transition-colors"
          >
            About Us
          </Link>
         {/*  <Link 
            to="/products" 
            className="text-white font-semibold py-3 px-4 hover:bg-white/10 rounded transition-colors"
          >
            Products
          </Link> */}
          <Link 
            to="/contact" 
            className="text-white font-semibold py-3 px-4 hover:bg-white/10 rounded transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
