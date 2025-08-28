import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Globe,
  Building2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PatrocinadorCard from "@/components/PatrocinadorCard";
import Navbar from "@/components/Navbar";

interface Patrocinador {
  id: number;
  nome: string;
  categoria: "Diamante" | "Ouro" | "Prata" | "Bronze";
  logo: string;
  descricao: string;
  website: string;
  setor: string;
}

const patrocinadores: Patrocinador[] = [
  {
    id: 1,
    nome: "TechCorp Solutions",
    categoria: "Diamante",
    logo: "🚀",
    descricao: "Líder em soluções tecnológicas inovadoras para o futuro da mobilidade urbana.",
    website: "https://techcorp.com",
    setor: "Tecnologia"
  },
  {
    id: 2,
    nome: "EcoMobility",
    categoria: "Ouro",
    logo: "🌱",
    descricao: "Especialistas em soluções sustentáveis para transporte urbano inteligente.",
    website: "https://ecomobility.com",
    setor: "Sustentabilidade"
  },
  {
    id: 3,
    nome: "UrbanFlow",
    categoria: "Ouro",
    logo: "🏙️",
    descricao: "Transformando a mobilidade urbana com tecnologia de ponta e inovação.",
    website: "https://urbanflow.com",
    setor: "Mobilidade Urbana"
  },
  {
    id: 4,
    nome: "SmartCity Labs",
    categoria: "Prata",
    logo: "🏗️",
    descricao: "Desenvolvendo cidades inteligentes através de soluções inovadoras de transporte.",
    website: "https://smartcitylabs.com",
    setor: "Infraestrutura"
  },
  {
    id: 5,
    nome: "GreenTech",
    categoria: "Prata",
    logo: "🌿",
    descricao: "Tecnologias verdes para um futuro mais sustentável e conectado.",
    website: "https://greentech.com",
    setor: "Tecnologia Verde"
  },
  {
    id: 6,
    nome: "MobilityHub",
    categoria: "Bronze",
    logo: "🚗",
    descricao: "Conectando ideias e soluções para o futuro da mobilidade.",
    website: "https://mobilityhub.com",
    setor: "Plataforma"
  }
];



const Patrocinadores = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");

  const patrocinadoresFiltrados = categoriaFiltro === "Todas" 
    ? patrocinadores 
    : patrocinadores.filter(p => p.categoria === categoriaFiltro);

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
      transition: {
        duration: 0.5
      }
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
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-yellow-300 mr-3" />
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Nossos Patrocinadores
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-300 ml-3" />
            </div>
            <p className="max-w-2xl mx-auto text-xl text-blue-100">
              Empresas visionárias que acreditam no futuro da mobilidade urbana e 
              apoiam a inovação em nosso evento.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icone: Building2, valor: "6", label: "Patrocinadores", cor: "text-blue-600" },
            { icone: TrendingUp, valor: "R$ 260k+", label: "Investimento Total", cor: "text-green-600" },
            { icone: Globe, valor: "4", label: "Categorias", cor: "text-purple-600" },
            { icone: Building2, valor: "1000+", label: "Participantes", cor: "text-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className={`mx-auto w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center mb-4`}>
                <stat.icone className={`w-6 h-6 ${stat.cor}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.valor}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Todas", "Diamante", "Ouro", "Prata", "Bronze"].map((categoria) => (
            <Button
              key={categoria}
              variant={categoriaFiltro === categoria ? "default" : "outline"}
              onClick={() => setCategoriaFiltro(categoria)}
              className="rounded-full"
            >
              {categoria}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Patrocinadores */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {patrocinadoresFiltrados.map((patrocinador, index) => (
            <PatrocinadorCard 
              key={patrocinador.id} 
              patrocinador={patrocinador} 
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white border-0 rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4 font-teko">
              Quer ser um patrocinador?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-29lt">
              Junte-se às empresas visionárias que estão moldando o futuro da mobilidade urbana. 
              Entre em contato conosco para conhecer as oportunidades de patrocínio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Solicitar Informações
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Baixar Kit do Patrocinador
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Patrocinadores; 