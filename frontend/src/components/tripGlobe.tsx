"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GlobeMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  mapTilerKey?: string;
}

const LoadingScreen: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#000014] transition-opacity duration-1000 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      </div>
    </div>
  );
};

const GlobeMap: React.FC<GlobeMapProps> = ({
  center = [-100, 40],
  zoom = 1.5,  
  style = 'liberty',
  mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'YOUR_MAPTILER_KEY'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars: Array<{
      x: number;
      y: number;
      size: number;
      brightness: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    const createStars = () => {
      const starCount = 300;
      stars.length = 0;
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    };
    createStars();

    let time = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 2
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      time += 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapTilerKey || mapTilerKey === 'YOUR_MAPTILER_KEY') {
      console.error('MapTiler API key is required. Please set NEXT_PUBLIC_MAPTILER_API_KEY in your environment variables.');
      setIsLoading(false);
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
        projection: 'globe', 
        renderWorldCopies: false, 
        antialias: true,
        preserveDrawingBuffer: true
      } as maplibregl.MapOptions);

      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');       
        

        if (map.current && 'setProjection' in map.current && typeof map.current.setProjection === 'function') {
          (map.current).setProjection({ type: 'globe' });
        }

        setMapReady(true);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
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

      if (map.current) {
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.GlobeControl());
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
        map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setIsLoading(false);
      return;
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, style, mapTilerKey]);

  return (
    <>
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        /* Smooth transition for controls */
        .maplibregl-control-container {
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>
      
      <div className="w-full h-full relative overflow-hidden bg-[#000014]">
        {/* Starry background */}
        <canvas
          ref={starsCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            backgroundColor: '#000014',
            zIndex: 0
          }}
        />
        
        {/* Globe container */}
        <div 
          ref={mapContainer} 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            mapReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            zIndex: 1,
            backgroundColor: 'transparent'
          }}
        />
        
        {/* Loading screen */}
        <LoadingScreen isLoading={isLoading} />
        
        {(!mapTilerKey || mapTilerKey === 'YOUR_MAPTILER_KEY') && !isLoading && (
          <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 rounded-lg p-3 shadow-md z-10">
            <div className="text-sm font-medium text-red-800 mb-1">API Key Missing</div>
            <div className="text-xs text-red-700">
              Set NEXT_PUBLIC_MAPTILER_API_KEY in your .env.local file
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobeMap;