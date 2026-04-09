import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix default marker icons in bundled environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export interface MapAsset {
    id: number;
    kib_type: string;
    nama_barang: string;
    kode_barang: string;
    pj_nama: string;
    harga: number;
    latitude: number;
    longitude: number;
    wilayah?: { id: number; nama: string } | null;
}

interface Props {
    assets: MapAsset[];
    className?: string;
    onMarkerClick?: (asset: MapAsset) => void;
}

const KIB_COLORS: Record<string, string> = {
    A: '#16a34a', // green
    B: '#2563eb', // blue
    C: '#d97706', // amber
    D: '#9333ea', // purple
    E: '#dc2626', // red
    L: '#0891b2', // cyan
};

function createColoredIcon(color: string) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const KIB_LABELS: Record<string, string> = {
    A: 'KIB A - Tanah',
    B: 'KIB B - Peralatan & Mesin',
    C: 'KIB C - Gedung & Bangunan',
    D: 'KIB D - Jalan, Irigasi, Jaringan',
    E: 'KIB E - Aset Tetap Lainnya',
    L: 'KIB L - Aset Lainnya',
};

export default function MapView({ assets, className, onMarkerClick }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center: Indonesia
        const map = L.map(mapRef.current).setView([-2.5, 118], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Remove old cluster
        if (clusterRef.current) {
            map.removeLayer(clusterRef.current);
        }

        const cluster = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
        });

        const bounds: L.LatLngExpression[] = [];

        assets.forEach((asset) => {
            const icon = createColoredIcon(KIB_COLORS[asset.kib_type] || '#6b7280');
            const marker = L.marker([asset.latitude, asset.longitude], { icon });

            const popup = `
                <div style="min-width: 200px; font-family: system-ui, sans-serif;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${asset.nama_barang}</div>
                    <div style="display: inline-block; background: ${KIB_COLORS[asset.kib_type] || '#6b7280'}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 6px;">
                        ${KIB_LABELS[asset.kib_type] || asset.kib_type}
                    </div>
                    <table style="font-size: 12px; border-collapse: collapse; width: 100%;">
                        <tr><td style="color: #666; padding: 2px 8px 2px 0;">Kode</td><td style="font-family: monospace;">${asset.kode_barang}</td></tr>
                        <tr><td style="color: #666; padding: 2px 8px 2px 0;">Wilayah</td><td>${asset.wilayah?.nama || '-'}</td></tr>
                        <tr><td style="color: #666; padding: 2px 8px 2px 0;">PJ</td><td>${asset.pj_nama}</td></tr>
                        <tr><td style="color: #666; padding: 2px 8px 2px 0;">Harga</td><td>${formatCurrency(asset.harga)}</td></tr>
                    </table>
                </div>
            `;

            marker.bindPopup(popup);

            if (onMarkerClick) {
                marker.on('click', () => onMarkerClick(asset));
            }

            cluster.addLayer(marker);
            bounds.push([asset.latitude, asset.longitude]);
        });

        map.addLayer(cluster);
        clusterRef.current = cluster;

        if (bounds.length > 0) {
            map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
        }
    }, [assets, onMarkerClick]);

    return <div ref={mapRef} className={className} style={{ minHeight: 400 }} />;
}
