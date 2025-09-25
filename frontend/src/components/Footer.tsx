import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-race-primary mb-4 font-teko">ADMOVING</h3>
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
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 ADMOVING - Corrida da Igreja. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
