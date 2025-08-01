import React, { useState } from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || isAdmin !== true) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-gray-800 text-white w-64 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-0' : '-ml-64'
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <p className="text-sm text-gray-400">Bienvenido, {user?.name}</p>
        </div>
        
        <nav className="mt-5">
          <Link 
            to="/admin/dashboard" 
            className="block py-2 px-4 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/products" 
            className="block py-2 px-4 hover:bg-gray-700"
          >
            Productos
          </Link>
          <Link 
            to="/admin/orders" 
            className="block py-2 px-4 hover:bg-gray-700"
          >
            Órdenes
          </Link>
          <Link 
            to="/admin/users" 
            className="block py-2 px-4 hover:bg-gray-700"
          >
            Usuarios
          </Link>
          <button 
            onClick={logout}
            className="w-full text-left py-2 px-4 hover:bg-gray-700"
          >
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Panel de Administración</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
