// utils/filtradorEtiquetas.js
import Emocion from '../models/Emocion.js';

// FILTRAR ETIQUETAS BASADO EN HISTORIAL DE EMOCIONES
export const filtrarEtiquetas = async (usuarioId) => {
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
                frecuenciaEtiquetas[etiqueta] = (frecuenciaEtiquetas[etiqueta] || 0) + 1;
            });
        });
        
        // Una vez calculadas las frecuencias, se reordenan las emociones. Se devuelven las 3 mejores
        return Object.entries(frecuenciaEtiquetas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        
    } catch (error) {
        console.error("Error al filtrar etiquetas:", error);
        return null;
    }
};