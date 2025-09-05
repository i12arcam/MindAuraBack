import { XP_CONFIG, NIVELES_CONFIG } from "./xp_config.js";

// Función para calcular el XP requerido para un nivel
export const calcularXPparaNivel = (nivel) => {
    return Math.round(NIVELES_CONFIG.base_xp * Math.pow(NIVELES_CONFIG.factor_crecimiento, nivel - 1));
};

// Función para CALCULAR XP
export const calcularXP = (evento, dificultad, duracion) => {
    const config = XP_CONFIG[evento];
    if (!config) return 0;

    // Obtener multiplicadores
    let dificultadMultiplier = 1;
    let duracionMultiplier = 1;
    
    if (dificultad) {
        dificultadMultiplier = config.dificultad_multiplier[dificultad] || 1;
    }
    
    if (duracion) {
        const duracionConfig = config.duracion_multiplier.find(range => 
            duracion >= range.min && duracion < range.max
        );
        duracionMultiplier = duracionConfig ? duracionConfig.multiplier : 1;
    }
    
    return Math.round(config.base_xp * dificultadMultiplier * duracionMultiplier);
};

