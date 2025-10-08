'use client';

import React, { useState } from 'react';
import { ITALIAN_REGIONS } from '@/constants';
import { Check, MapPin } from 'lucide-react';

interface ItalyMapProps {
  selectedRegion?: string;
  onRegionSelect: (region: string) => void;
}

export const ItalyMap: React.FC<ItalyMapProps> = ({ selectedRegion, onRegionSelect }) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center">
      <label htmlFor="region-select" className="mb-2 text-sm font-medium text-gray-700 self-start">Seleziona la regione</label>
      <select
        id="region-select"
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
        value={selectedRegion || ''}
        onChange={e => onRegionSelect(e.target.value)}
      >
        <option value="" disabled>-- Scegli una regione --</option>
        {ITALIAN_REGIONS.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      {selectedRegion && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
            <Check className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium text-primary">{selectedRegion}</span>
          </div>
        </div>
      )}
    </div>
  );
}
