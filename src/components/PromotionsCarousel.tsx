import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GET_ALL_B2C_BANNER_IMAGES } from "@/graphql/ecommerce/b2cBannerQueries";
import Loader from "@/components/ui/loader";

const PromotionsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data, loading, error } = useQuery(GET_ALL_B2C_BANNER_IMAGES);
  const banners = data?.allB2CBannerImage?.bannerImage || [];
  // Sort banners by displayOrder
  const sortedBanners = [...banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  useEffect(() => {
    if (!sortedBanners.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sortedBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sortedBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sortedBanners.length) % sortedBanners.length);
  };

  if (loading) {
    return <div className="py-8 text-center"><Loader /></div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">Failed to load banners.</div>;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-soft">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sortedBanners.map((banner) => (
              <div
                key={banner.bannerId}
                className="w-full flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 px-6 sm:px-8 py-8 sm:py-12 flex flex-col md:flex-row items-center md:items-start">
                  {/* Banner Image */}
                  {banner.bannerImageFilePath && (
                    <img
                      src={banner.bannerImageFilePath}
                      alt={banner.title || 'Banner'}
                      className="w-full md:w-1/3 h-48 object-cover rounded-xl mb-4 md:mb-0 md:mr-8 md:ml-48 shadow-lg bg-white"
                    />
                  )}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-2">
                      <span role="img" aria-label="promo" className="text-3xl">🎉</span>
                      <span className="bg-white/20 px-3 py-1 rounded-lg text-white shadow font-bold tracking-wide">{banner.title}</span>
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-white/90 mb-2 max-w-xl mx-auto md:mx-0 drop-shadow">
                      {banner.description}
                    </p>
                    {banner.additionDesc && (
                      <p className="text-base text-white/80 mb-4 max-w-lg mx-auto md:mx-0 italic animate-pulse">
                        {banner.additionDesc}
                      </p>
                    )}
                    <Link to="/products">
                      <Button 
                        variant="secondary" 
                        size="lg"
                        className="mt-2 bg-white text-purple-700 hover:bg-white/90 font-bold shadow-lg px-8 py-2 text-lg transition-all duration-200 w-full sm:w-auto"
                      >
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {sortedBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionsCarousel;