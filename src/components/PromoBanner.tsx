import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Gift } from "lucide-react";

interface PromoBannerProps {
  message?: string;
  dismissible?: boolean;
}

const PromoBanner = ({ 
  message = "Welcome to Our Online Store — Happy Shopping!",
  dismissible = true 
}: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center text-center gap-2">
          <Gift className="h-4 w-4" />
          <span className="text-sm font-medium">
            {message}
          </span>
          {dismissible && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;