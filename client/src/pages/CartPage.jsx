import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const { 
    cartItems = [], 
    clearCart, 
    removeFromCart, 
    updateCartItem,
    subtotal = 0 
  } = useCart();
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    postalCode: ''
  });

  // Rellenar datos del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        ...(user.shippingAddress || {})
      }));
    }
  }, [isAuthenticated, user]);

  const shipping = subtotal > 100000 ? 0 : 8000;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setError('');
    setSuccess('');

    const requiredFields = ['name', 'email', 'address', 'city', 'state', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);

    if (missingFields.length > 0) {
      setError(`Por favor completa todos los campos requeridos: ${missingFields.join(', ')}`);
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    const phoneDigits = shippingInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('El teléfono debe tener al menos 7 dígitos');
      return false;
    }

    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError('Tu carrito está vacío');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para continuar con la compra');
      localStorage.setItem('pendingOrder', JSON.stringify({
        cartItems,
        shippingInfo,
        subtotal,
        shipping,
        total
      }));
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // 1. Crear la orden en el backend
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null
        })),
        shippingAddress: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode || '000000',
          phone: shippingInfo.phone.replace(/\D/g, '')
        },
        paymentMethod: 'card',
        itemsPrice: subtotal,
        shippingPrice: shipping,
        totalPrice: total
      };

      console.log('Enviando datos de la orden:', orderData); // Para depuración

      const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 2. Integración con Wompi
      const wompiResponse = await axios.post(
        'http://localhost:5000/api/payments/wompi', 
        {
          orderId: orderResponse.data._id,
          amountInCents: Math.round(total * 100),
          currency: 'COP',
          customerEmail: shippingInfo.email,
          customerName: shippingInfo.name,
          paymentMethod: {
            type: 'CARD',
            installments: 1
          },
          redirectUrl: `${window.location.origin}/order/${orderResponse.data._id}`,
          metadata: {
            orderId: orderResponse.data._id,
            customerName: shippingInfo.name
          }
        }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!wompiResponse.data?.paymentUrl) {
        throw new Error('No se recibió URL de pago de Wompi');
      }

      clearCart();
      setSuccess('Orden creada exitosamente. Redirigiendo a Wompi...');
      
      // Pequeño retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        window.location.href = wompiResponse.data.paymentUrl;
      }, 1500);

    } catch (error) {
      console.error('Error completo en el checkout:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Error al procesar el pago';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || 'Datos inválidos enviados al servidor';
          if (error.response.data.errors) {
            errorMessage += ': ' + Object.values(error.response.data.errors)
              .map(err => err.message || err)
              .join(', ');
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          localStorage.removeItem('token');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No se recibió respuesta del servidor';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    setError('');
    setSuccess('');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, { quantity: newQuantity });
    }
    setError('');
    setSuccess('');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="md:col-span-2">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 mb-4">No hay productos en tu carrito</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item._id} className="p-4 flex flex-col sm:flex-row">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="h-24 w-24 object-cover rounded"
                        onError={(e) => e.target.src = '/placeholder-product.jpg'}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <p className="text-lg font-semibold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-600">${item.price.toLocaleString()} c/u</p>
                      
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="disabled:opacity-50 text-gray-500 hover:text-gray-700 p-1"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <span className="mx-2 text-gray-700 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="ml-auto text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Resumen y checkout */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <h3 className="font-medium">Información de Envío</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={shippingInfo.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento/Estado *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || cartItems.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white mt-4 transition-colors ${
                  processing || cartItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } flex items-center justify-center`}
              >
                {processing ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Pagar con Wompi'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;