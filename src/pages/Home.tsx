import Navbar from "@/components/Navbar";
import NavigationBar from "../components/navigationBar";
import Hero from "@/components/Hero";
import PromotionsCarousel from "@/components/PromotionsCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import LoyaltyWidget from "@/components/LoyaltyWidget";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Import category images
import fruitsImage from "@/assets/fruits-category.jpg";
import vegetablesImage from "@/assets/vegetables-category.jpg";
import organicImage from "@/assets/organic-category.jpg";
import { GET_B2CPRODUCTS } from "@/graphql/Product/b2cProductQueries";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_B2C_CUSTOMER_WISHLIST, DEACTIVATE_WISHLIST_BY_CAPID, GET_WISHLIST_BY_CUSTOMER } from "@/graphql/Product/wishlistQueries";
import { toast } from "@/hooks/use-toast";
import Catcarousel from "@/components/Catcarousel";

const Home = () => {
  const categories = [
    {
      title: "Fruits",
      description: "Sweet, fresh, and seasonal",
      image: fruitsImage,
      itemCount: 150,
    },
    {
      title: "Vegetables",
      description: "Farm-fresh and crispy",
      image: vegetablesImage,
      itemCount: 200,
    },
    {
      title: "Organic",
      description: "Certified organic produce",
      image: organicImage,
      itemCount: 80,
    },
  ];

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");

  const { data: wishlistData, refetch: refetchWishlist } = useQuery(GET_WISHLIST_BY_CUSTOMER, {
    variables: { customerId: user?.b2cCustomerId, orgId: 1, branchId: 0 },
    skip: !user?.b2cCustomerId,
    fetchPolicy: "network-only",
  });

  const userWishlist = wishlistData?.b2CCustomerWishListBYCustomerId?.customerWishList || [];

  const [addWishlist] = useMutation(ADD_B2C_CUSTOMER_WISHLIST);
  const [removeWishCAP] = useMutation(DEACTIVATE_WISHLIST_BY_CAPID);

  const isInWishlist = (id: number, detailId = 0) =>
    userWishlist.some((w: any) => w.productId === id && w.productDetailId === detailId);

  const handleAddToWishlist = async (productId: string | number, productDetailId = 0) => {
    if (!user?.b2cCustomerId) {
      toast({ title: "Login Required", description: "Please login to add items to your wishlist.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const prodIdNum = Number(productId);
    const product = featuredProducts.find((p: any) => p.id === prodIdNum || Number(p.id) === prodIdNum);

    let productName = product?.name || "";
    if (productDetailId && productDetailId > 0) {
      productName = product?.itemName || product?.productDetailName || product?.detailValue || product?.variantName || productName;
    }

    try {
      if (isInWishlist(prodIdNum, productDetailId)) {
        const res = await removeWishCAP({
          variables: {
            customerId: user?.b2cCustomerId,
            productId: prodIdNum,
            productDetailId: productDetailId,
            orgId: 1,
            branchId: 0,
          },
        });

        if (res.data?.deactivateB2CCustomerWishListByCAPId?.isSuccess) {
          toast({ title: "Wishlist Updated", description: "Removed from wishlist" });
          await refetchWishlist();
          return;
        }

        toast({ title: "Error", description: "Could not remove from wishlist.", variant: "destructive" });
        return;
      }

      const res = await addWishlist({
        variables: {
          customerWishList: {
            orgId: 1,
            branchId: 0,
            wishListId: 0,
            wishListCode: "",
            customerId: user?.b2cCustomerId,
            productId: prodIdNum,
            productDetailId: productDetailId,
            productName: productName || "",
            qty: 1,
            uom: product?.unit || "",
            price: product?.price || 0,
            isActive: true,
            createdBy: user?.b2cCustomerId,
            createdOn: new Date().toISOString(),
          },
        },
      });

      if (res.data?.addB2CCustomerWishList?.isSuccess) {
        toast({ title: "Wishlist Updated ❤️", description: "Product successfully added to your wishlist." });
        await refetchWishlist();
      } else {
        toast({ title: "Error", description: res.data?.addB2CCustomerWishList?.errorMessage || "Could not add to wishlist.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not update wishlist.", variant: "destructive" });
    }
  };

  const { data, loading, error } = useQuery(GET_B2CPRODUCTS, {
    variables: { pageNo: 1, pageSize: 4 },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const apiProducts = data?.allB2CProduct?.product;

    if (apiProducts && apiProducts.length > 0) {
      const mapped = apiProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        price: p.usualPrice || 0,
        originalPrice: p.mrp || null, // if not available, set null
        image: p.galleryImages?.[0]?.productImagePath || "", // first image OR empty
        rating: p.rating || 0, // if no rating in API
        reviewCount: p.reviewCount || 0, // optional field
        isOrganic: p.isOrganic || false, // optional
        isFresh: p.isFresh || false, // optional
        unit: p.unit || "", // if unit available
      }));

      setFeaturedProducts(mapped);
    }
  }, [data]);

  useEffect(() => {
    const u = localStorage.getItem("b2cUser");
    setIsLoggedIn(!!u);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      <NavigationBar />
      
      <Hero />
      <Catcarousel/>
      {/* Promotions Carousel */}
      {/* <PromotionsCarousel /> */}

      {/* Featured Categories */}
      {/* <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our premium selection of fresh produce, carefully sourced from local farms
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section> */}

      {/* Popular Products */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Trending Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Popular Products
              </h2>
            </div>
            <Button variant="outline">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isInWishlist={isInWishlist(Number(product.id))}
                onAddToWishlist={(id: any) => handleAddToWishlist(id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Teaser (shown only when logged in) */}
      {isLoggedIn && (
        <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="bg-card-gradient rounded-2xl p-8 sm:p-12 text-center shadow-soft">
                <div className="max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Join ERP Customer Portal Rewards
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Earn points on every purchase and unlock exclusive deals on premium organic produce
                  </p>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Join Now - It's Free!
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <LoyaltyWidget />
            </div>
          </div>
        </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;