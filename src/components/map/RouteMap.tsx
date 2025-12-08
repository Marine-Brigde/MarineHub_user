"use client"

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { findRiverRoute } from "./osmRiverRouting";

function haversine(a: [number, number], b: [number, number]) {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
}

const MAP_KEY = (import.meta.env.VITE_GOONG_MAP_KEY as string) || 'ebt7JiGUl4WpHtDy5kpe4JB299y5TAm63e9My9Z6';

interface RouteMapProps {
    start?: { lat: number; lng: number } | null; // ship
    end?: { lat: number; lng: number } | null; // boatyard
    className?: string;
    animate?: boolean;
}

export default function RouteMap({ start, end, className, animate = true }: RouteMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const shipMarkerRef = useRef<maplibregl.Marker | null>(null);
    const boatyardMarkerRef = useRef<maplibregl.Marker | null>(null);
    const rafRef = useRef<number | null>(null);

    // Initialize map once
    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return;

        mapRef.current = new maplibregl.Map({
            container: containerRef.current,
            style: `https://tiles.goong.io/assets/goong_satellite.json?api_key=${MAP_KEY}`,
            center: [106.660172, 10.762622],
            zoom: 10,
        });
        mapRef.current.addControl(new maplibregl.NavigationControl());

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Update markers/route when start/end change
    useEffect(() => {
        const getMap = () => mapRef.current;
        const cleanup = () => {
            const m = getMap();
            try {
                if (!m) return;
                if (typeof m.getLayer === 'function') {
                    if (m.getLayer('route-line')) {
                        try { m.removeLayer('route-line'); } catch (e) { }
                    }
                }
                if (typeof m.getSource === 'function') {
                    if (m.getSource('route-line')) {
                        try { m.removeSource('route-line'); } catch (e) { }
                    }
                }
                if (typeof m.hasImage === 'function') {
                    try {
                        if (m.hasImage('ship-img')) m.removeImage('ship-img');
                        if (m.hasImage('boatyard-img')) m.removeImage('boatyard-img');
                    } catch (e) { }
                }
            } catch (e) { }

            try {
                if (shipMarkerRef.current) {
                    shipMarkerRef.current.remove();
                    shipMarkerRef.current = null;
                }
            } catch (e) { shipMarkerRef.current = null; }

            try {
                if (boatyardMarkerRef.current) {
                    boatyardMarkerRef.current.remove();
                    boatyardMarkerRef.current = null;
                }
            } catch (e) { boatyardMarkerRef.current = null; }

            try {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                }
            } catch (e) { rafRef.current = null; }
        };

        const applyData = async () => {
            cleanup();

            const m = getMap();
            if (!m) return;

            const startCoord = start ? [start.lng, start.lat] as [number, number] : null;
            const endCoord = end ? [end.lng, end.lat] as [number, number] : null;

            if (!startCoord && !endCoord) {
                m.flyTo({ center: [106.660172, 10.762622], zoom: 10 });
                return;
            }

            // Prefer focusing on the ship when map opens so the ship is prominent.
            const initialShipZoom = 13;
            if (startCoord) {
                m.flyTo({ center: startCoord, zoom: initialShipZoom });
            } else if (endCoord) {
                m.flyTo({ center: endCoord, zoom: 13 });
            }

            // If both points exist, try to compute a river-following route (Overpass PoC)
            let routeCoords: [number, number][] | null = null;
            if (startCoord && endCoord) {
                try {
                    const river = await findRiverRoute(startCoord as [number, number], endCoord as [number, number]);
                    if (river && river.length >= 2) routeCoords = river as [number, number][];
                } catch (e) {
                    routeCoords = null;
                }

                if (!routeCoords) {
                    routeCoords = [startCoord as [number, number], endCoord as [number, number]];
                }

                try {
                    const routeGeo = {
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: routeCoords as any },
                        properties: {}
                    } as GeoJSON.Feature<GeoJSON.LineString, GeoJSON.GeoJsonProperties>;
                    if (typeof m.getSource === 'function' && m.getSource('route-line')) {
                        try { (m.getSource('route-line') as any).setData(routeGeo); } catch (e) { }
                    } else {
                        try { m.addSource('route-line', { type: 'geojson', data: routeGeo as any }); } catch (e) { }
                        try { m.addLayer({ id: 'route-line', type: 'line', source: 'route-line', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2563EB', 'line-width': 8, 'line-opacity': 0.9 } }); } catch (e) { }
                    }
                } catch (e) { }
            }

            // boatyard marker
            if (endCoord) {
                const el = document.createElement('div');
                el.className = 'rounded-full overflow-hidden bg-white border border-border';
                const boatyardSize = 44;
                el.style.width = boatyardSize + 'px';
                el.style.height = boatyardSize + 'px';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
                const img = document.createElement('img');
                img.src = encodeURI('/image/icon xuong.png');
                img.alt = 'Boatyard';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.onerror = () => { img.src = '/image/icon_xuong.avif'; };
                el.appendChild(img);
                try { boatyardMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(endCoord).addTo(m); } catch (e) { }
            }

            // ship marker (larger)
            if (startCoord) {
                const shipEl = document.createElement('div');
                const shipSize = 56; // larger ship
                shipEl.style.width = shipSize + 'px';
                shipEl.style.height = shipSize + 'px';
                shipEl.style.display = 'flex';
                shipEl.style.alignItems = 'center';
                shipEl.style.justifyContent = 'center';
                const img = document.createElement('img');
                img.src = encodeURI('/image/icon-thuyền-đánh-cá.png');
                img.alt = 'Ship';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.onerror = () => {
                    img.src = '';
                    shipEl.innerHTML = `\n                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 12L12 3l10 9-10 5L2 12z" fill="#2563EB" />\n                        </svg>`;
                };
                shipEl.appendChild(img);
                try { shipMarkerRef.current = new maplibregl.Marker({ element: shipEl }).setLngLat(startCoord).addTo(m); } catch (e) { }

                if (animate) {
                    let path: [number, number][] = [];
                    if (Array.isArray((routeCoords ?? []) as any) && (routeCoords as any).length >= 2) {
                        path = routeCoords as [number, number][];
                    } else if (startCoord && endCoord) {
                        path = [startCoord as [number, number], endCoord as [number, number]];
                    }

                    if (path.length >= 2) {
                        // precompute segment lengths
                        const segLens: number[] = [];
                        let total = 0;
                        for (let i = 0; i < path.length - 1; i++) {
                            const d = haversine(path[i], path[i + 1]);
                            segLens.push(d);
                            total += d;
                        }

                        const duration = 100000; // 120 seconds (2 minutes) - much slower
                        let startTime: number | null = null;

                        const step = (timestamp: number) => {
                            if (!startTime) startTime = timestamp;
                            const elapsed = timestamp - startTime;
                            const t = Math.min(1, elapsed / duration);
                            const travel = total * t;
                            // find segment
                            let acc = 0; let i = 0;
                            for (; i < segLens.length; i++) {
                                if (acc + segLens[i] >= travel) break;
                                acc += segLens[i];
                            }
                            if (i >= segLens.length) i = segLens.length - 1;
                            const segStart = path[i];
                            const segEnd = path[i + 1];
                            const segDist = segLens[i] || 1;
                            const segT = segDist === 0 ? 0 : (travel - acc) / segDist;
                            const lng = segStart[0] + (segEnd[0] - segStart[0]) * segT;
                            const lat = segStart[1] + (segEnd[1] - segStart[1]) * segT;
                            try {
                                if (shipMarkerRef.current && m) {
                                    shipMarkerRef.current.setLngLat([lng, lat]);

                                    // Check if ship is outside current viewport
                                    const bounds = m.getBounds();
                                    const shipIsVisible = bounds.contains([lng, lat]);

                                    // If ship moved outside viewport, smoothly pan camera back to ship
                                    if (!shipIsVisible) {
                                        m.easeTo({
                                            center: [lng, lat],
                                            duration: 1000, // Smooth 1 second animation
                                        });
                                    }
                                }
                            } catch (e) { }
                            if (t < 1) rafRef.current = requestAnimationFrame(step);
                        };
                        rafRef.current = requestAnimationFrame(step);
                    }
                }
            }
        };

        // wait for style load before applying
        const m = mapRef.current;
        if (!m) return;
        try {
            if ((m as any).isStyleLoaded && !(m as any).isStyleLoaded()) {
                m.once('load', applyData);
            } else {
                applyData();
            }
        } catch (e) {
            try { m.once('load', applyData); } catch (err) { applyData(); }
        }

        return () => {
            cleanup();
        };
    }, [start?.lat, start?.lng, end?.lat, end?.lng, animate]);

    return <div ref={containerRef} className={className || 'w-full h-64 rounded-lg'} />;
}
