
import React, { useEffect, useRef } from 'react';

// Since Leaflet is loaded from a CDN, 'L' will be a global variable.
declare var L: any;

interface MapProps {
    center: [number, number];
    zoom: number;
    markerPosition?: [number, number] | null;
    onMapClick?: (latlng: { lat: number; lng: number }) => void;
}

// Fix for default icon issue with bundlers, which can happen in some environments.
// This needs to be done once.
if (typeof L !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const Map: React.FC<MapProps> = ({ center, zoom, markerPosition, onMapClick }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // To hold the map instance
    const markerRef = useRef<any>(null); // To hold the marker instance

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            // Initialize map
            mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            // This is a common fix for a race condition in Leaflet where the map
            // initializes before its container has a size, resulting in gray areas.
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 180);

            // Add click listener if callback is provided
            if (onMapClick) {
                mapRef.current.on('click', (e: any) => {
                    onMapClick(e.latlng);
                });
            }

            // Add initial marker if position is provided
            if (markerPosition) {
                markerRef.current = L.marker(markerPosition).addTo(mapRef.current);
            }
        }

        // Cleanup function to destroy map instance on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // Effect to update map view when center/zoom props change
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.flyTo(center, zoom);
        }
    }, [center, zoom]);

    // Effect to update marker when markerPosition prop changes
    useEffect(() => {
        if (mapRef.current) {
            if (markerPosition) {
                if (markerRef.current) {
                    markerRef.current.setLatLng(markerPosition);
                } else {
                    markerRef.current = L.marker(markerPosition).addTo(mapRef.current);
                }
            } else {
                if (markerRef.current) {
                    markerRef.current.remove();
                    markerRef.current = null;
                }
            }
        }
    }, [markerPosition]);

    return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default Map;