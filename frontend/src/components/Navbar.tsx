import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-race-primary-light z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/Logo AD Dirceu.png" 
            alt="Logo AD Dirceu" 
            className="h-20 w-auto"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-race-primary to-race-secondary bg-clip-text text-transparent">ADMOOVING</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 ${
              location.pathname === "/" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Início
          </Link>
          <Link 
            to="/sobre" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 ${
              location.pathname === "/sobre" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Sobre o Evento
          </Link>
          <Link 
            to="/localizacao" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 ${
              location.pathname === "/localizacao" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Localização
          </Link>
          <Link 
            to="/patrocinadores" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 ${
              location.pathname === "/patrocinadores" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Patrocinadores
          </Link>
          <Link 
            to="/contatos" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 ${
              location.pathname === "/contatos" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Contatos
          </Link>
          <Link to="/inscricoes">
            <Button 
              variant={location.pathname === "/inscricoes" ? "default" : "outline"}
              className="bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white border-race-primary"
            >
              Inscrições
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;