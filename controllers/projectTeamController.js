const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const getTeam = async (req, res) => {
    try {
        const { project_id } = req.query;
        let query = supabase.from('project_team').select('*');

        if (project_id) {
            query = query.eq('project_id', Number(project_id));
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { project_id, name, role } = req.body;
        const { data, error } = await supabase
            .from('project_team')
            .insert([{ project_id, name, role }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTeam, addMember };