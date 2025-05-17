import { mockSearchResults, SearchResult, SearchFilter } from './mock-data';

// Simulate network latency for realistic behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search function that implements filtering and pagination
export async function searchDocuments(
  query: string, 
  filters: SearchFilter = {}, 
  page: number = 1, 
  limit: number = 10,
  sortBy: 'relevance' | 'date' = 'relevance',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ results: SearchResult[], total: number }> {
  // Simulate API request delay
  await delay(800);
  
  console.log('Starting search with filters:', JSON.stringify(filters, null, 2));
  console.log('Sorting by:', sortBy, 'in order:', sortOrder);
  
  // Filter results based on search query and filters
  let results = [...mockSearchResults];
  
  // Apply search query filtering (simple case-insensitive contains)
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.content.toLowerCase().includes(lowerQuery)
    );
  }
  // Otherwise, when query is empty, all results will be included (no filtering)
  
  // Apply category filters
  if (filters.categories && filters.categories.length > 0) {
    console.log('Filtering by categories:', filters.categories);
    
    const beforeCount = results.length;
    results = results.filter(item => {
      const found = filters.categories?.some(
        category => category.toLowerCase() === item.category.toLowerCase()
      );
      console.log(`Item category: ${item.category}, match: ${found}`);
      return found;
    });
    console.log(`Category filtering: ${beforeCount} results → ${results.length} results`);
  }
  
  // Apply date range filter using actualDate field for proper date comparison
  if (filters.dateRange?.from || filters.dateRange?.to) {
    console.log('Filtering by date range:', 
      filters.dateRange.from ? filters.dateRange.from.toISOString() : 'none', 
      'to', 
      filters.dateRange.to ? filters.dateRange.to.toISOString() : 'none'
    );
    
    const beforeCount = results.length;
    results = results.filter(item => {
      // Check if the item's date is within the date range
      let isInRange = true;
      
      if (filters.dateRange?.from) {
        // Item date must be greater than or equal to from date
        isInRange = isInRange && item.actualDate >= filters.dateRange.from;
      }
      
      if (filters.dateRange?.to) {
        // Item date must be less than or equal to to date
        isInRange = isInRange && item.actualDate <= filters.dateRange.to;
      }
      
      return isInRange;
    });
    
    console.log(`Date range filtering: ${beforeCount} results → ${results.length} results`);
  }
  
  // Apply relevance score filter
  if (filters.minRelevanceScore !== undefined) {
    results = results.filter(item => 
      item.relevanceScore >= (filters.minRelevanceScore || 0)
    );
  }
  
  // Apply sorting
  if (sortBy === 'relevance') {
    // Sort by relevance score
    results = results.sort((a, b) => 
      sortOrder === 'desc' 
        ? b.relevanceScore - a.relevanceScore  // Higher score first
        : a.relevanceScore - b.relevanceScore  // Lower score first
    );
  } else if (sortBy === 'date') {
    // Sort by date
    results = results.sort((a, b) => {
      if (sortOrder === 'desc') {
        // Newest first (b - a)
        return b.actualDate.getTime() - a.actualDate.getTime();
      } else {
        // Oldest first (a - b)
        return a.actualDate.getTime() - b.actualDate.getTime();
      }
    });
  }
  
  // Get total before pagination
  const total = results.length;
  
  console.log(`Found ${total} results after filtering`);
  
  // Apply pagination
  const start = (page - 1) * limit;
  const paginatedResults = results.slice(start, start + limit);
  
  return { 
    results: paginatedResults,
    total
  };
}

// Autocomplete suggestions function
export async function getSuggestions(query: string): Promise<string[]> {
  // Simulate API request delay
  await delay(300);
  
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Get unique words from titles and content that match the query
  const allWords = mockSearchResults.flatMap(item => {
    const titleWords = item.title.split(/\s+/);
    const contentWords = item.content.split(/\s+/).slice(0, 20); // Limit content words
    return [...titleWords, ...contentWords];
  });
  
  // Filter for words that start with the query
  const matchingWords = [...new Set(
    allWords.filter(word => 
      word.toLowerCase().startsWith(lowerQuery) && 
      word.length > 3 // Ignore short words
    )
  )];
  
  // Return top 5 suggestions
  return matchingWords.slice(0, 5);
} 