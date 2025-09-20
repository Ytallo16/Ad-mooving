import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-race-primary-light z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/Logo AD Dirceu.png" 
            alt="Logo AD Dirceu" 
            className="h-12 md:h-20 w-auto"
          />
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-race-primary to-race-secondary bg-clip-text text-transparent font-teko">ADMOOVING</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
              location.pathname === "/" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Início
          </Link>
          <Link 
            to="/sobre" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
              location.pathname === "/sobre" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Sobre o Evento
          </Link>
          <Link 
            to="/percurso" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
              location.pathname === "/percurso" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Percurso
          </Link>
          <Link 
            to="/patrocinadores" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
              location.pathname === "/patrocinadores" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Patrocinadores
          </Link>
          <Link 
            to="/contatos" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
              location.pathname === "/contatos" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
            }`}
          >
            Contatos
          </Link>
          <Link to="/inscricoes">
            <Button 
              variant={location.pathname === "/inscricoes" ? "default" : "outline"}
              className="bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white border-race-primary font-29lt"
            >
              Inscrições
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <Link to="/inscricoes">
            <Button 
              size="sm"
              variant={location.pathname === "/inscricoes" ? "default" : "outline"}
              className="bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white border-race-primary font-29lt text-xs px-3"
            >
              Inscrições
            </Button>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-race-primary hover:bg-race-primary/10 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-race-primary-light">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
                location.pathname === "/" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
              }`}
            >
              Início
            </Link>
            <Link 
              to="/sobre" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
                location.pathname === "/sobre" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
              }`}
            >
              Sobre o Evento
            </Link>
            <Link 
              to="/percurso" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
                location.pathname === "/percurso" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
              }`}
            >
              Percurso
            </Link>
            <Link 
              to="/patrocinadores" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
                location.pathname === "/patrocinadores" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
              }`}
            >
              Patrocinadores
            </Link>
            <Link 
              to="/contatos" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-race-primary/10 font-29lt ${
                location.pathname === "/contatos" ? "bg-race-primary/20 text-race-primary" : "text-foreground hover:text-race-primary"
              }`}
            >
              Contatos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;