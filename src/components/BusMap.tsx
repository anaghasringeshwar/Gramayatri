import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Route, Ping } from '../types';
import { Bus, MapPin } from 'lucide-react';

const API_KEY = 
  (process.env.GOOGLE_MAPS_PLATFORM_KEY as string) || 
  (import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY as string) || 
  '';
const isPlaceholder = API_KEY === 'MY_GOOGLE_MAPS_PLATFORM_KEY' || API_KEY === 'YOUR_API_KEY' || !API_KEY;
const hasValidKey = Boolean(API_KEY) && !isPlaceholder;

function RoutePath({ stops }: { stops: google.maps.LatLngLiteral[] }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const coreLib = useMapsLibrary('core');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib || !coreLib || stops.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new mapsLib.Polyline({
      path: stops,
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polylineRef.current.setMap(map);

    const bounds = new coreLib.LatLngBounds();
    stops.forEach(s => bounds.extend(s));
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
  }, [map, mapsLib, coreLib, stops]);

  return null;
}

export default function BusMap({ selectedRoute, latestPing, language = 'en' }: { selectedRoute: Route | null, latestPing: Ping | null, language?: 'en' | 'kn' }) {
  if (!hasValidKey) {
    const isKn = language === 'kn';
    return (
      <div className="bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <h3 className="font-display font-black text-slate-800 uppercase tracking-tight mb-4">
          {isKn ? 'ನಕ್ಷೆ ಸಂಯೋಜನೆ ಅಗತ್ಯವಿದೆ' : 'Map Integration Required'}
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6 font-medium">
          {isKn 
            ? 'ಲೈವ್ ಬಸ್ ಮಾರ್ಗವನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಲು, ದಯವಿಟ್ಟು ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಎಪಿಐ ಕೀಲಿಯನ್ನು ಸೇರಿಸಿ.' 
            : 'To see the live bus route on a map, please add your Google Maps API key.'}
        </p>
        <div className="text-left text-xs bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <p className="font-bold text-amber-600 italic">{isKn ? 'ಅಭಿವೃದ್ಧಿ ಹಂತದ ಸೂಚನೆಗಳು:' : 'Environment Tips:'}</p>
          <p>1. {isKn ? 'ಮ್ಯಾಪ್ ಕಾಣಿಸದಿದ್ದರೆ, .env ಫೈಲ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಕೀ ಇದೆಯೇ ಪರೀಕ್ಷಿಸಿ.' : 'If maps don\'t show, ensure VITE_GOOGLE_MAPS_PLATFORM_KEY is set in your .env.'}</p>
          <p>2. {isKn ? 'ಬದಲಾವಣೆಗಳಿಗಾಗಿ npm run build ಚಲಾಯಿಸಿ.' : 'Run npm run build to apply changes.'}</p>
          <div className="mt-4 pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">{isKn ? 'ನಿಮ್ಮ ಯೋಜನೆಯ ಲಿಂಕ್:' : 'Project Preview Link (Share this):'}</p>
            <code className="block p-1 bg-slate-50 rounded text-blue-600 select-all">https://ais-pre-5hnnm6fzmtmzs3fvjmodvl-749786148202.asia-southeast1.run.app</code>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedRoute) return null;

  const stopLocations = selectedRoute.stops.map(s => s.location);
  const busLocation = latestPing 
    ? selectedRoute.stops.find(s => s.id === latestPing.stopId)?.location 
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={stopLocations[0]}
          defaultZoom={10}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
          disableDefaultUI={true}
          zoomControl={true}
        >
          <RoutePath stops={stopLocations} />
          
          {selectedRoute.stops.map((stop, i) => (
            <AdvancedMarker key={stop.id} position={stop.location}>
              <div className="relative group">
                <div className="bg-white p-1 rounded-full border-2 border-slate-400 shadow-sm group-hover:border-emerald-500 transition-colors">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                  {language === 'kn' && stop.nameKn ? stop.nameKn : stop.name}
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {busLocation && (
            <AdvancedMarker position={busLocation}>
              <div className="bg-emerald-600 p-2 rounded-xl shadow-xl border-4 border-white animate-bounce-short">
                <Bus size={20} className="text-white" />
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

// Tailored animation for the bus
const styleTag = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleTag) {
  styleTag.innerHTML = `
    @keyframes bounce-short {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce-short {
      animation: bounce-short 1s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleTag);
}
