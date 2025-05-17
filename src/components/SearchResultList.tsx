'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchResultItem } from '@/components/SearchResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntersectionObserver } from '@/lib/hooks';
import { SearchResult } from '@/lib/mock-data';
import { AlertCircle } from 'lucide-react';

type SearchResultListProps = {
  results: SearchResult[];
  totalResults: number;
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export function SearchResultList({
  results,
  totalResults,
  searchTerm,
  isLoading,
  isError,
  hasMore,
  onLoadMore,
}: SearchResultListProps) {
  const { setNode, entry } = useIntersectionObserver({
    rootMargin: '200px',
  });
  
  // Load more results when the user scrolls to the bottom
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [entry, hasMore, isLoading, onLoadMore]);
  
  // Initial loading state (no results yet)
  if (isLoading && results.length === 0) {
    return <SearchResultSkeleton />;
  }
  
  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't load your search results. Please try again later.
        </p>
      </div>
    );
  }
  
  // No results found
  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm 
            ? `We couldn't find any results for "${searchTerm}". Try adjusting your search or filters.`
            : "No documents match the current filters. Try removing some filters."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Result Count */}
      <div className="text-sm text-muted-foreground">
        {searchTerm 
          ? `Found ${totalResults} results for "${searchTerm}"` 
          : `Showing ${totalResults} documents`}
      </div>
      
      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <SearchResultItem 
            key={result.id} 
            result={result} 
            searchTerm={searchTerm} 
            index={index}
          />
        ))}
        
        {/* Loading more results */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        )}
        
        {/* Intersection observer target */}
        <div ref={setNode} className="h-4" />
      </div>
    </div>
  );
}

function SearchResultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <Skeleton className="h-6 w-64 rounded-md" />
      </div>
      
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-5 w-2/3 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 