import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Flag, Zap, Droplets, Trophy } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar ícones do Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

interface PontoInteresse {
  id: number;
  nome: string;
  descricao: string;
  km: number;
  tipo: 'inicio' | 'checkpoint' | 'hidratacao' | 'final';
  lat: number;
  lng: number;
  icone: React.ReactNode;
  cor: string;
}

interface LeafletMapProps {
  pontos: PontoInteresse[];
  onPontoClick?: (ponto: PontoInteresse) => void;
  pontoSelecionado?: number | null;
}

// Coordenadas do percurso da corrida ADMOVING
// ATENÇÃO: Substitua estas coordenadas pelas coordenadas reais do seu percurso
// Para obter as coordenadas exatas, use o OpenStreetMap:
// 1. Acesse https://www.openstreetmap.org/
// 2. Clique com o botão direito no local desejado
// 3. Selecione "Mostrar coordenadas"
// 4. Substitua os valores lat e lng abaixo

const pontosInteresse: PontoInteresse[] = [
  {
    id: 1,
    nome: "Largada - Parque Potycabana",
    descricao: "Ponto de partida oficial da corrida",
    km: 0,
    tipo: 'inicio',
    lat: -5.086352724936339, // Latitude real da largada
    lng: -42.79094257659999, // Longitude real da largada
    icone: <Flag className="w-5 h-5" />,
    cor: "green"
  },
  {
    id: 2,
    nome: "Checkpoint 1",
    descricao: "Posto de hidratação e cronometragem",
    km: 1.5,
    tipo: 'checkpoint',
    lat: -5.0842,
    lng: -42.7878,
    icone: <Zap className="w-5 h-5" />,
    cor: "blue"
  },
  {
    id: 3,
    nome: "Hidratação",
    descricao: "Posto de água e isotônico",
    km: 2.5,
    tipo: 'hidratacao',
    lat: -5.0825,
    lng: -42.7849,
    icone: <Droplets className="w-5 h-5" />,
    cor: "cyan"
  },
  {
    id: 4,
    nome: "Checkpoint 2",
    descricao: "Ponto de cronometragem intermediário",
    km: 3.5,
    tipo: 'checkpoint',
    lat: -5.0840,
    lng: -42.7830,
    icone: <Zap className="w-5 h-5" />,
    cor: "blue"
  },
  {
    id: 5,
    nome: "Chegada - Teresina Shopping",
    descricao: "Linha de chegada da corrida",
    km: 5.0,
    tipo: 'final',
    lat: -5.0862,
    lng: -42.7908,
    icone: <Trophy className="w-5 h-5" />,
    cor: "yellow"
  }
];

