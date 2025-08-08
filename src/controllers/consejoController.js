import Consejo from '../models/Consejo.js';
import Emocion from '../models/Emocion.js';
import asyncHandler from 'express-async-handler';

// Implementar. Ponemos modificar y eliminar? Lo troncal de este sitio es devolver un consejo segun las etiquetas de emociones
// que se pasen.

// OBTENER TODOS LOS CONSEJOS
export const getConsejos = asyncHandler(async (req, res) => {
    try {
        const consejos = await Consejo.find({});
        res.status(200).json(consejos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// OBTENER UN CONSEJO
export const getConsejo = asyncHandler(async (req, res) => {
    try {
        const consejo = await Consejo.findById(req.params.id);
        if (consejo) {
            res.status(200).json(consejo);
        } else {
            res.status(404).json({ message: "Consejo no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// SELECCIONAR CONSEJO POR ETIQUETAS
export const selectConsejo = asyncHandler(async (req, res) => {
    try {
        const etiquetas = await filtrarEtiquetas(req.query.idUsuario);
        
        if (!etiquetas || etiquetas.length === 0) {
            console.log("Escenario 0: Sin emociones previas");
            const count = await Consejo.countDocuments();
            const random = Math.floor(Math.random() * count);
            const consejo = await Consejo.findOne().skip(random);
            
            if (consejo) {
                return res.status(200).json(consejo);
            } else {
                return res.status(404).json({ message: "No hay consejos disponibles" });
            }
        }
        
        // 1. Primero filtramos los consejos que tienen AL MENOS UNA etiqueta coincidente
        const consejosFiltrados = await Consejo.find({
            etiquetas: { $in: etiquetas }
          }).exec(); 

        // Verifica todos los consejos con sus etiquetas
        const todosConsejos = await Consejo.find({});
        console.log("Todos los consejos:", todosConsejos.map(c => ({
        titulo: c.titulo,
        etiquetas: c.etiquetas
        })));

        if (consejosFiltrados.length === 0) {
            console.log("Escenario 1: Hay emociones, pero no coincidencias.");
            return res.status(404).json({ 
                message: "No se encontraron consejos con esas etiquetas",
                sugerencia: "Intenta con otras etiquetas o consulta la lista de consejos sin filtros"
            });
        }
        console.log("Escenario 2: Hay emociones y coincidencias.");
        console.log(consejosFiltrados);
        console.log(etiquetas);

        // 2. Calculamos un "puntaje de coincidencia" para cada consejo
        const consejosConPuntaje = consejosFiltrados.map(consejo => {
            const etiquetasConsejo = consejo.etiquetas;

            // Encuentra qué etiquetas coinciden entre el consejo y el usuario
            const coincidencias = etiquetasConsejo.filter(etiqueta => 
            etiquetas.includes(etiqueta)
            );
            
            return {
            ...consejo.toObject(), // Mantenemos todos los datos del consejo
            matchScore: coincidencias.length // Número de etiquetas coincidentes
            };
        });
          
        // Si hay varios con máxima puntuación, 80% de elegir de ellos, 20% de otros
        const maxScore = Math.max(...consejosConPuntaje.map(c => c.matchScore));
        const mejoresConsejos = consejosConPuntaje.filter(c => c.matchScore === maxScore);
        const otrosConsejos = consejosConPuntaje.filter(c => c.matchScore !== maxScore);

        let consejoAleatorio;
        if (otrosConsejos.length > 0 && Math.random() < 0.2) { // 20% probabilidad
            consejoAleatorio = otrosConsejos[Math.floor(Math.random() * otrosConsejos.length)];
        } else {
            consejoAleatorio = mejoresConsejos[Math.floor(Math.random() * mejoresConsejos.length)];
        }

        res.status(200).json(consejoAleatorio);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al buscar consejos",
            error: error.message 
        });
    }
});

const filtrarEtiquetas = async (usuarioId) => {
    try {
        const emociones = await Emocion.find({ usuario: usuarioId })
                                     .sort({ fecha_creacion: -1 })
                                     .limit(10);
        
        if (emociones.length === 0) return null;
        
        if (emociones.length < 3) {
            // Convertir a array y limpiar
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

// CREAR UN CONSEJO
export const createConsejo = asyncHandler(async (req, res) => {
    const { titulo, contenido, etiquetas } = req.body;
    
    // Validación básica
    if (!titulo || !contenido || !etiquetas) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    try {
        // Crear nuevo Consejo (el _id será el firebaseUID)
        const nuevoConsejo = await Consejo.create({
            titulo,
            contenido,
            etiquetas
        });

        console.log("Consejo guardado:", nuevoConsejo);

        res.status(201).json(nuevoConsejo);


    } catch (error) {
        console.error("Error en creación de Consejo:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});