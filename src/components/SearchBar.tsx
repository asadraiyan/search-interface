'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce, useSearchHistory } from '@/lib/hooks';
import { getSuggestions } from '@/lib/search-service';

type SearchBarProps = {
  onSearch: (query: string) => void;
  initialQuery?: string;
};

export function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { searchHistory, addToHistory } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handle clicks outside the suggestions panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) && 
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit search even with empty query - this will show all results
    if (query.trim()) {
      addToHistory(query);
    }
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    addToHistory(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    onSearch(historyItem);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search or leave empty to show all documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="pr-24 rounded-lg border-2 h-12 text-base"
        />
        <div className="absolute right-1 top-1 flex space-x-1">
          {query && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={clearSearch}
              className="h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button type="submit" className="h-10">
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Suggestions and history panel */}
      {showSuggestions && (query.length > 0 || searchHistory.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-64 overflow-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2 py-1">Suggestions</h3>
              <ul>
                {suggestions.map((suggestion) => (
                  <li 
                    key={suggestion}
                    className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && debouncedQuery && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          )}

          {/* Search history */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground px-2 py-1">Recent searches</h3>
              <ul>
                {searchHistory.map((item) => (
                  <li 
                    key={item}
                    className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No results */}
          {!isLoading && query && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 