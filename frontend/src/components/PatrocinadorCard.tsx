import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star, Award, Heart, Users } from "lucide-react";

interface PatrocinadorCardProps {
  patrocinador: {
    id: number;
    nome: string;
    categoria: "Diamante" | "Ouro" | "Prata" | "Bronze";
    logo: string;
    descricao: string;
    website: string;
    setor: string;
  };
  index: number;
}

const categorias = {
  Diamante: { 
    cor: "from-purple-600 to-pink-600", 
    icone: Star,
    bgGradient: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200"
  },
  Ouro: { 
    cor: "from-yellow-500 to-orange-500", 
    icone: Award,
    bgGradient: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200"
  },
  Prata: { 
    cor: "from-gray-400 to-gray-600", 
    icone: Heart,
    bgGradient: "from-gray-50 to-slate-50",
    borderColor: "border-gray-200"
  },
  Bronze: { 
    cor: "from-amber-600 to-orange-700", 
    icone: Users,
    bgGradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200"
  }
};

const PatrocinadorCard = ({ patrocinador, index }: PatrocinadorCardProps) => {
  const categoriaInfo = categorias[patrocinador.categoria];
  const CategoriaIcone = categoriaInfo.icone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={`h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${categoriaInfo.borderColor} bg-gradient-to-br ${categoriaInfo.bgGradient}`}>
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${categoriaInfo.cor} p-4`}>
          <div className="flex items-center space-x-3">
            <div className="text-4xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              {patrocinador.logo}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {patrocinador.nome}
              </h3>
              <Badge 
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <CategoriaIcone className="w-3 h-3 mr-1" />
                {patrocinador.categoria}
              </Badge>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {patrocinador.descricao}
          </p>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {patrocinador.setor}
            </Badge>
          </div>
          
          <div className="pt-4">
            <Button 
              className={`w-full bg-gradient-to-r ${categoriaInfo.cor} hover:opacity-90 text-white border-0 shadow-lg`}
              onClick={() => window.open(patrocinador.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visitar Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PatrocinadorCard; 