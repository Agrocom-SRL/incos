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
        return { start: 18 * 60, end: 23 * 60 + 45 };
    }
    if (t === 'TARDE') {
        return { start: 14 * 60, end: 21 * 60 + 45 };
    }
    if (t === 'MANANA') {
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
    return { start: 13 * 60, end: 24 * 60 };
}
