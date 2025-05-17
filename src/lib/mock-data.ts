import { formatDistanceToNow } from 'date-fns';

export type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string; // Formatted date string (e.g. "3 months ago")
  actualDate: Date; // Actual Date object for filtering
  relevanceScore: number;
  url: string;
};

export type SearchFilter = {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  categories?: string[];
  minRelevanceScore?: number;
};

// Generate random dates within the last year
const getRandomDate = () => {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 12);
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

// Categories - defined at module level for consistency
export const CATEGORIES = [
  'Technology',
  'Science',
  'Business',
  'Health',
  'Education',
];

// Create 50 mock search results
export const mockSearchResults: SearchResult[] = Array.from({ length: 50 }).map((_, index) => {
  const randomDate = getRandomDate();
  // Ensure we get a consistent category for each index
  const categoryIndex = index % CATEGORIES.length;
  const category = CATEGORIES[categoryIndex];
  const relevanceScore = Math.floor(Math.random() * 100) / 100;
  
  return {
    id: `result-${index + 1}`,
    title: `${category} Result ${index + 1}: Lorem ipsum dolor sit amet`,
    excerpt: `This is a summary of ${category} search result ${index + 1}. It contains highlighted terms that match your search query.`,
    content: `${category}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultricies, nunc nisl ultricies nisl, eget ultricies nisl nisl eget ultricies. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultricies, nunc nisl ultricies nisl, eget ultricies nisl nisl eget ultricies.`,
    category,
    actualDate: randomDate, // Store the actual Date object
    date: formatRelativeTime(randomDate),
    relevanceScore,
    url: `https://example.com/${category.toLowerCase()}/document-${index + 1}`,
  };
});

// Get available categories from mock data
export const getAvailableCategories = () => {
  console.log('Available categories:', CATEGORIES);
  return CATEGORIES;
}; 