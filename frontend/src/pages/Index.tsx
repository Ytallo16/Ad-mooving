import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("/CAPA SITE AD MOVING 2ED.png")`, backgroundSize: 'cover' }}
        >
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-race-primary mb-4">Informações do Evento</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Junte-se a nós nesta jornada de fé, saúde e comunidade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-race-primary-light">
              <CardHeader>
                <Calendar className="mx-auto mb-2 h-8 w-8 text-race-primary" />
                <CardTitle className="text-race-primary">Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">15 de Março, 2025</p>
                <p className="text-sm text-muted-foreground">Sábado</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-race-primary-light">
              <CardHeader>
                <Clock className="mx-auto mb-2 h-8 w-8 text-race-primary" />
                <CardTitle className="text-race-primary">Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">6:00 às 11:00</p>
                <p className="text-sm text-muted-foreground">Manhã</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-race-primary-light">
              <CardHeader>
                <MapPin className="mx-auto mb-2 h-8 w-8 text-race-primary" />
                <CardTitle className="text-race-primary">Local</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">Parque da Igreja</p>
                <p className="text-sm text-muted-foreground">Endereço completo em breve</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-race-primary-light">
              <CardHeader>
                <Users className="mx-auto mb-2 h-8 w-8 text-race-primary" />
                <CardTitle className="text-race-primary">Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">500+ inscritos</p>
                <p className="text-sm text-muted-foreground">Todas as idades</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-race-primary-light/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-race-primary mb-4">Categorias</h2>
            <p className="text-lg text-muted-foreground">
              Escolha a modalidade que mais combina com você
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-race-secondary-light">
              <CardHeader className="text-center">
                <Trophy className="mx-auto mb-2 h-8 w-8 text-race-secondary" />
                <CardTitle className="text-race-secondary">5km Corrida</CardTitle>
                <CardDescription>Para corredores iniciantes</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-race-secondary mb-2">R$ 25</p>
                <p className="text-sm text-muted-foreground">Inclui kit do corredor</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-race-secondary-light">
              <CardHeader className="text-center">
                <Trophy className="mx-auto mb-2 h-8 w-8 text-race-secondary" />
                <CardTitle className="text-race-secondary">10km Corrida</CardTitle>
                <CardDescription>Para corredores experientes</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-race-secondary mb-2">R$ 25</p>
                <p className="text-sm text-muted-foreground">Inclui kit do corredor</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-race-accent-light">
              <CardHeader className="text-center">
                <Heart className="mx-auto mb-2 h-8 w-8 text-race-accent" />
                <CardTitle className="text-race-accent">3km Caminhada</CardTitle>
                <CardDescription>Para toda a família</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-race-accent mb-2">R$ 25</p>
                <p className="text-sm text-muted-foreground">Inclui kit do participante</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-race-primary-light">
              <CardHeader className="text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-race-primary" />
                <CardTitle className="text-race-primary">Kids</CardTitle>
                <CardDescription>Para crianças até 12 anos</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-race-primary mb-2">R$ 15</p>
                <p className="text-sm text-muted-foreground">Inclui kit infantil</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-race-primary to-race-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para o Movimento?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Inscreva-se agora e faça parte desta experiência única de fé, 
            saúde e comunidade. Vagas limitadas!
          </p>
          
          <Link to="/inscricoes">
            <Button size="lg" className="bg-white text-race-primary hover:bg-white/90 text-lg px-8 py-4">
              Garantir Minha Vaga
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-race-primary-light">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 ADMOOVING - Corrida da Igreja. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
