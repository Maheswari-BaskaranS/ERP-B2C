import { GET_ALL_B2C_PRODUCT_CATEGORIES, GET_PRODUCTS_BY_CATEGORY_ID } from "@/graphql/Product/productFilterQueries";
import { useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";

const Catcarousel = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ALL_B2C_PRODUCT_CATEGORIES);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = data?.allB2CProductCategory?.productCategory || [];

  // Generate gradient color based on category name
  const getGradientColor = (categoryName: string) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-orange-400 to-orange-600",
      "from-red-400 to-red-600",
      "from-cyan-400 to-cyan-600",
      "from-indigo-400 to-indigo-600",
    ];
    const hash = categoryName.charCodeAt(0) + categoryName.charCodeAt(categoryName.length - 1);
    return colors[hash % colors.length];
  };

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    navigate(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  // Auto-scroll carousel
  useEffect(() => {
    if (isHovered || categories.length === 0) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => prev + 2);
    }, 50);

    return () => clearInterval(interval);
  }, [isHovered, categories.length]);

  // Reset scroll when reaching end
  useEffect(() => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      if (scrollPosition >= maxScroll) {
        setScrollPosition(0);
      }
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  if (loading) {
    return <Skeleton variant="carousel" count={6} />;
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
        
        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-6 overflow-x-hidden scroll-smooth pb-4"
        >
          {/* Duplicate categories for seamless loop */}
          {[...categories, ...categories].map((category: any, index: number) => (
            <div
              key={`${category.categoryId}-${index}`}
              className="flex-shrink-0 w-48 group cursor-pointer transition-all duration-300"
              onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}
            >
              <div className="relative rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                {/* Background Image */}
                <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  {category.categoryImage ? (
                    <img
                      src={category.categoryImage}
                      alt={category.categoryName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradientColor(category.categoryName)} flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Layers className="h-12 w-12 text-white/80 mb-2" />
                      <span className="text-white/70 text-xs font-medium text-center px-2">{category.categoryName}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
                    {category.categoryName}
                  </h3>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catcarousel;