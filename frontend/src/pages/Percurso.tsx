import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Route, 
  Flag, 
  Trophy, 
  Users, 
  Calendar,
  Navigation,
  Zap,
  Mountain,
  Droplets,
  Sun
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import LeafletMap, { pontosInteresse, PontoInteresse } from "@/components/LeafletMap";

// Usando os pontos importados do componente LeafletMap

const Percurso = () => {
  const [pontoSelecionado, setPontoSelecionado] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Route className="w-8 h-8 text-yellow-300 mr-3" />
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-teko">
                Percurso da Corrida
              </h1>
              <Route className="w-8 h-8 text-yellow-300 ml-3" />
            </div>
            <p className="max-w-2xl mx-auto text-xl text-blue-100 font-29lt">
              Conheça o trajeto oficial da 2ª Edição do ADMOOVING
            </p>
          </motion.div>
        </div>
      </div>

      {/* Informações Gerais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icone: Route, valor: "10 km", label: "Distância Total", cor: "text-blue-600" },
            { icone: Clock, valor: "1h30min", label: "Tempo Estimado", cor: "text-green-600" },
            { icone: Mountain, valor: "Plano", label: "Tipo de Terreno", cor: "text-purple-600" },
            { icone: Sun, valor: "Manhã", label: "Horário", cor: "text-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
                <stat.icone className={`w-6 h-6 ${stat.cor}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.valor}</div>
              <div className="text-gray-600 font-29lt">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mapa do Percurso */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Pontos */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-race-primary">
                  <Navigation className="w-5 h-5 mr-2" />
                  Pontos do Percurso
                </CardTitle>
                <CardDescription>
                  Clique em um ponto para ver mais detalhes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pontosInteresse.map((ponto, index) => (
                  <motion.div
                    key={ponto.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        pontoSelecionado === ponto.id
                          ? 'border-race-primary bg-race-primary/5'
                          : 'border-gray-200 hover:border-race-primary/50'
                      }`}
                      onClick={() => setPontoSelecionado(pontoSelecionado === ponto.id ? null : ponto.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${ponto.cor} text-white`}>
                          {ponto.icone}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{ponto.nome}</h4>
                            <Badge variant="outline" className="text-xs">
                              {ponto.km} km
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{ponto.descricao}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mapa Interativo do Google Maps */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center text-race-primary">
                  <MapPin className="w-5 h-5 mr-2" />
                  Mapa do Percurso
                </CardTitle>
                <CardDescription>
                  Visualização interativa do trajeto da corrida com OpenStreetMap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeafletMap 
                  pontos={pontosInteresse}
                  onPontoClick={(ponto) => setPontoSelecionado(ponto.id)}
                  pontoSelecionado={pontoSelecionado}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Detalhes do Ponto Selecionado */}
      {pontoSelecionado && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
        >
          <Card className="bg-gradient-to-r from-race-primary/5 to-race-secondary/5 border-race-primary/20">
            <CardContent className="p-6">
              {(() => {
                const ponto = pontosInteresse.find(p => p.id === pontoSelecionado);
                if (!ponto) return null;
                
                return (
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${ponto.cor} text-white`}>
                      {ponto.icone}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-race-primary mb-2">{ponto.nome}</h3>
                      <p className="text-gray-700 mb-4">{ponto.descricao}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Route className="w-4 h-4 mr-1" />
                          {ponto.km} km
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.round(ponto.km * 6)} min estimado
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Informações Importantes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-race-primary">
                <Users className="w-5 h-5 mr-2" />
                Regras da Corrida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-race-primary rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Chegada obrigatória 30 minutos antes da largada</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-race-primary rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Uso obrigatório do número de peito fornecido</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-race-primary rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Respeitar os postos de hidratação</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-race-primary rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Seguir as orientações dos organizadores</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-race-primary">
                <Calendar className="w-5 h-5 mr-2" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">06:00</span>
                <span className="text-sm text-gray-600">Abertura do credenciamento</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">07:30</span>
                <span className="text-sm text-gray-600">Aquecimento coletivo</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">08:00</span>
                <span className="text-sm text-gray-600">Largada oficial</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">09:30</span>
                <span className="text-sm text-gray-600">Premiação</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <div className="bg-gradient-to-r from-race-primary to-race-secondary text-white border-0 rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4 font-teko">
              Pronto para a corrida?
            </h2>
            <p className="text-xl text-race-primary-light mb-8 max-w-2xl mx-auto font-29lt">
              Faça sua inscrição e garante sua vaga na 2ª Edição do ADMOOVING!
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-race-primary hover:bg-gray-100 font-29lt"
            >
              Fazer Inscrição
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Percurso;
