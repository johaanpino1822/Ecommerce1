const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getAllOrders, 
  handleWompiWebhook 
} = require('../controllers/order.Controller');
const authMiddleware = require('../middleware/authmiddleware');

// Rutas protegidas por autenticación
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getAllOrders);

// Webhook (sin autenticación)
router.post('/wompi-webhook', handleWompiWebhook);

module.exports = router;