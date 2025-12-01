import { useState } from 'react';

export type AddressSuggestion = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
};

export function useAddressLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lookupPostcode = async (postcode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock response
      if (postcode.toUpperCase().replace(/\s/g, '') === 'BA111AA') {
        setSuggestions([
          { line1: 'Mayday Saxonvale', line2: 'Saxonvale', city: 'Frome', postcode: 'BA11 1AA' },
          { line1: '1 The Bridges', line2: '', city: 'Frome', postcode: 'BA11 1AA' },
        ]);
      } else {
        setSuggestions([
          { line1: '10 High Street', line2: '', city: 'Frome', postcode: postcode.toUpperCase() },
          { line1: '12 High Street', line2: 'Flat A', city: 'Frome', postcode: postcode.toUpperCase() },
        ]);
      }
    } catch {
      setError('Failed to lookup address');
    } finally {
      setIsLoading(false);
    }
  };

  return { lookupPostcode, suggestions, isLoading, error };
}

