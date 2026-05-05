const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const getClients = async (req, res) => {
    const { data, error } = await supabase.from('clients').select('*').order('id', { ascending: true });
    if (error) return res.status(400).json(error);
    res.json(data);
};

const createClientDb = async (req, res) => {
    const { name, email, phone, company, status } = req.body;
    
    const nuevoCliente = { 
        name, 
        company,
        email: email || null, 
        phone: phone || null,
        status: status || 'ACTIVO' // Ajustado a 'ACTIVO' para coincidir con tu lógica de botones
    };

    const { data, error } = await supabase
        .from('clients')
        .insert([nuevoCliente])
        .select();
    
    if (error) {
        console.error("Error detallado de Supabase:", error);
        return res.status(400).json(error);
    }
    
    res.status(201).json(data);
};

// NUEVA FUNCIÓN: Actualizar estado (Desactivar/Activar)
const updateClientStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('clients')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) throw error;
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json(data[0]);
    } catch (err) {
        console.error("Error al actualizar cliente:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getClients, createClientDb, updateClientStatus };