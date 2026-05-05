const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient'); // Asegúrate de que la ruta a tu cliente de Supabase sea esta

// Obtener logs
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('fecha', { ascending: false });
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

// Insertar log
router.post('/', async (req, res) => {
  const { usuario, accion, entidad, detalle, fecha } = req.body;
  const { data, error } = await supabase
    .from('logs')
    .insert([{ usuario, accion, entidad, detalle, fecha }]);
    
  if (error) return res.status(400).json(error);
  res.json(data);
});

module.exports = router;