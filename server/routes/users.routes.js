const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authmiddleware');

// 🟢 Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Intento de login:', { email, password });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(400).json({ message: 'Correo o contraseña inválidos' });
    }

    if (!user.password) {
      console.error('⚠️ El usuario no tiene contraseña en la base de datos');
      return res.status(500).json({ message: 'Contraseña faltante' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔍 Contraseña válida:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña inválidos' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no definido');
      return res.status(500).json({ message: 'Error del servidor: JWT secreto faltante' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Token generado correctamente');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('🔥 Error en login:', err.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// 🟢 Ruta protegida: obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error('🔥 Error al obtener perfil:', err.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// 🟡 Ruta temporal para restablecer contraseña (SOLO PARA USO INTERNO O PRUEBAS)
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email y nueva contraseña requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email: email.trim() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(`🔁 Contraseña restablecida para: ${email}`);
    res.json({ message: 'Contraseña actualizada correctamente', user });
  } catch (err) {
    console.error('🔥 Error al restablecer contraseña:', err.message);
    res.status(500).json({ message: 'Error actualizando la contraseña' });
  }
});

module.exports = router;
