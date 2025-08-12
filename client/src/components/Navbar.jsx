import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaHome, FaStore, FaLaptop, FaChevronDown } from 'react-icons/fa';
import { m as motion } from 'framer-motion';

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const menuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-2 bg-white/95 backdrop-blur-sm shadow-lg' : 'py-4 bg-gradient-to-r from-[#0C4B45] to-[#083D38] shadow-xl'}`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo con efecto especial */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onMouseEnter={() => setHoveredItem('logo')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <motion.div 
              className="relative"
              animate={{
                rotate: hoveredItem === 'logo' ? [0, 10, -5, 0] : 0,
                scale: hoveredItem === 'logo' ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-[#F2A9FD] rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="bg-[#662D8F] p-3 rounded-xl shadow-lg relative z-10">
                <FaLaptop className="text-white text-2xl" />
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <span className={`text-3xl font-extrabold tracking-tight ${scrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#662D8F] to-[#0C4B45]' : 'text-white'} transition-all duration-500`}>
                PC<span className="text-[#F2A9FD]">Vázquez</span>
              </span>
              <span className={`text-xs font-light tracking-widest ${scrolled ? 'text-[#0C4B45]/80' : 'text-[#83F4E9]'} transition-all duration-500 uppercase`}>Innovación Tecnológica</span>
            </div>
          </Link>

          {/* Menú escritorio */}
          <div className="hidden lg:flex items-center space-x-2">
            <DesktopNavLink 
              to="/" 
              active={location.pathname === '/'} 
              scrolled={scrolled}
              hovered={hoveredItem === 'home'}
              onHover={() => setHoveredItem('home')}
            >
              <FaHome className="mr-2" /> Inicio
            </DesktopNavLink>

            <DesktopNavLink 
              to="/products" 
              active={location.pathname === '/products'} 
              scrolled={scrolled}
              hovered={hoveredItem === 'products'}
              onHover={() => setHoveredItem('products')}
            >
              <FaStore className="mr-2" /> Productos <FaChevronDown className="ml-1 text-xs" />
            </DesktopNavLink>

            <DesktopNavLink 
              to="/about" 
              active={location.pathname === '/about'} 
              scrolled={scrolled}
              hovered={hoveredItem === 'about'}
              onHover={() => setHoveredItem('about')}
            >
              Sobre Nosotros
            </DesktopNavLink>

            <DesktopCartLink 
              to="/cart" 
              itemCount={itemCount} 
              scrolled={scrolled}
              hovered={hoveredItem === 'cart'}
              onHover={() => setHoveredItem('cart')}
            />

            {!user ? (
              <DesktopNavLink 
                to="/login" 
                active={location.pathname === '/login'} 
                scrolled={scrolled}
                hovered={hoveredItem === 'login'}
                onHover={() => setHoveredItem('login')}
              >
                <FaUser className="mr-2" /> Mi Cuenta
              </DesktopNavLink>
            ) : (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                  scrolled ? 'bg-gradient-to-r from-[#F2A9FD] to-[#e895fc] text-[#662D8F]' : 'bg-gradient-to-r from-[#662D8F] to-[#512577] text-white'
                } shadow-lg`}
              >
                <span className="relative z-10">Cerrar sesión</span>
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
              </motion.button>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-xl ${
                scrolled ? 'bg-[#662D8F] text-white' : 'bg-[#F2A9FD] text-[#662D8F]'
              } shadow-md`}
            >
              {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Menú móvil */}
        <motion.div
          className="lg:hidden overflow-hidden"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={menuVariants}
        >
          <motion.div 
            className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl p-6 mt-4 flex flex-col space-y-4 border border-[#83F4E9]/20"
            variants={menuVariants}
          >
            <MobileNavItem 
              to="/" 
              active={location.pathname === '/'} 
              onClick={() => setIsOpen(false)}
              variants={itemVariants}
            >
              <FaHome className="mr-3" /> Inicio
            </MobileNavItem>

            <MobileNavItem 
              to="/products" 
              active={location.pathname === '/products'} 
              onClick={() => setIsOpen(false)}
              variants={itemVariants}
            >
              <FaStore className="mr-3" /> Productos
            </MobileNavItem>

            <MobileNavItem 
              to="/about" 
              active={location.pathname === '/about'} 
              onClick={() => setIsOpen(false)}
              variants={itemVariants}
            >
              Sobre Nosotros
            </MobileNavItem>

            <MobileCartItem 
              to="/cart" 
              itemCount={itemCount} 
              onClick={() => setIsOpen(false)}
              variants={itemVariants}
            />

            {!user ? (
              <MobileNavItem 
                to="/login" 
                active={location.pathname === '/login'} 
                onClick={() => setIsOpen(false)}
                variants={itemVariants}
              >
                <FaUser className="mr-3" /> Mi Cuenta
              </MobileNavItem>
            ) : (
              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center px-6 py-4 rounded-xl text-white bg-gradient-to-r from-[#662D8F] to-[#512577] hover:from-[#512577] hover:to-[#3a1a5a] font-medium transition-all shadow-lg mt-2"
                variants={itemVariants}
              >
                Cerrar sesión
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </nav>
  );
};

// Componente de enlace para escritorio
const DesktopNavLink = ({ to, children, active, scrolled, hovered, onHover }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      className="relative"
    >
      <Link
        to={to}
        className={`
          flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden
          ${active
            ? `${scrolled ? 'text-white bg-gradient-to-r from-[#662D8F] to-[#512577] shadow-md' : 'text-white bg-gradient-to-r from-[#662D8F] to-[#512577] shadow-lg'}`
            : `${scrolled ? 'text-[#0C4B45] hover:text-[#662D8F]' : 'text-white/90 hover:text-white'}`
          }
        `}
      >
        <span className="relative z-10 flex items-center">
          {children}
        </span>
        {hovered && !active && (
          <motion.span 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F2A9FD]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
};

// Componente de carrito para escritorio
const DesktopCartLink = ({ to, itemCount, scrolled, hovered, onHover }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      className="relative"
    >
      <Link
        to={to}
        className={`
          flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden
          ${scrolled ? 'text-[#0C4B45] hover:text-[#662D8F]' : 'text-white/90 hover:text-white'}
        `}
      >
        <span className="relative z-10 flex items-center">
          <FaShoppingCart className="text-xl mr-2" />
          Carrito
        </span>
        {hovered && (
          <motion.span 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F2A9FD]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        )}
        {itemCount > 0 && (
          <motion.span
            className={`
              absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center
              ${scrolled ? 'bg-[#662D8F] text-white' : 'bg-[#F2A9FD] text-[#662D8F]'}
              shadow-md font-bold z-20
            `}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            whileHover={{ scale: 1.2 }}
          >
            {itemCount}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
};

// Componente de ítem móvil
const MobileNavItem = ({ to, children, active, onClick, variants }) => {
  return (
    <motion.div variants={variants}>
      <Link
        to={to}
        onClick={onClick}
        className={`
          flex items-center px-5 py-4 rounded-lg transition-all duration-300 font-medium
          ${active 
            ? 'bg-gradient-to-r from-[#662D8F] to-[#512577] text-white shadow-md' 
            : 'text-[#0C4B45] hover:bg-[#83F4E9]/30'
          }
        `}
      >
        {children}
      </Link>
    </motion.div>
  );
};

// Componente de carrito móvil
const MobileCartItem = ({ to, itemCount, onClick, variants }) => {
  return (
    <motion.div variants={variants}>
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center px-5 py-4 rounded-lg transition-all duration-300 font-medium text-[#0C4B45] hover:bg-[#83F4E9]/30 relative"
      >
        <FaShoppingCart className="text-xl mr-3" />
        Carrito
        {itemCount > 0 && (
          <span
            className="ml-auto bg-[#662D8F] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg font-bold"
          >
            {itemCount}
          </span>
        )}
      </Link>
    </motion.div>
  );
};

export default Navbar;