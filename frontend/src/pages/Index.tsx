import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-12-14T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[550px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in hover:scale-105 transition-transform duration-700 ease-out"
          style={{ backgroundImage: `url("/Fundo (4).png")`, backgroundSize: 'cover' }}
        >
        </div>
        
        {/* Button at bottom of hero */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Link to="/inscricoes">
            <Button 
              size="lg" 
              className="bg-race-primary hover:bg-race-primary-dark text-white text-lg px-8 py-4 shadow-lg animate-bounce"
            >
              Inscreva-se
            </Button>
          </Link>
        </div>
        
        {/* Cronômetro acima do botão */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 text-center">
          <div className="inline-block" key={`${timeLeft.days}-${timeLeft.hours}-${timeLeft.minutes}-${timeLeft.seconds}`}>
            
            
            <div className="flex gap-8 text-white">
              <div className="text-center">
                <div className="text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-lg font-semibold text-white/90 mt-2 font-29lt">Dias</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-lg font-semibold text-white/90 mt-2 font-29lt">Horas</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-lg font-semibold text-white/90 mt-2 font-29lt">Min</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-lg font-semibold text-white/90 mt-2 font-29lt">Seg</div>
              </div>
            </div>
            <div className="text-white/80 text-base mt-4 font-medium font-29lt">14 de Dezembro de 2025</div>
          </div>
        </div>
      </section>

      {/* Event Info - Novo Layout */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Informações do Evento</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Junte-se a nós nesta jornada de fé, saúde e comunidade
            </p>
          </div>
          
          {/* Cards de Informações - Grid Responsivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {/* Card Data */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-2 font-teko">Data</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">14 de Dezembro, 2025</p>
                <p className="text-gray-600 font-medium">Sábado</p>
              </div>
            </div>

            {/* Card Horário */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-2 font-teko">Horário</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">6:00 às 8:00</p>
                <p className="text-gray-600 font-medium">Manhã</p>
              </div>
            </div>

            {/* Card Local */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-2 font-teko">Local</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">Teresina Shopping</p>
                <p className="text-gray-600 font-medium">Ponto de encontro principal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Motivacional */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-race-primary/10 via-race-secondary/5 to-race-primary/10 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-race-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-race-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-race-primary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-8 font-teko leading-tight">
              "Pois nele vivemos, nos movemos e existimos"
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
              Mais que uma corrida, é uma jornada de transformação pessoal e espiritual
            </p>
            <p className="text-base md:text-lg text-race-secondary font-semibold italic">
              Atos 17:28
            </p>
            
            {/* Vídeo do YouTube */}
            <div className="my-12">
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/9BbjXy2_KZs?si=lGzYBrBgvlYG0JKG&autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
                    title="ADMOOVING - Vídeo Motivacional"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
              </div>
            </div>
            
           
          </div>
        </div>
      </section>

      {/* Galeria de Imagens - Placeholder */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Momentos Especiais</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Reviva os melhores momentos das edições anteriores
            </p>
          </div>
          
          {/* Grid de imagens - placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-race-primary/10 to-race-secondary/10 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-race-primary/30">
              <div className="text-center">
                <svg className="w-16 h-16 text-race-primary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-race-primary/70 font-medium">Imagem 1</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-race-secondary/10 to-race-primary/10 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-race-secondary/30">
              <div className="text-center">
                <svg className="w-16 h-16 text-race-secondary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-race-secondary/70 font-medium">Imagem 2</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-race-primary/10 to-race-secondary/10 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-race-primary/30">
              <div className="text-center">
                <svg className="w-16 h-16 text-race-primary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-race-primary/70 font-medium">Imagem 3</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias - Apenas 2 Corridas */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Categorias</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha a modalidade que mais combina com você
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {/* 5km Corrida */}
            <div className="bg-gradient-to-br from-race-primary/5 to-race-primary/10 rounded-2xl p-8 md:p-10 border-2 border-race-primary/20 hover:border-race-primary/40 transition-all duration-300 hover:shadow-xl group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-race-primary mb-4 font-teko">5km Corrida</h3>
                <p className="text-gray-600 mb-6 text-lg">Para corredores de todas as idades</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-race-primary">R$ 25</span>
                </div>
                <div className="bg-white rounded-lg p-6 mb-8 space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Kit completo do corredor</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Medalha de participação</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Cronometragem oficial</span>
                  </div>
                </div>
                <Link to="/inscricoes">
                  <Button className="w-full bg-race-primary hover:bg-race-primary-dark text-white font-bold py-4 text-lg">
                    Inscrever-se
                  </Button>
                </Link>
              </div>
            </div>

            {/* Kids */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 md:p-10 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-xl group relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                  INFANTIL
                </span>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v.5a1.5 1.5 0 01-1.5 1.5H9m0 0v-4m6 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-orange-600 mb-4 font-teko">Kids</h3>
                <p className="text-gray-600 mb-6 text-lg">Para crianças até 12 anos</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-orange-600">R$ 15</span>
                </div>
                <div className="bg-white rounded-lg p-6 mb-8 space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Kit infantil especial</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Medalha personalizada</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Acompanhamento dos pais</span>
                  </div>
                </div>
                <Link to="/inscricoes">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg">
                    Inscrever-se
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Depoimentos - Placeholder */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">O que dizem os participantes</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Histórias reais de transformação e superação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <div className="bg-gradient-to-br from-race-primary/5 to-race-secondary/5 rounded-2xl p-6 border border-race-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Maria Silva</h4>
                  <p className="text-sm text-gray-600">Participante 2024</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Uma experiência incrível! Mais que uma corrida, foi um momento de conexão com Deus e comigo mesma."
              </p>
            </div>
            
            {/* Depoimento 2 */}
            <div className="bg-gradient-to-br from-race-secondary/5 to-race-primary/5 rounded-2xl p-6 border border-race-secondary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-race-secondary to-race-primary rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">João Santos</h4>
                  <p className="text-sm text-gray-600">Participante 2024</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Levei minha família toda! As crianças adoraram e nós nos sentimos parte de uma comunidade especial."
              </p>
            </div>
            
            {/* Depoimento 3 */}
            <div className="bg-gradient-to-br from-race-primary/5 to-race-secondary/5 rounded-2xl p-6 border border-race-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-800">Ana Costa</h4>
                  <p className="text-sm text-gray-600">Participante 2024</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Superei meus limites físicos e espirituais. Uma manhã que mudou minha perspectiva de vida!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-race-primary to-race-secondary relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-teko leading-tight">
              Pronto para o Movimento?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed">
              Inscreva-se agora e faça parte desta experiência única de fé, saúde e comunidade. Vagas limitadas!
            </p>
            <Link to="/inscricoes">
              <Button 
                size="lg" 
                className="bg-white text-race-primary hover:bg-gray-100 text-xl md:text-2xl px-10 md:px-16 py-6 md:py-8 font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Garantir Minha Vaga
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-race-primary mb-4 font-teko">ADMOOVING</h3>
              <p className="text-gray-400 leading-relaxed">
                Mais que uma corrida, é uma jornada de fé, saúde e transformação pessoal.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <div className="space-y-2">
                <Link to="/inscricoes" className="block text-gray-400 hover:text-white transition-colors">Inscrições</Link>
                <Link to="/sobre" className="block text-gray-400 hover:text-white transition-colors">Sobre o Evento</Link>
                <Link to="/patrocinadores" className="block text-gray-400 hover:text-white transition-colors">Patrocinadores</Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 contato@admooving.com</p>
                <p>📱 (86) 99999-9999</p>
                <p> Teresina Shopping</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 ADMOOVING - Corrida da Igreja. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
