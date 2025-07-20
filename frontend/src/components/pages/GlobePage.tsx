"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuth } from '@/src/context/AuthContext';
import { GlobeLine, Star, RawTripData } from '@/src/types';

interface LoadingScreenProps {
  isLoading: boolean;
}

interface TripInfoProps {
  selectedTrip: GlobeLine | null;
  onClose: () => void;
}

interface GlobeTripVisualizationProps {
  center?: [number, number];
  zoom?: number;
  mapTilerKey?: string;
}



const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#000014] transition-opacity duration-1000 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
};

const TripInfo: React.FC<TripInfoProps> = ({ selectedTrip, onClose }) => {
  if (!selectedTrip) return null;

  const tripTypeIcons: Record<GlobeLine['trip_type'], string> = {
    flight: "✈️",
    train: "🚂",
    bus: "🚌",
    car: "🚗",
    ferry: "⛴️",
    other: "📍"
  };

  return (
    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl max-w-sm z-40">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-800">{selectedTrip.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tripTypeIcons[selectedTrip.trip_type]}</span>
          <span className="capitalize text-gray-600">{selectedTrip.trip_type}</span>
        </div>
        <div className="border-t pt-2">
          <div className="font-medium text-gray-700">From:</div>
          <div className="text-gray-600">{selectedTrip.origin.city}</div>
          <div className="text-xs text-gray-500">{selectedTrip.origin.name}</div>
        </div>
        <div className="border-t pt-2">
          <div className="font-medium text-gray-700">To:</div>
          <div className="text-gray-600">{selectedTrip.destination.city}</div>
          <div className="text-xs text-gray-500">{selectedTrip.destination.name}</div>
        </div>
        {selectedTrip.departure_date && (
          <div className="border-t pt-2">
            <div className="text-gray-600">
              <span className="font-medium">Date:</span> {new Date(selectedTrip.departure_date).toLocaleDateString()}
            </div>
          </div>
        )}
        {(selectedTrip.airline || selectedTrip.operator) && (
          <div className="text-gray-600">
            <span className="font-medium">Operator:</span> {selectedTrip.airline || selectedTrip.operator}
          </div>
        )}
      </div>
    </div>
  );
};

