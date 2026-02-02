import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import { cn } from '@/lib/utils';

const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface LocationMapProps {
    location: string;
    latitude?: number;
    longitude?: number;
    className?: string;
}

export default function LocationMap({ location, latitude, longitude, className }: LocationMapProps) {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Strict verification of coordinates
        if (typeof latitude === 'number' && typeof longitude === 'number') {
            setCoordinates([latitude, longitude]);
            setLoading(false);
        } else if (location) {
            geocodeLocation(location);
        } else {
            setLoading(false);
            setError('No location provided');
        }
    }, [location, latitude, longitude]);

    const geocodeLocation = async (address: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    address
                )}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                setError('Location not found on map');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Failed to load map');
        } finally {
            setLoading(false);
        }
    };

    const openNavigation = () => {
        if (coordinates) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`, '_blank');
        }
    };

    if (loading) {
        return <div className={cn("h-[250px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground", className)}>Loading Map...</div>;
    }

    if (error || !coordinates) {
        return (
            <div className={cn("h-[250px] w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center", className)}>
                <MapPin className="h-8 w-8 opacity-50" />
                <p>{error || 'Location coordinates unavailable'}</p>
                <Button variant="outline" size="sm" onClick={openNavigation}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Google Maps
                </Button>
            </div>
        );
    }

    return (
        <div className={cn("relative rounded-lg overflow-hidden border border-border h-[250px]", className)} style={{ isolation: 'isolate' }}>
            <MapContainer
                key={`${coordinates[0]}-${coordinates[1]}`}
                center={coordinates}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coordinates} icon={customIcon}>
                    <Popup>
                        {location} <br />
                        <span
                            className="text-primary cursor-pointer hover:underline"
                            onClick={openNavigation}
                        >
                            Get Directions
                        </span>
                    </Popup>
                </Marker>
            </MapContainer>

            <div className="absolute bottom-2 right-2 z-[400]">
                <Button size="sm" className="shadow-lg" onClick={openNavigation}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                </Button>
            </div>
        </div>
    );
}
