import React from 'react';
import { formatCurrency } from '@/lib/utils/reference';

interface VerticalProgressCounterProps {
    current: number;
    target: number;
    minimum: number;
    investorCount: number;
    daysRemaining?: number;
}

export function VerticalProgressCounter({ current, target, minimum, investorCount, daysRemaining }: VerticalProgressCounterProps) {
    // Calculate percentages
    const percentageOfMax = Math.min((current / target) * 100, 100);
    const minimumMarkerPosition = (minimum / target) * 100;

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(current)}</h2>
            </div>

            {/* Vertical Progress Bar */}
            <div className="flex justify-center mb-6">
                <div className="relative w-16 h-80">
                    {/* The actual progress bar with rounded corners and overflow hidden */}
                    <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
                        {/* Progress fill (from bottom) - using emerald-500 */}
                        <div
                            className="absolute bottom-0 w-full transition-all duration-1000 ease-out bg-emerald-500"
                            style={{ height: `${percentageOfMax}%` }}
                        />
                    </div>

                    {/* Minimum target marker */}
                    <div
                        className="absolute w-full border-t-[3px] border-dotted border-gray-600 z-10"
                        style={{ bottom: `${minimumMarkerPosition}%` }}
                    >
                        {/* Marker label - on the LEFT */}
                        <div className="absolute right-full mr-3 -translate-y-1/2 whitespace-nowrap">
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-700">{formatCurrency(minimum)}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Minimum Target</div>
                            </div>
                        </div>
                    </div>

                    {/* Maximum target label at top - NO dotted line */}
                    <div className="absolute top-0 w-full z-10">
                        {/* Label - on the LEFT */}
                        <div className="absolute right-full mr-3 -translate-y-1/2 whitespace-nowrap">
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-700">{formatCurrency(target)}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Maximum Target</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-center">
                <div>
                    <span className="block text-2xl font-bold text-slate-900">{investorCount}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-500">Investors</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-slate-900">{daysRemaining ?? 30}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-500">Days Left</span>
                </div>
            </div>
        </div>
    );
}
