/**
 * Ventana horaria (minutos desde medianoche) para la grilla de armado según turno del paralelo.
 * Evita mostrar franjas matutinas vacías cuando el grupo es NOCHE/TARDE.
 *
 * @param {string|null|undefined} turnoRaw — ej. URL `turno=NOCHE` o valor del paralelo
 * @returns {{ start: number, end: number }}
 */
export function getTurnoGridRangeMinutes(turnoRaw) {
    const t = String(turnoRaw || '')
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    if (t === 'NOCHE') {
        // Seed `horarios`: 18:15–22:00 (bloques de 45 min)
        return { start: 18 * 60 + 15, end: 22 * 60 };
    }
    if (t === 'TARDE') {
        // Seed `horarios`: 13:45–18:15 (bloques de 45 min)
        return { start: 13 * 60 + 45, end: 18 * 60 + 15 };
    }
    if (t === 'MANANA') {
        // No hay seed de mañana todavía: mantener rango amplio (fallback)
        return { start: 7 * 60 + 30, end: 14 * 60 };
    }
    return { start: 8 * 60, end: 22 * 60 };
}

/**
 * Sábado: sin turno institucional; solo franja tarde–noche (sin mañana).
 * Independiente del rango lun–vie del paralelo.
 *
 * @returns {{ start: number, end: number }}
 */
export function getSabadoArmadoGridRangeMinutes() {
    // Seed `horarios` sábado: 15:00–19:00 (bloques de 45 min)
    return { start: 15 * 60, end: 19 * 60 };
}
