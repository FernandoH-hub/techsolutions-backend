const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Obtener todas las tareas
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Crear una nueva tarea
router.post('/', async (req, res) => {
    try {
        const { project_id, title, responsible, priority, status } = req.body;
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ 
                project_id, 
                title, 
                responsible, 
                priority: priority || 'Media', 
                status: status || 'Pendiente' 
            }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. ACTUALIZAR TAREA (Crucial para cambiar de estado o responsable)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. ELIMINAR TAREA
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: "Tarea eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;