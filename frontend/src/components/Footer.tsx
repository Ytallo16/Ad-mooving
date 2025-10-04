import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
            <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
            <div className="space-y-3">
              <a 
                href="https://www.instagram.com/admovingoficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-white">@admovingoficial</span>
              </a>
              <a 
                href="https://www.instagram.com/addirceu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-white">@addirceu</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-gray-400">
              <a 
                href="mailto:admoving@addirceu.com.br?subject=Contato%20ADMOVING&body=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20evento%20ADMOVING."
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                {/* Gmail icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  className="text-red-500"
                >
                  <path
                    fill="currentColor"
                    d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.236l-7.2 4.5a2 2 0 01-1.6 0L4 8.236V6l8 5 8-5v2.236z"
                  />
                </svg>
                <span>admoving@addirceu.com.br</span>
              </a>
              <a 
                href="https://wa.me/5586920012341"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                {/* WhatsApp icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  className="text-green-500"
                >
                  <path
                    fill="currentColor"
                    d="M20.52 3.48A11.9 11.9 0 0012.05 0C5.46.03.14 5.36.17 11.94a11.84 11.84 0 001.58 5.96L0 24l6.29-1.6a11.9 11.9 0 005.76 1.47h.05c6.59-.03 11.91-5.36 11.91-11.94a11.9 11.9 0 00-3.49-8.45zM12.1 21.3h-.04a9.32 9.32 0 01-4.74-1.29l-.34-.2-3.73.95.99-3.64-.22-.37A9.29 9.29 0 012.85 12C2.82 6.9 6.92 2.8 12.02 2.78a9.33 9.33 0 019.35 9.32c-.02 5.1-4.13 9.2-9.27 9.2z"
                  />
                  <path
                    fill="currentColor"
                    d="M17.2 14.2c-.27-.13-1.6-.78-1.84-.86-.24-.09-.42-.13-.59.13-.17.27-.68.86-.83 1.04-.15.18-.31.2-.58.07-.27-.13-1.16-.43-2.22-1.36-.82-.73-1.37-1.63-1.53-1.9-.16-.27-.02-.42.12-.55.12-.12.27-.31.41-.46.14-.15.18-.27.27-.45.09-.18.04-.34-.02-.48-.06-.13-.59-1.42-.81-1.94-.21-.5-.42-.43-.59-.44l-.5-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.67 1.12 2.86.14.18 1.94 3.1 4.7 4.34.66.29 1.18.46 1.58.59.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.29.23-.63.23-1.17.16-1.29-.07-.11-.24-.18-.5-.3z"
                  />
                </svg>
                <span>+55 86 92001-2341</span>
              </a>
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
