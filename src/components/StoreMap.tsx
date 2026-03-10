import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Navigation, Loader2 } from 'lucide-react';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Store } from '../types';

// Leaflet default icon settings
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component for map view changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface StoreMapProps {
  stores: Store[];
}

export default function StoreMap({ stores }: StoreMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.2048, 138.2529]);
  const [zoom, setZoom] = useState(5);
  const [locating, setLocating] = useState(false);

  const validStores = stores.filter(s => s.latitude && s.longitude);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setZoom(14); // Zoom in to see nearby stores
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('位置情報の取得に失敗しました。設定を確認してください。');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-[600px] w-full rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 group">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="h-full w-full"
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validStores.map((store) => (
          <Marker 
            key={store.id} 
            position={[store.latitude!, store.longitude!]}
          >
            <Popup className="rounded-2xl overflow-hidden">
              <div className="p-2 space-y-3 min-w-[200px]">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {store.thumbnail_url && (
                    <img src={store.thumbnail_url} alt={store.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{store.category}</span>
                  <h3 className="font-bold text-gray-900 mt-1">{store.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 italic">"{store.summary}"</p>
                </div>
                <Link 
                  to={`/store/${store.id}`}
                  className="block w-full text-center bg-gray-900 text-white text-xs font-bold py-2 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  詳細を見る
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Geolocation Button */}
      <button 
        onClick={handleLocateUser}
        disabled={locating}
        className="absolute bottom-8 right-8 z-[1000] flex items-center gap-3 px-6 py-4 bg-white text-gray-900 font-black rounded-2xl shadow-2xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all border border-gray-100 disabled:opacity-50"
      >
        {locating ? (
          <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
        ) : (
          <Navigation className="w-5 h-5 text-orange-600" />
        )}
        <span className="tracking-tight text-sm">現在地から探す</span>
      </button>
    </div>
  );
}
