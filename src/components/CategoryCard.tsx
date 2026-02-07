import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  itemCount: number;
}

const CategoryCard = ({ title, description, image, itemCount }: CategoryCardProps) => {
  return (
    <Link to="/products" className="block group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-2">
          <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
            {itemCount}+ items
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white/90 text-foreground hover:bg-white group-hover:translate-x-1 transition-transform"
        >
          Shop {title}
          <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      </div>
    </Link>
  );
};

export default CategoryCard;