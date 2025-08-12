import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, login, error: authError, isAdmin } = useAuth();

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('El email no tiene un formato válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const loginSuccess = await login(credentials);

      if (loginSuccess) {
        setSuccess(true);
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/cart');
        }
      } else {
        setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al conectar con el servidor. Intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C4B45] to-[#062923] flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="mx-auto bg-gradient-to-br from-[#662D8F] to-[#F2A9FD] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <LockClosedIcon className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#83F4E9] tracking-tight">ACCESO ADMINISTRATIVO</h2>
          <p className="mt-2 text-[#B5EAD7] font-light">
            Solo personal autorizado
          </p>
        </div>

        <motion.div 
          className="bg-[#0A2E38]/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-[#83F4E9]/20"
          whileHover={{ y: -5 }}
        >
          <div className="px-6 py-8 sm:p-10">
            {success && (
              <motion.div 
                className="mb-6 bg-[#0C4B45] rounded-lg py-3 px-4 flex items-center border border-[#83F4E9]/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <svg className="h-5 w-5 text-[#83F4E9] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#83F4E9] font-medium">¡Autenticación exitosa! Redirigiendo...</span>
              </motion.div>
            )}

            {error && (
              <motion.div 
                className="mb-6 bg-[#4B2280]/50 rounded-lg py-3 px-4 flex items-start border border-[#F2A9FD]/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ExclamationCircleIcon className="h-5 w-5 text-[#F2A9FD] mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-[#F2A9FD]">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#83F4E9] mb-1">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 bg-[#0A2E38]/70 border ${error && error.includes('email') ? 'border-[#F2A9FD]' : 'border-[#83F4E9]/30'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F2A9FD] focus:border-transparent text-white placeholder-[#83F4E9]/50`}
                  placeholder="admin@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#83F4E9] mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength="6"
                  className={`w-full px-4 py-3 bg-[#0A2E38]/70 border ${error && error.includes('contraseña') ? 'border-[#F2A9FD]' : 'border-[#83F4E9]/30'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F2A9FD] focus:border-transparent text-white placeholder-[#83F4E9]/50`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#F2A9FD] focus:ring-[#F2A9FD] border-[#83F4E9]/30 rounded bg-[#0A2E38]/70"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#83F4E9]">
                    Recuérdame
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-[#F2A9FD] hover:text-[#83F4E9] transition-colors">
                    ¿Contraseña olvidada?
                  </Link>
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-[#662D8F] to-[#F2A9FD] hover:from-[#512577] hover:to-[#e895fc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F2A9FD] ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    </>
                  ) : 'ACCEDER AL SISTEMA'}
                </motion.button>
              </div>
            </form>
          </div>

          <div className="bg-[#0A2E38]/80 px-6 py-4 sm:px-10 border-t border-[#83F4E9]/10">
            <p className="text-xs text-[#83F4E9]/70 text-center">
              Al iniciar sesión, aceptas nuestro{' '}
              <Link to="/terms" className="font-medium text-[#F2A9FD] hover:text-[#83F4E9] transition-colors">
                Acuerdo de confidencialidad
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-sm">
          <p className="text-[#83F4E9]/80">
            ¿Problemas técnicos?{' '}
            <Link to="/support" className="font-medium text-[#F2A9FD] hover:text-[#83F4E9] transition-colors">
              Contactar al soporte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;