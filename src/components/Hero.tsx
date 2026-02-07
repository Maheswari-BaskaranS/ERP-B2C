import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GET_ALL_B2C_BANNER_IMAGES } from "@/graphql/ecommerce/b2cBannerQueries";
import Skeleton from "@/components/ui/skeleton";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data, loading, error } = useQuery(GET_ALL_B2C_BANNER_IMAGES);
  const banners = data?.allB2CBannerImage?.bannerImage || [];
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
    return <Skeleton variant="hero" />;
  }

  // If no banners, show default hero
  if (!sortedBanners.length || error) {
    return (
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Leaf className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">100% Fresh & Organic</span>
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                  Fresh Produce
                  <br />
                  <span className="text-white/90">Delivered Daily</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
                  Get the freshest fruits and vegetables delivered straight to your door. 
                  Quality guaranteed, sustainably sourced.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/products">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto">
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = sortedBanners[currentSlide];

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-soft">
          {/* Carousel */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sortedBanners.map((banner) => (
              <div
                key={banner.bannerId}
                className="w-full flex-shrink-0 relative overflow-hidden h-96 sm:h-[450px] lg:h-[500px]"
              >
                {/* Background Image */}
                {banner.bannerImageFilePath ? (
                  <img
                    src={banner.bannerImageFilePath}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-hero-gradient" />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full px-6 sm:px-8 lg:px-12 text-center">
                    <div className="max-w-2xl mx-auto">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                        {banner.title}
                      </h1>
                      
                      {banner.description && (
                        <p className="text-lg sm:text-xl text-white/90 mb-6 mx-auto">
                          {banner.description}
                        </p>
                      )}

                      {banner.additionDesc && (
                        <p className="text-base sm:text-lg text-white/80 mb-8 italic">
                          {banner.additionDesc}
                        </p>
                      )}

                      <Link to="/products">
                        <Button 
                          size="lg" 
                          className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg px-8 py-2 text-lg"
                        >
                          Shop Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {sortedBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-10"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-10"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;