'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Clock, Tag, ArrowRight, Star } from 'lucide-react';
import { SearchResult } from '@/lib/mock-data';
import { highlightText } from '@/lib/highlight-text';

type SearchResultItemProps = {
  result: SearchResult;
  searchTerm: string;
  index: number;
};

export function SearchResultItem({ result, searchTerm, index }: SearchResultItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Truncate text to a certain length
  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Excerpt with highlighted search term
  const highlightedExcerpt = highlightText({
    text: result.excerpt,
    searchTerm,
  });
  
  // Title with highlighted search term
  const highlightedTitle = highlightText({
    text: result.title,
    searchTerm,
    className: "bg-primary/20 text-primary-foreground px-1 rounded"
  });
  
  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${index === 0 ? 'animate-in fade-in-50 slide-in-from-top-5' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 relative">
        {/* Document Preview Tooltip on Hover */}
        {isHovered && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  ref={previewRef}
                  className="absolute right-4 top-4 h-6 w-6 bg-muted rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Document Preview</h4>
                  <p className="text-xs text-muted-foreground">
                    {truncateText(result.content, 250)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="space-y-4">
          {/* Relevance Score */}
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span>Score: {result.relevanceScore.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Result Title */}
          <h3 className="text-lg font-medium">
            {highlightedTitle}
          </h3>
          
          {/* Result Excerpt */}
          <p className="text-sm text-muted-foreground">
            {highlightedExcerpt}
          </p>
          
          {/* Result Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{result.date}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              <span>{result.category}</span>
            </div>
            <div className="flex-grow"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs flex items-center gap-1" 
              onClick={() => window.open(result.url, '_blank')}
            >
              View <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* URL Indicator */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
          <a 
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background text-xs text-muted-foreground px-2 py-1 border rounded-full flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {result.url.replace(/^https?:\/\//, '')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
} 