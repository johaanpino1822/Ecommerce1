import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaChevronLeft, FaChevronRight, FaCheck, FaShare, FaExpand ,   FaMinus,  FaPlus  } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data.data);
        if (res.data.data.colors?.length) {
          setSelectedColor(res.data.data.colors[0]);
        }
        if (res.data.data.sizes?.length) {
          setSelectedSize(res.data.data.sizes[0]);
        }
      } catch (error) {
        console.error('Error al obtener el producto:', error);
        toast.error('Error al cargar el producto');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product || quantity < 1) return;

    addToCart({
      ...product,
      selectedColor,
      selectedSize
    }, quantity);

    toast.success(
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm">Agregado al carrito</p>
      </div>, 
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        className: "bg-white border-l-4 border-[#662D8F] shadow-lg"
      }
    );
  };

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity)){
      if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
        setQuantity(newQuantity);
      }
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % (product?.images?.length || 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `/uploads/products/${imagePath}`;
  };

  const isInCart = cart.some(item => item.product._id === product?._id);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0C4B45]/5 to-[#83F4E9]/5">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-96 bg-gray-200"></div>
              <div className="p-8 md:w-1/2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gradient-to-b from-[#0C4B45]/5 to-[#83F4E9]/5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0C4B45]">Producto no encontrado</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#662D8F] to-[#F2A9FD] text-white rounded-lg hover:from-[#512577] hover:to-[#e895fc] transition-all"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const images = [
    product.image ? getImageUrl(product.image) : '/placeholder.jpg',
    ...(product.additionalImages?.map(img => getImageUrl(img)))|| []
  ];

  const mainImage = images[selectedImage] || '/placeholder.jpg';

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0C4B45]/5 to-[#83F4E9]/5">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="md:flex">
            {/* Gallery Section */}
            <div className="md:w-1/2 relative">
              <div className="relative h-96 md:h-full bg-gradient-to-br from-[#0C4B45]/10 to-[#83F4E9]/10 flex items-center justify-center p-8">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain cursor-zoom-in"
                  onClick={() => setShowFullscreenImage(true)}
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                    >
                      <FaChevronLeft className="text-[#662D8F]" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                    >
                      <FaChevronRight className="text-[#662D8F]" />
                    </button>
                  </>
                )}
                
                {/* Fullscreen Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFullscreenImage(true); }}
                  className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                >
                  <FaExpand className="text-[#662D8F]" />
                </button>
                
                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                      <button 
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                        className={`w-3 h-3 rounded-full transition-all ${selectedImage === index ? 'bg-[#662D8F] scale-125' : 'bg-gray-300 hover:bg-[#F2A9FD]'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${selectedImage === index ? 'border-[#662D8F]' : 'border-transparent'}`}
                    >
                      <img 
                        src={img} 
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover bg-gray-50"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info Section */}
            <div className="p-8 md:w-1/2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-[#0C4B45] mb-2">{product.name}</h1>
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`text-lg ${star <= (product.rating || 0) ? 'text-[#F2A9FD]' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0} reseñas)</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isFavorite ? (
                    <FaHeart className="text-2xl text-[#F2A9FD]" />
                  ) : (
                    <FaRegHeart className="text-2xl text-gray-400 hover:text-[#F2A9FD]" />
                  )}
                </button>
              </div>
              
              <div className="mb-6">
                <span className="font-bold text-3xl text-[#662D8F]">
                  ${product.price?.toLocaleString() || '0.00'}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through ml-3">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="ml-3 bg-[#F2A9FD]/20 text-[#662D8F] text-sm font-bold px-2 py-1 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-8">{product.description}</p>
              
              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Color:</h3>
                  <div className="flex space-x-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-[#662D8F]' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Talla:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${selectedSize === size ? 'bg-[#662D8F] text-white border-[#662D8F]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stock Indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Disponibilidad:</span>
                  <span className={`font-medium ${product.stock > 5 ? 'text-[#0C4B45]' : 'text-[#662D8F]'}`}>
                    {product.stock} en stock
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full ${product.stock > 5 ? 'bg-[#83F4E9]' : 'bg-[#F2A9FD]'}`} 
                    style={{ width: `${Math.min(100, (product.stock / 10) * 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button 
                      onClick={decrementQuantity}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-16 text-center border-t-0 border-b-0 focus:ring-0 focus:border-gray-300"
                    />
                    <button 
                      onClick={incrementQuantity}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                  
                  <motion.button
                    onClick={handleAddToCart}
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
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <span className="ml-2 font-medium text-[#0C4B45]">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 font-medium text-[#0C4B45]">{product.sku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Marca:</span>
                    <span className="ml-2 font-medium text-[#0C4B45]">{product.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Envío:</span>
                    <span className="ml-2 font-medium text-[#0C4B45]">Gratis en pedidos +$50</span>
                  </div>
                </div>
              </div>
              
              {/* Share Buttons */}
              <div className="mt-6 flex space-x-4">
                <button className="flex items-center text-sm text-gray-500 hover:text-[#662D8F]">
                  <FaShare className="mr-2" /> Compartir
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {showFullscreenImage && (
          <motion.div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative max-w-6xl w-full max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                onClick={() => setShowFullscreenImage(false)}
                className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-[#F2A9FD]"
              >
                &times;
              </button>
              
              <div className="relative h-full w-full flex items-center justify-center">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white"
                    >
                      <FaChevronLeft className="text-xl" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-3 rounded-full text-white"
                    >
                      <FaChevronRight className="text-xl" />
                    </button>
                    
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                      {images.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-3 h-3 rounded-full transition-all ${selectedImage === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;