const axios = require('axios');
const Order = require('../models/Order');

const WOMPI_API_URL = process.env.WOMPI_API_URL;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

exports.createTransaction = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    const order = await Order.findById(orderId).populate('user items.product');
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const transactionData = {
      amount_in_cents: order.total * 100,
      currency: 'COP',
      customer_email: order.user.email,
      payment_method: {
        type: paymentMethod.type, // 'CARD', 'NEQUI', etc.
        token: paymentMethod.token // Token generado por Wompi.js
      },
      reference: `ORD-${order._id}`,
      redirect_url: `${process.env.FRONTEND_URL}/order/${order._id}`
    };

    const response = await axios.post(`${WOMPI_API_URL}/transactions`, transactionData, {
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    order.wompiTransaction = {
      id: response.data.data.id,
      status: response.data.data.status,
      paymentMethod: paymentMethod.type
    };
    await order.save();

    res.json({ transaction: response.data.data });
  } catch (error) {
    console.error('Error al crear transacción Wompi:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers['x-signature'];
    
    // Validar firma (opcional pero recomendado)
    
    const transaction = event.data.transaction;
    const order = await Order.findOne({ 'wompiTransaction.id': transaction.id });
    
    if (order) {
      order.wompiTransaction.status = transaction.status;
      
      if (transaction.status === 'APPROVED') {
        order.status = 'completed';
      } else if (transaction.status === 'DECLINED') {
        order.status = 'cancelled';
      }
      
      order.statusHistory.push({
        status: order.status,
        date: new Date()
      });
      
      await order.save();
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook Wompi:', error);
    res.status(500).send('Error processing webhook');
  }
};