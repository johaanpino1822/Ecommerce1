import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import HeroWelcome from "../components/HeroWelcome";
import Footer from "../components/Footer";
import api from '../api/axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const data = res.data;

        if (Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.error('Respuesta inesperada del servidor:', data);
          setProducts([]);
        }
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Componentes personalizados para flechas
  const NextArrow = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300"
      aria-label="Siguiente"
    >
      <FiChevronRight size={24} />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300"
      aria-label="Anterior"
    >
      <FiChevronLeft size={24} />
    </button>
  );

  // Configuración mejorada del carrusel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false
        }
      }
    ]
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500 text-xl">
      Error al cargar productos: {error}
    </div>
  );

  return (
    <div className="home-page bg-gradient-to-b from-gray-50 to-white">
      <HeroWelcome />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
          Nuestros <span className="text-indigo-600">Productos</span>
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Descubre nuestra exclusiva colección cuidadosamente seleccionada
        </p>

        <div className="relative group">
          {products.length > 0 ? (
            <Slider {...sliderSettings} className="px-2">
              {products.map((product) => (
                <div key={product._id} className="px-3 py-6 transform transition-all duration-500 hover:scale-105">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;