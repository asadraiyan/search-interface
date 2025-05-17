'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { CalendarIcon, Filter, X, SlidersHorizontal } from 'lucide-react';
import { getAvailableCategories } from '@/lib/mock-data';
import { SearchFilter } from '@/lib/mock-data';

type SearchFiltersProps = {
  onApplyFilters: (filters: SearchFilter) => void;
  activeFilters: SearchFilter;
};

export function SearchFilters({ onApplyFilters, activeFilters }: SearchFiltersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
  const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilter>(activeFilters);
  const categories = getAvailableCategories();
  
  // Count active filters
  const activeFilterCount = (
    (localFilters.categories?.length || 0) +
    (localFilters.dateRange?.from ? 1 : 0) +
    (localFilters.dateRange?.to ? 1 : 0) +
    (localFilters.minRelevanceScore ? 1 : 0)
  );

  // Update local filters without applying them immediately
  const updateLocalFilters = (newFilters: SearchFilter) => {
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Only apply filters when Apply button is clicked
    onApplyFilters(localFilters);
    setIsDialogOpen(false);
    setIsPopoverOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilter = {};
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    setIsDialogOpen(false);
    setIsPopoverOpen(false);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    console.log(`Category ${category} changed to ${checked}`);
    
    const newFilters = {...localFilters};
    const currentCategories = newFilters.categories || [];
    
    if (checked) {
      newFilters.categories = [...currentCategories, category];
    } else {
      newFilters.categories = currentCategories.filter(c => c !== category);
    }
    
    // If no categories selected, set to undefined instead of empty array
    if (newFilters.categories?.length === 0) {
      newFilters.categories = undefined;
    }
    
    console.log('Updated local filters:', newFilters);
    updateLocalFilters(newFilters);
  };

  const handleRelevanceChange = (value: string) => {
    const numValue = parseFloat(value);
    const newFilters = {
      ...localFilters,
      minRelevanceScore: isNaN(numValue) ? undefined : numValue
    };
    
    updateLocalFilters(newFilters);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    const currentDateRange = localFilters.dateRange || { from: undefined, to: undefined };
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...currentDateRange,
        from: date
      }
    };
    
    updateLocalFilters(newFilters);
    setIsFromCalendarOpen(false);
  };

  const handleDateToChange = (date: Date | undefined) => {
    const currentDateRange = localFilters.dateRange || { from: undefined, to: undefined };
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...currentDateRange,
        to: date
      }
    };
    
    updateLocalFilters(newFilters);
    setIsToCalendarOpen(false);
  };

  // Reset local filters when the dialog/popover opens to match active filters
  const handleOpenChange = (open: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (open) {
      setLocalFilters(activeFilters);
    }
    setter(open);
  };

  // For small screens, use a dialog
  const MobileFilters = () => (
    <>
      <Button 
        type="button"
        variant="outline" 
        className="md:hidden flex items-center gap-2"
        onClick={() => handleOpenChange(true, setIsDialogOpen)}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isDialogOpen && (
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => handleOpenChange(open, setIsDialogOpen)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Search Filters</DialogTitle>
              <DialogDescription>
                Refine your search results using these filters.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {FiltersContent}
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  // For larger screens, use a popover - fixed implementation that properly follows shadcn/ui pattern
  const DesktopFilters = () => (
    <Popover 
      open={isPopoverOpen} 
      onOpenChange={(open) => handleOpenChange(open, setIsPopoverOpen)}
    >
      <PopoverTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          className="hidden md:flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50 p-4" align="start" side="bottom">
        <div className="grid gap-4">
          {FiltersContent}
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Common filter content
  const FiltersContent = (
    <>
      {/* Date Range */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Date Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-muted-foreground">From</span>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 mt-1"
              size="sm"
              onClick={() => setIsFromCalendarOpen(!isFromCalendarOpen)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localFilters.dateRange?.from ? (
                <span>{localFilters.dateRange.from.toLocaleDateString()}</span>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
            {isFromCalendarOpen && (
              <div className="absolute mt-1 bg-background border rounded-md shadow-md z-50">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange?.from}
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </div>
            )}
          </div>
          <div>
            <span className="text-xs text-muted-foreground">To</span>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 mt-1"
              size="sm"
              onClick={() => setIsToCalendarOpen(!isToCalendarOpen)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localFilters.dateRange?.to ? (
                <span>{localFilters.dateRange.to.toLocaleDateString()}</span>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
            {isToCalendarOpen && (
              <div className="absolute mt-1 bg-background border rounded-md shadow-md z-50">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange?.to}
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div className="flex items-center space-x-2" key={category}>
              <Checkbox 
                id={`category-${category}`}
                checked={localFilters.categories?.includes(category)} 
                onCheckedChange={(checked) => 
                  handleCategoryChange(category, checked === true)
                }
              />
              <label 
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Relevance Score */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Minimum Relevance Score</h3>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            min="0" 
            max="1" 
            step="0.1"
            value={localFilters.minRelevanceScore || ''}
            onChange={(e) => handleRelevanceChange(e.target.value)}
            className="h-9"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">(0-1)</span>
        </div>
      </div>
    </>
  );

  // Render active filter pills - these show the APPLIED filters (activeFilters)
  const ActiveFilterPills = () => {
    if ((activeFilters.categories?.length || 0) +
        (activeFilters.dateRange?.from ? 1 : 0) +
        (activeFilters.dateRange?.to ? 1 : 0) +
        (activeFilters.minRelevanceScore ? 1 : 0) === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {activeFilters.categories?.map((category) => (
          <div 
            key={category}
            className="bg-muted text-xs px-2 py-1 rounded-full flex items-center"
          >
            <span>{category}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => {
                const newFilters = {...activeFilters};
                newFilters.categories = activeFilters.categories?.filter(c => c !== category);
                onApplyFilters(newFilters);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {activeFilters.dateRange?.from && (
          <div className="bg-muted text-xs px-2 py-1 rounded-full flex items-center">
            <span>From: {activeFilters.dateRange.from.toLocaleDateString()}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => {
                const newFilters = {...activeFilters};
                if (newFilters.dateRange) {
                  newFilters.dateRange.from = undefined;
                }
                onApplyFilters(newFilters);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {activeFilters.dateRange?.to && (
          <div className="bg-muted text-xs px-2 py-1 rounded-full flex items-center">
            <span>To: {activeFilters.dateRange.to.toLocaleDateString()}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => {
                const newFilters = {...activeFilters};
                if (newFilters.dateRange) {
                  newFilters.dateRange.to = undefined;
                }
                onApplyFilters(newFilters);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {activeFilters.minRelevanceScore !== undefined && (
          <div className="bg-muted text-xs px-2 py-1 rounded-full flex items-center">
            <span>Min Score: {activeFilters.minRelevanceScore}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => {
                const newFilters = {...activeFilters};
                newFilters.minRelevanceScore = undefined;
                onApplyFilters(newFilters);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <MobileFilters />
        <DesktopFilters />
        
        {((activeFilters.categories?.length || 0) +
          (activeFilters.dateRange?.from ? 1 : 0) +
          (activeFilters.dateRange?.to ? 1 : 0) +
          (activeFilters.minRelevanceScore ? 1 : 0)) > 0 && (
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <ActiveFilterPills />
    </div>
  );
} 