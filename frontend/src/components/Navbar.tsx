import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-race-primary-light z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-race-primary to-race-secondary bg-clip-text text-transparent">ADMOOVING</h1>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-race-primary ${
              location.pathname === "/" ? "text-race-primary" : "text-foreground"
            }`}
          >
            Início
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