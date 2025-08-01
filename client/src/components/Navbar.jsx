import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaHome, FaStore, FaLaptop } from 'react-icons/fa';

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const getCounterAnimation = () => {
    if (itemCount > 0) {
      return {
        initial: { scale: 0, rotate: -30 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: "spring", stiffness: 300, damping: 15 }
      };
    }
    return {};
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-white shadow-xl' : 'py-4 bg-gray-900 shadow-lg'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md transform group-hover:rotate-12 transition-transform">
              <FaLaptop className="text-white text-xl" />
            </div>
            <span className={`text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>
              PC<span className="text-blue-400">Vazquez</span>
            </span>
            <span className={`text-xs font-light italic ${scrolled ? 'text-gray-500' : 'text-blue-200'}`}>SOMOS TECNOLOGIA</span>
          </Link>

          {/* Menú escritorio */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={location.pathname === '/'} scrolled={scrolled}>
              <FaHome className="mr-2" /> Inicio
            </NavLink>

            <NavLink to="/products" active={location.pathname === '/products'} scrolled={scrolled}>
              Productos
            </NavLink>

            <NavLink to="/about" active={location.pathname === '/about'} scrolled={scrolled}>
              Sobre Nosotros
            </NavLink>

            <CartLink to="/cart" itemCount={itemCount} scrolled={scrolled} getCounterAnimation={getCounterAnimation} />

            {!user ? (
              <NavLink to="/login" active={location.pathname === '/login'} scrolled={scrolled}>
                <FaUser className="mr-1" /> Mi Cuenta
              </NavLink>
            ) : (
              <button 
                onClick={handleLogout} 
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  scrolled ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-600/80 text-white hover:bg-blue-600'
                }`}
              >
                Cerrar sesión
              </button>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full ${scrolled ? 'bg-gray-200 text-gray-900' : 'bg-blue-600/80 text-white'}`}
            >
              {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col space-y-3">
            <MobileNavLink to="/" active={location.pathname === '/'} onClick={() => setIsOpen(false)}>
              <FaHome className="mr-2" /> Inicio
            </MobileNavLink>

            <MobileNavLink to="/products" active={location.pathname === '/products'} onClick={() => setIsOpen(false)}>
              Productos
            </MobileNavLink>

            <MobileNavLink to="/about" active={location.pathname === '/about'} onClick={() => setIsOpen(false)}>
              Sobre Nosotros
            </MobileNavLink>

            <MobileCartLink to="/cart" itemCount={itemCount} onClick={() => setIsOpen(false)} getCounterAnimation={getCounterAnimation} />

            {!user ? (
              <MobileNavLink to="/login" active={location.pathname === '/login'} onClick={() => setIsOpen(false)}>
                <FaUser className="mr-2" /> Mi Cuenta
              </MobileNavLink>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
              >
                🚪 Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enlace escritorio
const NavLink = ({ to, children, active, scrolled }) => (
  <Link
    to={to}
    className={`
      flex items-center px-3 py-2 rounded-lg transition-all duration-300 font-medium
      ${active
        ? `${scrolled ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-md`
        : `${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'} hover:bg-blue-600/20`
      }
    `}
  >
    {children}
  </Link>
);

// Carrito escritorio
const CartLink = ({ to, itemCount, scrolled, getCounterAnimation }) => (
  <Link
    to={to}
    className={`
      flex items-center px-3 py-2 rounded-lg transition-all duration-300 font-medium relative
      ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'} hover:bg-blue-600/20
    `}
  >
    <FaShoppingCart className="text-xl mr-1" />
    Carrito
    {itemCount > 0 && (
      <span
        className={`
          absolute -top-2 -right-2 text-xs rounded-full h-6 w-6 flex items-center justify-center
          ${scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}
          shadow-md font-bold
        `}
        style={getCounterAnimation()}
      >
        {itemCount}
      </span>
    )}
  </Link>
);

// Enlace móvil
const MobileNavLink = ({ to, children, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      flex items-center px-4 py-3 rounded-lg transition-colors duration-300 font-medium
      ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}
    `}
  >
    {children}
  </Link>
);

// Carrito móvil
const MobileCartLink = ({ to, itemCount, onClick, getCounterAnimation }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center px-4 py-3 rounded-lg transition-colors duration-300 font-medium text-gray-700 hover:bg-blue-50 relative"
  >
    <FaShoppingCart className="text-xl mr-2" />
    Carrito
    {itemCount > 0 && (
      <span
        className="ml-auto bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow font-bold"
        style={getCounterAnimation()}
      >
        {itemCount}
      </span>
    )}
  </Link>
);

export default Navbar;