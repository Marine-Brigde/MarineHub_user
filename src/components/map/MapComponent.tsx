
import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeatureCollection, Polygon } from 'geojson';
import maplibregl from 'maplibre-gl'; // Import maplibregl để TypeScript nhận diện

// Goong API keys from .env
const MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY as string;
const API_KEY = import.meta.env.VITE_GOONG_API_KEY as string;

interface MapComponentProps {
    onLocationSelect: (lat: string, lng: string, address: string) => void;
}

export function MapComponent({ onLocationSelect }: MapComponentProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [query, setQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [error, setError] = useState('');
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initialize map
    useEffect(() => {
        if (mapContainer.current && !map.current) {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: `https://tiles.goong.io/assets/goong_satellite.json?api_key=${MAP_KEY}`,
                center: [106.660172, 10.762622], // Default center (Ho Chi Minh City)
                zoom: 12,
            });

            map.current.on('load', () => {
                map.current!.addControl(new maplibregl.NavigationControl());
            });

            // Add click event for manual marker placement
            map.current.on('click', (e: maplibregl.MapMouseEvent) => {
                const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                fetchReverseGeocode(lngLat);
            });
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Function to draw a circle
    const drawCircle = (center: [number, number], radiusInMeters: number) => {
        const points = 64;
        const coords = {
            latitude: center[1],
            longitude: center[0],
        };
        const km = radiusInMeters / 1000;
        const ret = [];
        const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
        const distanceY = km / 110.574;
        for (let i = 0; i < points; i++) {
            const theta = (i / points) * (2 * Math.PI);
            const x = distanceX * Math.cos(theta);
            const y = distanceY * Math.sin(theta);
            ret.push([coords.longitude + x, coords.latitude + y]);
        }
        ret.push(ret[0]);
        return ret;
    };

    // Function to add marker and circle
    const addMarkerAndCircle = (lngLat: [number, number]) => {
        if (map.current) {
            // Remove existing marker and circle
            if (map.current.getLayer('circle')) {
                map.current.removeLayer('circle');
                map.current.removeSource('circle');
            }
            document.querySelectorAll('.maplibregl-marker').forEach((el) => el.remove());

            // Add new marker
            new maplibregl.Marker().setLngLat(lngLat).addTo(map.current);

            // Add circle
            const circleData: FeatureCollection<Polygon> = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [drawCircle(lngLat, 500)],
                        },
                        properties: {}, // thêm properties cho đúng chuẩn GeoJSON
                    },
                ],
            };

            map.current.addSource('circle', {
                type: 'geojson',
                data: circleData,
            });

            map.current.addLayer({
                id: 'circle',
                type: 'fill',
                source: 'circle',
                layout: {},
                paint: {
                    'fill-color': '#588888',
                    'fill-opacity': 0.5,
                },
            });

            // Fly to location
            map.current.flyTo({ center: lngLat, zoom: 14 });
        }
    };

    // Fetch autocomplete suggestions
    const fetchDataAutoComplete = async (input: string) => {
        if (!input || input.length < 3) {
            setSuggestions([]);
            return;
        }
        const apiLink = `https://rsapi.goong.io/place/autocomplete?api_key=${API_KEY}&input=${encodeURIComponent(input)}`;
        try {
            const response = await fetch(apiLink);
            const data = await response.json();
            if (data.predictions) {
                setSuggestions(data.predictions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching autocomplete:', error);
            setError('Không thể tải gợi ý địa chỉ');
            setSuggestions([]);
        }
    };

    // Fetch place details
    const fetchPlaceDetails = async (placeId: string, description: string) => {
        const apiLink = `https://rsapi.goong.io/place/detail?api_key=${API_KEY}&place_id=${placeId}`;
        try {
            const response = await fetch(apiLink);
            const data = await response.json();
            if (data.result) {
                const { location } = data.result.geometry;
                const lngLat: [number, number] = [location.lng, location.lat];
                addMarkerAndCircle(lngLat);
                onLocationSelect(location.lat.toString(), location.lng.toString(), description);
                setError('');
            } else {
                setError('Không tìm thấy chi tiết địa điểm');
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
            setError('Lỗi khi tải chi tiết địa điểm');
        }
    };

    // Fetch address from coordinates (reverse geocoding)
    const fetchReverseGeocode = async (lngLat: [number, number]) => {
        const apiLink = `https://rsapi.goong.io/geocode?latlng=${lngLat[1]},${lngLat[0]}&api_key=${API_KEY}`;
        try {
            const response = await fetch(apiLink);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                addMarkerAndCircle(lngLat);
                onLocationSelect(lngLat[1].toString(), lngLat[0].toString(), address);
                setError('');
            } else {
                setError('Không tìm thấy địa chỉ cho vị trí này');
                addMarkerAndCircle(lngLat);
                onLocationSelect(lngLat[1].toString(), lngLat[0].toString(), '');
            }
        } catch (error) {
            console.error('Error fetching reverse geocode:', error);
            setError('Lỗi khi lấy địa chỉ từ tọa độ');
            addMarkerAndCircle(lngLat);
            onLocationSelect(lngLat[1].toString(), lngLat[0].toString(), '');
        }
    };

    // Debounce autocomplete requests
    const handleSearch = (value: string) => {
        setQuery(value);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            fetchDataAutoComplete(value);
        }, 500); // 500ms debounce
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="address-search">Tìm kiếm địa chỉ hoặc nhấp vào bản đồ để ghim</Label>
                <Input
                    id="address-search"
                    placeholder="Nhập địa chỉ để tìm kiếm"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            {error && (
                <div className="text-red-600 text-sm">{error}</div>
            )}
            {suggestions.length > 0 && (
                <Card className="max-h-40 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <Button
                            key={suggestion.place_id}
                            variant="ghost"
                            className="w-full text-left justify-start"
                            onClick={() => {
                                setQuery(suggestion.description);
                                setSuggestions([]);
                                fetchPlaceDetails(suggestion.place_id, suggestion.description);
                            }}
                        >
                            {suggestion.description}
                        </Button>
                    ))}
                </Card>
            )}
            <div
                ref={mapContainer}
                className="w-full h-96 rounded-lg"
            />
        </div>
    );
}
