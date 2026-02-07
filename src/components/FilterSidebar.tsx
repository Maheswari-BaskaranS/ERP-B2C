import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronRight } from "lucide-react";
import { GET_ALL_B2C_PRODUCT_CATEGORIES } from "@/graphql/Product/productFilterQueries";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange?: (priceRange: number[], selectedFilters: string[]) => void;
}

const FilterSidebar = ({ isOpen, onClose, onFilterChange }: FilterSidebarProps) => {
  const navigate = useNavigate();
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_ALL_B2C_PRODUCT_CATEGORIES);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const categories = categoriesData?.allB2CProductCategory?.productCategory || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const VISIBLE_CATEGORY_LIMIT = 12;

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    onClose();
    navigate(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  const handlePriceChange = (newPrice: number[]) => {
    setPriceRange(newPrice);
    onFilterChange?.(newPrice, selectedFilters);
  };

  const handleFilterToggle = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    setSelectedFilters(newFilters);
    onFilterChange?.(priceRange, newFilters);
  };

  const filterCategories = [
    {
      title: "Categories",
      filters: categories.map((cat: any) => ({
        id: cat.categoryId.toString(),
        label: cat.categoryName,
        count: 0,
        categoryId: cat.categoryId,
      })),
      isCategory: true,
    },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setPriceRange([0, 100000]);
    onFilterChange?.([0, 100000], []);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky inset-y-0 left-0 lg:inset-auto lg:top-14 z-50 w-80 bg-background border-r border-border
        transform transition-transform duration-300 lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto lg:max-h-[calc(100vh-56px)]
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Filters */}
          {selectedFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Active Filters</span>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.map(filterId => {
                  const filter = filterCategories
                    .flatMap(cat => cat.filters)
                    .find(f => f.id === filterId);
                  return (
                    <Badge 
                      key={filterId} 
                      variant="secondary" 
                      className="pr-1"
                    >
                      {filter?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-transparent"
                        onClick={() => toggleFilter(filterId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Price Range</Label>
            <div className="px-3 mb-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={100000}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Filter Categories */}
          {filterCategories.map((category, index) => (
            <div key={category.title} className="mb-6">
              <Label className="text-sm font-medium mb-3 block">
                {category.title}
              </Label>

              {/* Search box for large category lists */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category chips/grid */}
              <div className="grid grid-cols-2 gap-2">
                {category.filters
                  .filter((f: any) => f.label.toLowerCase().includes(searchTerm.toLowerCase()))
                  .slice(0, showAllCategories ? undefined : VISIBLE_CATEGORY_LIMIT)
                  .map((filter: any) => (
                    <button
                      key={filter.id}
                      onClick={() => handleCategoryClick(filter.categoryId, filter.label)}
                      className="text-left p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="truncate">{filter.label}</span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Show more / Show less */}
              {category.filters.filter((f: any) => f.label.toLowerCase().includes(searchTerm.toLowerCase())).length > VISIBLE_CATEGORY_LIMIT && (
                <div className="mt-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowAllCategories((s) => !s)}>
                    {showAllCategories ? "Show less" : `Show all (${category.filters.length})`}
                  </Button>
                </div>
              )}

              {index < filterCategories.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;