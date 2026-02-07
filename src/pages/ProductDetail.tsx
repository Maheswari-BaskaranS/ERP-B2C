import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Star, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useMutation, useQuery } from "@apollo/client";
import { GET_PODUCT_BY_ID } from "@/graphql/Product/b2cProductQueries";
import { ADD_B2C_CUSTOMER_CART, GET_B2C_CUSTOMER_CART, UPDATE_B2C_CUSTOMER_CART } from "@/graphql/Product/Cartqueries";
import { toast } from "sonner";
import { ADD_B2C_CUSTOMER_WISHLIST, DEACTIVATE_WISHLIST_BY_CAPID, GET_WISHLIST_BY_CUSTOMER, UPDATE_WISHLIST_BY_CAPID } from "@/graphql/Product/wishlistQueries";

const ProductDetail = () => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string>("");

  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");
  const customerId = user.b2cCustomerId;
  // Mock product data
  const { data, loading, error } = useQuery(GET_PODUCT_BY_ID, {
    variables: {
      productId: Number(id),
      orgId: 1,
      branchId: 1,
    },
    fetchPolicy: "no-cache",
  });
  const { data: cartData, refetch } = useQuery(GET_B2C_CUSTOMER_CART, {
    variables: { customerId: customerId, customerType: 2 },
    fetchPolicy: "network-only",
  });
  const [addToCart, { loading: cartLoading }] = useMutation(
    ADD_B2C_CUSTOMER_CART
  );
  const [updateCart] = useMutation(UPDATE_B2C_CUSTOMER_CART);

  const { data: wishData, refetch: refreshWish } = useQuery(
    GET_WISHLIST_BY_CUSTOMER,
    {
      variables: { orgId: 1, branchId: 0, customerId },
      fetchPolicy: "network-only",
    }
  );

  const [addWish] = useMutation(ADD_B2C_CUSTOMER_WISHLIST);
  const [updateWishCAP] = useMutation(UPDATE_WISHLIST_BY_CAPID);
  const [removeWishCAP] = useMutation(DEACTIVATE_WISHLIST_BY_CAPID);

  // Transform API → UI format
  // Transform API → UI format
  const apiProduct = data?.productById?.product;
  const cartItems = cartData?.customerCartByCustomerId?.customerCart || [];

  const product = apiProduct
    ? {
        id: apiProduct.productId,
        name: apiProduct.productName,
        description: apiProduct.description || "",
        rating: 4.8,
        reviewCount: 0,
        isOrganic: false,
        isFresh: apiProduct.stockqty !== 0, // null = assume fresh

        // PRICE (no variants → take from productPriceSetting)
        price:
          apiProduct.productPriceSetting?.b2CSellingPrice ||
          apiProduct.productPriceSetting?.b2CMinimumPrice ||
          0,

        // IMAGES (from galleryImages only)
        images:
          apiProduct.galleryImages?.map((img: any) => img.productImagePath) ||
          [],

        // VARIANTS → your product has no productDetails
        variants:
          apiProduct.productDetails?.length > 0
            ? apiProduct.productDetails.map((detail: any) => ({
                id: detail.productDetailId,
                itemName: detail.itemName,
                weight:
                  detail.productWeight ||
                  detail.detailValue ||
                  detail.itemName ||
                  apiProduct.productWeight ||
                  "1 Unit",

                unit: detail.uomName || apiProduct.uomName || "",

                price: detail.productPriceSetting?.b2CSellingPrice || 0,

                originalPrice:
                  detail.productPriceSetting?.b2CMinimumPrice || null,
              }))
            : [
                // DEFAULT VARIANT WHEN NO productDetails
                {
                  id: 0,
                  productDetailId: 0,
                  weight: `${apiProduct.productWeight || 1} ${
                    apiProduct.uomName
                  }`,
                  unit: apiProduct.uomName,
                  price: apiProduct.productPriceSetting?.b2CSellingPrice || 0,
                  originalPrice:
                    apiProduct.productPriceSetting?.b2CMinimumPrice || null,
                },
              ],

        reviews: [],
      }
    : null;

  const handleWishlist = async () => {
    if (!user?.b2cCustomerId) {
      toast.error("Please login to add items to your wishlist.");
      navigate("/auth");
      return;
    }
    if (!product) return;

    const variant = currentVariant;

    try {
      if (isInWishlist) {
        // ❌ Remove from wishlist
        const res = await removeWishCAP({
          variables: {
            customerId,
            productId: product.id,
            productDetailId: variant.id || 0,
            orgId: 1,
            branchId: 0,
          },
        });

        if (res.data?.deactivateB2CCustomerWishListByCAPId?.isSuccess) {
          toast.success("Removed from wishlist");
          refreshWish();
        }
        return;
      }

      // 🟢 Add to wishlist
      const payload = {
        orgId: 1,
        branchId: 0,
        wishListId: 0,
        wishListCode: "",
        customerId,
        price: variant.price,
        qty: 1,
        uom: variant.unit,
        productId: product.id,
        productDetailId: variant.id || 0,
        productName:
          (variant && (variant.itemName || variant.productDetailName || variant.detailValue || variant.variantName)) ||
          product.name,
        isActive: true,
        createdBy: customerId,
        createdOn: new Date().toISOString(),
      };

      const res = await addWish({ variables: { customerWishList: payload } });

      if (res.data?.addB2CCustomerWishList?.isSuccess) {
        toast.success("Added to wishlist");
        refreshWish();
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const handleAddToCart = async () => {
    if (!user?.b2cCustomerId) {
      toast.error("Please login to add items to your cart.");
      navigate("/auth");
      return;
    }
    
    if (!product) return;

    const variant = currentVariant;

    // 🔍 1. Find if cart already has this product+variant
    const existing = cartItems.find(
      (item: any) =>
        item.productId === product.id &&
        item.productDetailId === (variant.id || 0)
    );

    // 🔧 2. Prepare payload
    const payload = {
      branchId: 0,
      orgId: 1,
      cratId: existing ? existing.cratId : 0,
      cartCode: existing?.cartCode || "",
      createdBy: customerId,
      createdOn: new Date().toISOString(),
      customerId: customerId,
      customerType: 2,
      price: variant.price * (existing ? existing.qty + quantity : quantity),
      productId: product.id,
      productDetailId: variant.id || 0,
      productName:
        (variant && (variant.itemName || variant.productDetailName || variant.detailValue || variant.variantName)) ||
        product.name,
      productImage: product.images?.[0] || "",
      qty: existing ? existing.qty + quantity : quantity,
      isActive: true,
    };

    try {
      let res;

      // 🟡 3. If exists → update
      if (existing) {
        res = await updateCart({
          variables: { customerCart: payload },
        });

        if (res.data?.updateB2CCustomerCart?.isSuccess) {
          toast.success("Cart updated!");
          refetch();
          return;
        } else {
          toast.error(
            res.data?.updateB2CCustomerCart?.errorMessage || "Update failed"
          );
          return;
        }
      }

      // 🟢 4. Else → add
      res = await addToCart({
        variables: { customerCart: payload },
      });

      if (res.data?.addB2CCustomerCart?.isSuccess) {
        toast.success("Added to cart!");
        refetch();
      } else {
        toast.error(res.data?.addB2CCustomerCart?.errorMessage || "Add failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const currentVariant = product?.variants[selectedVariant];
  const discount = currentVariant?.originalPrice
    ? Math.round(
        ((currentVariant?.originalPrice - currentVariant?.price) /
          currentVariant?.originalPrice) *
          100
      )
    : 0;

  // 2️⃣ Wishlist items from API
  const wishlistItems =
    wishData?.b2CCustomerWishListBYCustomerId?.customerWishList || [];

  // 3️⃣ Now this is safe — currentVariant exists
  const isInWishlist = wishlistItems.some(
    (w: any) =>
      w.productId === product?.id && w.productDetailId === currentVariant?.id
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (displayImages?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (displayImages?.length || 1)) % (displayImages?.length || 1));
  };

  // Helper: try to get images from a variant object
  const getVariantImages = (variant: any) => {
    if (!variant) return [];
    if (Array.isArray(variant.images) && variant.images.length) return variant.images;
    if (typeof variant.image === "string" && variant.image) return [variant.image];
    if (variant.productImage) return [variant.productImage];
    if (variant.productImagePath) return [variant.productImagePath];
    return [];
  };

  // Keep displayName/images in sync with the selected variant (or product default).
  useEffect(() => {
    if (!product) return;

    const v = product?.variants?.[selectedVariant];
    if (v) {
      const vImgs = getVariantImages(v);
      setDisplayImages(vImgs && vImgs.length ? vImgs : product.images || []);
      setDisplayName(v?.itemName || product?.name || "");
    } else {
      setDisplayImages(product.images || []);
      setDisplayName(product.name || "");
    }

    setCurrentImageIndex(0);
  }, [product, selectedVariant]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30">
              {displayImages?.length > 0 && displayImages[currentImageIndex] ? (
                <img
                  src={displayImages[currentImageIndex]}
                  alt={displayName || product?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground border mb-2 rounded-md">
                  No Image
                </div>
              )}

              {/* Navigation Buttons */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product?.isOrganic && (
                  <Badge className="bg-success text-success-foreground">
                    Organic
                  </Badge>
                )}
                {product?.isFresh && (
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-foreground"
                  >
                    Fresh
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge variant="destructive">-{discount}%</Badge>
                )}
              </div>

              {/* Heart Icon */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                onClick={handleWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isInWishlist ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {displayImages?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${displayName || product?.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium ml-1">{product?.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product?.reviewCount} reviews)
              </span>
            </div>

            {/* Name & Description */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {displayName || product?.name}
              </h1>
              <p className="text-muted-foreground">{product?.description}</p>
            </div>

            {/* Variant Selector */}
            <div>
              <h3 className="font-semibold mb-3">Size & Weight</h3>
              <div className="grid grid-cols-3 gap-3">
                {product?.variants?.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(index);
                      const v = product?.variants?.[index];
                      const vImgs = getVariantImages(v);
                      setDisplayImages(vImgs && vImgs.length ? vImgs : product?.images || []);
                      setDisplayName(v?.itemName || product?.name || "");
                      setCurrentImageIndex(0);
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      selectedVariant === index 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{variant?.itemName}</div>
                    <div className="text-sm text-primary font-semibold">
                      ₹{variant?.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{currentVariant?.price}
              </span>
              {currentVariant?.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{currentVariant?.originalPrice}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                /{currentVariant?.unit}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {/* <div>
                <h3 className="font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div> */}

              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ₹{(currentVariant?.price * quantity).toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Reviews ({product?.reviewCount})
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm">{product?.rating}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {product?.reviews?.map((review) => (
              <div key={review.id}>
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review?.avatar} alt={review?.user} />
                    <AvatarFallback>{review?.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review?.user}</span>
                      <div className="flex items-center">
                        {Array?.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review?.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review?.comment}</p>
                  </div>
                </div>
                {review?.id !==
                  product?.reviews[product?.reviews?.length - 1].id && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {/* Sticky Add to Cart (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <Button size="lg" className="w-full">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart - ₹{(currentVariant?.price * quantity).toFixed(2)}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;