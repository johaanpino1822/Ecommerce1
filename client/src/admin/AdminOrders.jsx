import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
   const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token no disponible. Debes iniciar sesión.');

    const response = await axios.get('http://localhost:5000/api/admin/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fetchedOrders = Array.isArray(response.data.data) ? response.data.data : [];
    setOrders(fetchedOrders);
  } catch (err) {
    console.error('Error al obtener las órdenes:', err);
    setError('No se pudieron cargar las órdenes. Verifica tu sesión o permisos.');
  } finally {
    setLoading(false);
  }
};

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10 text-blue-600">Cargando órdenes...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Órdenes registradas</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No hay órdenes registradas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 text-gray-700 text-left">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Cantidad de Productos</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm">{order._id}</td>
                  <td className="py-2 px-4">{order.user?.name || 'No disponible'}</td>
                  <td className="py-2 px-4">{order.items?.length || 0}</td>
                  <td className="py-2 px-4">${order.total?.toFixed(2)}</td>
                  <td className="py-2 px-4 capitalize">{order.status}</td>
                  <td className="py-2 px-4">
                    {new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
