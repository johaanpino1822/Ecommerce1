import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Error al obtener el producto:', error);
        toast.error('Error al cargar el producto');
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || quantity < 1) return;

    setLoading(true);
    try {
      // Aquí asumo que tienes un endpoint para agregar al carrito
      // y que el usuario está autenticado (el token estaría en localStorage o cookies)
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: product._id,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success(`${product.name} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error(error.response?.data?.message || 'Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  if (!product) {
    return (
      <div className="p-6 mt-16 flex justify-center">
        <div className="animate-pulse text-lg">Cargando producto...</div>
      </div>
    );
  }

  const imageUrl = product.image
    ? `http://localhost:5000/uploads/products/${product.image}`
    : 'https://via.placeholder.com/600x400?text=Sin+imagen';

  return (
    <div className="p-6 mt-16">
      <div className="max-w-3xl mx-auto border rounded-lg shadow p-4">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover mb-4 rounded"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x400?text=Imagen+no+disponible';
          }}
        />
        
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-700 mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-semibold text-green-700">
            ${Number(product.price).toLocaleString()}
          </p>
          
          {product.stock > 0 ? (
            <span className="text-sm text-green-600">Disponible</span>
          ) : (
            <span className="text-sm text-red-600">Agotado</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Categoría: {product.category}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
          </div>
          
          {product.stock > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-2 text-sm">Cantidad:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 p-1 border rounded"
                />
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Agregando...' : 'Agregar al carrito'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;