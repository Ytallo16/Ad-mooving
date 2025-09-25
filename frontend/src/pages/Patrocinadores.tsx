import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstagramFloat from "@/components/InstagramFloat";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, MessageCircle } from "lucide-react";

// Ícone personalizado do WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);
import logoCleiton from "@/assets/logo_cleiton_cell.webp";
import backgroundCleiton from "@/assets/background_cleiton_cell.webp";
import rapidexLogo from "@/assets/rapidex.svg";
import backgroundRapidex from "@/assets/RAPIDEXLOGO.webp";
import ebenezerLogo from "@/assets/ebenezer_logo.webp";

interface Patrocinador {
  id: number;
  nome: string;
  logo: string;
  descricao: string;
  instagram?: string; // @usuario
  whatsapp?: string; // número em formato local
  backgroundImage?: string; // imagem de fundo
  logoBgClass?: string; // classe para fundo do logo
  logoImgClass?: string; // classe para ajustar tamanho/contraste do logo
}

const patrocinadores: Patrocinador[] = [
  {
    id: 1,
    nome: "Cleiton Cell",
    logo: logoCleiton,
    descricao: "Especialista em assistência técnica de celulares e smartphones.",
    instagram: "cleitoncellprimeoficial",
    whatsapp: "(86) 8826-1642",
    backgroundImage: backgroundCleiton,
    logoBgClass: "bg-black p-3",
    logoImgClass: "w-24 h-24 scale-110"
  },
  {
    id: 2,
    nome: "Rapidex Telecom",
    logo: rapidexLogo,
    descricao: "Soluções em telecomunicações e internet de alta velocidade para residências e empresas.",
    instagram: "rapidex.telecom",
    whatsapp: "(86) 99984-50005",
    logoImgClass: "w-24 h-24 scale-110",
    logoBgClass: "bg-black/80 p-3",
    backgroundImage: backgroundRapidex
  },
  {
    id: 3,
    nome: "Livraria Ebenezer",
    logo: ebenezerLogo,
    descricao: "Livros cristãos, Bíblias e materiais de estudo bíblico para fortalecer sua fé.",
    instagram: "livrariaebenezer01",
    whatsapp: "(86) 9919-4554",
    logoImgClass: "w-24 h-24 scale-110",
    logoBgClass: "bg-white p-3"
  }
];

const Patrocinadores = () => {
  const listaFinal = patrocinadores;

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
        className="px-4 pb-16 mx-auto max-w-6xl sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {listaFinal.map((p) => (
            <div key={p.id} className="h-full">
              <Card className="h-[320px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white flex flex-col">
                <div 
                  className={`h-32 p-5 flex items-center ${p.backgroundImage ? 'relative' : 'bg-[linear-gradient(135deg,#0b1e3a,#0a2348)]'}`}
                  style={p.backgroundImage ? { 
                    backgroundImage: `url(${p.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  {p.backgroundImage && (
                    <div className="absolute inset-0 bg-black/40 rounded-t-lg"></div>
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`${p.logoBgClass ?? (p.backgroundImage ? 'bg-white/90 p-2' : 'bg-white/20 p-2')} rounded-lg backdrop-blur-sm`}>
                      {p.logo.includes('http') || p.logo.includes('.') ? (
                        <img 
                          src={p.logo} 
                          alt={`Logo ${p.nome}`}
                          className={`${p.logoImgClass ?? 'w-10 h-10'} object-contain`}
                        />
                      ) : (
                        <span className={`${p.logoImgClass ?? 'w-10 h-10'} flex items-center justify-center text-6xl`}>{p.logo}</span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${p.backgroundImage ? 'text-white' : 'text-white'}`}>{p.nome}</h3>
                      <p className={`text-sm ${p.backgroundImage ? 'text-gray-200' : 'text-blue-100'}`}>Patrocinador oficial</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-2 flex-1 flex flex-col">
                  <p className="text-gray-700 leading-relaxed">{p.descricao}</p>

                  {(p.instagram || p.whatsapp) && (
                    <div className="pt-0 border-t border-gray-100 mt-0 sm:mt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1 sm:mt-2">
                        {p.instagram && (
                          <a
                            href={`https://www.instagram.com/${p.instagram.replace('@','')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition text-sm"
                          >
                            <Instagram className="w-4 h-4" />
                            <span className="truncate max-w-full">@{p.instagram.replace('@','')}</span>
                          </a>
                        )}
                        {p.whatsapp && (
                          <a
                            href={`https://wa.me/55${p.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition text-sm"
                          >
                            <WhatsAppIcon className="w-4 h-4" />
                            <span className="truncate max-w-full">WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section removida para simplificar a página */}
      
      <Footer />
      <InstagramFloat />
    </div>
  );
};

export default Patrocinadores; 