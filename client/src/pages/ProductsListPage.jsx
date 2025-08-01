import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsListPage = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  // Obtener productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data.data || res.data); // Compatible con diferentes formatos de respuesta
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar los productos');
        toast.error('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Manejar imágenes
  const getImageUrl = (imageName) => {
    if (!imageName) return '/placeholder.jpg';
    if (imageName.startsWith('http')) return imageName;
    
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.REACT_APP_API_URL || '';
    
    return `${baseUrl}/uploads/products/${imageName}`;
  };

  // Filtrar y ordenar productos
  const processedProducts = useMemo(() => {
    // Filtrado
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Ordenación
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
  }, [products, searchTerm, categoryFilter, sortOption]);

  // Obtener categorías únicas
  const categories = useMemo(() => 
    ['all', ...new Set(products.map(product => product.category))], 
    [products]
  );

  // Estados de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-3 text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-3">!</div>
          <h2 className="text-xl font-semibold mb-2">Error al cargar productos</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-24 py-8">
      {/* Encabezado y controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Nuestros Productos</h1>
          <p className="text-gray-600">Explora nuestra colección exclusiva</p>
        </div>
        
        <div className="w-full md:w-auto space-y-3">
          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Filtro por categoría */}
            <select
              className="flex-grow min-w-[150px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>

            {/* Ordenación */}
            <select
              className="flex-grow min-w-[150px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Ordenar por</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {processedProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="mt-1 text-gray-500 mb-4">Intenta ajustar tus filtros de búsqueda</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setSortOption('default');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const hasDiscount = product.discount > 0;
            const discountedPrice = hasDiscount 
              ? product.price * (1 - product.discount / 100) 
              : product.price;

            return (
              <div 
                key={product._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] ${
                  isOutOfStock ? 'opacity-70' : ''
                }`}
              >
                <Link to={`/product/${product._id}`} className="block">
                  {/* Imagen del producto */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    
                    {/* Badges */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          AGOTADO
                        </span>
                      </div>
                    )}
                    
                    {hasDiscount && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Detalles del producto */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`font-bold ${
                        hasDiscount ? 'text-gray-900' : 'text-gray-900'
                      }`}>
                        ${discountedPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                      {!isOutOfStock && (
                        <span className="text-xs text-gray-500">
                          {product.stock} en stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;