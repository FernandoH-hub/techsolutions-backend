const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Obtener todos los proyectos
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Crear un nuevo proyecto
router.post('/', async (req, res) => {
    try {
        const { client_id, name, description, start_date, end_date, status } = req.body;
        const { data, error } = await supabase
            .from('projects')
            .insert([{ client_id, name, description, start_date, end_date, status }])
            .select();
        
        if (error) throw error;
        
        // IMPORTANTE: Devolvemos data[0] para que el frontend reciba el ID directamente
        res.status(201).json(data[0]); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Actualizar proyecto (Para pausas, cambios de estado y fechas)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;