// src/maplibre-gl.d.ts
import 'maplibre-gl';

declare module 'maplibre-gl' {
  // Extend the MapOptions interface to include the 'projection' property
  export interface MapOptions {
    projection?: string | { name: 'globe' };
  }

  // Extend the Map class to include the 'setFog' method
  export interface Map {
    setFog(fog?: {}): void;
  }
}