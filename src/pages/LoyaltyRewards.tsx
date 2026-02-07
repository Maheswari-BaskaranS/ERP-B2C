import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Gift, Star, Trophy, Zap, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  available: boolean;
}

const LoyaltyRewards = () => {
  const [currentPoints, setCurrentPoints] = useState(1250);
  const [tier, setTier] = useState("Gold");
  const [pointsHistory] = useState([
    { id: "1", date: "2024-01-10", description: "Order #12345", points: 45 },
    { id: "2", date: "2024-01-08", description: "Order #12344", points: 28 },
    { id: "3", date: "2024-01-05", description: "Order #12343", points: 62 },
    { id: "4", date: "2024-01-03", description: "Referral Bonus", points: 100 },
  ]);

  const rewards: Reward[] = [
    {
      id: "1",
      title: "$5 Off Next Order",
      description: "Get $5 discount on your next purchase",
      points: 500,
      icon: <Gift className="h-6 w-6" />,
      available: true,
    },
    {
      id: "2",
      title: "Free Delivery",
      description: "Free delivery on your next order",
      points: 300,
      icon: <Zap className="h-6 w-6" />,
      available: true,
    },
    {
      id: "3",
      title: "$10 Off Next Order",
      description: "Get $10 discount on your next purchase",
      points: 1000,
      icon: <Gift className="h-6 w-6" />,
      available: true,
    },
    {
      id: "4",
      title: "$20 Off Next Order",
      description: "Get $20 discount on your next purchase",
      points: 2000,
      icon: <Gift className="h-6 w-6" />,
      available: false,
    },
    {
      id: "5",
      title: "Premium Box",
      description: "Get a premium selection box for free",
      points: 1500,
      icon: <Award className="h-6 w-6" />,
      available: false,
    },
    {
      id: "6",
      title: "VIP Membership (1 Month)",
      description: "Unlock exclusive deals and early access",
      points: 3000,
      icon: <Trophy className="h-6 w-6" />,
      available: false,
    },
  ];

  const handleRedeem = (reward: Reward) => {
    if (currentPoints >= reward.points) {
      setCurrentPoints(currentPoints - reward.points);
      toast.success(`Successfully redeemed: ${reward.title}`);
    } else {
      toast.error("Insufficient points for this reward");
    }
  };

  const nextTierPoints = 2000;
  const progressToNextTier = (currentPoints / nextTierPoints) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Loyalty Rewards</h1>
              <p className="text-muted-foreground">Earn points and redeem amazing rewards</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Points Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Your Points Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {currentPoints.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mb-4">Available Points</p>
                    <Badge variant="secondary" className="text-base px-4 py-1">
                      <Star className="h-4 w-4 mr-2" />
                      {tier} Member
                    </Badge>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress to Platinum</span>
                      <span className="text-sm font-medium">
                        {currentPoints} / {nextTierPoints}
                      </span>
                    </div>
                    <Progress value={progressToNextTier} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Earn {nextTierPoints - currentPoints} more points to unlock Platinum benefits
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Earning Info */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Every Purchase</p>
                      <p className="text-xs text-muted-foreground">
                        Earn 1 point for every $1 spent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Referral Bonus</p>
                      <p className="text-xs text-muted-foreground">
                        Get 100 points for each friend
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Product Reviews</p>
                      <p className="text-xs text-muted-foreground">
                        Earn 25 points per review
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Rewards */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Redeem Your Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map((reward) => {
                    const canRedeem = currentPoints >= reward.points;
                    return (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-lg border transition-all ${
                          canRedeem
                            ? "border-primary/20 bg-primary/5"
                            : "border-border bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              canRedeem ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {reward.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{reward.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {reward.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            {reward.points} points
                          </span>
                          <Button
                            size="sm"
                            disabled={!canRedeem}
                            onClick={() => handleRedeem(reward)}
                          >
                            Redeem
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Points History */}
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pointsHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary">
                          +{item.points}
                        </span>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoyaltyRewards;
