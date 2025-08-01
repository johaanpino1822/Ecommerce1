import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (err) {
        setError('No se pudo cargar la orden');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center py-8">Cargando orden...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`p-6 ${order.paymentStatus === 'paid' ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-center mb-4">
            {order.paymentStatus === 'paid' ? (
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            ) : (
              <XCircleIcon className="h-12 w-12 text-yellow-500" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">
            {order.paymentStatus === 'paid' 
              ? '¡Gracias por tu compra!' 
              : 'Pago pendiente'}
          </h1>
          
          <p className="text-center mb-6">
            {order.paymentStatus === 'paid'
              ? `Tu pedido #${order.orderNumber} ha sido confirmado.`
              : `Tu pedido #${order.orderNumber} está pendiente de pago.`}
          </p>
        </div>

        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
          
          <div className="space-y-4 mb-6">
            {order.items.map(item => (
              <div key={item._id} className="flex justify-between border-b pb-2">
                <div>
                  <p>{item.product?.name || 'Producto eliminado'}</p>
                  <p className="text-sm text-gray-500">x {item.quantity}</p>
                </div>
                <p>${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold mb-2">
              <span>Total:</span>
              <span>${order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Método de pago:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Estado del pago:</span>
              <span className="capitalize">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <h2 className="text-lg font-semibold mb-2">Dirección de Envío</h2>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}</p>
          <p>{order.shippingAddress.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;