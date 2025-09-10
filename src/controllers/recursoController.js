import Recurso from '../models/Recurso.js';
import asyncHandler from 'express-async-handler';
import { filtrarEtiquetas } from '../utils/filtradorEtiquetas.js';
import { todosLosRecursos } from '../data/listaRecursosApp.js';

// OBTENER TODOS LOS RECURSOS
export const getRecursos = asyncHandler(async (req, res) => {
    try {
        const recursos = await Recurso.find({});
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

        let obtenerRecursoAleatorio = false;
        
        if (!etiquetas || etiquetas.length === 0) {
            console.log("Escenario 0: Sin emociones previas - recurso aleatorio");
            obtenerRecursoAleatorio = true;
        }
        
        // 1. Filtramos recursos que tienen al menos una etiqueta coincidente
        const recursosFiltrados = await Recurso.find({
            etiquetas: { $in: etiquetas }
        })

        if (recursosFiltrados.length === 0) {
            console.log("Escenario 1: Hay emociones, pero no coincidencias.");
            obtenerRecursoAleatorio = true;
        }

        if(obtenerRecursoAleatorio) {
            const recursosAleatorios = await Recurso.aggregate([
                { $sample: { size: 3 } },
                { 
                    $project: {
                        _id: 0, // Excluimos _id
                        id: "$_id", // Creamos id a partir de _id
                        titulo: 1,
                        descripcion: 1,
                        fecha_creacion: 1,
                        autor: 1,
                        categoria: 1,
                        etiquetas: 1,
                        duracion: 1,
                        enlace_contenido: 1,
                        tipo: 1,
                        dificultad: 1,
                    } 
                }
            ]);
            if (recursosAleatorios.length > 0) {
                res.status(200).json(recursosAleatorios);
            } else {
                res.status(404).json({ message: "No hay recursos disponibles" });
            }
        } else {
            console.log("Escenario 2: Hay emociones y coincidencias.");
            console.log(etiquetas);

            // 2. Calculamos puntaje de coincidencia
            const recursosConPuntaje = recursosFiltrados.map(recurso => {
                const etiquetasRecurso = recurso.etiquetas;
                const coincidencias = etiquetasRecurso.filter(etiqueta => 
                    etiquetas.includes(etiqueta)
                );

                // Convertimos el _id a id
                const recursoObj = recurso.toObject();
                recursoObj.id = recursoObj._id;
                delete recursoObj._id;
                
                return {
                    ...recursoObj,
                    matchScore: coincidencias.length
                };
            });
            
            // Selección con ponderación
            const maxScore = Math.max(...recursosConPuntaje.map(r => r.matchScore));
            const mejoresRecursos = recursosConPuntaje.filter(r => r.matchScore === maxScore);
            const otrosRecursos = recursosConPuntaje.filter(r => r.matchScore !== maxScore)
            .sort((a, b) => b.matchScore - a.matchScore);

            const listaRecursos = [...mejoresRecursos, ...otrosRecursos];

            res.status(200).json(listaRecursos);
        }
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al buscar recursos",
            error: error.message 
        });
    }
});

// BUSCAR RECURSOS POR PARÁMETROS
export const buscarRecursos = asyncHandler(async (req, res) => {
    const { parametro, filtro } = req.params;
    try {
        let query = {};

        switch(filtro) {
            case "titulo":
                query = { titulo: { $regex: parametro, $options: 'i' } };
                break;
            case "categoria":
                const parametroNormalizado = parametro
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s/g, "")
                    .toLowerCase();
                    
                query = { categoria: parametroNormalizado };
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

export const establecerTodosLosRecursos = asyncHandler(async (req, res) => {
    try {
        
      await Recurso.deleteMany({});
      const result = await Recurso.insertMany(todosLosRecursos);
  
      res.status(201).json({
        message: `Base de datos actualizada con ${result.length} recursos`
      });
      
    } catch (error) {
      console.error('Error al actualizar recursos:', error);
      res.status(500).json({
        message: 'Error al actualizar la base de recursos',
        error: error.message
      });
    }
  });