import { XP_CONFIG, NIVELES_CONFIG, RACHA_CONFIG } from "./xp_config.js";

// Función para calcular el XP requerido para un nivel
export const calcularXPparaNivel = (nivel) => {
    return Math.round(NIVELES_CONFIG.base_xp * Math.pow(NIVELES_CONFIG.factor_crecimiento, nivel - 1));
};

// Función para calcular el multiplicador de racha
const calcularMultiplicadorRacha = (racha) => {
    if (!racha || racha <= 0) return RACHA_CONFIG.base_multiplier;
    
    // Cálculo lineal: base + (incremento * días de racha)
    let multiplier = RACHA_CONFIG.base_multiplier + 
                    (RACHA_CONFIG.incremento_por_dia * Math.min(racha, RACHA_CONFIG.dias_para_max));
    
    // Asegurar que no supere el máximo
    return Math.min(multiplier, RACHA_CONFIG.max_multiplier);
};

// Función para CALCULAR XP
export const calcularXP = (evento, dificultad, duracion, racha) => {
    const config = XP_CONFIG[evento];
    if (!config) return 0;

    // Obtener multiplicadores
    let dificultadMultiplier = 1;
    let duracionMultiplier = 1;
    let rachaMultiplier = 1;
    
    if (dificultad) {
        dificultadMultiplier = config.dificultad_multiplier[dificultad] || 1;
    }
    
    if (duracion) {
        const duracionConfig = config.duracion_multiplier.find(range => 
            duracion >= range.min && duracion < range.max
        );
        duracionMultiplier = duracionConfig ? duracionConfig.multiplier : 1;
    }
    
    // CALCULAR MULTIPLICADOR DE RACHA
    if (racha && racha > 0) {
        rachaMultiplier = calcularMultiplicadorRacha(racha);
    }
    
    console.log(`Cálculo XP: Base=${config.base_xp}, Dificultad=${dificultadMultiplier}, Duración=${duracionMultiplier}, Racha=${rachaMultiplier} (${racha} días)`);
    
    return Math.round(config.base_xp * dificultadMultiplier * duracionMultiplier * rachaMultiplier);
};

