const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

// Crear transacción en Wompi
router.post('/create-transaction', async (req, res) => {
  try {
    const { orderId, amount, customerEmail, paymentMethod } = req.body;

    // Validar datos de entrada
    if (!orderId || !amount || !customerEmail || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: orderId, amount, customerEmail, paymentMethod'
      });
    }

    // Verificar que la orden existe
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Configurar datos para Wompi
    const wompiData = {
      amount_in_cents: Math.round(amount * 100), // Wompi usa centavos
      currency: 'COP',
      customer_email: customerEmail,
      payment_method: {
        type: paymentMethod === 'card' ? 'CARD' : 
              paymentMethod === 'nequi' ? 'NEQUI' : 'PSE',
      },
      reference: orderId.toString(),
      redirect_url: `${process.env.FRONTEND_URL}/order/${orderId}/result`,
      payment_source_id: null
    };

    // Crear transacción en Wompi
    const wompiResponse = await axios.post(
      `${process.env.WOMPI_API_URL}/transactions`,
      wompiData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Validar respuesta de Wompi
    if (!wompiResponse.data.data || !wompiResponse.data.data.redirect_url) {
      throw new Error('Respuesta inválida de Wompi');
    }

    // Actualizar orden con ID de transacción
    order.paymentId = wompiResponse.data.data.id;
    await order.save();

    // Responder con URL de pago
    res.json({
      success: true,
      paymentUrl: wompiResponse.data.data.redirect_url,
      transactionId: wompiResponse.data.data.id
    });

  } catch (error) {
    console.error('Error al crear transacción en Wompi:', error);
    
    let errorMessage = 'Error al procesar el pago';
    let statusCode = 500;
    
    if (error.response) {
      // Error de la API de Wompi
      errorMessage = error.response.data?.error?.message || errorMessage;
      statusCode = error.response.status;
      
      console.error('Detalles del error de Wompi:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Webhook para recibir notificaciones de Wompi
router.post('/webhook', express.json({ verify: (req, res, buf) => {
  req.rawBody = buf.toString();
}}), async (req, res) => {
  try {
    // Verificar firma del webhook
    const signature = req.headers['x-wompi-signature'];
    const computedSignature = crypto
      .createHmac('sha256', process.env.WOMPI_EVENT_SECRET)
      .update(req.rawBody)
      .digest('hex');

    if (signature !== computedSignature) {
      console.warn('Intento de webhook no autorizado. Firma inválida.');
      return res.status(403).json({ success: false, error: 'Firma inválida' });
    }

    const event = req.body;
    const transaction = event.data;
    const orderId = transaction.reference;

    // Validar que la orden existe
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Orden no encontrada para webhook: ${orderId}`);
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }

    // Actualizar estado según la transacción
    switch (transaction.status) {
      case 'APPROVED':
        order.paymentStatus = 'paid';
        order.status = 'processing';
        break;
      case 'DECLINED':
      case 'VOIDED':
        order.paymentStatus = 'failed';
        break;
      case 'REFUNDED':
        order.paymentStatus = 'refunded';
        break;
      default:
        console.warn(`Estado de transacción no manejado: ${transaction.status}`);
    }

    order.paymentMethod = transaction.payment_method_type;
    await order.save();

    console.log(`Orden ${order._id} actualizada a estado: ${order.paymentStatus}`);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error en webhook de Wompi:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error procesando webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;