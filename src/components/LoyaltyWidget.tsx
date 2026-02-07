import { Progress } from "@/components/ui/progress";
import { Star, Gift } from "lucide-react";

interface LoyaltyWidgetProps {
  currentPoints?: number;
  nextRewardPoints?: number;
  rewardName?: string;
}

const LoyaltyWidget = ({ 
  currentPoints = 750, 
  nextRewardPoints = 1000,
  rewardName = "Free Organic Box"
}: LoyaltyWidgetProps) => {
  const progressPercentage = (currentPoints / nextRewardPoints) * 100;
  const pointsToNext = nextRewardPoints - currentPoints;

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-hero-gradient rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Rewards Progress</h3>
            <p className="text-xs text-muted-foreground">{currentPoints} points earned</p>
          </div>
        </div>
        <Gift className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            {pointsToNext} points to {rewardName}
          </span>
          <span className="font-medium text-primary">
            {currentPoints}/{nextRewardPoints}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyWidget;