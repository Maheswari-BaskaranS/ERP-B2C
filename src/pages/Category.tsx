import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, List, SlidersHorizontal, Search, X } from "lucide-react";
import { GET_PRODUCT_BY_BARCODE, GET_PRODUCTS_BY_CATEGORY_ID } from "@/graphql/Product/productFilterQueries";
// Import images
import fruitsImage from "@/assets/fruits-category.jpg";
import vegetablesImage from "@/assets/vegetables-category.jpg";
import organicImage from "@/assets/organic-category.jpg";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import Loader from "@/components/ui/loader";
import { GET_B2CPRODUCTS } from "@/graphql/Product/b2cProductQueries";
import { toast } from "@/hooks/use-toast";
import { ADD_B2C_CUSTOMER_WISHLIST, DEACTIVATE_WISHLIST_BY_CAPID, GET_WISHLIST_BY_CUSTOMER } from "@/graphql/Product/wishlistQueries";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PromoBanner from "@/components/PromoBanner";
import NavigationBar from "@/components/navigationBar";

const Category = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get("name") || "All Products";
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Check if we're viewing category products or all products
  const isCategoryView = !!categoryId;

  // Reset products when category changes
  useEffect(() => {
    setAllProducts([]);
    setTotalCount(0);
  }, [categoryId]);

  // Query for category products or all products
  const { data: categoryData, loading: categoryLoading } = useQuery(GET_PRODUCTS_BY_CATEGORY_ID, {
    variables: { categoryId: Number(categoryId) },
    skip: !categoryId,
    fetchPolicy: "no-cache",
  });

  const { data, loading, error, refetch } = useQuery(GET_B2CPRODUCTS, {
    variables: { pageNo, pageSize },
    fetchPolicy: "network-only",
    skip: isCategoryView, // Skip if viewing category
  });

  const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");

  const [addWishlist] = useMutation(ADD_B2C_CUSTOMER_WISHLIST);
  const [removeWishCAP] = useMutation(DEACTIVATE_WISHLIST_BY_CAPID);
  const [searchProducts] = useLazyQuery(GET_PRODUCT_BY_BARCODE, {
    fetchPolicy: "network-only",
  });
  const { data: wishlistData, refetch: refetchWishlist } = useQuery(GET_WISHLIST_BY_CUSTOMER, {
    variables: { customerId: user?.b2cCustomerId, orgId: 1, branchId: 0 },
    skip: !user?.b2cCustomerId,
    fetchPolicy: "network-only",
  });

  const userWishlist =
    wishlistData?.b2CCustomerWishListBYCustomerId.customerWishList || [];


  const handleAddToWishlist = async (
    productId: string,
    productDetailId = 0
  ) => {
    if (!user?.b2cCustomerId) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const product = allProducts.find(
      (p) =>
        p.id === Number(productId) ||
        p.productDetailId === Number(productDetailId)
    );
console.log("Adding to wishlist:", productId, productDetailId, product);
    // If not found, still continue but use empty name
    // If a specific productDetailId is passed, prefer any detail-level name fields
    let productName = product?.name || "";
    if (productDetailId && productDetailId > 0) {
      productName =
        product?.itemName ||
        product?.productDetailName ||
        product?.detailValue ||
        product?.variantName ||
        productName;
    }
    const uom = product?.unit || "";
    const price = product?.price || 0;
    try {
      // If product is already in wishlist → deactivate (remove)
      if (isInWishlist(Number(productId), productDetailId)) {
        const res = await removeWishCAP({
          variables: {
            customerId: user?.b2cCustomerId,
            productId: Number(productId),
            productDetailId: productDetailId,
            orgId: 1,
            branchId: 0,
          },
        });

        if (res.data?.deactivateB2CCustomerWishListByCAPId?.isSuccess) {
          toast({
            title: "Wishlist Updated",
            description: "Removed from wishlist",
          });
          await refetchWishlist();
          return;
        }

        toast({
          title: "Error",
          description: "Could not remove from wishlist.",
          variant: "destructive",
        });
        return;
      }

      // Else → add to wishlist
      const res = await addWishlist({
        variables: {
          customerWishList: {
            orgId: 1,
            branchId: 0,
            wishListId: 0,
            wishListCode: "",
            customerId: user?.b2cCustomerId,
            productId: Number(productId),
            productDetailId: productDetailId,
            productName: productName || "",
            qty: 1,
            uom: uom || "",
            price: price || 0,
            isActive: true,
            createdBy: user?.b2cCustomerId,
            createdOn: new Date().toISOString(),
          },
        },
      });

      if (res.data?.addB2CCustomerWishList?.isSuccess) {
        toast({
          title: "Wishlist Updated ❤️",
          description: "Product successfully added to your wishlist.",
        });
        await refetchWishlist();
      } else {
        toast({
          title: "Error",
          description: res.data?.addB2CCustomerWishList?.errorMessage || "Could not add to wishlist.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not update wishlist.",
        variant: "destructive",
      });
    }
  };
  const isInWishlist = (id: number, detailId = 0) =>
    userWishlist.some(
      (w: any) => w.productId === id && w.productDetailId === detailId
    );

  // Handle product search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          setIsSearching(true);
          const { data } = await searchProducts({
            variables: {
              searchCode: searchQuery,
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
            setShowSearchResults(false);
          }
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  const handleProductSelect = (product: any) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/product/${product.productId}`);
  };

  // Handle product search - cleared old implementation
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const apiProducts = data?.allB2CProduct?.product || [];

  // When API loads new data → replace existing list for pagination
  useEffect(() => {
    console.log('Data processing effect triggered:', { 
      hasData: !!data, 
      hasProducts: !!data?.allB2CProduct?.product,
      productsLength: data?.allB2CProduct?.product?.length,
      isCategoryView,
      rawData: data 
    });

    if (data?.allB2CProduct?.product && data.allB2CProduct.product.length > 0) {
      const newProducts = data.allB2CProduct.product.map((p: any) => ({
        id: p.productId,
        productDetailId: p.productDetailId || 0,
        name: p.productName,
        price: p.sellingPrice || p.usualPrice || 0,
        originalPrice: null,
        image: p.galleryImages?.[0]?.productImagePath || "/placeholder.png",
        rating: 4.5,
        reviewCount: 0,
        isOrganic: false,
        isFresh: p.stockqty > 0,
        unit: p.uomName || "Pcs",
        category: p.categoryName,
      }));

      // Replace product list for pagination
      setAllProducts(newProducts);
      // Extract totalCount from response root (not from individual products)
      const apiTotalCount = data.allB2CProduct.totalCount || 0;
      setTotalCount(apiTotalCount);
      console.log('API Response Debug:', {
        apiTotalCount, 
        pageSize, 
        pageNo,
        productsCount: newProducts.length,
        responseTotalCount: data.allB2CProduct.totalCount,
        shouldFetchMore: apiTotalCount > (pageNo * pageSize)
      });
    } else if (!isCategoryView) {
      // Only clear products if we're not in category view and got empty results
      console.log('Clearing products - no data or in category view');
      setAllProducts([]);
      setTotalCount(0);
    }
  }, [data, isCategoryView, pageSize, pageNo]);

  // Handle category products
  useEffect(() => {
    if (categoryData?.b2CProductByCategoryId?.product) {
      const products = Array.isArray(categoryData.b2CProductByCategoryId.product)
        ? categoryData.b2CProductByCategoryId.product
        : [categoryData.b2CProductByCategoryId.product];

      const newProducts = products.map((p: any) => ({
        id: p.productId,
        productDetailId: 0,
        name: p.productName,
        price: p.sellingPrice || p.usualPrice || 0,
        unit: p.uomName || "Pcs",
        originalPrice: null,
        image: p.galleryImages?.[0]?.productImagePath || "/placeholder.png",
        rating: 4.5,
        reviewCount: 0,
        isOrganic: false,
        isFresh: true,
        category: categoryName,
      }));

      setAllProducts(newProducts);
      // For category products, use the totalCount from API if available, otherwise use the length
      const categoryTotalCount = products[0]?.totalCount || newProducts.length;
      setTotalCount(categoryTotalCount);
      console.log('Category Total Count:', categoryTotalCount, 'Products Length:', newProducts.length);
    }
  }, [categoryData, categoryName]);

  // Pagination: change pageNo to fetch a new page (useQuery will update)
  const handleChangePage = (newPage: number) => {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
    if (newPage > totalPages) return;
    setPageNo(newPage);
    // refetch to be explicit
    try {
      refetch({ pageNo: newPage, pageSize });
    } catch (e) {
      // ignore
    }
  };

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  // Sort products based on selected option
  const getSortedProducts = () => {
    let sorted = [...allProducts];

    // Apply price range filter
    sorted = sorted.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "latest":
        // Reverse order to show latest items first
        sorted.reverse();
        break;
      default:
        break;
    }

    return sorted;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
            <Navbar />
            <NavigationBar />

      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onFilterChange={(newPriceRange, newSelectedFilters) => {
            setPriceRange(newPriceRange);
            setSelectedFilters(newSelectedFilters);
          }}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Category Header */}
          <div className="border-b border-border bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {categoryName}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Seamless experience for every customer
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {allProducts.length} products
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="ml-2"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>

              {/* Search Input */}
              <div className="mt-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">Searching...</span>}

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
                  {showSearchResults && searchResults.length === 0 && searchQuery.trim().length > 0 && !isSearching && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
                      <p className="text-sm text-muted-foreground text-center">No products found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="border-b border-border bg-background/95 backdrop-blur sticky top-14 sm:top-16 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
             {/*    <div className="flex items-center gap-3">
        
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                 
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="hidden lg:flex"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isFilterOpen ? "Hide" : "Show"} Filters
                  </Button>
                </div> */}

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-soft z-50">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Page size selector */}
                  <Select value={String(pageSize)} onValueChange={(val) => {
                    const newSize = Number(val);
                    setPageSize(newSize);
                    setPageNo(1);
                    try {
                      refetch({ pageNo: 1, pageSize: newSize });
                    } catch (e) {
                      // ignore
                    }
                  }}>
                    <SelectTrigger className="w-28 sm:w-32 ml-2">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-soft z-50">
                      {[5, 10, 15, 20].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} per page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isCategoryView && categoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader />
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid" 
                      ? "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" 
                      : "flex flex-col gap-4"
                  }
                >
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                      <div
                        key={product.id}
                        className={viewMode === "list" ? "flex gap-4 p-4 border border-border rounded-lg bg-background hover:shadow-md transition-shadow w-64" : ""}
                      >
                 {/*      {viewMode === "list" && (
                        <div className="flex-shrink-0 w-24 h-24">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )} */}
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <ProductCard
                          {...product}
                          isInWishlist={isInWishlist(product.id)}
                          onAddToWishlist={handleAddToWishlist}
                          isListView={viewMode === "list"}
                        />
                      </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  )}
                </div>
              )}

            {/* Pagination Controls */}
            {(() => {
              const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
              const shouldShowPagination = totalCount > pageSize || totalPages > 1 || totalCount > 0;
              
              console.log('Pagination Debug:', { 
                totalCount, 
                pageSize, 
                totalPages, 
                shouldShowPagination, 
                pageNo, 
                isCategoryView,
                productsLength: allProducts.length,
                dataLength: data?.allB2CProduct?.product?.length,
                hasData: !!data,
                loading 
              });
              
              return shouldShowPagination ? (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleChangePage(pageNo - 1)} 
                    disabled={pageNo === 1 || loading}
                  >
                    Prev
                  </Button>

                  {/* Page Info */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded text-sm">
                    Page {pageNo} of {totalPages} ({totalCount} total items)
                  </div>

                  {/* Page numbers (windowed) */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [] as number[];
                      const start = Math.max(1, pageNo - 2);
                      const end = Math.min(totalPages, pageNo + 2);

                      if (start > 1) pages.push(1);
                      if (start > 2) pages.push(-1); // ellipsis

                      for (let p = start; p <= end; p++) pages.push(p);

                      if (end < totalPages - 1) pages.push(-1);
                      if (end < totalPages) pages.push(totalPages);

                      return pages.map((p, i) =>
                        p === -1 ? (
                          <span key={i} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handleChangePage(p)}
                            className={`px-3 py-1 rounded transition-colors ${
                              p === pageNo 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-background border border-border hover:bg-muted'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleChangePage(pageNo + 1)} 
                    disabled={pageNo >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
 
  );
};

export default Category;