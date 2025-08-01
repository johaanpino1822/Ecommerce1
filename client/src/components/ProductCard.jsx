import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaEye, FaHeart, FaRegHeart, FaCheck } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : process.env.REACT_APP_API_URL || '';
    
    return `${baseUrl}/uploads/products/${imagePath}`;
  };

  const mainImage = product?.image 
    ? getImageUrl(product.image) 
    : '/placeholder.jpg';

  const isInCart = cart.some(item => item.product._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="relative border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {product?.isNew && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            NUEVO
          </span>
        )}
        {product?.discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button 
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        {isFavorite ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-600 hover:text-red-500" />
        )}
      </button>

      {/* Product Image */}
      <Link to={`/product/${product?._id || '#'}`} className="block relative">
        <img 
          src={mainImage} 
          alt={product?.name || 'Producto sin nombre'}
          className="w-full h-56 object-contain bg-gray-50 p-4"
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />

        {/* Quick View Overlay */}
        {isHovered && (
          <div 
            className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300"
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FaEye className="mr-2" /> Vista Rápida
            </button>
          </div>
        )}
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product?._id || '#'}`}>
          <h3 className="font-bold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
            {product?.name || 'Producto sin nombre'}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {product?.shortDescription || product?.description || 'Sin descripción disponible'}
          </p>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-lg text-blue-600">
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
              product.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {product.stock > 5 ? 'Disponible' : 'Últimas unidades'}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
            isInCart 
              ? 'bg-green-100 text-green-800 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
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
        </button>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{product?.name}</h3>
                <button 
                  onClick={() => setShowQuickView(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <img 
                    src={mainImage} 
                    alt={product?.name} 
                    className="w-full h-64 object-contain"
                  />
                </div>
                
                <div>
                  <p className="text-gray-700 mb-4">
                    {product?.description || 'Descripción no disponible'}
                  </p>
                  
                  <div className="mb-4">
                    <span className="font-bold text-xl text-blue-600">
                      ${product?.price?.toLocaleString() || '0.00'}
                    </span>
                    {product?.originalPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      handleAddToCart(e);
                      setShowQuickView(false);
                    }}
                    disabled={isInCart}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                      isInCart 
                        ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;