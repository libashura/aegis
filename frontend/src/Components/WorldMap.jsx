'use client';

import { useEffect, useRef } from 'react';

// Country coordinates (approximate center)
const countryCoordinates = {
  US: [37.0902, -95.7129],
  GB: [55.3781, -3.436],
  DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  JP: [36.2048, 138.2529],
  CN: [35.8617, 104.1954],
  IN: [20.5937, 78.9629],
  RU: [61.524, 105.3188],
  BR: [-14.2350, -51.9253],
  AU: [-25.2744, 133.7751],
  CA: [56.1304, -106.3468],
  MX: [23.6345, -102.5528],
  ZA: [-30.5595, 22.9375],
  KR: [35.9078, 127.7669],
  SG: [1.3521, 103.8198],
};

export default function WorldMap({ threatData }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Dynamic import of leaflet (client side only)
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        // Initialize map
        mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current);

        // Add threat markers
        if (threatData && threatData.length > 0) {
          const maxCount = Math.max(...threatData.map((c) => c.count));

          threatData.forEach((country) => {
            const coords = countryCoordinates[country.country];
            if (coords) {
              const intensity = country.count / maxCount;
              let color, radius;

              if (intensity >= 0.8) {
                color = '#dc2626';
                radius = 30;
              } else if (intensity >= 0.6) {
                color = '#ea580c';
                radius = 25;
              } else if (intensity >= 0.4) {
                color = '#eab308';
                radius = 20;
              } else if (intensity >= 0.2) {
                color = '#2563eb';
                radius = 15;
              } else {
                color = '#16a34a';
                radius = 10;
              }

              const circle = L.circleMarker(coords, {
                radius,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6,
              })
                .bindPopup(
                  `<div style="color: black; font-weight: bold;">
                    ${country.country}<br/>
                    Threats: ${country.count}
                  </div>`
                )
                .addTo(mapInstance.current);

              markersRef.current.push(circle);
            }
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });

    return () => {
      // Cleanup on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, [threatData]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[600px] rounded-lg border border-gray-700 shadow-lg"
      style={{ background: '#1a202c' }}
    />
  );
}
