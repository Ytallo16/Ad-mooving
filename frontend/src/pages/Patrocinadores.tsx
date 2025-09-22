import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe, Building2 } from "lucide-react";
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
    categoria: "Ouro",
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

  const prioridade: Record<string, number> = { Ouro: 0, Prata: 1, Bronze: 2 };
  const listaFinal = (categoriaFiltro === "Todas"
    ? [...patrocinadores].sort((a, b) => (prioridade[a.categoria] - prioridade[b.categoria]) || a.nome.localeCompare(b.nome))
    : patrocinadoresFiltrados.sort((a, b) => a.nome.localeCompare(b.nome))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl font-teko">Nossos Patrocinadores</h1>
            <p className="max-w-2xl mx-auto text-lg text-blue-100 mt-3">Empresas que apoiam e acreditam no nosso evento.</p>
          </motion.div>
        </div>
      </div>

      

      {/* Filtros */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["Todas", "Ouro", "Prata", "Bronze"].map((categoria) => (
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

      {/* Lista de Patrocinadores (simples, ordenada por prioridade) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {listaFinal.map((patrocinador, index) => (
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white border-0 rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4 font-teko">
              Quer ser um patrocinador?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-29lt">
              Junte-se às empresas visionárias que estão moldando o futuro.
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
                 className="bg-white text-blue-600 hover:bg-gray-100"
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