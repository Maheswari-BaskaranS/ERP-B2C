import { Search, ShoppingCart, User, Menu, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import defaultLogo from '../assets/ERPv.png'
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_B2C_CUSTOMER_CART } from "@/graphql/Product/Cartqueries";
import { useEffect, useState } from "react";
import { GET_WISHLIST_BY_CUSTOMER } from "@/graphql/Product/wishlistQueries";
import { GET_PRODUCT_BY_BARCODE } from "@/graphql/Product/productFilterQueries";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const [count, setCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const headerLogo = (import.meta.env.VITE_SITE_LOGO && String(import.meta.env.VITE_SITE_LOGO).trim()) || defaultLogo as string;
  const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");
  const customerId = user.b2cCustomerId;
  
  const [searchProducts] = useLazyQuery(GET_PRODUCT_BY_BARCODE, {
    fetchPolicy: "network-only",
  });
  const { data, loading, error } = useQuery(GET_B2C_CUSTOMER_CART, {
    variables: {
      customerId: customerId,
      customerType: 2,
    },
    fetchPolicy: "network-only",
  });
   const { data:wishlist, refetch:wishlistRefetch } = useQuery(GET_WISHLIST_BY_CUSTOMER, {
    variables: { customerId: customerId,orgId: 1, branchId: 0 },
    fetchPolicy: "network-only",
  });
  
  useEffect(() => {
    if (data?.customerCartByCustomerId?.customerCart) {
      setCount(data?.customerCartByCustomerId?.customerCart?.length);
    }
  }, [data]);

  useEffect(() => {
    if (wishlist?.b2CCustomerWishListBYCustomerId?.isSuccess) {
      setWishlistCount(wishlist?.b2CCustomerWishListBYCustomerId?.customerWishList.length);
    }
  }, [wishlist]);

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim().length > 0) {
        try {
          const { data } = await searchProducts({
            variables: {
              searchCode: searchInput,
            },
          });
          
          if (data?.b2CProductByBarCode?.product) {
            const products = Array.isArray(data.b2CProductByBarCode.product) 
              ? data.b2CProductByBarCode.product 
              : [data.b2CProductByBarCode.product];
            setSearchResults(products);
            setShowSearchResults(true);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchProducts]);

  const handleProductSelect = (product: any) => {
    setSearchInput("");
    setShowSearchResults(false);
    navigate(`/product/${product.productId}`);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={headerLogo}
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain bg-white"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              ERP Customer Portal
            </span>
          </Link>

          {/* Search - Hidden on mobile and on non-home pages */}
          {isHomePage && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 bg-muted/50 border-muted focus:border-primary"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => searchInput.trim().length > 0 && setShowSearchResults(true)}
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.productId}
                        onClick={() => handleProductSelect(product)}
                        className="w-full px-4 py-3 text-left hover:bg-muted border-b last:border-b-0 transition-colors flex gap-3 items-center"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {product.productImagePath ? (
                            <img 
                              src={product.productImagePath} 
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground text-center px-1">No image</span>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{product.productName}</div>
                          <div className="text-xs text-muted-foreground">Code: {product.productCode}</div>
                          <div className="text-sm font-semibold text-primary mt-1">₹{product.sellingPrice}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {showSearchResults && searchResults.length === 0 && searchInput.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
                    <p className="text-sm text-muted-foreground text-center">No products found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {count}
                </span>
              </Link>
            </Button>

            {/* Profile */}
            <Button variant="ghost" size="icon" asChild>
              <Link to={user ? "/account" : "/auth"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search - Only on home */}
        {isHomePage && (
          <div className="md:hidden pb-3 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-muted/50 border-muted"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => searchInput.trim().length > 0 && setShowSearchResults(true)}
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Mobile Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.productId}
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-4 py-3 text-left hover:bg-muted border-b last:border-b-0 transition-colors flex gap-3 items-center"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {product.productImagePath ? (
                          <img 
                            src={product.productImagePath} 
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground text-center px-1">No image</span>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{product.productName}</div>
                        <div className="text-xs text-muted-foreground">Code: {product.productCode}</div>
                        <div className="text-sm font-semibold text-primary mt-1">₹{product.sellingPrice}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchResults.length === 0 && searchInput.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
                  <p className="text-sm text-muted-foreground text-center">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;