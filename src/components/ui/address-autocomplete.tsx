'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface AddressResult {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    fullAddress: string;
}

interface AddressAutocompleteProps {
    onAddressSelect: (address: AddressResult) => void;
    defaultPostcode?: string;
    defaultAddressLine1?: string;
}

export function AddressAutocomplete({
    onAddressSelect,
    defaultPostcode = '',
    defaultAddressLine1 = ''
}: AddressAutocompleteProps) {
    const [postcode, setPostcode] = useState(defaultPostcode);
    const [searchQuery, setSearchQuery] = useState(defaultAddressLine1);
    const [addresses, setAddresses] = useState<AddressResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search by postcode using Postcodes.io API
    const searchByPostcode = async () => {
        if (!postcode.trim()) {
            setError('Please enter a postcode');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Clean postcode (remove spaces, uppercase)
            const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();

            // Use Postcodes.io API to validate and get postcode data
            const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

            if (!response.ok) {
                throw new Error('Invalid postcode');
            }

            const data = await response.json();

            if (data.status === 200 && data.result) {
                const result = data.result;

                // Create a basic address from postcode data
                // In a real app, you'd integrate with a proper address lookup service
                // For now, we'll create a template that users can customize
                const addressSuggestions: AddressResult[] = [
                    {
                        line1: '', // User will fill this
                        line2: result.admin_district || '',
                        city: result.parish || result.admin_ward || result.admin_district || '',
                        postcode: result.postcode,
                        fullAddress: `${result.admin_district || ''}, ${result.postcode}`
                    }
                ];

                setAddresses(addressSuggestions);
                setShowDropdown(true);
            } else {
                throw new Error('Postcode not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to find postcode');
            setAddresses([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter addresses based on search query
    const filteredAddresses = searchQuery.trim()
        ? addresses.filter(addr =>
            addr.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : addresses;

    const handleAddressSelect = (address: AddressResult) => {
        // Populate the form fields
        onAddressSelect({
            line1: address.line1 || '', // User will fill this in
            line2: address.line2,
            city: address.city,
            postcode: address.postcode,
            fullAddress: address.fullAddress
        });
        setShowDropdown(false);
        // Clear the search query so user can enter their street address
        setSearchQuery('');
    };

    const handleManualEntry = () => {
        setShowDropdown(false);
        setAddresses([]);
    };

    return (
        <div className="space-y-4" ref={dropdownRef}>
            {/* Postcode Search */}
            <div className="space-y-2">
                <Label htmlFor="postcode-search">Find Address by Postcode</Label>
                <div className="flex gap-2">
                    <Input
                        id="postcode-search"
                        placeholder="e.g. SW1A 1AA"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                searchByPostcode();
                            }
                        }}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={searchByPostcode}
                        disabled={isLoading}
                        variant="outline"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Address Search/Filter */}
            {addresses.length > 0 && (
                <div className="space-y-2 relative">
                    <Label htmlFor="address-search">Or search/filter addresses</Label>
                    <div className="relative">
                        <Input
                            id="address-search"
                            placeholder="Start typing your address..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>

                    {/* Dropdown */}
                    {showDropdown && filteredAddresses.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredAddresses.map((address, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAddressSelect(address)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                                >
                                    <div className="font-medium text-slate-900">{address.fullAddress}</div>
                                    <div className="text-sm text-slate-500">Click to use this postcode and city</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Manual Entry Option */}
            <div className="pt-2 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleManualEntry}
                    className="text-sm text-slate-600 hover:text-slate-900"
                >
                    Or enter address manually
                </Button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-slate-500">
                Enter your postcode to find your address, or type to search. You can also enter your address manually below.
            </p>
        </div>
    );
}
