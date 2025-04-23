// hooks/use-media-query.ts
"use client"; // This hook relies on browser APIs

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Function to update state based on match status
    const listener = () => setMatches(mediaQueryList.matches);

    // Set the initial state
    listener();

    // Add listener for changes
    // Using addEventListener for modern browsers, could use addListener for older ones if needed
    try {
        mediaQueryList.addEventListener('change', listener);
    } catch (e) {
        // Fallback for older browsers (e.g., Safari < 14)
        try {
            mediaQueryList.addListener(listener);
        } catch (e2) {
            console.error("useMediaQuery: addEventListener/addListener failed", e2);
        }
    }


    // Cleanup listener on component unmount
    return () => {
      try {
          mediaQueryList.removeEventListener('change', listener);
      } catch (e) {
          // Fallback for older browsers
          try {
              mediaQueryList.removeListener(listener);
          } catch (e2) {
              console.error("useMediaQuery: removeEventListener/removeListener failed", e2);
          }
      }
    };
  }, [query]); // Re-run effect if query changes

  return matches;
}