import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Validar que los datos existan y sean un array
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setProducts(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProducts([]);
      setFiltered([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = filtered.filter((p) => p._id !== id);
      setProducts(updated);
      setFiltered(updated);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        (p.description && p.description.toLowerCase().includes(value))
    );
    setFiltered(result);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Productos</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={handleSearch}
          className="border px-3 py-2 w-full max-w-md rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.description}</td>
                  <td className="border p-2">${product.price}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
