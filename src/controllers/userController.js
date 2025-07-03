import Usuario from '../models/Usuario.js'
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcrypt'
const saltRounds = 10;

// Tus rutas van aquí
    // GETS GENERICOS

//error 404: no se ha encontrado; error 409: conflicto

///api/user
export const getUsers = asyncHandler(async(req, res) => { //NO TIENE CU
    try{
        const users = await Usuario.find({})
        res.status(200).json(users)

    }catch(error){
        res.status(500).json({ message: error.message });
    }
})
///api/user/:id
export const getUser = asyncHandler(async(req, res) => { //CU01
    console.log("Entrmos a getUser")
    console.log(req.params.id)
    try{
        const user = await Usuario.findById(req.params.id);
        if(user)
            res.status(200).json(user)
        else
            res.status(404).json({ message: "Usuario no encontrado" });

    }catch(error){
        res.status(500).json({ message: error.message });
    }
})
///api/user
export const createUser = asyncHandler(async (req, res) => { //CU23
    const { nombre_usuario, nombre, contraseña, fecha_nacimiento } = req.body;
    try {
        // Comprobar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ nombre_usuario });
        if (usuarioExistente) {
            console.log("Usuario existente:", usuarioExistente);
            return res.status(409).json({ message: "Este usuario ya existe" });
        }
        // Verificar que la contraseña no sea undefined o null
        if (!contraseña) {
            console.log("Contraseña no proporcionada");
            return res.status(400).json({ message: "Contraseña no proporcionada" });
        }
        //CIFRAR CONTRASEÑA
        const contraseña_hashed = await bcrypt.hash(contraseña, saltRounds);

        //PROCESAR FECHA
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha_nacimiento)) {
            return res.status(400).json({ message: "Formato de fecha no valido" });
        }
        const [día, mes, año] = fecha_nacimiento.split('/');
        const fechaProcesada = new Date(`${año}-${mes}-${día}`);

        if (isNaN(fechaProcesada.getTime())) {
            return res.status(400).json({ message: "La fecha no es válida" });
        }

        //CREAR OBJETO USUARIO
        const newUsu = new Usuario({
            nombre_usuario,
            nombre,
            contraseña: contraseña_hashed,
            fecha_nacimiento: fechaProcesada,
            id_grupos: []
        });
        await newUsu.save();
        console.log("Usuario guardado:", newUsu);

        // CREAR CATEGORIA SIN CATEGORA
        const Categoria = new CategoriaUsuario({ //Categoria "Sin categoria"
            nombre: "Sin Categoria",
            descripcion: "Tareas sin categoria definida",
            id_usuario: newUsu._id,
        });
        await Categoria.save();
        console.log("categoria guardada:", Categoria);

        //NOTIFICACION BIENVENIDA
        //llamarla desde el frontend

        res.status(200).json(newUsu);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ message: error.message });
    }
});

///api/user/login
export const loginUser = asyncHandler(async(req, res) => { //CU24

    const { nombre_usuario, contraseña } = req.body;
    try {
        const usuario = await Usuario.findOne({ nombre_usuario });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario incorrecto' });
        }

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(409).json({ message: 'Credenciales incorrectas' });
        }

        //req.session.usuarioId = usuario._id.toString();

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

///api/user/modifyProfile/:id
export const modifyUser = asyncHandler(async(req, res) => { //CU02
    
    const { nombre_usuario, nombre} = req.body;

    try {
        if (!nombre_usuario || !nombre) {
            return res.status(400).json({ message: "Se requieren nombre_usuario y nombre para actualizar el usuario" });
        }
        let updateData = {
            nombre_usuario,
            nombre,
        };
        
        // Intentar encontrar y actualizar el usuario
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        // Si el usuario no se encuentra, devolver 404
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Devolver éxito si se actualizó el usuario
        res.status(200).json({ message: 'El usuario ha sido actualizado', usuario });
    } catch (error) {
        // Manejar cualquier otro error
        res.status(500).json({ message: error.message });
        
    }
})
///api/user/modifyPassword
export const modifyPassword = asyncHandler(async(req, res) => { 
    const { contraseña } = req.body;
    console.log("Contraseña: ", contraseña)
    try {
        // Solo actualizar la contraseña si se pasa en el cuerpo de la solicitud
        if (!contraseña) {
            return res.status(400).json({ message: "Contraseña no proporcionada" });
        } 
        
        const contraseña_hashed = await bcrypt.hash(contraseña, saltRounds);

        const usuario = await Usuario.findByIdAndUpdate(req.params.id, {contraseña: contraseña_hashed} , { new: true });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json({ message: 'La contraseña ha sido actualizada', usuario});
    } catch (error) {
        // Manejar cualquier otro error
        res.status(500).json({ message: error.message });
    }     
})

/*
export const logoutUser = asyncHandler(async(req, res) => { //CU25
    try {
        const usuarioId = req.session.usuarioId; // Almacena el ID del usuario antes de destruir la sesión

        req.session.destroy(async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión' });
            }

            const usuario = await Usuario.findById(usuarioId); // Utiliza el ID almacenado
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Sesión cerrada exitosamente' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}) */
///api/user/invitation/:grupo
export const acceptInvitationGroup = asyncHandler(async(req, res) => { //CU06
    const {id_usuario} = req.body
    try {
        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const grupo = await Grupo.findById(req.params.grupo);
        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        for (let i = 0; i < usuario.id_grupos.length; i++) {
            if (usuario.id_grupos[i].equals(grupo._id)) {
                return res.status(409).json({ message: 'El usuario ya está en el grupo' });
            }
        }

        usuario.id_grupos.push(grupo);
        await usuario.save();

        grupo.id_usuarios.push(usuario);
        await grupo.save();

        res.status(200).json({ message: 'Invitación aceptada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})
