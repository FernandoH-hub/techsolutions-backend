const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <--- NUEVO
const saltRounds = 10;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * 1. OBTENER USUARIOS
 */
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, full_name, role, created_at, security_question') 
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener usuarios: " + error.message });
    }
};

/**
 * 2. REGISTRAR USUARIO
 */
const registerUser = async (req, res) => {
    try {
        const { username, password, full_name, role, security_question, security_answer } = req.body;
        
        if (!username || !password || !security_question || !security_answer) {
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedAnswer = await bcrypt.hash(security_answer.toLowerCase().trim(), saltRounds);

        // Seguridad: Evitar que alguien se registre como Superadministrador por su cuenta
        let finalRole = role;
        if (role === 'Superadministrador' && req.user?.role !== 'Superadministrador') {
            finalRole = 'Usuario'; 
        }

        const { data, error } = await supabase
            .from('users')
            .insert([{ 
                username, 
                password: hashedPassword, 
                full_name, 
                role: finalRole,
                security_question,
                security_answer: hashedAnswer
            }])
            .select('id, username, full_name, role');

        if (error) throw error;
        return res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Error en el registro: " + error.message });
    }
};

/**
 * 3. ACTUALIZAR USUARIO
 */
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, full_name, role, security_question, security_answer } = req.body;

    try {
        let updates = { username, full_name, role, security_question };

        if (password && password.trim() !== "") {
            updates.password = await bcrypt.hash(password, saltRounds);
        }

        if (security_answer && security_answer.trim() !== "") {
            updates.security_answer = await bcrypt.hash(security_answer.toLowerCase().trim(), saltRounds);
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return res.json({ message: "Usuario actualizado correctamente", data });

    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar: " + error.message });
    }
};

/**
 * 4. LOGIN (CON GENERACIÓN DE JWT)
 */
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "El usuario no existe." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        // --- GENERACIÓN DEL TOKEN JWT ---
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'clave_maestra_desarrollo',
            { expiresIn: '24h' } // El token expira en un día
        );

        // Enviamos los datos del usuario junto con el TOKEN
        const { password: _, security_answer: __, ...userWithoutSecrets } = user;
        
        return res.json({ 
            message: "Login exitoso", 
            user: { ...userWithoutSecrets, token } // <--- EL FRONTEND NECESITA ESTO
        });

    } catch (error) {
        return res.status(500).json({ error: "Error en el servidor: " + error.message });
    }
};

/**
 * 5. ELIMINAR USUARIO (USANDO ROLES DEL TOKEN)
 */
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const requesterRole = req.user.role; // Obtenido del verifyToken automáticamente

    try {
        const { data: targetUser, error: fetchError } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', id)
            .single();

        if (fetchError || !targetUser) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Lógica de jerarquía
        if (requesterRole === 'Administrador') {
            if (targetUser.role === 'Administrador' || targetUser.role === 'Superadministrador') {
                return res.status(403).json({ error: "No tienes permisos para eliminar a este nivel." });
            }
        }

        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        return res.json({ message: `Usuario ${targetUser.full_name} eliminado.` });

    } catch (error) {
        return res.status(500).json({ error: "Error al eliminar: " + error.message });
    }
};

/**
 * 6. OBTENER PREGUNTA
 */
const getSecurityQuestion = async (req, res) => {
    try {
        const { username } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('security_question')
            .eq('username', username)
            .single();

        if (error || !data) return res.status(404).json({ error: "Usuario no encontrado" });
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * 7. RESTABLECER CONTRASEÑA
 */
const resetPassword = async (req, res) => {
    try {
        const { username, security_answer, new_password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, security_answer')
            .eq('username', username)
            .single();

        if (error || !user) return res.status(404).json({ error: "Usuario no encontrado" });

        const match = await bcrypt.compare(security_answer.toLowerCase().trim(), user.security_answer);
        if (!match) return res.status(401).json({ error: "Respuesta de seguridad incorrecta." });

        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) throw updateError;
        return res.json({ message: "Contraseña actualizada con éxito." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUsers, 
    deleteUser,
    updateUser,
    getSecurityQuestion,
    resetPassword
};