const GlobeTripVisualization: React.FC<GlobeTripVisualizationProps> = ({
  center = [0, 20],
  zoom = 1.5,
  mapTilerKey = 'YOUR_MAPTILER_KEY'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<GlobeLine | null>(null);
  const [trips, setTrips] = useState<GlobeLine[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchTrips = async () => {
        setIsLoading(true);
        try {

          const response = await fetch(`/api/trips/user/${user.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch trips: ${response.statusText}`);
          }
          const rawData = await response.json();

          // Format the data as before
          const formattedTrips: GlobeLine[] = rawData.map((trip: RawTripData) => ({
            id: trip.id,
            name: trip.name,
            trip_type: trip.trip_type,
            origin: { name: trip.origin_name, coordinates: [trip.origin_lon, trip.origin_lat], city: trip.origin_city },
            destination: { name: trip.destination_name, coordinates: [trip.destination_lon, trip.destination_lat], city: trip.destination_city },
            departure_date: trip.departure_date,
            airline: trip.airline,
            operator: trip.operator,
          }));
          
          // Save the formatted data into our component's state
          setTrips(formattedTrips);

        } catch (error) {
          console.error("Error fetching trips:", error);
          setTrips([]); 
        }
      };

      fetchTrips();
    } else {
        // If there's no user, we can stop loading and show an empty map
        setIsLoading(false);
        setTrips([]);
    }
  }, [user]); 

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

    const stars: Star[] = [];
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
    if (!mapContainer.current || map.current) return;

    const actualMapTilerKey = mapTilerKey === 'YOUR_MAPTILER_KEY' ? process.env.NEXT_PUBLIC_MAPTILER_API_KEY : mapTilerKey;
    const hasValidKey = actualMapTilerKey && actualMapTilerKey !== 'YOUR_MAPTILER_KEY';

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: hasValidKey
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${actualMapTilerKey}`
          : {
              version: 8,
              sources: {
                'raster-tiles': {
                  type: 'raster',
                  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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
            },
        center: center,
        zoom: zoom,
        projection: 'globe',
        renderWorldCopies: false,
        antialias: true,
        preserveDrawingBuffer: true
      } as maplibregl.MapOptions);

      map.current.on('load', () => {
        if (map.current && 'setProjection' in map.current) {
          try {
            (map.current).setProjection({ type: 'globe' });
          } catch {
            console.log('Globe projection not supported');
          }
        }

        // addTripVisualizations();
        setMapReady(true);
        setIsLoading(false);
      });

      if (map.current) {
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
      }

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addTripVisualizations = useCallback(() => {
    if (!map.current) return;

    try {
      const createGreatCircleRoute = (start: [number, number], end: [number, number]): [number, number][] => {
        const points: [number, number][] = [];
        const numPoints = 100;

        let endLon = end[0];
        if (Math.abs(end[0] - start[0]) > 180) {
            endLon = end[0] > start[0] ? end[0] - 360 : end[0] + 360;
        }

        const lat1 = start[1] * Math.PI / 180;
        const lon1 = start[0] * Math.PI / 180;
        const lat2 = end[1] * Math.PI / 180;
        const lon2 = endLon * Math.PI / 180;
        
        const dLon = lon2 - lon1;
        const a = Math.sin((lat2 - lat1) / 2) ** 2 + 
                  Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        let lastLon = start[0];

        for (let i = 0; i <= numPoints; i++) {
          const f = i / numPoints;

          if (c === 0) {
              points.push([start[0], start[1]]);
              continue;
          }
          
          const A = Math.sin((1 - f) * c) / Math.sin(c);
          const B = Math.sin(f * c) / Math.sin(c);
          
          const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
          const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
          const z = A * Math.sin(lat1) + B * Math.sin(lat2);
          
          const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
          let lon = Math.atan2(y, x) * 180 / Math.PI;

          if (i > 0) {
              if (lon - lastLon > 180) {
                  lon -= 360;
              } else if (lastLon - lon > 180) {
                  lon += 360;
              }
          }
          lastLon = lon;
          points.push([lon, lat]);
        }
        
        return points;
      };

      const routeFeatures = trips.map(trip => ({
        type: 'Feature' as const,
        properties: {
          id: trip.id,
          name: trip.name,
          trip_type: trip.trip_type
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: createGreatCircleRoute(trip.origin.coordinates, trip.destination.coordinates)
        }
      }));

      map.current.addSource('trip-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routeFeatures
        }
      });

      map.current.addLayer({
        id: 'trip-routes-bg',
        type: 'line',
        source: 'trip-routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'trip_type'], 'flight'], '#0066FF',
            ['==', ['get', 'trip_type'], 'train'], '#00AA44',
            '#AA00FF'
          ],
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 3
        }
      });

      map.current.addLayer({
        id: 'trip-routes-layer',
        type: 'line',
        source: 'trip-routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'trip_type'], 'flight'], '#0066FF',
            ['==', ['get', 'trip_type'], 'train'], '#00AA44',
            '#AA00FF'
          ],
          'line-width': 3,
          'line-opacity': 0.9,
          'line-dasharray': [0, 2, 2]
        }
      });

      const locationFeatures: GeoJSON.Feature[] = [];
      const addedLocations = new Set<string>();

      trips.forEach(trip => {
        const originKey = `${trip.origin.coordinates[0]},${trip.origin.coordinates[1]}`;
        const destKey = `${trip.destination.coordinates[0]},${trip.destination.coordinates[1]}`;

        if (!addedLocations.has(originKey)) {
          locationFeatures.push({
            type: 'Feature',
            properties: {
              name: trip.origin.name,
              city: trip.origin.city,
              type: 'origin'
            },
            geometry: {
              type: 'Point',
              coordinates: trip.origin.coordinates
            }
          });
          addedLocations.add(originKey);
        }

        if (!addedLocations.has(destKey)) {
          locationFeatures.push({
            type: 'Feature',
            properties: {
              name: trip.destination.name,
              city: trip.destination.city,
              type: 'destination'
            },
            geometry: {
              type: 'Point',
              coordinates: trip.destination.coordinates
            }
          });
          addedLocations.add(destKey);
        }
      });

      map.current.addSource('locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: locationFeatures
        }
      });

      map.current.addLayer({
        id: 'location-glow',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 20,
          'circle-color': '#FFFFFF',
          'circle-opacity': 0.2,
          'circle-blur': 1
        }
      });

      map.current.addLayer({
        id: 'location-circles',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FF3366',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-opacity': 0.9
        }
      });

      map.current.addLayer({
        id: 'location-labels',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': ['get', 'city'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
          'text-offset': [0, 1.8],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2
        }
      });

      const dashArraySequence = [
        [0, 2, 2],
        [0.5, 2, 1.5],
        [1, 2, 1],
        [1.5, 2, 0.5],
        [2, 2, 0],
        [0, 0.5, 2, 1.5],
        [0, 1, 2, 1],
        [0, 1.5, 2, 0.5]
      ];

      let step = 0;
      const animateDashArray = () => {
        if (!map.current || !map.current.getLayer('trip-routes-layer')) return;

        const newStep = parseInt((Date.now() / 50).toString()) % dashArraySequence.length;

        if (newStep !== step) {
          map.current.setPaintProperty(
            'trip-routes-layer',
            'line-dasharray',
            dashArraySequence[newStep]
          );
          step = newStep;
        }

        requestAnimationFrame(animateDashArray);
      };
      animateDashArray();

      map.current.on('click', 'trip-routes-layer', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['trip-routes-layer']
        });

        if (features && features.length > 0) {
          const tripId = features[0].properties?.id;
          const trip = trips.find(t => t.id === tripId);
          if (trip) {
            setSelectedTrip(trip);
          }
        }
      });

      map.current.on('mouseenter', 'trip-routes-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'trip-routes-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

    } catch (error) {
      console.error('Error adding trip visualizations:', error);
    }
  }, [trips]);

  useEffect(() => {
    if (mapReady && trips.length > 0 && map.current && !map.current.getSource('trip-routes')) {
      addTripVisualizations();
    }
}, [mapReady, trips, addTripVisualizations]);

  return (
    <>
      <div className="w-full h-full relative overflow-hidden bg-[#000014]">
        <canvas
          ref={starsCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: '#000014',
            zIndex: 0
          }}
        />
        
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
        
        <TripInfo selectedTrip={selectedTrip} onClose={() => setSelectedTrip(null)} />
        
        <LoadingScreen isLoading={isLoading} />
        
        {(!process.env.NEXT_PUBLIC_MAPTILER_API_KEY || process.env.NEXT_PUBLIC_MAPTILER_API_KEY === 'YOUR_MAPTILER_KEY') && !isLoading && (
          <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-md z-10">
            <div className="text-sm font-medium text-yellow-800 mb-1">Using Fallback Map</div>
            <div className="text-xs text-yellow-700">
              For better visualization, set NEXT_PUBLIC_MAPTILER_API_KEY in your .env.local
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobeTripVisualization;