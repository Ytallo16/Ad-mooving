import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Desativando framer-motion para teste de performance
const motion = {
  section: (props: any) => <section {...props} />,
  div: (props: any) => <div {...props} />,
};
import img259 from "../assets/ADDIRCEU-259.webp";
import img196 from "../assets/ADDIRCEU-196.webp";
import img319 from "../assets/ADDIRCEU-319.webp";

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

  // Variantes de animação otimizadas
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const [img1Loaded, setImg1Loaded] = useState(false);
  const [img2Loaded, setImg2Loaded] = useState(false);
  const [img3Loaded, setImg3Loaded] = useState(false);

  // Link do Google Calendar para o evento (14/12/2025, 06:00-08:00 BRT → 09:00-11:00 UTC)
  // Inclui fuso horário para exibir corretamente no Google Agenda.
  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('ADMOVING - Largada às 6h.')}&dates=20251214T090000Z/20251214T110000Z&details=${encodeURIComponent('ADMOVING - Largada às 6h.')} &location=${encodeURIComponent('Parque Potycabana, Teresina - PI')}&ctz=America/Fortaleza`;

  // Link do Google Maps para o local do evento (Parque Potycabana)
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent('Parque Potycabana, Teresina - PI')}`;

  // Instagram da igreja (fixo)
  const instagramUrl = 'https://www.instagram.com/addirceu';

  // Removido: geração de arquivo ICS. Usaremos apenas o link do Google Agenda.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[400px] md:h-[550px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
          style={{ backgroundImage: `url("/Fundo (4).png")`, backgroundSize: 'cover' }}
        >
        </div>
        
        {/* Button at bottom of hero */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Link to="/inscricoes">
            <Button 
              size="lg" 
              className="bg-race-primary hover:bg-race-primary-dark text-white text-sm md:text-lg px-4 md:px-8 py-2 md:py-4 shadow-lg"
            >
              Inscreva-se
            </Button>
          </Link>
        </div>
        
        {/* Cronômetro acima do botão */}
        <div className="absolute bottom-24 md:bottom-40 left-1/2 transform -translate-x-1/2 z-10 text-center px-4">
          <div className="inline-block" key={`${timeLeft.days}-${timeLeft.hours}-${timeLeft.minutes}-${timeLeft.seconds}`}>
            <div className="flex gap-2 md:gap-8 text-white justify-center">
              <div className="text-center">
                <div className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-xs md:text-lg font-semibold text-white/90 mt-1 md:mt-2 font-29lt">Dias</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs md:text-lg font-semibold text-white/90 mt-1 md:mt-2 font-29lt">Horas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs md:text-lg font-semibold text-white/90 mt-1 md:mt-2 font-29lt">Min</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg font-teko">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs md:text-lg font-semibold text-white/90 mt-1 md:mt-2 font-29lt">Seg</div>
              </div>
            </div>
            <div className="text-white/80 text-sm md:text-base mt-2 md:mt-4 font-medium font-29lt">14 de Dezembro de 2025</div>
          </div>
        </div>
      </section>

      {/* Event Info - Novo Layout */}
      <motion.section 
        className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12 md:mb-16" variants={fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Informações do Evento</h2>
            
          </motion.div>
          
          {/* Cards de Informações - Grid Responsivo */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16" variants={staggerContainer}>
            {/* Card Data com ícone do Google Agenda no canto superior direito */}
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group relative"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer'); }}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                title="Adicionar ao Google Agenda"
                aria-label="Adicionar ao Google Agenda"
              >
                <img 
                  src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_24_2x.png" 
                  alt="Google Agenda"
                  width="24"
                  height="24"
                />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-2 font-teko">Data</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">14 de Dezembro, 2025</p>
                <p className="text-gray-600 font-medium">Domingo</p>
              </div>
            </motion.div>

            {/* Card Cronograma */}
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-3 font-teko">Cronograma</h3>
                <div className="text-gray-700 font-medium space-y-1">
                  <p>Concentração: 05:20h</p>
                  <p>Aquecimento: 05:40h</p>
                  <p>Largada: 06h</p>
                  <p>Cerimônia de premiação: 07:30h-09:30h</p>
                </div>
              </div>
            </motion.div>

            {/* Card Local com ícone do Google Maps no canto superior direito */}
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-race-primary/20 group relative"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); window.open(googleMapsUrl, '_blank', 'noopener,noreferrer'); }}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                title="Abrir no Google Maps"
                aria-label="Abrir no Google Maps"
              >
                {/* Ícone vetorial estilo Google Maps */}
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <clipPath id="pinClip"><path d="M12 2c-3.8 0-7 3.06-7 6.84 0 1.97.86 3.63 2.02 5.16.88 1.17 1.92 2.28 2.91 3.55.56.72 1.12 1.48 1.67 2.31.2.3.38.6.56.9.18-.3.36-.6.56-.9.55-.83 1.11-1.59 1.67-2.31.99-1.27 2.03-2.38 2.91-3.55C18.14 12.47 19 10.81 19 8.84 19 5.06 15.8 2 12 2z"/></clipPath>
                  </defs>
                  <path fill="#34A853" d="M12 2c-3.8 0-7 3.06-7 6.84 0 1.97.86 3.63 2.02 5.16.88 1.17 1.92 2.28 2.91 3.55.56.72 1.12 1.48 1.67 2.31.2.3.38.6.56.9.18-.3.36-.6.56-.9.55-.83 1.11-1.59 1.67-2.31.99-1.27 2.03-2.38 2.91-3.55C18.14 12.47 19 10.81 19 8.84 19 5.06 15.8 2 12 2z"/>
                  <g clipPath="url(#pinClip)">
                    <rect x="-2" y="2" width="14" height="10" fill="#4285F4"/>
                    <rect x="12" y="2" width="14" height="10" fill="#FBBC05"/>
                    <rect x="-2" y="12" width="28" height="12" fill="#EA4335"/>
                  </g>
                  <circle cx="12" cy="9" r="3.2" fill="#fff"/>
                </svg>
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-race-primary mb-2 font-teko">Local</h3>
                <p className="text-2xl font-bold text-gray-800 mb-1">Parque Potycabana</p>
                <p className="text-gray-600 font-medium">Ponto de encontro principal</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Seção Motivacional */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-r from-race-primary/10 via-race-secondary/5 to-race-primary/10 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-race-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-race-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-race-primary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-3 md:px-6 relative z-10">
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-start">
              {/* Coluna esquerda: Verso estilizado */}
              <div className="text-left md:text-left md:max-w-none mt-6 md:mt-10 md:self-start md:col-span-2">
                <blockquote className="border-l-4 border-race-primary pl-3 md:pl-4">
                  <h2 className="text-5xl md:text-7xl font-bold text-race-primary mb-3 md:mb-4 font-figtree leading-tight">
                    "Pois nele vivemos, nos movemos e existimos"
                  </h2>
                </blockquote>
                <p className="text-lg md:text-2xl text-race-secondary font-semibold italic md:ml-1 font-figtree">
                  Atos 17:28
                </p>
              </div>

              {/* Coluna direita: Texto de participação + Vídeo */}
              <div className="md:col-span-3">
                <div className="mb-5 text-center md:text-left">
                  <div className="h-1 w-12 bg-race-primary rounded mx-auto md:mx-0 mb-3"></div>
                  <p className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                    <span className="text-race-primary">A sua participação</span> na 1ª corrida da 
                    <span className="text-race-primary font-extrabold"> AD Moving</span>
                  </p>
                  <p className="text-base md:text-lg text-gray-600 mt-1 leading-relaxed">
                    nos ajudou a construir uma igreja no sertão da Paraíba — assista:
                  </p>
                </div>
                <div className="relative w-full max-w-4xl md:max-w-none mx-auto">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-black/5">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/9BbjXy2_KZs?si=lGzYBrBgvlYG0JKG&autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
                      title="ADMOVING - Vídeo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
                </div>

                {/* Instagram pill será posicionado globalmente no canto inferior esquerdo em telas md+ */}

                {/* CTA removido conforme solicitado */}
              </div>
            </div>
          </motion.div>
          {/* Instagram floating pill - bottom-left on md+ */}
          <div className="hidden md:flex items-center gap-3 fixed left-6 bottom-6 z-20 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-4 py-2 shadow">
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
              <Instagram className="w-5 h-5 text-pink-600" />
            </span>
            <div>
              <p className="text-xs text-gray-600 leading-none">Nos acompanhe</p>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 leading-tight hover:underline">
                @ieadcgd
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      

      {/* Galeria de Imagens - Momentos Especiais */}
      <motion.section 
        className="py-16 md:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.4,
              staggerChildren: 0.15
            }
          }
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12" 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Momentos Especiais</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Reviva os melhores momentos da edição anterior
            </p>
          </motion.div>
          
          {/* Grid de imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Imagem 1 */}
            <motion.div 
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-md ring-0 hover:ring-2 ring-black/10 transition-transform duration-150 will-change-transform"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.4, 
                  ease: "easeOut",
                  delay: 0.1
                }
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`absolute inset-0 ${img1Loaded ? 'hidden' : 'block'}`}>
                <div className="w-full h-full bg-gray-200" />
              </div>
              <picture>
                <source srcSet={img259} type="image/webp" />
                <img 
                  src={img259} 
                  alt="ADMOVING - Momento Especial 1"  
                  className="w-full h-64 object-cover transition-transform duration-150 group-hover:scale-[1.02] will-change-transform"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setImg1Loaded(true)}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 will-change-opacity">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Pódio de Premiação</p>
                  <p className="text-xs opacity-90">Campeões da edição anterior</p>
                </div>
              </div>
            </motion.div>

            {/* Imagem 2 */}
            <motion.div 
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-md ring-0 hover:ring-2 ring-black/10 transition-transform duration-150 will-change-transform"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.4, 
                  ease: "easeOut",
                  delay: 0.2
                }
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`absolute inset-0 ${img2Loaded ? 'hidden' : 'block'}`}>
                <div className="w-full h-full bg-gray-200" />
              </div>
              <picture>
                <source srcSet={img196} type="image/webp" />
                <img 
                  src={img196} 
                  alt="ADMOVING - Momento Especial 2" 
                  className="w-full h-64 object-cover transition-transform duration-150 group-hover:scale-[1.02] will-change-transform"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setImg2Loaded(true)}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-100 will-change-opacity">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Pódio de Premiação</p>
                  <p className="text-xs opacity-90">Corrida Kids</p>
                </div>
              </div>
            </motion.div>

            {/* Imagem 3 */}
            <motion.div 
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-md ring-0 hover:ring-2 ring-black/10 transition-transform duration-150 will-change-transform"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.4, 
                  ease: "easeOut",
                  delay: 0.3
                }
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`absolute inset-0 ${img3Loaded ? 'hidden' : 'block'}`}>
                <div className="w-full h-full bg-gray-200" />
              </div>
              <picture>
                <source srcSet={img319} type="image/webp" />
                <img 
                  src={img319} 
                  alt="ADMOVING - Momento Especial 3" 
                  className="w-full h-64 object-cover transition-transform duration-150 group-hover:scale-[1.02] will-change-transform"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setImg3Loaded(true)}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-100 will-change-opacity">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Equipe de voluntários</p>
                  <p className="text-xs opacity-90">Organização da corrida</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categorias - Apenas 2 Corridas */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Categorias</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha a modalidade que mais combina com você
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* 5km Corrida */}
            <div className="bg-gradient-to-br from-race-primary/5 to-race-primary/10 rounded-2xl p-8 md:p-10 border-2 border-race-primary/20 hover:border-race-primary/40 transition-all duration-300 hover:shadow-xl group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-race-primary mb-4 font-teko">Corrida</h3>
                <p className="text-gray-600 mb-6 text-lg">Para corredores de todas as idades</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-race-primary">R$ 80,00</span>
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
                  <span className="text-5xl font-bold text-orange-600">R$ 50,00</span>
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

            {/* Caminhada */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 md:p-10 border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-emerald-700 mb-4 font-teko">Caminhada</h3>
                <p className="text-gray-600 mb-6 text-lg">2,5 km - Para quem prefere participar no seu ritmo</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-emerald-700">R$ 80,00</span>
                </div>
                <div className="bg-white rounded-lg p-6 mb-8 space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Kit completo do participante</span>
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
                    <span className="text-gray-700 font-medium">Sem cronometragem</span>
                  </div>
                </div>
                <Link to="/inscricoes">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 text-lg">
                    Inscrever-se
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Kit do Corredor - Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-race-primary mb-6 font-teko">Kit do Corredor</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Confira o que você receberá ao se inscrever no evento
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Imagem principal do kit */}
            <div className="mb-12">
              <div className="relative bg-gradient-to-br from-race-primary/5 to-race-secondary/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-2 font-teko">Camiseta Oficial</h3>
                </div>
                
                <div className="relative max-w-md mx-auto">
                  <img 
                    src="/kit.jpeg" 
                    alt="Kit do Corredor ADMOVING - Camiseta Oficial" 
                    className="w-full h-auto rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      ((e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-gradient-to-br from-race-primary/10 to-race-secondary/10 rounded-2xl h-64 flex items-center justify-center border-2 border-dashed border-race-primary/30">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-race-primary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-race-primary to-race-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    OFICIAL
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                
                </div>
              </div>
            </div>

            {/* Itens do kit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Camiseta */}
              <div className="bg-gradient-to-br from-race-primary/5 to-race-primary/10 rounded-2xl p-6 text-center border border-race-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-race-primary to-race-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-race-primary mb-2 font-teko">Camiseta oficial</h4>
                <p className="text-gray-600 text-sm">Modelo do evento</p>
              </div>

              {/* Medalha */}
              <div className="bg-gradient-to-br from-race-secondary/5 to-race-secondary/10 rounded-2xl p-6 text-center border border-race-secondary/20 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-race-secondary to-race-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-race-secondary mb-2 font-teko">Número de peito</h4>
                <p className="text-gray-600 text-sm">Identificação oficial</p>
              </div>

              {/* Número */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-green-600 mb-2 font-teko">Chip de cronometragem</h4>
                <p className="text-gray-600 text-sm">Tempo oficial</p>
              </div>
              {/* Medalha pós-prova */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 text-center border border-indigo-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-indigo-600 mb-2 font-teko">Medalha (pós-prova)</h4>
                <p className="text-gray-600 text-sm">Premiação de participação</p>
              </div>

              {/* Ecobag */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 10a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-emerald-600 mb-2 font-teko">Ecobag</h4>
                <p className="text-gray-600 text-sm">Itens do kit na sacola</p>
              </div>

              {/* Troféus para vencedores das categorias */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-100 rounded-2xl p-6 text-center border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8m-4-4v4m8-16h-3a5 5 0 01-10 0H2v2a5 5 0 005 5h10a5 5 0 005-5V5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-pink-700 mb-2 font-teko">Troféus para vencedores</h4>
                <p className="text-gray-600 text-sm">Premiação para campeões por categoria</p>
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-700 mb-6">
                Garante já o seu kit exclusivo da 2ª Edição do ADMOVING!
              </p>
              <Link to="/inscricoes">
                <Button className="bg-gradient-to-r from-race-primary to-race-secondary hover:from-race-primary-dark hover:to-race-secondary-dark text-white font-bold py-4 px-8 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Quero Meu Kit
                </Button>
              </Link>
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

      <Footer />
    </div>
  );
};

export default Index;
