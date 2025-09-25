import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

interface Patrocinador {
  id: number;
  nome: string;
  logo: string;
  descricao: string;
  website: string;
}

const patrocinadores: Patrocinador[] = [
  {
    id: 1,
    nome: "TechCorp Solutions",
    logo: "🚀",
    descricao: "Líder em soluções tecnológicas inovadoras para o futuro da mobilidade urbana.",
    website: "https://techcorp.com"
  },
  {
    id: 2,
    nome: "EcoMobility",
    logo: "🌱",
    descricao: "Especialistas em soluções sustentáveis para transporte urbano inteligente.",
    website: "https://ecomobility.com"
  },
  {
    id: 3,
    nome: "UrbanFlow",
    logo: "🏙️",
    descricao: "Transformando a mobilidade urbana com tecnologia de ponta e inovação.",
    website: "https://urbanflow.com"
  },
  {
    id: 4,
    nome: "SmartCity Labs",
    logo: "🏗️",
    descricao: "Desenvolvendo cidades inteligentes através de soluções inovadoras de transporte.",
    website: "https://smartcitylabs.com"
  },
  {
    id: 5,
    nome: "GreenTech",
    logo: "🌿",
    descricao: "Tecnologias verdes para um futuro mais sustentável e conectado.",
    website: "https://greentech.com"
  },
  {
    id: 6,
    nome: "MobilityHub",
    logo: "🚗",
    descricao: "Conectando ideias e soluções para o futuro da mobilidade.",
    website: "https://mobilityhub.com"
  }
];

const Patrocinadores = () => {
  const listaFinal = [...patrocinadores].sort((a, b) => a.nome.localeCompare(b.nome));

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

      

      {/* Filtros removidos: listagem simples */}

      {/* Lista de Patrocinadores */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listaFinal.map((p) => (
            <div key={p.id} className="h-full">
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      {p.logo}
                    </div>
                    <h3 className="text-xl font-bold text-white">{p.nome}</h3>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-700 leading-relaxed">{p.descricao}</p>
                  <div className="pt-2">
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">Visitar Website</a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section removida para simplificar a página */}
      
      <Footer />
    </div>
  );
};

export default Patrocinadores; 