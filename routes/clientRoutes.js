const express = require('express');
const router = express.Router();
const { getClients, createClientDb, updateClientStatus } = require('../controllers/clientController');

router.get('/', getClients);
router.post('/', createClientDb);
// Esta es la ruta que te faltaba y por eso daba error 404
router.put('/:id', updateClientStatus); 

module.exports = router;