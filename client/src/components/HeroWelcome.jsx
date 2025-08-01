import React from 'react';
import { Link } from 'react-router-dom';
import { FaLaptop, FaSearch } from 'react-icons/fa';

const HeroWelcome = () => {
  return (
    <section className="relative h-[80vh] md:h-[90vh] flex mt-16 items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-blue-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80')] bg-cover bg-center opacity-50" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slideInUp">
             <span className="text-blue-400">PCVazquez</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto animate-slideInUp">
            Equipos de alto rendimiento para todas tus necesidades tecnológicas
          </p>
          
          <div className="flex justify-center animate-slideInUp">
            <Link 
              to="/products" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center"
            >
              <FaSearch className="mr-3" /> Descubrir Productos
            </Link>
          </div>

          <div className="mt-16 animate-fadeIn delay-500">
            <div className="inline-flex items-center bg-black/30 px-6 py-2 rounded-full">
              <FaLaptop className="text-blue-400 mr-2" />
              <p className="text-blue-200 font-medium text-sm md:text-base">
                "SOMOS TECNOLOGÍA - Soluciones confiables"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWelcome;