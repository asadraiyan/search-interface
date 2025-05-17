'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SearchFilters } from '@/components/SearchFilters';
import { SearchResultList } from '@/components/SearchResultList';
import { searchDocuments } from '@/lib/search-service';
import { SearchResult, SearchFilter } from '@/lib/mock-data';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const RESULTS_PER_PAGE = 10;
  
  // Debugging - log current filters
  useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);
  
  // Main search function
  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Log for debugging
      console.log('Searching with query:', query, 'filters:', filters, 'sort:', sortBy, sortOrder);
      
      const { results: searchResults, total } = await searchDocuments(
        query,
        filters,
        1,
        RESULTS_PER_PAGE,
        sortBy,
        sortOrder
      );
      
      // Log for debugging
      console.log('Search results:', searchResults.length, 'total:', total);
      
      setResults(searchResults);
      setTotalResults(total);
      setHasMore(total > searchResults.length);
    } catch (error) {
      console.error('Error searching documents:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, sortOrder]);
  
  // Load more results when scrolling
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setIsLoading(true);
    
    try {
      const { results: newResults, total } = await searchDocuments(
        searchTerm,
        filters,
        nextPage,
        RESULTS_PER_PAGE,
        sortBy,
        sortOrder
      );
      
      setResults(prev => [...prev, ...newResults]);
      setCurrentPage(nextPage);
      setHasMore(total > [...results, ...newResults].length);
    } catch (error) {
      console.error('Error loading more results:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, hasMore, isLoading, results, searchTerm, sortBy, sortOrder]);
  
  // Apply filters
  const handleApplyFilters = useCallback((newFilters: SearchFilter) => {
    console.log('Applying new filters:', JSON.stringify(newFilters, null, 2));
    
    // Add debugging to see what's changing
    if (newFilters.categories) {
      console.log('Selected categories:', newFilters.categories);
    }
    
    // Apply the filters to the state
    setFilters(prev => {
      console.log('Previous filters:', prev, 'New filters:', newFilters);
      return newFilters;
    });
    
    // Re-run the search with the new filters
    if (searchTerm) {
      setResults([]);
      setCurrentPage(1);
      setIsLoading(true);
      setIsError(false);
      
      // Important: Use the newFilters directly here instead of relying on state update
      searchDocuments(searchTerm, newFilters, 1, RESULTS_PER_PAGE, sortBy, sortOrder)
        .then(({ results: searchResults, total }) => {
          console.log('Filtered results count:', searchResults.length);
          if (searchResults.length > 0) {
            console.log('First result category:', searchResults[0].category);
            console.log('Categories in results:', [...new Set(searchResults.map(r => r.category))]);
          }
          setResults(searchResults);
          setTotalResults(total);
          setHasMore(total > searchResults.length);
        })
        .catch(error => {
          console.error('Error applying filters:', error);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [searchTerm, sortBy, sortOrder]);
  
  // Handle sorting changes
  const handleSortChange = useCallback((newSortBy: 'relevance' | 'date', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Re-run the search with the new sorting
    if (results.length > 0) {
      setResults([]);
      setCurrentPage(1);
      setIsLoading(true);
      
      searchDocuments(searchTerm, filters, 1, RESULTS_PER_PAGE, newSortBy, newSortOrder)
        .then(({ results: searchResults, total }) => {
          console.log('Sorted results count:', searchResults.length);
          setResults(searchResults);
          setTotalResults(total);
          setHasMore(total > searchResults.length);
        })
        .catch(error => {
          console.error('Error sorting results:', error);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [results.length, searchTerm, filters]);
  
  // Optional: Run an initial search when the component mounts
  useEffect(() => {
    // Load all data initially with empty search term
    handleSearch('');
  }, [handleSearch]);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="space-y-8">
        {/* Search Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Document Search</h1>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `Search results for "${searchTerm}"`
              : "Browse through our collection of documents, reports, and articles."}
          </p>
        </div>
        
        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch} 
          initialQuery={searchTerm}
        />
        
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <div className="flex flex-col space-y-4 w-full">
            <SearchFilters 
              onApplyFilters={handleApplyFilters} 
              activeFilters={filters}
            />
            
            {/* Debug info - remove in production */}
            <div className="text-xs text-muted-foreground">
              {filters.categories?.length ? (
                <div>Category filters: {filters.categories.join(', ')}</div>
              ) : null}
              {filters.minRelevanceScore ? (
                <div>Min score: {filters.minRelevanceScore}</div>
              ) : null}
            </div>
          </div>
          
          {/* Sorting Controls */}
          <div className="flex items-center gap-2 md:mt-0 mt-4 w-full md:w-auto">
            <div className="text-sm whitespace-nowrap">Sort by:</div>
            <Select
              value={sortBy}
              onValueChange={(value: 'relevance' | 'date') => {
                handleSortChange(value, sortOrder);
              }}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
            
            <button 
              className="flex items-center text-sm px-2 py-1 rounded border h-9" 
              onClick={() => handleSortChange(sortBy, sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            </button>
          </div>
        </div>
        
        {/* Results */}
        <div className="mt-4">
          <SearchResultList
            results={results}
            totalResults={totalResults}
            searchTerm={searchTerm}
            isLoading={isLoading}
            isError={isError}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  );
} 