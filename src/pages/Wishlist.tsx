import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { ADD_B2C_CUSTOMER_WISHLIST, DEACTIVATE_WISHLIST, DEACTIVATE_WISHLIST_BY_CAPID, GET_WISHLIST_BY_CUSTOMER } from "@/graphql/Product/wishlistQueries";
import { ADD_B2C_CUSTOMER_CART } from "@/graphql/Product/Cartqueries";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

    const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");
    const customerId = user.b2cCustomerId;
  // FETCH WISHLIST
  const { data, loading, error, refetch } = useQuery(GET_WISHLIST_BY_CUSTOMER, {
    variables: { customerId: customerId,orgId: 1, branchId: 0 },
    fetchPolicy: "network-only",
  });

  const [removeWishlistMutation] = useMutation(DEACTIVATE_WISHLIST);
  const [addToCart, { loading: cartLoading }] = useMutation(
    ADD_B2C_CUSTOMER_CART
    );

  // MAP API → UI Friendly
  useEffect(() => {
    if (data?.b2CCustomerWishListBYCustomerId?.isSuccess) {
      const mapped =
        data.b2CCustomerWishListBYCustomerId?.customerWishList || [];
console.log("Wishlist data:", mapped);
      setWishlistItems(
        mapped.map((item) => ({
          id: item.wishListId,
          productId: item.productId,
          productDetailId: item.productDetailId,
          name: item.productName,
          image:
            (item.galleryImages && item.galleryImages.length > 0 &&
              (item.galleryImages[0].productImagePath || item.galleryImages[0].productImageName)) ||
            item.productImage || "",
          price: item.price,
          originalPrice: null,
          isOrganic: false,
          isFresh: false,
        }))
      );
    }
  }, [data]);

  // REMOVE ITEM
    const removeItem = async (item: any) => {
    const res = await removeWishlistMutation({
      variables: {
        wishListId: item.id,
      },
    });

    if (res?.data?.deactivateB2CCustomerWishList?.isSuccess) {
      toast.success("Removed from wishlist");
      setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
      await refetch();
    } else {
      toast.error("Failed to remove");
    }
  };

  // MOVE TO CART (OPTIONAL)
  const moveToCart = async (item: any) => {
    try {
      const payload = {
        branchId: 0,
        orgId: 1,
        cratId: 0, // if cart already exists, replace this with existing.cratId
        cartCode: "",
        createdBy: customerId,
        createdOn: new Date().toISOString(),
        customerId: customerId,
        customerType: 2,
        price: item.price, // single qty
        productId: item.productId,
        productDetailId: item.productDetailId || 0,
        productName: item.name,
        productImage: item.image || "",
        qty: 1,
        isActive: true,
      };

      // CALL ADD TO CART API
      const cartRes = await addToCart({
        variables: {
          customerCart: payload,
        },
      });

      if (cartRes?.data?.addB2CCustomerCart?.isSuccess) {
        toast.success("Product added to cart");

        // REMOVE FROM WISHLIST
        await removeItem(item);
      } else {
        toast.error("Failed to move to cart");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 animate-slide-up">My Wishlist</h1>
              <p className="text-gray-600 mt-1 animate-slide-up delay-100">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-3 animate-slide-in-right">
              <Badge variant="secondary" className="px-3 py-1 bg-[#5E3E82]/10 text-[#5E3E82] border-[#5E3E82]/20">
                <Heart className="h-4 w-4 mr-1 fill-[#FF0000] text-[#5E3E82]" />
                {wishlistItems.length} saved
              </Badge>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#5E3E82]/10 to-[#5E3E82]/20 rounded-full flex items-center justify-center animate-bounce">
                <Heart className="h-10 w-10 text-[#5E3E82]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Save your favorite items to buy them later
              </p>
              <Link to="/">
                <Button size="lg" className="px-6 bg-[#5E3E82] hover:bg-[#4A2F6B] text-white transform hover:scale-105 transition-all duration-200">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {wishlistItems.map((item, index) => (
              <Card key={item.id} className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:-translate-y-2 animate-fade-in-up`} style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-white rounded-t-lg overflow-hidden relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center animate-pulse">
                              <Eye className="h-6 w-6 text-gray-500" />
                            </div>
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Remove from Wishlist Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 w-7 h-7 bg-white/95 hover:bg-white shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                      onClick={() => removeItem(item)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-sm group-hover:text-[#5E3E82] transition-colors duration-200">
                        {item.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">(4.5)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-[#5E3E82] hover:bg-[#4A2F6B] text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => moveToCart(item)}
                        disabled={cartLoading}
                      >
                        <ShoppingCart className="h-3 w-3 mr-2" />
                        {cartLoading ? 'Adding...' : 'Add to Cart'}
                      </Button>

                      <Link to={`/product/${item.productId}`} className="block">
                        <Button variant="outline" size="sm" className="w-full border-[#5E3E82]/30 text-[#5E3E82] hover:bg-[#5E3E82] hover:text-white transform hover:scale-105 transition-all duration-200">
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Actions for non-empty wishlist */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 text-center animate-fade-in">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-[#5E3E82]/10 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Continue Shopping
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Discover more products you'll love
              </p>
              <Link to="/products">
                <Button variant="outline" size="lg" className="px-6 border-[#5E3E82] text-[#5E3E82] hover:bg-[#5E3E82] hover:text-white transform hover:scale-105 transition-all duration-200">
                  Browse More Products
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-in-right {
          from { 
            opacity: 0; 
            transform: translateX(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
      ` }} />
    </div>
  );
};

export default Wishlist;
