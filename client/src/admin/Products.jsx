import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && response.data.success) {
          setProducts(response.data.data || []);
        } else {
          setProducts([]);
          console.error('Respuesta inesperada:', response);
        }
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('Hubo un error al cargar los productos.');
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const getImageUrl = (filename) => {
    return `http://localhost:5000/uploads/${filename}`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Lista de Productos</h2>
        <button
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        >
          + Agregar Producto
        </button>
      </div>

      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Imagen</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Precio</th>
                <th className="border p-2 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="border p-2 text-center">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-20 h-20 object-cover mx-auto rounded"
                        />
                      ) : (
                        <span className="text-gray-400">Sin imagen</span>
                      )}
                    </td>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">${product.price}</td>
                    <td className="border p-2">{product.description}</td>
                  </tr>
                ))
              ) : (
                <tr key="no-products">
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No hay productos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
