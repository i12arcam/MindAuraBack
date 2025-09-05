// services/logroService.js
import { METAS_POR_EVENTO_RAREZA, ORDEN_RAREZAS } from '../data/metasLogros.js';
import UsuarioLogro from '../models/UsuarioLogro.js';
import Logro from '../models/Logro.js';

export const verificarLogro = async (usuarioId, evento, nuevoContador) => {
    try {
        // 1. Buscar el logro base para este evento
        const logroBase = await Logro.findOne({ evento });
        if (!logroBase) {
            console.log(`No se encontró logro base para evento: ${evento}`);
            return null;
        }

        // 2. Obtener metas específicas para este evento
        const metasEvento = METAS_POR_EVENTO_RAREZA[evento];
        if (!metasEvento) {
            console.log(`No hay metas definidas para evento: ${evento}`);
            return null;
        }

        // 3. Verificar si se alcanzó AL MENOS la meta de HIERRO
        const metaHierro = metasEvento.HIERRO;
        if (nuevoContador < metaHierro) {
            return null; // No se alcanzó ni siquiera HIERRO
        }

        // 4. Determinar QUÉ rareza se debería tener ACTUALMENTE
        let rarezaActualRequerida = 'HIERRO';
        
        for (const rareza of ORDEN_RAREZAS) {
            const meta = metasEvento[rareza];
            if (nuevoContador >= meta) {
                rarezaActualRequerida = rareza;
            } else {
                break;
            }
        }

        // 5. Verificar si el usuario ya tiene este logro
        let usuarioLogro = await UsuarioLogro.findOne({
            usuarioId,
            logroId: logroBase._id
        });

        // 6. Si NO existe el logro para el usuario, CREARLO con la rareza actual
        if (!usuarioLogro) {
            usuarioLogro = new UsuarioLogro({
                usuarioId,
                logroId: logroBase._id,
                rarezaActual: rarezaActualRequerida
            });
            await usuarioLogro.save();
            
            return {
                logroId: logroBase._id,
                titulo: generarTituloConRareza(logroBase.titulo, rarezaActualRequerida),
                descripcion: logroBase.descripcion,
                evento: logroBase.evento,
                rareza: rarezaActualRequerida
            };
        }

        // 7. Si YA existe, verificar si la rareza actual es MENOR a la requerida
        const indiceActual = ORDEN_RAREZAS.indexOf(usuarioLogro.rarezaActual);
        const indiceRequerido = ORDEN_RAREZAS.indexOf(rarezaActualRequerida);
        
        if (indiceRequerido > indiceActual) {
            // ACTUALIZAR la rareza
            usuarioLogro.rarezaActual = rarezaActualRequerida;
            await usuarioLogro.save();
            
            return {
                titulo: generarTituloConRareza(logroBase.titulo, rarezaActualRequerida),
                descripcion: logroBase.descripcion,
                evento: logroBase.evento,
                rareza: rarezaActualRequerida
            };
        }

        // 8. Si no hay cambios, devolver null
        return null;

    } catch (error) {
        console.error('Error en verificarLogros:', error);
        return null;
    }
};

// Función para generar títulos con rareza
export const generarTituloConRareza = (tituloBase, rareza) => {
    const prefijos = {
        HIERRO: 'Novato',
        BRONCE: 'Aprendiz', 
        PLATA: 'Experto',
        ORO: 'Maestro',
        PLATINO: 'Gran Maestro',
        DIAMANTE: 'Leyenda'
    };
    
    return `${prefijos[rareza]} ${tituloBase}`;
};