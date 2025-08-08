import Recurso from '../models/Recurso.js';
import Emocion from '../models/Emocion.js';
import asyncHandler from 'express-async-handler';

// OBTENER TODOS LOS RECURSOS
export const getRecursos = asyncHandler(async (req, res) => {
    try {
        const recursos = await Recurso.find({});
        console.log(recursos);

        res.status(200).json(recursos);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// OBTENER UN RECURSO POR ID
export const getRecurso = asyncHandler(async (req, res) => {
    try {
        const recurso = await Recurso.findById(req.params.idRecurso);
        if (recurso) {
            res.status(200).json(recurso);
        } else {
            res.status(404).json({ message: "Recurso no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// SELECCIONAR RECURSO POR ETIQUETAS (PARA RECOMENDACIÓN PERSONALIZADA)
export const selectRecurso = asyncHandler(async (req, res) => {
    try {
        const etiquetas = await filtrarEtiquetas(req.query.idUsuario);
        
        if (!etiquetas || etiquetas.length === 0) {
            console.log("Escenario 0: Sin emociones previas - recurso aleatorio");
            const count = await Recurso.countDocuments();
            const random = Math.floor(Math.random() * count);
            const recurso = await Recurso.findOne().skip(random);
            
            if (recurso) {
                return res.status(200).json(recurso);
            } else {
                return res.status(404).json({ message: "No hay recursos disponibles" });
            }
        }
        
        // 1. Filtramos recursos que tienen al menos una etiqueta coincidente
        const recursosFiltrados = await Recurso.find({
            etiquetas: { $in: etiquetas }
        }).exec(); 

        // Log para depuración
        console.log("Todos los recursos:", await Recurso.find({}).select('titulo etiquetas'));

        if (recursosFiltrados.length === 0) {
            console.log("Escenario 1: Hay emociones, pero no coincidencias.");
            return res.status(404).json({ 
                message: "No se encontraron recursos con esas etiquetas",
                sugerencia: "Intenta con otras etiquetas o consulta la lista de recursos sin filtros"
            });
        }
        
        console.log("Escenario 2: Hay emociones y coincidencias.");
        console.log(recursosFiltrados);
        console.log(etiquetas);

        // 2. Calculamos puntaje de coincidencia
        const recursosConPuntaje = recursosFiltrados.map(recurso => {
            const etiquetasRecurso = recurso.etiquetas;
            const coincidencias = etiquetasRecurso.filter(etiqueta => 
                etiquetas.includes(etiqueta)
            );
            
            return {
                ...recurso.toObject(),
                matchScore: coincidencias.length
            };
        });
          
        // Selección con ponderación
        const maxScore = Math.max(...recursosConPuntaje.map(r => r.matchScore));
        const mejoresRecursos = recursosConPuntaje.filter(r => r.matchScore === maxScore);
        const otrosRecursos = recursosConPuntaje.filter(r => r.matchScore !== maxScore);

        let recursoAleatorio;
        if (otrosRecursos.length > 0 && Math.random() < 0.2) {
            recursoAleatorio = otrosRecursos[Math.floor(Math.random() * otrosRecursos.length)];
        } else {
            recursoAleatorio = mejoresRecursos[Math.floor(Math.random() * mejoresRecursos.length)];
        }

        res.status(200).json(recursoAleatorio);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al buscar recursos",
            error: error.message 
        });
    }
});

// FILTRAR ETIQUETAS BASADO EN HISTORIAL DE EMOCIONES
const filtrarEtiquetas = async (usuarioId) => {
    try {
        const emociones = await Emocion.find({ usuario: usuarioId })
                                     .sort({ fecha_creacion: -1 })
                                     .limit(10);
        
        if (emociones.length === 0) return null;
        
        if (emociones.length < 3) {
            return emociones[0].etiquetas;
        }
        
        const frecuenciaEtiquetas = {};
        
        emociones.forEach(emocion => {
            emocion.etiquetas.forEach(etiqueta => {
                if (etiqueta) {
                    frecuenciaEtiquetas[etiqueta] = (frecuenciaEtiquetas[etiqueta] || 0) + 1;
                }
            });
        });
        
        return Object.entries(frecuenciaEtiquetas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        
    } catch (error) {
        console.error("Error al filtrar etiquetas:", error);
        return null;
    }
};

// OBTENER TODOS LOS RECURSOS
export const buscarRecursos = asyncHandler(async (req, res) => {
    const { parametro, filtro } = req.params;
    try {
        let query = {};
        
        // Aplicar el filtro correspondiente
        console.log(filtro);
        switch(filtro) {
            case "titulo":
                query = { titulo: { $regex: parametro, $options: 'i' } };
                break;
            case "categoria":
                query = { categoria: parametro };
                break;
            case "etiquetas":
                const etiquetas = parametro.split(',').map(etiqueta => etiqueta.trim());
                
                // Buscar recursos que contengan al menos una de las etiquetas
                query = { etiquetas: { $in: etiquetas } };
                break;
            default:
                res.status(401).json("Filtro no valido");
                break;
        }

        const recursos = await Recurso.find(query);

        res.status(200).json(recursos);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREAR UN NUEVO RECURSO
export const createRecurso = asyncHandler(async (req, res) => {
    const { titulo, descripcion, autor, categoria, etiquetas, duracion, enlace_contenido, tipo, dificultad } = req.body;
    
    // Validación básica
    if (!titulo || !enlace_contenido || !tipo) {
        return res.status(400).json({ message: "Faltan campos requeridos: título, enlace_contenido y tipo son obligatorios" });
    }
    
    // Validación específica para actividades
    if (tipo === 'actividad' && !dificultad) {
        return res.status(400).json({ message: "La dificultad es requerida para recursos de tipo 'actividad'" });
    }
    
    try {
        const nuevoRecurso = await Recurso.create({
            titulo,
            descripcion,
            autor,
            categoria,
            etiquetas,
            duracion,
            enlace_contenido,
            tipo,
            dificultad: tipo === 'actividad' ? dificultad : null
        });

        res.status(201).json(nuevoRecurso);

    } catch (error) {
        console.error("Error en creación de Recurso:", error);
        res.status(500).json({ 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
});

// ACTUALIZAR UN RECURSO
export const updateRecurso = asyncHandler(async (req, res) => {
    try {
        const recurso = await Recurso.findById(req.params.id);
        
        if (!recurso) {
            return res.status(404).json({ message: "Recurso no encontrado" });
        }
        
        // Actualizar solo los campos proporcionados
        Object.keys(req.body).forEach(key => {
            if (key in recurso) {
                recurso[key] = req.body[key];
            }
        });
        
        // Validar dificultad si es actividad
        if (recurso.tipo === 'actividad' && !recurso.dificultad) {
            return res.status(400).json({ message: "La dificultad es requerida para recursos de tipo 'actividad'" });
        }
        
        const recursoActualizado = await recurso.save();
        res.status(200).json(recursoActualizado);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ELIMINAR UN RECURSO
export const deleteRecurso = asyncHandler(async (req, res) => {
    try {
        const recurso = await Recurso.findByIdAndDelete(req.params.id);
        
        if (!recurso) {
            return res.status(404).json({ message: "Recurso no encontrado" });
        }
        
        res.status(200).json({ message: "Recurso eliminado correctamente" });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});