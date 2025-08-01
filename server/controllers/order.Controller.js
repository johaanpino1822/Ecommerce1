const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear nueva orden con transacción
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderItems, shippingAddress, itemsPrice, shippingPrice, totalPrice, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!orderItems?.length) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }

    // Validar campos requeridos
    const requiredFields = ['name', 'address', 'city', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !shippingAddress?.[field]);
    if (missingFields.length) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        error: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Procesar items
    const productUpdates = [];
    let calculatedSubtotal = 0;

    for (const item of orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, error: `ID de producto inválido: ${item.product}` });
      }

      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, error: `Producto no encontrado: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          error: `Stock insuficiente para ${product.name}`,
          available: product.stock,
          requested: item.quantity
        });
      }

      calculatedSubtotal += product.price * item.quantity;
      productUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } }
        }
      });
    }

    // Crear y guardar orden
    const order = new Order({
      user: userId,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items: orderItems,
      subtotal: itemsPrice,
      shipping: shippingPrice,
      total: totalPrice,
      paymentMethod,
      shippingInfo: shippingAddress,
      status: 'pending'
    });

    await Product.bulkWrite(productUpdates, { session });
    const savedOrder = await order.save({ session });
    await session.commitTransaction();
    
    res.status(201).json({ success: true, order: savedOrder });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al crear orden:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno al procesar la orden',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  } finally {
    session.endSession();
  }
};

// Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Webhook Wompi
const handleWompiWebhook = async (req, res) => {
  try {
    console.log('Webhook recibido:', req.body);
    // Aquí iría la lógica para procesar el webhook
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  handleWompiWebhook
};