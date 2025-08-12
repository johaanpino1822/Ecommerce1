import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaEye, FaHeart, FaRegHeart, FaCheck, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : process.env.REACT_APP_API_URL || '';
    
    return `${baseUrl}/uploads/products/${imagePath}`;
  };

  const images = [
    product?.image ? getImageUrl(product.image) : '/placeholder.jpg',
    ...(product?.additionalImages?.map(img => getImageUrl(img)) || [])
  ];

  const mainImage = images[selectedImage] || '/placeholder.jpg';

  const isInCart = cart.some(item => item.product._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  const nextImage = (e) => {
    e.preventDefault();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      className="relative border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(102, 45, 143, 0.1), 0 10px 10px -5px rgba(102, 45, 143, 0.04)'
      }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {product?.isNew && (
          <motion.span 
            className="bg-[#F2A9FD] text-[#0C4B45] text-xs font-bold px-2 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            NUEVO
          </motion.span>
        )}
        {product?.discount > 0 && (
          <motion.span 
            className="bg-[#662D8F] text-white text-xs font-bold px-2 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            -{product.discount}%
          </motion.span>
        )}
      </div>

      {/* Favorite Button */}
      <motion.button 
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isFavorite ? (
          <FaHeart className="text-[#F2A9FD]" />
        ) : (
          <FaRegHeart className="text-gray-600 hover:text-[#F2A9FD]" />
        )}
      </motion.button>

      {/* Product Image */}
      <Link to={`/product/${product?._id || '#'}`} className="block relative">
        <div className="relative h-56 w-full bg-gradient-to-br from-[#0C4B45]/10 to-[#83F4E9]/10">
          <img 
            src={mainImage} 
            alt={product?.name || 'Producto sin nombre'}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
              {images.map((_, index) => (
                <button 
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage(index);
                  }}
                  className={`w-2 h-2 rounded-full ${selectedImage === index ? 'bg-[#662D8F]' : 'bg-gray-300'}`}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Quick View Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-black/30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickView(true);
                  }}
                  className="bg-white text-[#662D8F] font-medium px-4 py-2 rounded-lg flex items-center hover:bg-[#662D8F] hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEye className="mr-2" /> Vista Rápida
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product?._id || '#'}`}>
          <h3 className="font-bold text-[#0C4B45] mb-1 hover:text-[#662D8F] transition-colors">
            {product?.name || 'Producto sin nombre'}
          </h3>
          <div className="flex items-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar 
                key={star} 
                className={`text-sm ${star <= (product?.rating || 0) ? 'text-[#F2A9FD]' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product?.reviewCount || 0})</span>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product?.shortDescription || product?.description || 'Sin descripción disponible'}
          </p>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-lg text-[#662D8F]">
              ${product?.price?.toLocaleString() || '0.00'}
            </span>
            {product?.originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {product?.stock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 5 ? 'bg-[#83F4E9]/20 text-[#0C4B45]' : 'bg-[#F2A9FD]/20 text-[#662D8F]'
            }`}>
              {product.stock > 5 ? 'Disponible' : 'Últimas unidades'}
            </span>
          )}
        </div>

        <motion.button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`w-full py-3 rounded-lg flex items-center justify-center transition-colors ${
            isInCart 
              ? 'bg-[#83F4E9]/30 text-[#0C4B45] cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#662D8F] to-[#F2A9FD] hover:from-[#512577] hover:to-[#e895fc] text-white'
          }`}
          whileHover={!isInCart ? { scale: 1.02 } : {}}
          whileTap={!isInCart ? { scale: 0.98 } : {}}
        >
          {isInCart ? (
            <>
              <FaCheck className="mr-2" /> En el carrito
            </>
          ) : (
            <>
              <FaShoppingCart className="mr-2" /> Agregar al carrito
            </>
          )}
        </motion.button>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#0C4B45]">{product?.name}</h3>
                  <motion.button 
                    onClick={() => setShowQuickView(false)}
                    className="text-gray-500 hover:text-[#662D8F] p-1"
                    whileHover={{ rotate: 90 }}
                  >
                    ✕
                  </motion.button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#0C4B45]/10 to-[#83F4E9]/10 p-6 rounded-lg flex items-center justify-center h-64">
                      <img 
                        src={mainImage} 
                        alt={product?.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`border-2 rounded-lg overflow-hidden ${selectedImage === index ? 'border-[#662D8F]' : 'border-transparent'}`}
                          >
                            <img 
                              src={img} 
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-16 object-contain bg-gray-50"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar 
                          key={star} 
                          className={`text-lg ${star <= (product?.rating || 0) ? 'text-[#F2A9FD]' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({product?.reviewCount || 0} reseñas)</span>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      {product?.description || 'Descripción no disponible'}
                    </p>
                    
                    <div className="mb-6">
                      <span className="font-bold text-2xl text-[#662D8F]">
                        ${product?.price?.toLocaleString() || '0.00'}
                      </span>
                      {product?.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {product?.stock !== undefined && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disponibilidad:</span>
                          <span className={`font-medium ${
                            product.stock > 5 ? 'text-[#0C4B45]' : 'text-[#662D8F]'
                          }`}>
                            {product.stock} en stock
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full ${
                              product.stock > 5 ? 'bg-[#83F4E9]' : 'bg-[#F2A9FD]'
                            }`} 
                            style={{ width: `${Math.min(100, (product.stock / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      <motion.button
                        onClick={(e) => {
                          handleAddToCart(e);
                          setShowQuickView(false);
                        }}
                        disabled={isInCart}
                        className={`flex-1 py-3 rounded-lg flex items-center justify-center transition-colors ${
                          isInCart 
                            ? 'bg-[#83F4E9]/30 text-[#0C4B45] cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#662D8F] to-[#F2A9FD] hover:from-[#512577] hover:to-[#e895fc] text-white'
                        }`}
                        whileHover={!isInCart ? { scale: 1.02 } : {}}
                        whileTap={!isInCart ? { scale: 0.98 } : {}}
                      >
                        {isInCart ? (
                          <>
                            <FaCheck className="mr-2" /> En el carrito
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="mr-2" /> Agregar al carrito
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={toggleFavorite}
                        className={`p-3 rounded-lg flex items-center justify-center ${
                          isFavorite 
                            ? 'bg-[#F2A9FD]/20 text-[#662D8F]' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;