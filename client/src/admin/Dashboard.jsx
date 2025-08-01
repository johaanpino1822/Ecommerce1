import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [statsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/orders?limit=5', config)
        ]);

        // Validación y saneamiento de los datos
        setStats({
          products: Number(statsRes.data?.products) || 0,
          orders: Number(statsRes.data?.orders) || 0,
          users: Number(statsRes.data?.users) || 0,
          revenue: Number(statsRes.data?.revenue) || 0
        });

        // Manejo seguro de las órdenes recientes
        let ordersData = [];
        if (ordersRes.data) {
          if (Array.isArray(ordersRes.data)) {
            ordersData = ordersRes.data;
          } else if (Array.isArray(ordersRes.data.orders)) {
            ordersData = ordersRes.data.orders;
          }
        }

        // Asegurar que cada orden tenga los campos necesarios
        const sanitizedOrders = ordersData.map(order => ({
          _id: order._id || '',
          user: {
            name: order.user?.name || 'N/A'
          },
          total: Number(order.total) || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt || new Date().toISOString()
        }));

        setRecentOrders(sanitizedOrders);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Resumen del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Productos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.products.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Órdenes</h3>
          <p className="text-3xl font-bold text-green-600">{stats.orders.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.users.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ${stats.revenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Órdenes Recientes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No hay órdenes recientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-2">{order._id.substring(0, 8)}...</td>
                    <td className="px-4 py-2">{order.user.name}</td>
                    <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-200 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;