import 'maplibre-gl';

declare module 'maplibre-gl' {
  export interface MapOptions {
    projection?: string | { name: 'globe' };
  }

}