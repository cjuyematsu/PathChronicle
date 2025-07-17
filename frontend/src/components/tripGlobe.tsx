"use client";

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GlobeMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  mapTilerKey?: string;
}

const GlobeMap: React.FC<GlobeMapProps> = ({
  center = [-100, 40],
  zoom = 3,
  style = 'liberty',
  mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'YOUR_MAPTILER_KEY'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapTilerKey || mapTilerKey === 'YOUR_MAPTILER_KEY') {
      console.error('MapTiler API key is required. Please set NEXT_PUBLIC_MAPTILER_API_KEY in your environment variables.');
      return;
    }

    const styleUrls = {
      streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`,
    };

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrls.streets,
        center: center,
        zoom: zoom,
      });

      map.current.on('error', (e) => {
        console.error('MapLibre error:', e);
        if (map.current && e.error?.status === 404) {
          console.warn('MapTiler style failed, falling back to basic style');
          map.current.setStyle({
            version: 8,
            sources: {
              'raster-tiles': {
                type: 'raster',
                tiles: [
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [{
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22
            }]
          });
        }
      });

      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');
      });

      if (map.current) {
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.addControl(new maplibregl.GlobeControl());

        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

        map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      return;
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, style, mapTilerKey]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      {(!mapTilerKey || mapTilerKey === 'YOUR_MAPTILER_KEY') && (
        <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 rounded-lg p-3 shadow-md">
          <div className="text-sm font-medium text-red-800 mb-1">API Key Missing</div>
          <div className="text-xs text-red-700">
            Set NEXT_PUBLIC_MAPTILER_API_KEY in your .env.local file
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobeMap;