import Programa from '../models/Programa.js';
import Recurso from '../models/Recurso.js';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { filtrarEtiquetas } from '../utils/filtradorEtiquetas.js';
import { todosLosProgramas } from '../data/listaProgramasApp.js';

// OBTENER TODOS LOS PROGRAMAS
export const getProgramas = asyncHandler(async (req, res) => {
    try {
        const programas = await Programa.find({}).populate('recursos');
        
        // Transformar cada programa para cambiar _id → id en los recursos
        const programasTransformados = programas.map(programa => {
            const programaObj = programa.toObject({ virtuals: true });
            return {
                ...programaObj,
                recursos: programaObj.recursos.map(recurso => ({
                    id: recurso._id.toString(),
                    ...recurso,
                    _id: undefined
                }))
            };
        });
        
        res.status(200).json(programasTransformados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// OBTENER UN PROGRAMA POR ID
export const getPrograma = asyncHandler(async (req, res) => {
    try {
        const programa = await Programa.findById(req.params.idPrograma).populate('recursos');
        // ✅ Haces populate correctamente

        if (!programa) {
            return res.status(404).json({ message: "Programa no encontrado" });
        }

        // Convertimos el programa a un objeto plano y transformamos los recursos
        const programaTransformado = {
            ...programa.toObject({ virtuals: true }), // Convierte a objeto y mantiene virtuals
            recursos: programa.recursos.map(recurso => ({
                id: recurso._id.toString(),  // Cambiamos _id → id
                ...recurso.toObject(),       // Copiamos el resto de campos
                _id: undefined               // Eliminamos _id explícitamente
            }))
        };
        console.log(programaTransformado);

        res.status(200).json(programaTransformado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// SELECCIONAR PROGRAMA POR ETIQUETAS (PARA RECOMENDACIÓN PERSONALIZADA)
export const selectPrograma = asyncHandler(async (req, res) => {
    try {
        const etiquetas = await filtrarEtiquetas(req.query.idUsuario);

        let obtenerProgramaAleatorio = false;
        
        if (!etiquetas || etiquetas.length === 0) {
            console.log("Escenario 0: Sin emociones previas - programa aleatorio");
            obtenerProgramaAleatorio = true;
        }
        
        // 1. Filtramos programas que tienen al menos una etiqueta coincidente
        const programasFiltrados = await Programa.find({
            etiquetas: { $in: etiquetas }
        }).populate('recursos');

        if (programasFiltrados.length === 0) {
            console.log("Escenario 1: Hay emociones, pero no coincidencias.");
            obtenerProgramaAleatorio = true;
        }

        if(obtenerProgramaAleatorio) {
            const programasAleatorios = await Programa.aggregate([
                { $sample: { size: 3 } },
                { $lookup: {
                    from: 'recursos',
                    localField: 'recursos',
                    foreignField: '_id',
                    as: 'recursos'
                }},
                { 
                    $project: {
                        _id: 0,
                        id: "$_id",
                        titulo: 1,
                        descripcion: 1,
                        fecha_creacion: 1,
                        categoria: 1,
                        etiquetas: 1,
                        recursos: 1
                    } 
                }
            ]);
            
            if (programasAleatorios.length > 0) {
                res.status(200).json(programasAleatorios);
            } else {
                res.status(404).json({ message: "No hay programas disponibles" });
            }
        } else {
            console.log("Escenario 2: Hay emociones y coincidencias.");
            
            // 2. Calculamos puntaje de coincidencia
            const programasConPuntaje = programasFiltrados.map(programa => {
                const etiquetasPrograma = programa.etiquetas;
                const coincidencias = etiquetasPrograma.filter(etiqueta => 
                    etiquetas.includes(etiqueta)
                );
                
                // Convertimos el _id a id
                const programaObj = programa.toObject();
                programaObj.id = programaObj._id;
                delete programaObj._id;
                
                return {
                    ...programaObj,
                    matchScore: coincidencias.length
                };
            });
              
            // Selección con ponderación
            const maxScore = Math.max(...programasConPuntaje.map(p => p.matchScore));
            const mejoresProgramas = programasConPuntaje.filter(p => p.matchScore === maxScore);
            const otrosProgramas = programasConPuntaje.filter(p => p.matchScore !== maxScore)
            .sort((a, b) => b.matchScore - a.matchScore);

            const listaProgramas = [...mejoresProgramas, ...otrosProgramas];

            res.status(200).json(listaProgramas);
        }
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al buscar programas",
            error: error.message 
        });
    }
});

// BUSCAR PROGRAMAS POR PARÁMETROS
export const buscarProgramas = asyncHandler(async (req, res) => {
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
                return res.status(400).json("Filtro no válido");
        }

        const programas = await Programa.find(query).populate('recursos');

        res.status(200).json(programas);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREAR UN NUEVO PROGRAMA
export const createPrograma = asyncHandler(async (req, res) => {
    const { titulo, descripcion, categoria, etiquetas, recursos } = req.body;
    
    if (!titulo || !categoria || !recursos || recursos.length === 0) {
        return res.status(400).json({ 
            message: "Faltan campos requeridos" 
        });
    }
    
    try {
        // Verificar que todos los recursos existen (por sus IDs)
        const recursosExistentes = await Recurso.find({ _id: { $in: recursos } });
        if (recursosExistentes.length !== recursos.length) {
            return res.status(400).json({ message: "Uno o más recursos no existen" });
        }

        const nuevoPrograma = await Programa.create({
            titulo,
            descripcion,
            categoria,
            etiquetas,
            recursos
        });

        // Populate para devolver el programa con recursos completos
        const programaPopulado = await Programa.findById(nuevoPrograma._id).populate('recursos');
        
        // ✅ Transformar _id → id en los recursos
        const programaTransformado = {
            ...programaPopulado.toObject({ virtuals: true }),
            recursos: programaPopulado.recursos.map(recurso => ({
                id: recurso._id.toString(),
                ...recurso.toObject(),
                _id: undefined
            }))
        };
        
        res.status(201).json(programaTransformado);

    } catch (error) {
        console.error("Error en creación de Programa:", error);
        res.status(500).json({ 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
});

// ACTUALIZAR UN PROGRAMA
export const updatePrograma = asyncHandler(async (req, res) => {
    try {
        const programa = await Programa.findById(req.params.id);
        
        if (!programa) {
            return res.status(404).json({ message: "Programa no encontrado" });
        }
        
        // Actualizar solo los campos proporcionados
        Object.keys(req.body).forEach(key => {
            if (key in programa && key !== 'recursos') {
                programa[key] = req.body[key];
            }
        });
        
        // Manejo especial para recursos
        if (req.body.recursos) {
            // Verificar que todos los recursos existen
            const recursosExistentes = await Recurso.find({ _id: { $in: req.body.recursos } });
            if (recursosExistentes.length !== req.body.recursos.length) {
                return res.status(400).json({ message: "Uno o más recursos no existen" });
            }
            programa.recursos = req.body.recursos;
        }
        
        const programaActualizado = await programa.save();
        
        const programaPopulado = await Programa.findById(programaActualizado._id).populate('recursos');
        
        // Transformar _id → id en los recursos
        const programaTransformado = {
            ...programaPopulado.toObject({ virtuals: true }),
            recursos: programaPopulado.recursos.map(recurso => ({
                id: recurso._id.toString(),
                ...recurso.toObject(),
                _id: undefined
            }))
        };
        
        res.status(200).json(programaTransformado);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ELIMINAR UN PROGRAMA
export const deletePrograma = asyncHandler(async (req, res) => {
    try {
        const programa = await Programa.findByIdAndDelete(req.params.id);
        
        if (!programa) {
            return res.status(404).json({ message: "Programa no encontrado" });
        }
        
        res.status(200).json({ message: "Programa eliminado correctamente" });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export const establecerTodosLosProgramas = asyncHandler(async (req, res) => {
    try {
  
      // 1. Verificar recursos existentes
      const recursosIds = todosLosProgramas.flatMap(p => 
        p.recursos.map(id => new Types.ObjectId(id))
      );
      const recursosExistentes = await Recurso.find({ _id: { $in: recursosIds } });
  
      // Comparación segura (usando strings)
      const idsFaltantes = recursosIds.filter(id => 
        !recursosExistentes.some(r => r._id.toString() === id.toString())
      );
  
      if (idsFaltantes.length > 0) {
        throw new Error(`Recursos no encontrados: ${idsFaltantes.join(', ')}`);
      }
  
      // 2. Insertar programas
      await Programa.deleteMany({});
      const result = await Programa.insertMany(todosLosProgramas); // Ya tienen IDs válidos
  
      res.status(201).json({ message: `Programas insertados: ${result.length}` });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        message: 'Error al actualizar programas',
        error: error.message,
        detalles: error.stack // Para depuración
      });
    }
  });