// Componente para ajustar o zoom automaticamente
const MapBounds: React.FC<{ pontos: PontoInteresse[] }> = ({ pontos }) => {
  const map = useMap();

  useEffect(() => {
    if (pontos.length > 0) {
      const bounds = L.latLngBounds(
        pontos.map(ponto => [ponto.lat, ponto.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, pontos]);

  return null;
};

// Cores personalizadas para os marcadores
const getMarkerColor = (cor: string) => {
  const colors: { [key: string]: string } = {
    green: '#22c55e',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    yellow: '#eab308',
    red: '#ef4444'
  };
  return colors[cor] || '#6b7280';
};

// Criar ícone personalizado para cada tipo de marcador
const createCustomIcon = (cor: string, tipo: string) => {
  const color = getMarkerColor(cor);
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
        font-weight: bold;
      ">
        ${tipo === 'inicio' ? '🏁' : 
          tipo === 'checkpoint' ? '⚡' : 
          tipo === 'hidratacao' ? '💧' : 
          tipo === 'final' ? '🏆' : '📍'}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const LeafletMapComponent: React.FC<LeafletMapProps> = ({ 
  pontos, 
  onPontoClick, 
  pontoSelecionado 
}) => {
  const [mapCenter] = useState<[number, number]>([
    pontos.length > 0 ? pontos[0].lat : -5.086352724936339,
    pontos.length > 0 ? pontos[0].lng : -42.79094257659999
  ]);
  const [routedPath, setRoutedPath] = useState<[number, number][]>([]);
  const markerRefs = useRef<Record<number, L.Marker | null>>({});

  // Construir rota seguindo as ruas usando OSRM (perfil a pé)
  useEffect(() => {
    const buildRoutedPath = async () => {
      const coords = pontos.map(p => `${p.lng},${p.lat}`).join(';');
      const buildFromProfile = async (profile: 'foot' | 'driving') => {
        const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&alternatives=false&steps=false`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const route = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(route)) return null;
        const latlngs: [number, number][] = route.map((c: [number, number]) => [c[1], c[0]]);
        return latlngs;
      };

      if (!pontos || pontos.length < 2) {
        setRoutedPath(pontos.map(p => [p.lat, p.lng] as [number, number]));
        return;
      }

      // Tenta a pé; se a instância pública não suportar, cai para driving
      const foot = await buildFromProfile('foot');
      if (foot && foot.length > 1) {
        setRoutedPath(foot);
        return;
      }
      const driving = await buildFromProfile('driving');
      if (driving && driving.length > 1) {
        setRoutedPath(driving);
        return;
      }
      // Fallback: linhas retas entre pontos
      setRoutedPath(pontos.map(p => [p.lat, p.lng] as [number, number]));
    };
    buildRoutedPath();
  }, [pontos]);

  // Componente interno para focar no ponto selecionado quando mudar
  const MapFocus: React.FC<{ selected: PontoInteresse | null | undefined }> = ({ selected }) => {
    const map = useMap();
    useEffect(() => {
      if (!selected) return;
      map.flyTo([selected.lat, selected.lng], 18, { animate: true, duration: 0.8 });
    }, [selected, map]);
    return null;
  };

  // Abrir popup do marcador do ponto selecionado após focar
  useEffect(() => {
    if (!pontoSelecionado) return;
    const marker = markerRefs.current[pontoSelecionado];
    if (marker) {
      const timer = setTimeout(() => {
        try {
          marker.openPopup();
        } catch {}
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pontoSelecionado]);

  return (
    <div className="w-full h-[420px] md:h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        {/* TileLayer do OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ajustar zoom para mostrar todos os pontos */}
        <MapBounds pontos={pontos} />
        {/* Focar no ponto selecionado, se houver */}
        <MapFocus selected={pontos.find(p => p.id === (pontoSelecionado ?? -1))} />
        
        {/* Linha do percurso - usa rota por ruas quando disponível */}
        {routedPath.length > 1 && (
          <Polyline
            positions={routedPath}
            color="#3b82f6"
            weight={4}
            opacity={0.9}
          />
        )}
        
        {/* Marcadores dos pontos */}
        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.lat, ponto.lng]}
            icon={createCustomIcon(ponto.cor, ponto.tipo)}
            ref={(ref) => { markerRefs.current[ponto.id] = (ref as unknown as L.Marker) || null; }}
            eventHandlers={{
              click: () => {
                if (onPontoClick) {
                  onPontoClick(ponto);
                }
              }
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {ponto.nome}
                </h3>
                <p className="text-gray-700 mb-2 text-sm">
                  {ponto.descricao}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {ponto.km} km</span>
                  <span>⏱️ {Math.round(ponto.km * 6)} min estimado</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Componente de loading
const LoadingComponent: React.FC = () => (
  <div className="w-full h-[420px] md:h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-race-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando mapa...</p>
    </div>
  </div>
);

// Componente de fallback caso o Leaflet não carregue
const FallbackMap: React.FC<{ pontos: PontoInteresse[] }> = ({ pontos }) => (
  <div className="w-full h-[420px] md:h-[600px] bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-8 overflow-hidden border border-gray-200">
    <div className="text-center mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Percurso da Corrida</h3>
      <p className="text-gray-600">Visualização do trajeto de 5km</p>
    </div>
    
    {/* Representação visual do percurso */}
    <div className="relative h-32 bg-white rounded-lg p-4 shadow-inner">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-yellow-500 rounded-full"></div>
      </div>
      
      {/* Pontos do percurso */}
      {pontos.map((ponto, index) => (
        <div
          key={ponto.id}
          className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
            ponto.cor === 'green' ? 'bg-green-500' :
            ponto.cor === 'blue' ? 'bg-blue-500' :
            ponto.cor === 'cyan' ? 'bg-cyan-500' :
            ponto.cor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
          style={{ left: `${(ponto.km / 5) * 100}%` }}
        >
          {ponto.tipo === 'inicio' ? '🏁' : 
           ponto.tipo === 'checkpoint' ? '⚡' : 
           ponto.tipo === 'hidratacao' ? '💧' : 
           ponto.tipo === 'final' ? '🏆' : '📍'}
        </div>
      ))}
      
      {/* Labels dos quilômetros */}
      {[0, 1, 2, 3, 4, 5].map((km, index) => (
        <div
          key={km}
          className="absolute top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm"
          style={{ left: `${(km / 5) * 100}%` }}
        >
          {km}km
        </div>
      ))}
    </div>
    
    {/* Lista de pontos */}
    <div className="mt-4 space-y-2">
      {pontos.map((ponto) => (
        <div key={ponto.id} className="flex items-center space-x-3 text-sm">
          <div className={`w-4 h-4 rounded-full ${
            ponto.cor === 'green' ? 'bg-green-500' :
            ponto.cor === 'blue' ? 'bg-blue-500' :
            ponto.cor === 'cyan' ? 'bg-cyan-500' :
            ponto.cor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
          <span className="font-medium">{ponto.nome}</span>
          <span className="text-gray-500">({ponto.km} km)</span>
        </div>
      ))}
    </div>
  </div>
);

// Componente principal com tratamento de erro
const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingComponent />;
  }

  if (hasError) {
    return <FallbackMap pontos={props.pontos} />;
  }

  return (
    <div className="relative">
      <LeafletMapComponent 
        {...props} 
        onError={() => setHasError(true)}
      />
      
      {/* Legenda do mapa */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Largada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Checkpoint</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
            <span>Hidratação</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Chegada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
export { pontosInteresse };
export type { PontoInteresse };