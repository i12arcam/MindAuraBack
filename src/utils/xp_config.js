// Configuración centralizada de XP por evento
export const XP_CONFIG = {
    'registrar_emocion': {
        base_xp: 15,
        dificultad_multiplier: {
            'facil': 1.0,
            'media': 1.5,
            'dificil': 2.0
        },
        duracion_multiplier: [
            { min: 0, max: 5, multiplier: 0.8 },
            { min: 5, max: 10, multiplier: 1.0 },
            { min: 10, max: 15, multiplier: 1.2 },
            { min: 15, max: Infinity, multiplier: 1.5 }
        ]
    },
    'visualizar_articulo': {
        base_xp: 10,
        dificultad_multiplier: {
            'facil': 1.0,
            'media': 1.3,
            'dificil': 1.8
        },
        duracion_multiplier: [
            { min: 0, max: 3, multiplier: 0.7 },
            { min: 3, max: 7, multiplier: 1.0 },
            { min: 7, max: 15, multiplier: 1.3 },
            { min: 15, max: Infinity, multiplier: 1.8 }
        ]
    },
    'visualizar_video': {
        base_xp: 12,
        dificultad_multiplier: {
            'facil': 1.0,
            'media': 1.4,
            'dificil': 1.9
        },
        duracion_multiplier: [
            { min: 0, max: 5, multiplier: 0.8 },
            { min: 5, max: 10, multiplier: 1.0 },
            { min: 10, max: 20, multiplier: 1.4 },
            { min: 20, max: Infinity, multiplier: 2.0 }
        ]
    },
    'completar_actividad': {
        base_xp: 25,
        dificultad_multiplier: {
            'facil': 1.0,
            'media': 2.0,
            'dificil': 3.0
        },
        duracion_multiplier: [
            { min: 0, max: 10, multiplier: 1.0 },
            { min: 10, max: 20, multiplier: 1.5 },
            { min: 20, max: 30, multiplier: 2.0 },
            { min: 30, max: Infinity, multiplier: 2.5 }
        ]
    },
    'iniciar_sesion': {
        base_xp: 5,
        dificultad_multiplier: {
            'facil': 1.0,
            'media': 1.0,
            'dificil': 1.0
        },
        duracion_multiplier: [
            { min: 0, max: Infinity, multiplier: 1.0 }
        ]
    }
};

// Configuración de niveles
export const NIVELES_CONFIG = {
    base_xp: 100, // XP base para el nivel 1
    factor_crecimiento: 1.5 // Factor de crecimiento exponencial
};

export const RACHA_CONFIG = {
    base_multiplier: 1.0,
    incremento_por_dia: 0.0333, // 5% más por cada día de racha
    max_multiplier: 2.0,      // Máximo 100% de bonus
    dias_para_max: 30         // Días necesarios para alcanzar el máximo
};