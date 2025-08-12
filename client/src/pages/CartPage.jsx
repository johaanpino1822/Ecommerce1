import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import crypto from 'crypto-browserify';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
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
    postalCode: '',
    legalId: '1234567890',
    legalIdType: 'CC'
  });
  const [paymentToken, setPaymentToken] = useState('tok_test_4242424242424242');
  const [acceptanceToken, setAcceptanceToken] = useState('');

  // Función corregida para generar la firma de integridad
  const generateIntegritySignature = (reference, amount, currency) => {
    const secretKey = process.env.REACT_APP_WOMPI_INTEGRITY_SECRET || 'prueba_integridad';
    const data = `${reference}${amount}${currency}${secretKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  };

  // Obtener acceptance token al montar el componente
  useEffect(() => {
    const fetchAcceptanceToken = async () => {
      try {
        const merchantId = process.env.REACT_APP_WOMPI_MERCHANT_ID || 'pub_test_Y5wO75g5gGwby7LHpmcerjQKOn6EnJSq';
        
        const response = await axios.get(
          `https://sandbox.wompi.co/v1/merchants/${merchantId}`
        );
        
        if (!response.data.data?.presigned_acceptance?.acceptance_token) {
          throw new Error('No se recibió el token de aceptación');
        }
        
        setAcceptanceToken(response.data.data.presigned_acceptance.acceptance_token);
      } catch (error) {
        console.error("Error obteniendo acceptance token:", error);
        setError("Error al conectar con el procesador de pagos. Intenta recargar la página.");
      }
    };

    fetchAcceptanceToken();
  }, []);

  // Actualizar info de envío si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const userShippingInfo = {
        name: user.name || '',
        email: user.email || '',
        ...(user.shippingAddress || {}),
        legalId: user.legalId || '1234567890',
        legalIdType: user.legalIdType || 'CC'
      };
      setShippingInfo(prev => ({ ...prev, ...userShippingInfo }));
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

    if (!acceptanceToken) {
      setError('El sistema de pagos no está disponible temporalmente. Intenta nuevamente más tarde.');
      return false;
    }

    const requiredFields = ['name', 'email', 'address', 'city', 'state', 'phone', 'legalId'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]?.trim());

    if (missingFields.length > 0) {
      setError(`Por favor completa todos los campos requeridos: ${missingFields.join(', ')}`);
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    const phoneDigits = shippingInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos (sin código de país)');
      return false;
    }

    if (!shippingInfo.legalId || !/^[0-9]{6,12}$/.test(shippingInfo.legalId)) {
      setError('Documento de identidad inválido. Debe tener entre 6 y 12 dígitos');
      return false;
    }

    return true;
  };

  const generateCardToken = async () => {
    try {
      const response = await axios.post(
        'https://sandbox.wompi.co/v1/tokens/cards',
        {
          number: "4242424242424242",
          exp_month: "12",
          exp_year: "29",
          cvc: "123",
          card_holder: shippingInfo.name.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_WOMPI_PUBLIC_KEY || 'pub_test_Y5wO75g5gGwby7LHpmcerjQKOn6EnJSq'}`
          }
        }
      );
      return response.data.data.id;
    } catch (error) {
      console.error('Error generating card token:', error);
      throw new Error('Error al generar token de tarjeta. Verifica los datos de la tarjeta.');
    }
  };

  const createOrder = async (orderData, token) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`, 
        orderData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      if (!response?.data?.success || !response?.data?.order?._id) {
        throw new Error('No se pudo crear la orden');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al crear orden:', error);
      throw new Error(error.response?.data?.error || 'Error al crear la orden');
    }
  };

  const createWompiPayment = async (orderId, token) => {
    try {
      const amountInCents = Math.round(total * 100);
      const phoneDigits = shippingInfo.phone.replace(/\D/g, '');
      const formattedPhone = phoneDigits.startsWith('57') ? phoneDigits.substring(2) : phoneDigits;

      const freshPaymentToken = await generateCardToken();
      const reference = `ORD-${orderId}-${Date.now()}`;
      
      const payload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: shippingInfo.email.trim().toLowerCase(),
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: freshPaymentToken,
          payment_source_id: null
        },
        reference: reference,
        redirect_url: `${window.location.origin}/order/${orderId}`,
        customer_data: {
          full_name: shippingInfo.name.trim(),
          phone_number: formattedPhone, // Asegurar solo números sin código de país
          email: shippingInfo.email.trim().toLowerCase(),
          legal_id_type: shippingInfo.legalIdType || 'CC',
          legal_id: shippingInfo.legalId.toString()
        },
        acceptance_token: acceptanceToken,
        signature: generateIntegritySignature(reference, amountInCents, 'COP') // Firma correctamente generada
      };

      console.log('Enviando a Wompi:', {
        ...payload,
        payment_method: {
          ...payload.payment_method,
          token: '***REDACTED***'
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/wompi/create-transaction`,
        payload,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      if (!response?.data?.ok) {
        throw new Error(response?.data?.error || 'No se recibió respuesta válida de Wompi');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en pago Wompi:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al procesar el pago';
      if (error.response?.data?.details) {
        errorMessage += `: ${error.response.data.details.join(', ')}`;
      } else if (error.response?.data?.error?.messages) {
        errorMessage += `: ${Object.entries(error.response.data.error.messages)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ')}`;
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
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
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null
        })),
        shippingAddress: {
          name: shippingInfo.name.trim(),
          email: shippingInfo.email.trim().toLowerCase(),
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          state: shippingInfo.state.trim(),
          postalCode: shippingInfo.postalCode?.trim() || '000000',
          phone: shippingInfo.phone.replace(/\D/g, ''),
          legalId: shippingInfo.legalId,
          legalIdType: shippingInfo.legalIdType
        },
        paymentMethod: 'credit_card',
        itemsPrice: subtotal,
        shippingPrice: shipping,
        totalPrice: total
      };

      const orderResponse = await createOrder(orderData, token);
      const orderId = orderResponse.order._id;

      const wompiResponse = await createWompiPayment(orderId, token);

      clearCart();
      setSuccess('Orden creada exitosamente. Redirigiendo a Wompi...');
      
      setTimeout(() => {
        window.location.href = wompiResponse.data.redirect_url || 
          `${window.location.origin}/order/${orderId}`;
      }, 1500);

    } catch (error) {
      console.error('Error en checkout:', error);
      setError(error.message || 'Error al procesar el pedido. Verifica tus datos e intenta nuevamente.');
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
          <div>
            <p className="font-medium">{error}</p>
            <div className="mt-2 flex space-x-2">
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Recargar página
              </button>
              <button 
                onClick={() => setError('')}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
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
                    placeholder="Ej: 3233019836"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sin código de país (57)</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    name="legalIdType"
                    value={shippingInfo.legalIdType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="CC">Cédula</option>
                    <option value="CE">Cédula Extranjería</option>
                    <option value="TI">Tarjeta Identidad</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento de Identidad *
                  </label>
                  <input
                    type="text"
                    name="legalId"
                    value={shippingInfo.legalId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Token de Pago (Pruebas)
                  <InformationCircleIcon className="h-4 w-4 ml-1 text-gray-500" />
                </label>
                <input
                  type="text"
                  value={paymentToken}
                  onChange={(e) => setPaymentToken(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Ej: tok_test_4242424242424242"
                  disabled
                />
                <div className="text-xs text-gray-600 mt-1">
                  <p>Se generará automáticamente un token nuevo para cada transacción</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || cartItems.length === 0 || !acceptanceToken}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white mt-4 transition-colors ${
                  processing || cartItems.length === 0 || !acceptanceToken
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