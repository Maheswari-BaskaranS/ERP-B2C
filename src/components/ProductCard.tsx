import { Heart, Plus, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isOrganic?: boolean;
  isFresh?: boolean;
  unit: string;
  onAddToWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  isListView?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  isOrganic,
  isFresh,
  unit,
  onAddToWishlist,
  isInWishlist,
  isListView,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Generate gradient color based on product name
  const getGradientColor = () => {
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
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[hash % colors.length];
  };

  const hasImage = image && !imageError;

  return (
    <Link
      to={`/product/${id}`}
      className="group relative bg-card rounded-2xl shadow-card hover:shadow-soft transition-all duration-300 overflow-hidden block"
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-muted/30 ${isListView ? "h-20" : "aspect-square"}`}>
        {hasImage ? (
          <img
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradientColor()} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
            <div className="flex flex-col items-center justify-center">
              <Package className="h-12 w-12 text-white/80 mb-2" />
              <span className="text-white/70 text-xs font-medium text-center px-2 line-clamp-2">{name}</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOrganic && <Badge variant="organic">Organic</Badge>}
          {isFresh && <Badge variant="fresh">Fresh</Badge>}
          {discount > 0 && (
            <Badge variant="destructive" className="font-bold">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Heart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault(); // ⛔ stop navigation
            onAddToWishlist?.(id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow 
              `}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Quick Add Button */}
        {/* <Button
          size="icon"
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90 shadow-lg"
        >
          <Plus className="h-4 w-4" />
        </Button> */}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">/{unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;