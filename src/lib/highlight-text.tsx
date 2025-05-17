'use client';

import React from 'react';

type HighlightProps = {
  text: string;
  searchTerm: string;
  className?: string;
};

export function highlightText({ text, searchTerm, className = "bg-yellow-200" }: HighlightProps) {
  if (!searchTerm.trim()) {
    return <span>{text}</span>;
  }
  
  // Escape special characters in the search term for regex
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split text by search term and create array of parts
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
        return isMatch 
          ? <mark key={i} className={className}>{part}</mark> 
          : <span key={i}>{part}</span>;
      })}
    </span>
  );
} 