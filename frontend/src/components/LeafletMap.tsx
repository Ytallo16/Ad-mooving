import React, { useEffect, useState } from 'react';
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

// Coordenadas do percurso da corrida ADMOOVING
// ATENÇÃO: Substitua estas coordenadas pelas coordenadas reais do seu percurso
// Para obter as coordenadas exatas, use o OpenStreetMap:
// 1. Acesse https://www.openstreetmap.org/
// 2. Clique com o botão direito no local desejado
// 3. Selecione "Mostrar coordenadas"
// 4. Substitua os valores lat e lng abaixo

const pontosInteresse: PontoInteresse[] = [
  {
    id: 1,
    nome: "Largada",
    descricao: "Praça Central - Ponto de partida oficial",
    km: 0,
    tipo: 'inicio',
    lat: -23.5505, // Substitua pela latitude real da largada
    lng: -46.6333, // Substitua pela longitude real da largada
    icone: <Flag className="w-5 h-5" />,
    cor: "green"
  },
  {
    id: 2,
    nome: "Checkpoint 1",
    descricao: "Posto de hidratação e cronometragem",
    km: 2.5,
    tipo: 'checkpoint',
    lat: -23.5485, // Substitua pela latitude real do checkpoint 1
    lng: -46.6313, // Substitua pela longitude real do checkpoint 1
    icone: <Zap className="w-5 h-5" />,
    cor: "blue"
  },
  {
    id: 3,
    nome: "Hidratação",
    descricao: "Posto de água e isotônico",
    km: 5.0,
    tipo: 'hidratacao',
    lat: -23.5465, // Substitua pela latitude real do posto de hidratação
    lng: -46.6293, // Substitua pela longitude real do posto de hidratação
    icone: <Droplets className="w-5 h-5" />,
    cor: "cyan"
  },
  {
    id: 4,
    nome: "Checkpoint 2",
    descricao: "Ponto de cronometragem intermediário",
    km: 7.5,
    tipo: 'checkpoint',
    lat: -23.5445, // Substitua pela latitude real do checkpoint 2
    lng: -46.6273, // Substitua pela longitude real do checkpoint 2
    icone: <Zap className="w-5 h-5" />,
    cor: "blue"
  },
  {
    id: 5,
    nome: "Chegada",
    descricao: "Praça Central - Linha de chegada",
    km: 10.0,
    tipo: 'final',
    lat: -23.5425, // Substitua pela latitude real da chegada
    lng: -46.6253, // Substitua pela longitude real da chegada
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
    pontos.length > 0 ? pontos[0].lat : -23.5505,
    pontos.length > 0 ? pontos[0].lng : -46.6333
  ]);

  // Criar linha do percurso
  const routePath = pontos.map(ponto => [ponto.lat, ponto.lng] as [number, number]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
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
        
        {/* Linha do percurso */}
        <Polyline
          positions={routePath}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
        />
        
        {/* Marcadores dos pontos */}
        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.lat, ponto.lng]}
            icon={createCustomIcon(ponto.cor, ponto.tipo)}
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
  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-race-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando mapa...</p>
    </div>
  </div>
);

// Componente de fallback caso o Leaflet não carregue
const FallbackMap: React.FC<{ pontos: PontoInteresse[] }> = ({ pontos }) => (
  <div className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-8 overflow-hidden border border-gray-200">
    <div className="text-center mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Percurso da Corrida</h3>
      <p className="text-gray-600">Visualização do trajeto de 10km</p>
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
          style={{ left: `${(ponto.km / 10) * 100}%` }}
        >
          {ponto.tipo === 'inicio' ? '🏁' : 
           ponto.tipo === 'checkpoint' ? '⚡' : 
           ponto.tipo === 'hidratacao' ? '💧' : 
           ponto.tipo === 'final' ? '🏆' : '📍'}
        </div>
      ))}
      
      {/* Labels dos quilômetros */}
      {[0, 2.5, 5, 7.5, 10].map((km, index) => (
        <div
          key={km}
          className="absolute top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm"
          style={{ left: `${(km / 10) * 100}%` }}
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